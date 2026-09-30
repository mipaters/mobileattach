import type { AgentActivity, Bundle, Customer, CustomerPreference, Product, ROIModel } from "./types";

export const disclaimer =
  "Concept demonstration using synthetic customer, product, catalogue, pricing, eligibility, inventory, financial, interaction, and outcome data. Products, prices, recommendations, eligibility results, financial values, and business outcomes are illustrative and do not represent current Rogers offers, customers, systems, or forecasts.";

const product = (
  id: string,
  name: string,
  category: Product["category"],
  monthlyPrice: number,
  upfrontPrice: number,
  description: string,
  features: string[],
  useCases: string[],
  extra: Partial<Product> = {},
): Product => ({
  id,
  name,
  category,
  monthlyPrice,
  upfrontPrice,
  description,
  features,
  useCases,
  compatibility: ["universal"],
  promotion: "Illustrative bundle credit",
  inventory: "In stock",
  marginBand: "Medium",
  eligibility: "Eligible in simulated scenario",
  approvalRequired: false,
  rating: 4.4,
  exclusions: [],
  version: "CAT-2026.09",
  effectivePeriod: "Demo period",
  active: true,
  ...extra,
});

export const products: Product[] = [
  product("dev-northstar", "Northstar Pro 256", "device", 42, 99, "Camera-first flagship with balanced cost.", ["50 MP pro camera", "All-day battery", "256 GB", "6.4-inch display", "Travel eSIM"], ["Photography", "Travel", "Battery"]),
  product("dev-harbour", "Harbour One 256", "device", 31, 49, "Strong everyday value with a capable camera.", ["Dual camera", "Long battery", "256 GB", "6.2-inch display"], ["Value", "Photography"]),
  product("dev-apex", "Apex Ultra 512", "device", 58, 149, "Premium imaging and large storage.", ["Pro camera array", "Two-day battery", "512 GB", "6.8-inch display"], ["Photography", "Gaming", "Travel"], { inventory: "Low stock", marginBand: "High" }),
  product("dev-maple", "Maple Mini 128", "device", 24, 0, "Compact and affordable everyday phone.", ["Compact body", "128 GB", "Bright display"], ["Compact", "Value"]),
  product("dev-orbit", "Orbit Max 256", "device", 39, 79, "Large display and battery for media.", ["Large display", "High-capacity battery", "256 GB"], ["Gaming", "Battery"]),
  product("dev-lumen", "Lumen Air 256", "device", 35, 129, "Lightweight design with clear photography.", ["Lightweight", "Portrait camera", "256 GB"], ["Photography", "Compact"]),
  product("dev-cascade", "Cascade Fold 512", "device", 72, 249, "Flexible productivity-focused display.", ["Foldable screen", "512 GB", "Multitasking"], ["Productivity"], { approvalRequired: true, inventory: "Low stock" }),
  product("dev-pioneer", "Pioneer SE 128", "device", 19, 0, "Reliable essentials at a low monthly cost.", ["128 GB", "Durable shell", "Simple camera"], ["Value", "Durability"]),
  product("plan-select", "Infinite Select 75", "plan", 58, 0, "75 GB plan with a flexible travel-day benefit.", ["75 GB data", "5G access", "2 travel days"], ["Travel", "Photography"]),
  product("plan-value", "Everyday 50", "plan", 48, 0, "Balanced 50 GB plan for everyday use.", ["50 GB data", "5G access"], ["Value"]),
  product("plan-premium", "Infinite Max 150", "plan", 75, 0, "High-data plan for intensive mobile use.", ["150 GB data", "Premium speeds", "5 travel days"], ["Gaming", "Travel"]),
  product("plan-lite", "Connect 30", "plan", 40, 0, "Simple 30 GB plan.", ["30 GB data", "5G access"], ["Value"]),
  product("plan-family", "Shared 100", "plan", 68, 0, "Shareable data for multi-line households.", ["100 GB shared", "Family controls"], ["Household"]),
  product("case-impact", "ImpactGuard Case", "case", 0, 39, "Protective case with reinforced corners.", ["Drop protection", "Recycled materials"], ["Durability"], { compatibility: ["dev-northstar", "dev-harbour", "dev-apex"] }),
  product("case-slim", "SlimShell Case", "case", 0, 29, "Low-profile everyday protection.", ["Slim profile", "Soft-touch finish"], ["Compact"], { compatibility: ["dev-maple", "dev-lumen", "dev-pioneer"] }),
  product("case-premium", "TrailArmor Case", "case", 0, 59, "Rugged premium protection.", ["Rugged shell", "Grip frame"], ["Travel", "Durability"], { compatibility: ["dev-apex", "dev-orbit", "dev-northstar"] }),
  product("case-fold", "FlexFrame Case", "case", 0, 69, "Hinge-aware protection.", ["Hinge protection"], ["Productivity"], { compatibility: ["dev-cascade"] }),
  product("screen-clear", "ClearShield Screen Protection", "screen", 0, 29, "Clear tempered protection.", ["Tempered glass", "Case compatible"], ["Durability"]),
  product("screen-privacy", "PrivacyShield", "screen", 0, 39, "Limits side-angle viewing.", ["Privacy filter", "Tempered glass"], ["Productivity"]),
  product("screen-premium", "UltraShield Ceramic", "screen", 0, 49, "Premium scratch resistance.", ["Ceramic coating"], ["Durability"]),
  product("screen-fold", "FlexShield Film", "screen", 0, 45, "Flexible screen film.", ["Flexible film"], ["Productivity"], { compatibility: ["dev-cascade"] }),
  product("charge-compact", "Compact 30W Charger", "charging", 0, 35, "Compact fast charger.", ["30W charging"], ["Travel"]),
  product("charge-dual", "DualPort Travel Charger", "charging", 0, 55, "Charge two devices while travelling.", ["Dual port", "Travel adapters"], ["Travel"]),
  product("charge-pad", "DeskCharge Pad", "charging", 0, 49, "Simple wireless desk charging.", ["Wireless charging"], ["Productivity"]),
  product("audio-buds", "SoundArc Buds", "audio", 0, 89, "Wireless earbuds for calls and media.", ["Noise reduction", "Compact case"], ["Travel"]),
  product("audio-pro", "SoundArc Pro", "audio", 0, 169, "Premium noise-cancelling earbuds.", ["Active noise cancellation"], ["Travel", "Productivity"]),
  product("audio-speaker", "PocketWave Speaker", "audio", 0, 69, "Portable wireless speaker.", ["Water resistant"], ["Travel"]),
  product("protect-lite", "Device Care Essential", "protection", 7, 0, "Core accidental-damage coverage.", ["Accidental damage"], ["Value"]),
  product("protect-plus", "Device Care Plus", "protection", 12, 0, "Broader protection with streamlined service.", ["Accidental damage", "Loss support", "Express service"], ["Photography", "Travel"]),
  product("protect-max", "Device Care Complete", "protection", 17, 0, "Highest illustrative coverage tier.", ["Expanded coverage", "Priority support"], ["Premium"]),
  product("travel-flex", "Travel Pass Flex", "travel", 8, 0, "Optional monthly travel-day bank.", ["4 travel days"], ["Travel"]),
  product("travel-week", "Roam Week", "travel", 0, 45, "One-time seven-day travel option.", ["7 day pass"], ["Travel"]),
  product("travel-global", "Global Connect", "travel", 15, 0, "Recurring international benefit.", ["Multi-region allowance"], ["Frequent travel"]),
  product("line-family", "Additional Family Line", "line", 35, 0, "Optional household line.", ["Shared account benefit"], ["Household"]),
  product("line-student", "Student Starter Line", "line", 30, 0, "Optional value line for an eligible household member.", ["40 GB data"], ["Household"]),
  product("line-tablet", "Connected Tablet Line", "line", 15, 0, "Optional data line for a tablet.", ["10 GB data"], ["Productivity"]),
  product("home-connect", "Home Connect 500", "home", 70, 0, "Illustrative home Internet cross-sell.", ["500 Mbps"], ["Household"]),
  product("home-stream", "Home Stream Bundle", "home", 88, 0, "Illustrative Internet and entertainment package.", ["Internet", "Entertainment"], ["Household"]),
  product("home-secure", "Connected Home Essentials", "home", 22, 0, "Illustrative smart-home service.", ["Home monitoring"], ["Household"]),
];

export const customer: Customer = {
  id: "CUS-10482",
  name: "Jordan Lee",
  simulated: true,
  currentDevice: "Three-year-old premium smartphone",
  currentPlan: "30 GB plan",
  tenure: "6 years",
  monthlySpend: 82,
  upgradeReason: "Battery degradation and camera quality",
  usage: ["Photography", "Video", "Messaging", "Navigation"],
  statement: "I want a great camera, but I don’t want my bill to get out of control.",
  household: { activeLines: 2, eligibleMembers: 1, internet: false },
  consent: "Sales-assistance context permitted",
  contactPreference: "In person",
};

export const defaultPreferences: CustomerPreference = {
  budget: 115,
  upfrontBudget: 150,
  primaryUse: "Photography",
  travelFrequency: "Occasional",
  devicePreference: "Camera",
  storage: 256,
  protection: "Interested",
  paymentPreference: "Lower monthly",
  additionalLine: false,
};

export const bundles: Bundle[] = [
  { id: "essential", name: "Essential", deviceId: "dev-northstar", planId: "plan-select", itemIds: [], fitScore: 88, savings: 10, note: "Core device and plan only." },
  { id: "recommended", name: "Recommended", deviceId: "dev-northstar", planId: "plan-select", itemIds: ["case-impact", "screen-clear", "protect-plus"], fitScore: 96, savings: 35, note: "Balanced protection and cost." },
  { id: "premium", name: "Premium", deviceId: "dev-apex", planId: "plan-premium", itemIds: ["case-premium", "screen-premium", "protect-max", "charge-dual", "travel-flex"], fitScore: 87, savings: 55, note: "Maximum capability at a higher cost." },
];

export const agents: AgentActivity[] = [
  { name: "Mobile Attach Supervisor Agent", role: "Orchestrator", task: "Coordinate the sales journey", input: "Shared customer and basket context", output: "Final explainable recommendation", confidence: 96, policy: "Human decision required", authority: "Recommend only" },
  { name: "Context Agent", role: "Customer intelligence", task: "Separate facts from preferences", input: "Needs, budget, products, consent", output: "Permitted context summary", confidence: 98, policy: "Data minimisation", authority: "Observe and evaluate" },
  { name: "Recommendation Agent", role: "Product suitability", task: "Rank eligible devices and plans", input: "Catalogue, eligibility, inventory", output: "Primary and alternative options", confidence: 94, policy: "Suitability over price", authority: "Recommend only" },
  { name: "Bundle Optimization Agent", role: "Bundle design", task: "Build transparent bundle choices", input: "Compatibility, costs, attach options", output: "Essential, recommended, premium", confidence: 92, policy: "Optional means optional", authority: "Propose only" },
];

export const defaultROI: ROIModel = {
  transactions: 1_200_000,
  accessoryBaseline: 38,
  accessoryImproved: 46,
  protectionBaseline: 31,
  protectionImproved: 39,
  lineBaseline: 16,
  lineImproved: 21,
  accessoryRevenue: 58,
  protectionRevenue: 145,
  lineMonthlyRevenue: 35,
  retainedMonths: 24,
  grossMargin: 42,
  digitalImprovement: 14,
  operatingCost: 3_200_000,
  investment: 8_500_000,
};

export const kpis = [
  ["18,420", "Sales journeys analysed"],
  ["72%", "Device conversion rate"],
  ["46%", "Accessory attach rate"],
  ["39%", "Protection attach rate"],
  ["21%", "Additional-line attach rate"],
  ["$34", "Incremental transaction value"],
  ["64%", "Recommendation acceptance"],
  ["14%", "Checkout completion improvement"],
  ["91%", "Eligibility validation"],
  ["4.3 / 5", "Customer experience score"],
];

export const chartData = [
  { name: "Retail", conversion: 76, attach: 51, acceptance: 68 },
  { name: "Digital", conversion: 65, attach: 38, acceptance: 59 },
  { name: "Contact centre", conversion: 70, attach: 44, acceptance: 63 },
];
