#!/usr/bin/env python3
"""A tiny personal RAG agent with no third-party dependencies."""

from __future__ import annotations

import json
import math
import os
import re
import socket
import time
import uuid
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib import error, request
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"
DATA_DIR = ROOT / "data"
DOCS_FILE = DATA_DIR / "docs.json"
MODEL_EXECUTOR = ThreadPoolExecutor(max_workers=4)

DEFAULT_SYSTEM_PROMPT = """你是王忆航个人网站上的作品集知识库智能体。
你的任务是帮助访客理解王忆航的研究项目、GitHub 代码、成果材料、方法选择和个人贡献。
回答问题时必须优先依据检索到的知识库片段；如果知识库没有相关信息，要明确说明，不要编造仓库地址、实验结果、录取信息或医学结论。
回答要具体、可信、中文优先。涉及项目时，尽量说明：研究问题、方法、数据/材料、王忆航的贡献、局限性和可继续追问的方向。"""


def load_env_file() -> None:
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def now_ms() -> int:
    return int(time.time() * 1000)


def load_docs() -> list[dict[str, Any]]:
    if not DOCS_FILE.exists():
        return []
    try:
        return json.loads(DOCS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def save_docs(docs: list[dict[str, Any]]) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    DOCS_FILE.write_text(
        json.dumps(docs, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def tokenize(text: str) -> list[str]:
    lower = text.lower()
    words = re.findall(r"[a-z0-9_]+|[\u4e00-\u9fff]", lower)
    bigrams = [lower[i : i + 2] for i in range(len(lower) - 1) if re.match(r"[\u4e00-\u9fff]{2}", lower[i : i + 2])]
    return words + bigrams


def chunk_text(text: str, size: int = 700, overlap: int = 120) -> list[str]:
    clean = re.sub(r"\n{3,}", "\n\n", text.strip())
    if not clean:
        return []

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", clean) if p.strip()]
    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        if len(current) + len(paragraph) + 2 <= size:
            current = f"{current}\n\n{paragraph}".strip()
            continue
        if current:
            chunks.append(current)
        if len(paragraph) <= size:
            current = paragraph
            continue
        for i in range(0, len(paragraph), size - overlap):
            piece = paragraph[i : i + size].strip()
            if piece:
                chunks.append(piece)
        current = ""

    if current:
        chunks.append(current)
    return chunks


def build_chunks(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    for doc in docs:
        for index, content in enumerate(chunk_text(doc.get("content", ""))):
            chunks.append(
                {
                    "doc_id": doc["id"],
                    "doc_title": doc["title"],
                    "chunk_index": index,
                    "content": content,
                    "tokens": tokenize(f"{doc['title']}\n{content}"),
                }
            )
    return chunks


def retrieve(query: str, docs: list[dict[str, Any]], top_k: int = 5) -> list[dict[str, Any]]:
    chunks = build_chunks(docs)
    if not chunks:
        return []

    query_tokens = tokenize(query)
    query_counts = Counter(query_tokens)
    query_terms = set(query_tokens)
    doc_freq: Counter[str] = Counter()

    for chunk in chunks:
        doc_freq.update(set(chunk["tokens"]))

    total = len(chunks)
    query_norm = math.sqrt(sum(v * v for v in query_counts.values())) or 1.0
    scored: list[dict[str, Any]] = []

    for chunk in chunks:
        counts = Counter(chunk["tokens"])
        score = 0.0
        for token, q_count in query_counts.items():
            if token not in counts:
                continue
            idf = math.log((1 + total) / (1 + doc_freq[token])) + 1
            score += q_count * counts[token] * idf
        chunk_norm = math.sqrt(sum(v * v for v in counts.values())) or 1.0
        normalized = score / (query_norm * chunk_norm)
        title_tokens = set(tokenize(chunk["doc_title"]))
        content_tokens = set(chunk["tokens"])
        title_overlap = len(query_terms & title_tokens) / max(1, len(query_terms))
        content_overlap = len(query_terms & content_tokens) / max(1, len(query_terms))
        normalized += title_overlap * 0.7 + content_overlap * 0.18
        if normalized > 0:
            scored.append({**chunk, "score": round(normalized, 4)})

    scored.sort(key=lambda item: item["score"], reverse=True)
    return [
        {
            "doc_id": item["doc_id"],
            "doc_title": item["doc_title"],
            "chunk_index": item["chunk_index"],
            "content": item["content"],
            "score": item["score"],
        }
        for item in scored[:top_k]
    ]


MODEL_ALIASES = {
    "kimi-k2": "kimi-k2.6",
}

PREFERRED_MODEL_ORDER = [
    "kimi-k3",
    "kimi-k2.6",
]


def normalize_model_name(model: str | None) -> str:
    clean = (model or "").strip()
    return MODEL_ALIASES.get(clean, clean)


def fetch_openai_model_ids(api_key: str, base_url: str, timeout: float = 6) -> list[str]:
    req = request.Request(
        f"{base_url}/models",
        headers={"Authorization": f"Bearer {api_key}"},
        method="GET",
    )
    try:
        with request.urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8"))
        return [item.get("id") for item in data.get("data", []) if item.get("id")]
    except (error.HTTPError, error.URLError, TimeoutError, socket.timeout, OSError, json.JSONDecodeError):
        return []


def ordered_model_candidates(api_key: str, base_url: str) -> list[str]:
    preferred = normalize_model_name(os.getenv("OPENAI_MODEL", "moonshot-v1-8k"))
    fallback = normalize_model_name(os.getenv("OPENAI_FALLBACK_MODEL", ""))
    available_models = fetch_openai_model_ids(api_key, base_url)

    if available_models:
        available = set(available_models)
        candidates = [
            model
            for model in [preferred, fallback, *PREFERRED_MODEL_ORDER, *available_models]
            if model in available
            and ("code" not in model or model in {preferred, fallback})
        ]
    else:
        candidates = [
            preferred,
            fallback,
            *PREFERRED_MODEL_ORDER,
        ]

    unique: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in unique:
            unique.append(candidate)
    return unique


def call_openai_compatible(message: str, contexts: list[dict[str, Any]]) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model_timeout = float(os.getenv("MODEL_TIMEOUT_SECONDS", "35"))
    system_prompt = os.getenv("AGENT_SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT)

    context_text = "\n\n".join(
        f"[来源 {i + 1}: {item['doc_title']} / 片段 {item['chunk_index'] + 1}]\n{item['content'][:900]}"
        for i, item in enumerate(contexts)
    )
    user_prompt = f"""用户问题：
{message}

知识库检索结果：
{context_text or "没有检索到相关知识。"}

请基于这些材料回答，控制在 500 字以内，必须完整收尾。"""

    def make_request(selected_model: str) -> request.Request:
        payload = {
            "model": selected_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": 1000,
        }
        return request.Request(
            f"{base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

    failures: list[str] = []
    for selected_model in ordered_model_candidates(api_key, base_url):
        try:
            with request.urlopen(make_request(selected_model), timeout=model_timeout) as response:
                data = json.loads(response.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"].strip()
                if content:
                    return content
                failures.append(f"{selected_model}: 空回答")
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            failures.append(f"{selected_model}: HTTP {exc.code} {exc.reason} {detail[:240]}")
        except (error.URLError, KeyError, TimeoutError, socket.timeout, OSError) as exc:
            failures.append(f"{selected_model}: {exc}")

    return "模型调用失败，已切换到本地检索摘要模式。最近错误：" + "；".join(failures[:3])


def list_openai_models() -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"ok": False, "error": "OPENAI_API_KEY 未配置", "models": []}

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    try:
        models = fetch_openai_model_ids(api_key, base_url, timeout=18)
        return {
            "ok": bool(models),
            "base_url": base_url,
            "models": models,
            "chat_candidates": ordered_model_candidates(api_key, base_url),
        }
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        return {"ok": False, "base_url": base_url, "error": f"HTTP {exc.code} {exc.reason} {detail}", "models": []}
    except (error.URLError, TimeoutError, socket.timeout, OSError) as exc:
        return {"ok": False, "base_url": base_url, "error": str(exc), "models": []}


def local_answer(message: str, contexts: list[dict[str, Any]]) -> str:
    if not contexts:
        return (
            "我在当前知识库里没有检索到足够相关的内容。\n\n"
            "你可以先上传公司资料、产品说明、会议记录、网页复制文本，"
            "然后再问我更具体的问题。"
        )

    bullets = []
    for item in contexts[:3]:
        snippet = re.sub(r"\s+", " ", item["content"]).strip()
        if len(snippet) > 240:
            snippet = snippet[:240].rstrip() + "..."
        bullets.append(f"- 来自《{item['doc_title']}》：{snippet}")

    return (
        "我先用本地检索模式回答。模型服务可用时，我会把这些材料组织成更像“作品集答辩”的完整回答。\n\n"
        f"你的问题：{message}\n\n"
        "最相关的知识片段：\n"
        + "\n".join(bullets)
        + "\n\n建议下一步：可以继续追问项目的研究问题、个人贡献、方法局限、GitHub 成果入口，或让它模拟面试官提问。"
    )


def make_chat_response(message: str, top_k: int = 5) -> dict[str, Any]:
    docs = load_docs()
    contexts = retrieve(message, docs, top_k=top_k)
    answer: str | None = None
    if os.getenv("OPENAI_API_KEY"):
        total_timeout = float(os.getenv("AGENT_MODEL_TOTAL_TIMEOUT_SECONDS", "42"))
        future = MODEL_EXECUTOR.submit(call_openai_compatible, message, contexts)
        try:
            answer = future.result(timeout=total_timeout)
        except FutureTimeoutError:
            answer = (
                "模型响应较慢，我先用知识库检索结果回答。"
                "你可以稍后再试一次，通常 Render 免费实例或 Kimi 排队结束后会恢复完整模型回答。\n\n"
                + local_answer(message, contexts)
            )
    if answer is None:
        answer = local_answer(message, contexts)
    return {"answer": answer, "sources": contexts}


def is_write_allowed(headers: Any) -> bool:
    admin_token = os.getenv("ADMIN_TOKEN", "").strip()
    public_read_only = os.getenv("PUBLIC_READ_ONLY", "").strip().lower() in {"1", "true", "yes"}
    if admin_token:
        return headers.get("X-Admin-Token", "") == admin_token
    return not public_read_only


class AgentHandler(SimpleHTTPRequestHandler):
    server_version = "PersonalRAGAgent/0.1"

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[{self.log_date_time_string()}] {format % args}")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self.write_json(
                {
                    "ok": True,
                    "docs": len(load_docs()),
                    "model_enabled": bool(os.getenv("OPENAI_API_KEY")),
                    "public_read_only": os.getenv("PUBLIC_READ_ONLY", "").strip().lower() in {"1", "true", "yes"},
                }
            )
            return
        if parsed.path == "/api/docs":
            docs = load_docs()
            self.write_json(
                [
                    {
                        "id": doc["id"],
                        "title": doc["title"],
                        "created_at": doc["created_at"],
                        "chars": len(doc.get("content", "")),
                    }
                    for doc in sorted(docs, key=lambda item: item["created_at"], reverse=True)
                ]
            )
            return
        if parsed.path == "/api/models":
            self.write_json(list_openai_models())
            return
        if parsed.path == "/" or parsed.path == "/index.html":
            self.serve_file(STATIC_DIR / "index.html", "text/html; charset=utf-8")
            return
        if parsed.path.startswith("/static/"):
            target = STATIC_DIR / unquote(parsed.path.removeprefix("/static/"))
            if target.suffix == ".css":
                self.serve_file(target, "text/css; charset=utf-8")
            elif target.suffix == ".js":
                self.serve_file(target, "application/javascript; charset=utf-8")
            else:
                self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Token")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/docs":
            if not is_write_allowed(self.headers):
                self.write_json({"error": "公开模式不允许修改知识库"}, HTTPStatus.FORBIDDEN)
                return
            body = self.read_json()
            title = str(body.get("title", "")).strip() or "未命名文档"
            content = str(body.get("content", "")).strip()
            if not content:
                self.write_json({"error": "文档内容不能为空"}, HTTPStatus.BAD_REQUEST)
                return
            docs = load_docs()
            doc = {
                "id": uuid.uuid4().hex,
                "title": title,
                "content": content,
                "created_at": now_ms(),
            }
            docs.append(doc)
            save_docs(docs)
            self.write_json({"ok": True, "doc": {k: doc[k] for k in ("id", "title", "created_at")}})
            return

        if parsed.path in {"/api/chat", "/api/agent/run"}:
            body = self.read_json()
            message = str(body.get("message", "")).strip()
            if not message:
                self.write_json({"error": "message 不能为空"}, HTTPStatus.BAD_REQUEST)
                return
            top_k = int(body.get("top_k", 5) or 5)
            self.write_json(make_chat_response(message, top_k=top_k))
            return

        self.send_error(HTTPStatus.NOT_FOUND)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/docs/"):
            if not is_write_allowed(self.headers):
                self.write_json({"error": "公开模式不允许修改知识库"}, HTTPStatus.FORBIDDEN)
                return
            doc_id = unquote(parsed.path.removeprefix("/api/docs/"))
            docs = load_docs()
            kept = [doc for doc in docs if doc["id"] != doc_id]
            if len(kept) == len(docs):
                self.write_json({"error": "没有找到这个文档"}, HTTPStatus.NOT_FOUND)
                return
            save_docs(kept)
            self.write_json({"ok": True})
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def write_json(self, payload: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(encoded)

    def serve_file(self, path: Path, content_type: str) -> None:
        if not path.exists() or not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main() -> None:
    load_env_file()
    DATA_DIR.mkdir(exist_ok=True)
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8765"))
    httpd = ThreadingHTTPServer((host, port), AgentHandler)
    print(f"Personal RAG Agent running at http://{host}:{port}")
    print("Press Ctrl+C to stop.")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
