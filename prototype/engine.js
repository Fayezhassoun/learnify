export function computeSegment(segment, account) {
  const retainedMarginPerSub = Math.max(
    0,
    segment.retainedRevenuePerSub * (1 - segment.refundRate) - segment.serviceCostPerSub
  );
  const expectedValuePerConversion = retainedMarginPerSub * segment.firstBillRate;
  const cpa = segment.spend / Math.max(segment.conversions, 1);
  const estimatedProfit = expectedValuePerConversion * segment.conversions - segment.spend;
  const paybackDays = Math.max(
    7,
    Math.round((cpa / Math.max(retainedMarginPerSub, 1)) * 30)
  );

  const dataQualityScore = segment.trackingStatus === 'degraded' ? 0.2 : 0.95;
  const sampleScore = Math.min(1, segment.conversions / Math.max(account.minConversions, 1) / 2);
  const retentionScore = Math.min(1, segment.retention30d / 0.7);
  const confidence = Number((0.45 * dataQualityScore + 0.3 * sampleScore + 0.25 * retentionScore).toFixed(2));

  const profitabilityScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        50 + estimatedProfit / 400 + (segment.firstBillRate - 0.4) * 45 + (segment.retention30d - 0.4) * 30 - segment.refundRate * 80
      )
    )
  );

  return {
    ...segment,
    retainedMarginPerSub: Number(retainedMarginPerSub.toFixed(2)),
    expectedValuePerConversion: Number(expectedValuePerConversion.toFixed(2)),
    cpa: Number(cpa.toFixed(2)),
    estimatedProfit: Number(estimatedProfit.toFixed(2)),
    paybackDays,
    confidence,
    profitabilityScore,
    healthy: dataQualityScore >= 0.8,
  };
}

export function buildRecommendation(segment, account) {
  if (!segment.healthy) {
    return {
      id: `freeze-${segment.id}`,
      type: 'Data freeze',
      title: `Freeze mutations for ${segment.campaign}`,
      target: `${segment.channel} / ${segment.geo}`,
      confidence: 0.96,
      risk: 'High',
      approvalRequired: true,
      impactLabel: 'Protect account from false negatives while tracking is unstable',
      rationale: 'Signal validation failed because conversion reporting diverged from downstream billing quality.',
      evidence: [
        `Tracking status: ${segment.trackingStatus}`,
        `Conversions: ${segment.conversions}`,
        `First bill rate: ${(segment.firstBillRate * 100).toFixed(0)}%`
      ],
      action: 'Hold all budget mutations until postback integrity returns to normal.',
      priorityScore: 100,
      category: 'protect'
    };
  }

  if (segment.estimatedProfit < -2000 && segment.confidence >= 0.75 && segment.placement.toLowerCase().includes('audience')) {
    return {
      id: `exclude-${segment.id}`,
      type: 'Placement exclusion',
      title: `Exclude ${segment.placement} inventory for ${segment.geo}`,
      target: `${segment.channel} / ${segment.placement}`,
      confidence: segment.confidence,
      risk: 'Low',
      approvalRequired: false,
      impactLabel: `Protect about $${Math.round(Math.abs(segment.estimatedProfit) * 0.45).toLocaleString()} over the next cycle`,
      rationale: 'Downstream value is too weak for this inventory slice despite acceptable top-funnel conversion volume.',
      evidence: [
        `Estimated profit: $${Math.round(segment.estimatedProfit).toLocaleString()}`,
        `Refund rate: ${(segment.refundRate * 100).toFixed(0)}%`,
        `Payback: ${segment.paybackDays} days`
      ],
      action: 'Auto-executable exclusion because blast radius is limited and confidence is high.',
      priorityScore: 90,
      category: 'cut'
    };
  }

  if (segment.estimatedProfit < -1000 && segment.confidence >= 0.7) {
    return {
      id: `cut-${segment.id}`,
      type: 'Budget decrease',
      title: `Reduce budget on ${segment.campaign}`,
      target: `${segment.channel} / ${segment.geo}`,
      confidence: segment.confidence,
      risk: 'Medium',
      approvalRequired: true,
      impactLabel: `Recover about $${Math.round(Math.abs(segment.estimatedProfit) * 0.35).toLocaleString()} in wasted spend`,
      rationale: 'CPA is being supported by weak billing quality and poor retained value, so the segment is failing the payback target.',
      evidence: [
        `CPA: $${segment.cpa}`,
        `First bill rate: ${(segment.firstBillRate * 100).toFixed(0)}%`,
        `Payback: ${segment.paybackDays} days`
      ],
      action: `Route a ${account.dailyBudgetMoveCapPct}% budget decrease for approval.`,
      priorityScore: 75,
      category: 'cut'
    };
  }

  if (segment.estimatedProfit > 3000 && segment.paybackDays <= account.targetPaybackDays && segment.confidence >= 0.7) {
    return {
      id: `scale-${segment.id}`,
      type: 'Budget increase',
      title: `Scale ${segment.campaign}`,
      target: `${segment.channel} / ${segment.geo}`,
      confidence: segment.confidence,
      risk: 'Medium',
      approvalRequired: true,
      impactLabel: `Add about $${Math.round(segment.estimatedProfit * 0.2).toLocaleString()} retained margin if scale holds`,
      rationale: 'This segment remains profitable after churn and refund adjustments and still meets the payback target.',
      evidence: [
        `Estimated profit: $${Math.round(segment.estimatedProfit).toLocaleString()}`,
        `Retained margin/sub: $${segment.retainedMarginPerSub}`,
        `Payback: ${segment.paybackDays} days`
      ],
      action: `Queue a controlled ${Math.min(account.dailyBudgetMoveCapPct, 15)}% budget increase.`,
      priorityScore: 60,
      category: 'scale'
    };
  }

  return {
    id: `hold-${segment.id}`,
    type: 'Hold',
    title: `Monitor ${segment.campaign}`,
    target: `${segment.channel} / ${segment.geo}`,
    confidence: segment.confidence,
    risk: 'Low',
    approvalRequired: false,
    impactLabel: 'No action recommended in this cycle',
    rationale: 'The segment is within expected range or lacks enough incremental upside to justify a mutation.',
    evidence: [
      `Estimated profit: $${Math.round(segment.estimatedProfit).toLocaleString()}`,
      `Payback: ${segment.paybackDays} days`,
      `Confidence: ${(segment.confidence * 100).toFixed(0)}%`
    ],
    action: 'Continue monitoring and wait for the next billing / retention update.',
    priorityScore: 20,
    category: 'hold'
  };
}

export function evaluateScenario(data) {
  const computedSegments = data.segments.map((segment) => computeSegment(segment, data.account));
  const recommendations = computedSegments
    .map((segment) => buildRecommendation(segment, data.account))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const spend = computedSegments.reduce((sum, segment) => sum + segment.spend, 0);
  const expectedProfit = computedSegments.reduce((sum, segment) => sum + segment.estimatedProfit, 0);
  const atRiskSpend = computedSegments
    .filter((segment) => !segment.healthy || segment.estimatedProfit < 0)
    .reduce((sum, segment) => sum + segment.spend, 0);
  const paybackDays = Math.round(
    computedSegments.reduce((sum, segment) => sum + segment.paybackDays, 0) / computedSegments.length
  );
  const dataHealth = computedSegments.every((segment) => segment.healthy) ? 'stable' : 'critical';

  return {
    account: data.account,
    metrics: {
      spend,
      expectedProfit,
      atRiskSpend,
      paybackDays,
    },
    segments: computedSegments,
    recommendations,
    approvals: recommendations.filter((rec) => rec.approvalRequired),
    autoExecutable: recommendations.filter((rec) => !rec.approvalRequired && rec.category !== 'hold'),
    dataHealth,
    audit: data.audit,
  };
}
