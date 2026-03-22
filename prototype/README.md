# Agentic AI Campaign Decision Engine Prototype

This prototype is now a small functional demo rather than a static mockup.

## What it does

- loads structured scenario data from JSON
- computes profitability, payback, and confidence per segment
- generates ranked recommendations from decision logic
- routes risky actions into an approvals queue
- freezes actioning when tracking quality degrades

## How to run

From the repository root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/prototype/
```

## Included scenarios

1. **Baseline operating state**
   - healthy tracking
   - profitable and unprofitable segments mixed together
   - budget-cut, exclusion, and scale recommendations generated from data
2. **Tracking anomaly state**
   - one segment degrades to trigger a data-freeze recommendation
   - account data health changes from stable to critical

## Files

- `engine.js` contains the scoring and recommendation logic
- `app.js` loads scenario data and renders the interactive UI
- `data-baseline.json` and `data-anomaly.json` contain example account states
