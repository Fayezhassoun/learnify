# learnify

Functional first prototype for an **Agentic AI Campaign Decision Engine** focused on subscription and MVAS performance marketing.

## Included in this version

- A data-driven front-end demo in `prototype/`
- Scenario JSON inputs for baseline and tracking-anomaly states
- A lightweight decision engine that computes:
  - estimated profit
  - payback period
  - profitability scores
  - confidence
  - ranked recommendations
- Interactive operator workflow covering:
  - summary metrics
  - action feed
  - recommendation detail panel
  - approvals queue
  - profitability heatmap
  - audit trail

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/prototype/
```

## Why this matters

This version moves beyond static demo cards and shows the first actual product loop:
- structured campaign inputs
- profit-aware scoring
- trust-aware recommendations
- approval-aware action routing
