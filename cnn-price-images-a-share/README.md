# CNN Price Images for Cross-Market Return Prediction

Research code for predicting short-horizon stock returns with convolutional neural networks trained on OHLCV price images. The repository contains the final 22-script experimental pipeline for Chinese A-shares, U.S. equities, cross-horizon transfer learning, portfolio backtests, information-coefficient analysis, and factor-adjusted evaluation.

## Research design

- Inputs: daily open, high, low, close, and volume observations rendered as image tensors.
- Image windows: 5, 20, and 60 trading days.
- Target: binary direction of the following 5-day return.
- A-share sample: data beginning in 2014, with model experiments covering 2015–2025.
- U.S. sample: standardized stock data with evaluation through 2024.
- Evaluation: weekly cross-sectional sorts, decile portfolios, transaction costs, IC, equal/value weighting, and factor regressions.
- Transfer tests: 20-day and 60-day representations transferred to the 5-day prediction task, including cross-market tests on U.S. equities.

## Repository layout

```text
.
├── scripts/              # Final experiment scripts, numbered in execution order
├── docs/
│   └── PROJECT_SUMMARY_CN.md
├── requirements.txt
└── .gitignore
```

Raw market data, generated `.npy` tensors, trained weights, predictions, spreadsheets, and plots are intentionally excluded because they are large or machine-generated.

## Pipeline

### A-share experiments

| Stage | Script | Purpose |
|---|---|---|
| Data | `01_Download_data.py` | Build the A-share universe, download BaoStock OHLCV data, and exclude stocks with less than 12 months of history |
| Images | `02_OHLCV.py` | Generate 5/20/60-day OHLCV image tensors |
| Training | `03_train_all_models.py` | Train five runs of each CNN architecture with early stopping |
| Inference | `04`–`06` | Ensemble inference for the 5/20/60-day models |
| Evaluation | `07_backtest_all.py`, `08_IC.py` | Weekly decile backtests, IC, EW/VW tests, and factor-adjusted results |
| Transfer | `09`–`11` | Cross-horizon tensor construction, inference, and evaluation |

### U.S. and cross-market experiments

| Stage | Script | Purpose |
|---|---|---|
| Preparation | `12_US_clean_data.py` | Standardize per-stock U.S. CSV files |
| Images | `13_US_OHLCV.py` | Generate U.S. 5/20/60-day image tensors |
| Inference | `14`–`16` | Apply the A-share CNN ensembles to U.S. tensors |
| Evaluation | `17_US_backtest_all.py`, `18_US_IC.py` | U.S. backtests, IC, and factor-adjusted tests |
| Transfer | `19`–`22` | U.S. cross-horizon tensor generation, inference, and transfer evaluation |

## Setup

Python 3.10 or newer is recommended.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The scripts use relative paths and should be run from the repository root. Before running a stage, place its required input directories beside `scripts/` or adjust the configuration constants near the script's entry point.

Example A-share sequence:

```bash
python scripts/01_Download_data.py
python scripts/02_OHLCV.py
python scripts/03_train_all_models.py
python scripts/04_predict_I5R5.py
python scripts/05_predict_I20R5.py
python scripts/06_predict_I60R5.py
python scripts/07_backtest_all.py
python scripts/08_IC.py
```

### 2026 CNN-SURF bridge

Use `scripts/23_cnn_surf_2026.py` to produce the five CNN prediction CSVs that
the sibling `cnn-surf-variables/build_cnn_surf_variables.py` expects, then feed
them directly into the SURF variable builder.

```bash
python3 scripts/23_cnn_surf_2026.py \
  --archive "/path/to/2014-2025data_baostock_with_cap_good.zip" \
  --increment-dir ../cnn-surf-variables/data/baostock_2026_increment \
  --start 2026-01-01 \
  --end 2026-06-23 \
  --overwrite
```

Defaults assume this repository sits beside `cnn-surf-variables`. The command
creates:

- `data/cnn_surf_2026/daily_full/`: full per-stock daily CSVs made from the
  historical ZIP plus 2026 increments.
- `data/cnn_surf_2026/stock_images/` and
  `data/cnn_surf_2026/transfer_images/`: 2026 Friday image tensors.
- `data/cnn_surf_2026/predictions/`: the exact five filenames consumed by
  `build_cnn_surf_variables.py`:
  `cnn_5d_predictions_2020_2025.csv`,
  `cnn_20d_predictions_2020_2025.csv`,
  `cnn_60d_predictions_2020_2025.csv`,
  `cnn_transfer_predictions_20d_to_5d.csv`, and
  `cnn_transfer_predictions_60d_to_5d.csv`.
- `../cnn-surf-variables/output/cnn_surf_weekly_2026_known_98.csv.gz`.

The requested `--end` date should have at least five later trading days in the
incremental data; the original CNN image labels and the SURF forward variables
both require that future 5-day window. If you already have staged images or
predictions, run only the later stages with `--steps predict surf` or
`--steps surf`.

## Reproducibility notes

- Training creates five independently trained checkpoints per window and prediction scripts ensemble their probabilities.
- The training/validation split is seeded by run index; GPU kernels and multiprocessing can still introduce platform-level variation.
- Generated artifacts are not committed. Reproducing results requires the corresponding market data and enough storage for image tensors.
- Several scripts are computationally intensive and were designed for multiprocessing and optional CUDA acceleration.
- This repository is research code, not investment advice or a production trading system.
