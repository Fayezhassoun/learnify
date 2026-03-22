# Agentic AI Campaign Decision Engine Prototype

This prototype is a lightweight static demo of the first operator workflow for the product concept:

- monitor campaign profitability using downstream business signals
- surface trust-aware recommendations
- separate low-risk auto-executable actions from high-risk approvals
- block actioning when data quality degrades

## How to run

From the repository root, run one of the following:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/prototype/
```

## Prototype scenarios

The interface includes two states:

1. **Stable data mode**
   - shows ranked actions based on retained margin and payback logic
2. **Tracking anomaly mode**
   - simulates a broken postback / conversion issue
   - shifts the system into a guarded no-action posture

## Why this is the right first prototype

It demonstrates the core wedge before building heavy infrastructure:

- a profit-first overview instead of a dashboard of vanity metrics
- an action feed instead of raw reporting
- approval-aware recommendations instead of blind automation
- data-quality gating as a first-class control
