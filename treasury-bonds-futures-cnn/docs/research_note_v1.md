# Treasury Bonds and Treasury Futures CNN Research Note

This project adapts price-image CNN methods to Chinese treasury futures and treasury bond markets.

Key ideas:

- Convert OHLCV history into image-like tensors.
- Compare multiple input windows and prediction horizons.
- Evaluate whether fixed-income price patterns retain learnable short-term signals.
- Treat treasury futures as more interpretable than sparse cash bond cross-sections at the prototype stage.

Current limitations:

- Cash bond data can be sparse and illiquid.
- Futures cross-sections are thin because they contain only a few tenor contracts.
- Transaction costs, margin, liquidity constraints, and duration controls need more careful modeling.
- Public repository links and full reproducibility materials still need to be finalized.
