export interface ROIInputs {
  advocates: number;
  sharesPerAdvocate: number;
  reachPerShare: number;
  engagementRate: number;
  conversionRate: number;
  averageDealValue: number;
  programInvestment: number;
}

export interface ROIResults {
  totalShares: number;
  estimatedReach: number;
  engagements: number;
  opportunities: number;
  influencedRevenue: number;
  roi: number;
  netReturn: number;
}

export const DEFAULT_ROI_INPUTS: ROIInputs = {
  advocates: 250,
  sharesPerAdvocate: 3,
  reachPerShare: 1200,
  engagementRate: 4.5,
  conversionRate: 2.8,
  averageDealValue: 18500,
  programInvestment: 48000,
};

export function calculateROI(inputs: ROIInputs): ROIResults {
  const totalShares = inputs.advocates * inputs.sharesPerAdvocate;
  const estimatedReach = totalShares * inputs.reachPerShare;
  const engagements = estimatedReach * (inputs.engagementRate / 100);
  const opportunities = engagements * (inputs.conversionRate / 100);
  const influencedRevenue = opportunities * inputs.averageDealValue;
  const netReturn = influencedRevenue - inputs.programInvestment;
  const roi =
    inputs.programInvestment > 0
      ? (netReturn / inputs.programInvestment) * 100
      : 0;

  return {
    totalShares: Math.round(totalShares),
    estimatedReach: Math.round(estimatedReach),
    engagements: Math.round(engagements),
    opportunities: Math.round(opportunities),
    influencedRevenue: Math.round(influencedRevenue),
    roi: Math.round(roi),
    netReturn: Math.round(netReturn),
  };
}
