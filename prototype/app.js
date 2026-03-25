import { evaluateScenario } from './engine.js';

const scenarios = {
  baseline: 'data-baseline.json',
  anomaly: 'data-anomaly.json',
};

const state = {
  scenario: 'baseline',
  evaluation: null,
  selectedRecommendationId: null,
  approvalsState: new Map(),
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

async function loadScenario(name) {
  const response = await fetch(scenarios[name]);
  const data = await response.json();
  state.scenario = name;
  state.evaluation = evaluateScenario(data);
  state.selectedRecommendationId = state.evaluation.recommendations[0]?.id ?? null;
  render();
}

function metricCard(title, value, subtitle, trend, tone = 'neutral') {
  return `
    <article class="metric-card">
      <p class="label">${title}</p>
      <div class="metric-value">${value}</div>
      <div class="metric-trend ${tone}">${trend}</div>
      <p class="metric-sub">${subtitle}</p>
    </article>
  `;
}

function badgeClass(value) {
  const normalized = value.toLowerCase();
  if (normalized.includes('low') || normalized.includes('stable')) return 'good';
  if (normalized.includes('high') || normalized.includes('critical')) return 'danger';
  if (normalized.includes('medium')) return 'warn';
  return 'neutral';
}

function recommendationState(rec) {
  return state.approvalsState.get(rec.id) ?? (rec.approvalRequired ? 'Pending approval' : 'Ready');
}

function renderSummary() {
  const { metrics, dataHealth } = state.evaluation;
  document.getElementById('summaryGrid').innerHTML = [
    metricCard('Spend monitored', currency.format(metrics.spend), 'Live scenario spend under evaluation.', 'Decision cycle ready'),
    metricCard('Expected profit', currency.format(metrics.expectedProfit), 'Estimated contribution after churn and refund adjustments.', metrics.expectedProfit >= 0 ? 'Positive unit economics' : 'Profit pressure detected', metrics.expectedProfit >= 0 ? 'good' : 'danger'),
    metricCard('Payback period', `${metrics.paybackDays} days`, 'Average modeled payback across active segments.', metrics.paybackDays <= state.evaluation.account.targetPaybackDays ? 'Within target policy' : 'Above target threshold', metrics.paybackDays <= state.evaluation.account.targetPaybackDays ? 'good' : 'warn'),
    metricCard('At-risk spend', currency.format(metrics.atRiskSpend), 'Spend exposed to losses or unreliable signal.', dataHealth === 'stable' ? 'Containment possible' : 'Expanded due to tracking risk', dataHealth === 'stable' ? 'warn' : 'danger'),
  ].join('');

  const healthLabel = dataHealth === 'stable' ? 'Stable' : 'Critical anomaly';
  const badge = document.getElementById('dataHealthBadge');
  badge.className = `badge ${badgeClass(healthLabel)}`;
  badge.textContent = `Data health: ${healthLabel}`;
}

function renderActions() {
  document.getElementById('actionFeed').innerHTML = state.evaluation.recommendations.map((item) => `
    <article class="action-card ${state.selectedRecommendationId === item.id ? 'selected' : ''}" data-rec-id="${item.id}">
      <header>
        <div>
          <p class="label">${item.type}</p>
          <h4>${item.title}</h4>
          <p>${item.rationale}</p>
        </div>
        <span class="badge ${badgeClass(item.risk)}">${item.risk} risk</span>
      </header>
      <div class="meta-row">
        <span class="meta-chip">Impact: ${item.impactLabel}</span>
        <span class="meta-chip">Confidence: ${(item.confidence * 100).toFixed(0)}%</span>
        <span class="meta-chip">Target: ${item.target}</span>
      </div>
      <p class="row-note">${item.action}</p>
      <div class="action-actions">
        <button class="approve" data-action="approve" data-rec-id="${item.id}">${item.approvalRequired ? recommendationState(item) : 'Auto-executable'}</button>
        <button class="ghost" data-action="focus" data-rec-id="${item.id}">View detail</button>
      </div>
    </article>
  `).join('');
}

function renderApprovals() {
  document.getElementById('approvalQueue').innerHTML = state.evaluation.approvals.length
    ? state.evaluation.approvals.map((item) => `
      <article class="action-card">
        <p class="label">Approval queue</p>
        <h4>${item.title}</h4>
        <p>${item.impactLabel}</p>
        <div class="meta-row">
          <span class="meta-chip">State: ${recommendationState(item)}</span>
          <span class="meta-chip">Confidence ${(item.confidence * 100).toFixed(0)}%</span>
        </div>
      </article>
    `).join('')
    : '<div class="empty">No high-risk actions are waiting for review.</div>';
}

function renderHeatmap() {
  document.getElementById('heatmap').innerHTML = state.evaluation.segments.map((segment) => `
    <article class="heat-row">
      <header>
        <div>
          <p class="label">${segment.channel} / ${segment.geo} / ${segment.placement}</p>
          <h4>${segment.campaign}</h4>
        </div>
        <div class="heat-score ${segment.profitabilityScore >= 70 ? 'good' : segment.profitabilityScore >= 40 ? 'warn' : 'bad'}">${segment.profitabilityScore}</div>
      </header>
      <p>Estimated profit ${currency.format(segment.estimatedProfit)} · Payback ${segment.paybackDays} days · First bill ${(segment.firstBillRate * 100).toFixed(0)}%</p>
    </article>
  `).join('');
}

function renderAudit() {
  document.getElementById('auditTrail').innerHTML = state.evaluation.audit.map((item) => `
    <article class="audit-item">
      <strong>${item.title}</strong>
      <p>${item.detail}</p>
    </article>
  `).join('');
}

function renderDetail() {
  const recommendation = state.evaluation.recommendations.find((item) => item.id === state.selectedRecommendationId) ?? state.evaluation.recommendations[0];
  if (!recommendation) return;
  document.getElementById('detailDrawer').innerHTML = `
    <article class="detail-card">
      <p class="label">Recommendation detail</p>
      <h3>${recommendation.title}</h3>
      <p>${recommendation.rationale}</p>
      <div class="meta-row">
        <span class="meta-chip">Type: ${recommendation.type}</span>
        <span class="meta-chip">Risk: ${recommendation.risk}</span>
        <span class="meta-chip">Confidence: ${(recommendation.confidence * 100).toFixed(0)}%</span>
      </div>
      <ul class="detail-list">
        ${recommendation.evidence.map((evidence) => `<li>${evidence}</li>`).join('')}
      </ul>
      <p class="row-note">Recommended action: ${recommendation.action}</p>
    </article>
  `;
}

function renderScenarioLabel() {
  document.getElementById('scenarioLabel').textContent = state.scenario === 'baseline' ? 'Baseline scenario' : 'Tracking anomaly scenario';
}

function render() {
  renderScenarioLabel();
  renderSummary();
  renderActions();
  renderApprovals();
  renderHeatmap();
  renderAudit();
  renderDetail();
}

function attachEvents() {
  document.getElementById('scenarioSelect').addEventListener('change', (event) => {
    loadScenario(event.target.value);
  });

  document.getElementById('recomputeBtn').addEventListener('click', () => {
    loadScenario(state.scenario);
  });

  document.getElementById('actionFeed').addEventListener('click', (event) => {
    const recId = event.target.dataset.recId;
    const action = event.target.dataset.action;
    if (!recId || !action) return;

    state.selectedRecommendationId = recId;
    if (action === 'approve') {
      const recommendation = state.evaluation.recommendations.find((item) => item.id === recId);
      if (recommendation?.approvalRequired) {
        state.approvalsState.set(recId, 'Approved');
      }
    }

    render();
  });
}

attachEvents();
loadScenario('baseline');
