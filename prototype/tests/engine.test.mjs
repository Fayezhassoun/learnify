import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateScenario } from '../engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadJson(name) {
  const filePath = path.join(__dirname, '..', name);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

const baseline = await loadJson('data-baseline.json');
const anomaly = await loadJson('data-anomaly.json');

const baselineResult = evaluateScenario(baseline);
assert.equal(baselineResult.dataHealth, 'stable');
assert.ok(baselineResult.metrics.expectedProfit > 0, 'baseline scenario should remain profitable overall');
assert.ok(baselineResult.recommendations.some((rec) => rec.type === 'Placement exclusion'));
assert.ok(baselineResult.recommendations.some((rec) => rec.type === 'Budget decrease'));
assert.ok(baselineResult.recommendations.some((rec) => rec.type === 'Budget increase'));

const anomalyResult = evaluateScenario(anomaly);
assert.equal(anomalyResult.dataHealth, 'critical');
assert.equal(anomalyResult.recommendations[0].type, 'Data freeze');
assert.ok(anomalyResult.approvals.length >= 1, 'anomaly scenario should require approval for protection action');

console.log('engine tests passed');
