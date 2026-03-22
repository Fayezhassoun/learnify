const baselineState = {
  dataHealthy: true,
  metrics: {
    spend: 142000,
    expectedProfit: 31800,
    paybackDays: 27,
    atRiskSpend: 23800,
  },
  opportunities: [
    {
      id: 'rec-1',
      title: 'Cut budget on Meta Prospecting - Broad - US',
      type: 'Budget decrease',
      target: 'Campaign',
      expectedImpact: '+$8.4k retained margin / 14 days',
      confidence: 0.88,
      risk: 'Medium',
      approvalRequired: true,
      reason:
        'CPA looks efficient, but first-bill rate is 21% below target and day-14 retention is deteriorating. Keeping current spend is likely to extend payback beyond target.',
      evidence: ['Spend touched: $18.2k', 'Payback drift: +11 days', 'Refund spike: +18% vs baseline'],
    },
    {
      id: 'rec-2',
      title: 'Exclude low-quality Audience Network placements',
      type: 'Placement exclusion',
      target: 'Placement group',
      expectedImpact: '+$5.1k profit protection / 7 days',
      confidence: 0.92,
      risk: 'Low',
      approvalRequired: false,
      reason:
        'Placements drive 34% of conversions but only 11% of first billings. Downstream value is materially below threshold with stable sample size.',
      evidence: ['Placement spend: $9.6k', 'First bill gap: -49%', 'Action blast radius: limited'],
    },
    {
      id: 'rec-3',
      title: 'Scale Google Search - Carrier Plan 7 - UK',
      type: 'Budget increase',
      target: 'Campaign',
      expectedImpact: '+$6.8k retained margin / 14 days',
      confidence: 0.73,
      risk: 'Medium',
      approvalRequired: true,
      reason:
        'CPC is above account average, but retained gross margin per subscriber is strongest in this cohort and payback remains under target.',
      evidence: ['CPC: +19%', 'Day-30 retention: +24%', 'Payback: 19 days'],
    },
  ],
  segments: [
    { label: 'UK / Android / Search', score: 84, status: 'good', note: 'High retained margin, safe scale candidate' },
    { label: 'US / Broad / Social', score: 42, status: 'warn', note: 'Cheap CPA, weak first billing quality' },
    { label: 'DE / Audience Network', score: 19, status: 'bad', note: 'High churn-adjusted loss risk' },
    { label: 'FR / iOS / Prospecting', score: 68, status: 'good', note: 'Stable quality, hold or gradual scale' },
  ],
  audit: [
    {
      title: 'Budget cut approved on TikTok trial cohort',
      detail: 'Action reduced campaign budget by 20% after day-7 retention fell below minimum threshold. Expected payback improved from 44 to 31 days.',
    },
    {
      title: 'Automation blocked due to postback lag',
      detail: 'Data Quality Agent froze all scaling actions after conversion postbacks lagged 4.8 hours above normal.',
    },
    {
      title: 'Placement exclusions auto-executed',
      detail: 'Low-risk inventory blocklist applied to three placements with sufficient spend and consistent downstream losses.',
    },
  ],
};

const anomalyState = {
  ...baselineState,
  dataHealthy: false,
  metrics: {
    ...baselineState.metrics,
    expectedProfit: 11900,
    atRiskSpend: 51700,
  },
  opportunities: [
    {
      id: 'rec-a1',
      title: 'Freeze budget mutations across Meta workspaces',
      type: 'No action / Data freeze',
      target: 'Account group',
      expectedImpact: 'Prevent false pauses until signal is restored',
      confidence: 0.96,
      risk: 'High',
      approvalRequired: true,
      reason:
        'Platform conversions fell sharply while billing and landing-page engagement remain stable. This pattern strongly indicates tracking failure rather than campaign collapse.',
      evidence: ['Conversion delta: -58%', 'Billing delta: -3%', 'Postback latency: +340%'],
    },
    ...baselineState.opportunities.slice(1),
  ],
  segments: baselineState.segments.map((segment, index) =>
    index === 1 ? { ...segment, score: 31, status: 'bad', note: 'Signal unreliable until postback integrity is restored' } : segment
  ),
  audit: [
    {
      title: 'Critical anomaly detected in conversion tracking',
      detail: 'Data Quality Agent blocked campaign-level budget actions because billing, click, and engagement signals diverged from conversion reporting.',
    },
    ...baselineState.audit,
  ],
};

let state = baselineState;

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

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
  if (normalized.includes('high')) return 'danger';
  if (normalized.includes('medium')) return 'warn';
  return 'neutral';
}

function render() {
  document.getElementById('summaryGrid').innerHTML = [
    metricCard('Spend monitored', currency.format(state.metrics.spend), 'Cross-channel monitored spend in current window.', 'Within guardrail envelope'),
    metricCard('Expected profit', currency.format(state.metrics.expectedProfit), 'Estimated churn-adjusted contribution after spend.', state.dataHealthy ? 'Positive profit trajectory' : 'Compressed by signal instability', state.dataHealthy ? 'good' : 'warn'),
    metricCard('Payback period', `${state.metrics.paybackDays} days`, 'Median payback based on current retained margin curves.', state.dataHealthy ? 'Below target threshold' : 'Confidence reduced', state.dataHealthy ? 'good' : 'warn'),
    metricCard('At-risk spend', currency.format(state.metrics.atRiskSpend), 'Spend currently exposed to poor quality or bad data.', state.dataHealthy ? 'Contained and actionable' : 'Expanded due to tracking anomaly', state.dataHealthy ? 'warn' : 'danger'),
  ].join('');

  document.getElementById('dataHealthBadge').className = `badge ${state.dataHealthy ? 'good' : 'danger'}`;
  document.getElementById('dataHealthBadge').textContent = `Data health: ${state.dataHealthy ? 'Stable' : 'Critical anomaly'}`;

  document.getElementById('actionFeed').innerHTML = state.opportunities.map((item) => `
    <article class="action-card">
      <header>
        <div>
          <p class="label">${item.type}</p>
          <h4>${item.title}</h4>
          <p>${item.reason}</p>
        </div>
        <span class="badge ${badgeClass(item.risk)}">${item.risk} risk</span>
      </header>
      <div class="meta-row">
        <span class="meta-chip">Expected impact: ${item.expectedImpact}</span>
        <span class="meta-chip">Confidence: ${(item.confidence * 100).toFixed(0)}%</span>
        <span class="meta-chip">Target: ${item.target}</span>
      </div>
      <p class="row-note">Evidence: ${item.evidence.join(' • ')}</p>
      <div class="action-actions">
        <button class="approve">${item.approvalRequired ? 'Send for approval' : 'Auto-executable'}</button>
        <button class="ghost">View rationale</button>
      </div>
    </article>
  `).join('');

  const approvals = state.opportunities.filter((item) => item.approvalRequired);
  document.getElementById('approvalQueue').innerHTML = approvals.length
    ? approvals.map((item) => `
      <article class="action-card">
        <p class="label">Awaiting approver</p>
        <h4>${item.title}</h4>
        <p>${item.expectedImpact}</p>
        <div class="meta-row">
          <span class="meta-chip">Confidence ${(item.confidence * 100).toFixed(0)}%</span>
          <span class="meta-chip">${item.risk} risk</span>
        </div>
      </article>
    `).join('')
    : '<div class="empty">No high-risk actions are waiting for review.</div>';

  document.getElementById('heatmap').innerHTML = state.segments.map((segment) => `
    <article class="heat-row">
      <header>
        <div>
          <p class="label">Segment</p>
          <h4>${segment.label}</h4>
        </div>
        <div class="heat-score ${segment.status}">${segment.score}</div>
      </header>
      <p>${segment.note}</p>
    </article>
  `).join('');

  document.getElementById('auditTrail').innerHTML = state.audit.map((item) => `
    <article class="audit-item">
      <strong>${item.title}</strong>
      <p>${item.detail}</p>
    </article>
  `).join('');
}

document.getElementById('recomputeBtn').addEventListener('click', () => {
  state = baselineState;
  render();
});

document.getElementById('toggleDataBtn').addEventListener('click', () => {
  state = state.dataHealthy ? anomalyState : baselineState;
  render();
});

render();
