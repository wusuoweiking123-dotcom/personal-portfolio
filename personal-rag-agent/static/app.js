const chat = document.querySelector("#chat");
const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message");
const docForm = document.querySelector("#doc-form");
const docTitle = document.querySelector("#doc-title");
const docContent = document.querySelector("#doc-content");
const docFile = document.querySelector("#doc-file");
const docList = document.querySelector("#doc-list");
const refreshDocs = document.querySelector("#refresh-docs");
const statusPill = document.querySelector("#status");

function setStatus(text) {
  statusPill.textContent = text;
}

function addMessage(role, text, sources = []) {
  const article = document.createElement("article");
  article.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  article.appendChild(bubble);

  if (sources.length) {
    const sourceWrap = document.createElement("div");
    sourceWrap.className = "sources";
    sources.slice(0, 5).forEach((source) => {
      const item = document.createElement("div");
      item.className = "source";
      const content = source.content.length > 180 ? `${source.content.slice(0, 180)}...` : source.content;
      item.textContent = `《${source.doc_title}》片段 ${source.chunk_index + 1}，相关度 ${source.score}: ${content}`;
      sourceWrap.appendChild(item);
    });
    article.appendChild(sourceWrap);
  }

  chat.appendChild(article);
  chat.scrollTop = chat.scrollHeight;
  return article;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

async function loadDocs() {
  const docs = await api("/api/docs");
  docList.innerHTML = "";

  if (!docs.length) {
    const empty = document.createElement("div");
    empty.className = "doc-card";
    empty.textContent = "还没有文档。先粘贴一段资料，或者导入 .txt / .md 文件。";
    docList.appendChild(empty);
    return;
  }

  docs.forEach((doc) => {
    const card = document.createElement("article");
    card.className = "doc-card";

    const title = document.createElement("strong");
    title.textContent = doc.title;
    card.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "doc-meta";
    meta.textContent = `${doc.chars} 字符 · ${new Date(doc.created_at).toLocaleString()}`;
    card.appendChild(meta);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", async () => {
      if (!confirm(`删除《${doc.title}》？`)) return;
      await api(`/api/docs/${doc.id}`, { method: "DELETE" });
      await loadDocs();
    });
    card.appendChild(remove);

    docList.appendChild(card);
  });
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  messageInput.value = "";
  setStatus("思考中");
  const pending = addMessage("assistant", "正在检索知识库并组织回答...");

  try {
    const data = await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, top_k: 5 }),
    });
    pending.remove();
    addMessage("assistant", data.answer, data.sources || []);
  } catch (error) {
    pending.remove();
    addMessage("assistant", `出错了：${error.message}`);
  } finally {
    setStatus("本地运行");
  }
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    chatForm.requestSubmit();
  }
});

docForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = docTitle.value.trim();
  const content = docContent.value.trim();
  if (!content) {
    alert("文档内容不能为空");
    return;
  }

  setStatus("入库中");
  try {
    await api("/api/docs", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
    docTitle.value = "";
    docContent.value = "";
    docFile.value = "";
    await loadDocs();
  } catch (error) {
    alert(error.message);
  } finally {
    setStatus("本地运行");
  }
});

docFile.addEventListener("change", async () => {
  const file = docFile.files?.[0];
  if (!file) return;
  docTitle.value = docTitle.value || file.name;
  docContent.value = await file.text();
});

refreshDocs.addEventListener("click", loadDocs);

loadDocs().catch((error) => {
  docList.textContent = `加载文档失败：${error.message}`;
});
