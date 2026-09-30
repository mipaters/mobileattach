export type ProductCategory =
  | "device"
  | "plan"
  | "case"
  | "screen"
  | "charging"
  | "audio"
  | "protection"
  | "travel"
  | "line"
  | "home";

export interface CustomerPreference {
  budget: number;
  upfrontBudget: number;
  primaryUse: "Photography" | "Productivity" | "Value" | "Gaming";
  travelFrequency: "None" | "Occasional" | "Frequent";
  devicePreference: "Camera" | "Battery" | "Compact" | "Value";
  storage: 128 | 256 | 512;
  protection: "No" | "Interested" | "High";
  paymentPreference: "Lower monthly" | "Lower upfront";
  additionalLine: boolean;
}

export interface Household {
  activeLines: number;
  eligibleMembers: number;
  internet: boolean;
}

export interface Customer {
  id: string;
  name: string;
  simulated: true;
  currentDevice: string;
  currentPlan: string;
  tenure: string;
  monthlySpend: number;
  upgradeReason: string;
  usage: string[];
  statement: string;
  household: Household;
  consent: string;
  contactPreference: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  features: string[];
  compatibility: string[];
  monthlyPrice: number;
  upfrontPrice: number;
  promotion: string;
  inventory: "In stock" | "Low stock" | "Unavailable";
  marginBand: "Low" | "Medium" | "High";
  eligibility: string;
  approvalRequired: boolean;
  rating: number;
  useCases: string[];
  exclusions: string[];
  version: string;
  effectivePeriod: string;
  active: boolean;
}

export interface RecommendationReason {
  label: string;
  detail: string;
  weight: number;
}

export interface Recommendation {
  device: Product;
  plan: Product;
  attachments: Product[];
  alternatives: Product[];
  score: number;
  confidence: number;
  reasons: RecommendationReason[];
  exclusions: { product: string; reason: string }[];
}

export interface Bundle {
  id: "essential" | "recommended" | "premium";
  name: string;
  deviceId: string;
  planId: string;
  itemIds: string[];
  fitScore: number;
  savings: number;
  note: string;
}

export interface AgentActivity {
  name: string;
  role: string;
  task: string;
  input: string;
  output: string;
  confidence: number;
  policy: string;
  authority: string;
}

export interface ROIModel {
  transactions: number;
  accessoryBaseline: number;
  accessoryImproved: number;
  protectionBaseline: number;
  protectionImproved: number;
  lineBaseline: number;
  lineImproved: number;
  accessoryRevenue: number;
  protectionRevenue: number;
  lineMonthlyRevenue: number;
  retainedMonths: number;
  grossMargin: number;
  digitalImprovement: number;
  operatingCost: number;
  investment: number;
}
