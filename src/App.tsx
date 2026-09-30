import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Columns3,
  Database,
  Gauge,
  GitBranch,
  HeartHandshake,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MessageSquareText,
  Moon,
  PackageCheck,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  ShieldCheck,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { agents, bundles, chartData, customer, defaultPreferences, defaultROI, disclaimer, kpis, products } from "./data";
import type { Bundle, CustomerPreference, Product, Recommendation, ROIModel } from "./types";

const navItems = [
  ["/", "Executive Sales Dashboard", LayoutDashboard],
  ["/customer", "Customer and Basket", UserRound],
  ["/recommendation", "Agent Recommendation", Sparkles],
  ["/bundle", "Bundle Builder", ShoppingBasket],
  ["/comparison", "Product Comparison", Columns3],
  ["/assisted-sale", "Assisted Sale", MessageSquareText],
  ["/performance", "Sales Performance", BarChart3],
  ["/roi", "Value and ROI", CircleDollarSign],
  ["/architecture", "Microsoft Architecture", Building2],
  ["/governance", "Governance and Controls", ShieldCheck],
] as const;

const walkthrough = [
  { title: "The Commercial Opportunity", message: "Device sales create a high-intent moment to deepen the customer relationship with suitable attachments.", path: "/", icon: TrendingUp },
  { title: "Understand the Customer", message: "The Context Agent combines stated needs, current products, preferences, budget, basket, eligibility, and channel.", path: "/customer", icon: UserRound },
  { title: "Evaluate the Catalogue", message: "The Recommendation Agent removes products that do not fit budget, inventory, compatibility, or policy.", path: "/recommendation", icon: Database },
  { title: "Recommend the Best Fit", message: "One primary recommendation and two alternatives explain fit, cost, and trade-offs.", path: "/recommendation", icon: Target },
  { title: "Build the Bundle", message: "The Bundle Optimization Agent creates a transparent package of device, plan, protection, and accessories.", path: "/bundle", icon: Boxes },
  { title: "Compare, Do Not Pressure", message: "Essential, Recommended, and Premium choices keep optional items visible and removable.", path: "/comparison", icon: Columns3 },
  { title: "Employee and Customer Stay in Control", message: "The agent recommends, the employee explains, and the customer decides.", path: "/assisted-sale", icon: HeartHandshake },
  { title: "Record the Outcome", message: "Accepted, modified, and declined recommendations feed the simulated measurement loop.", path: "/assisted-sale", icon: ClipboardCheck },
  { title: "Measure Business Value", message: "Commercial leaders can inspect attach rate, transaction value, margin, and recommendation effectiveness.", path: "/performance", icon: Gauge },
  { title: "Microsoft Architecture and Governance", message: "A proposed Microsoft foundation connects data, intelligence, experiences, controls, and measurement.", path: "/architecture", icon: Building2 },
  { title: "Better Recommendations Create Better Relationships", message: "Understand the need. Recommend the fit. Build the bundle. Let the customer decide. Measure the outcome.", path: "/", icon: Sparkles },
];

const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
const findProduct = (id: string) => products.find((item) => item.id === id)!;
const architectureColours: Record<string, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  slate: "bg-slate-500",
};

function buildRecommendation(preferences: CustomerPreference): Recommendation {
  const cameraPriority = preferences.primaryUse === "Photography" || preferences.devicePreference === "Camera";
  const valuePriority = preferences.primaryUse === "Value" || preferences.devicePreference === "Value" || preferences.budget < 105;
  const premiumPriority = preferences.storage === 512 && preferences.budget >= 135;
  const device = premiumPriority
    ? findProduct("dev-apex")
    : valuePriority
      ? findProduct("dev-harbour")
      : cameraPriority
        ? findProduct("dev-northstar")
        : findProduct("dev-orbit");
  const plan = preferences.budget < 100 ? findProduct("plan-value") : preferences.travelFrequency === "Frequent" ? findProduct("plan-premium") : findProduct("plan-select");
  const attachments = [
    findProduct(device.id === "dev-apex" ? "case-premium" : "case-impact"),
    findProduct("screen-clear"),
    ...(preferences.protection === "No" ? [] : [findProduct(preferences.protection === "High" ? "protect-max" : "protect-plus")]),
    ...(preferences.travelFrequency === "Frequent" ? [findProduct("travel-flex")] : []),
    ...(preferences.additionalLine ? [findProduct("line-family")] : []),
  ];
  return {
    device,
    plan,
    attachments,
    alternatives: [findProduct("dev-harbour"), findProduct("dev-apex")].filter((item) => item.id !== device.id),
    score: valuePriority ? 92 : premiumPriority ? 89 : 96,
    confidence: 94,
    reasons: [
      { label: "Need match", detail: `${device.name} supports ${preferences.primaryUse.toLowerCase()} and the stated ${preferences.devicePreference.toLowerCase()} priority.`, weight: 35 },
      { label: "Budget fit", detail: `The device and plan total ${money(device.monthlyPrice + plan.monthlyPrice)} monthly before optional items.`, weight: 30 },
      { label: "Storage", detail: `${device.features.join(", ")} aligns with the ${preferences.storage} GB preference.`, weight: 20 },
      { label: "Availability", detail: `${device.inventory} in this simulated retail scenario.`, weight: 15 },
    ],
    exclusions: [
      { product: "Cascade Fold 512", reason: "Exceeds the current budget and requires simulated approval." },
      { product: "Maple Mini 128", reason: "Storage and camera capability do not meet the stated need." },
      { product: "FlexFrame Case", reason: `Not compatible with ${device.name}.` },
    ],
  };
}

function bundleTotals(bundle: Bundle, itemIds = bundle.itemIds) {
  const items = [findProduct(bundle.deviceId), findProduct(bundle.planId), ...itemIds.map(findProduct)];
  return {
    monthly: items.reduce((sum, item) => sum + item.monthlyPrice, 0),
    upfront: items.reduce((sum, item) => sum + item.upfrontPrice, 0),
  };
}

function App() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [overviewIndex, setOverviewIndex] = useState(0);
  const [overviewPlaying, setOverviewPlaying] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [analysisRun, setAnalysisRun] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle>(bundles[1]);
  const [bundleItems, setBundleItems] = useState(bundles[1].itemIds);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const recommendation = useMemo(() => buildRecommendation(preferences), [preferences]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (!overviewPlaying || !overviewOpen) return;
    const timer = window.setInterval(() => {
      setOverviewIndex((current) => {
        const next = current === walkthrough.length - 1 ? 0 : current + 1;
        navigate(walkthrough[next].path);
        return next;
      });
    }, 3500);
    return () => window.clearInterval(timer);
  }, [overviewPlaying, overviewOpen, navigate]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const reset = () => {
    setPreferences(defaultPreferences);
    setAnalysisRun(false);
    setSelectedBundle(bundles[1]);
    setBundleItems(bundles[1].itemIds);
    setSaleCompleted(false);
    setOverviewIndex(0);
    setOverviewPlaying(false);
    notify("Demo reset to the Jordan Lee scenario.");
    navigate("/");
  };

  const appState = {
    preferences,
    setPreferences,
    recommendation,
    analysisRun,
    setAnalysisRun,
    selectedBundle,
    setSelectedBundle,
    bundleItems,
    setBundleItems,
    saleCompleted,
    setSaleCompleted,
    notify,
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 transition-colors dark:bg-ink dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 lg:px-6">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">
            <Menu size={22} />
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rogers-500"><Sparkles size={21} /></div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold sm:text-base">Rogers Mobile Attach Agent</div>
              <div className="hidden text-xs text-slate-400 sm:block">The right recommendation. The right bundle. The right moment.</div>
            </div>
          </Link>
          <div className="ml-auto hidden items-center gap-2 xl:flex">
            <span className="badge bg-emerald-500/15 text-emerald-300"><Activity size={13} /> Recommendation System Active</span>
            <span className="badge bg-blue-500/15 text-blue-300">Synthetic Data</span>
          </div>
          <button className="btn-primary ml-auto xl:ml-2" onClick={() => setOverviewOpen(true)}>
            <BriefcaseBusiness size={16} /><span className="hidden sm:inline">Executive Demo Overview</span><span className="sm:hidden">Overview</span>
          </button>
          <button className="rounded-xl border border-white/15 p-2.5 text-slate-200 hover:bg-white/10" onClick={reset} aria-label="Reset demo"><RotateCcw size={18} /></button>
          <button className="rounded-xl border border-white/15 p-2.5 text-slate-200 hover:bg-white/10" onClick={() => setDark((value) => !value)} aria-label="Toggle colour mode">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className={`${menuOpen ? "fixed inset-x-0 top-[65px] z-30 block" : "hidden"} min-h-[calc(100vh-65px)] w-full border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-navy lg:sticky lg:top-[65px] lg:block lg:w-72 lg:shrink-0`}>
          <nav className="space-y-1" aria-label="Primary navigation">
            {navItems.map(([path, label, Icon], index) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? "bg-rogers-500 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                <span className="w-5 text-center text-xs opacity-60">{index + 1}</span><Icon size={18} />{label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <div className="mb-1 flex items-center gap-2 font-bold"><Info size={14} /> Concept demonstration</div>
            Every customer, offer, price, eligibility result, and action is simulated.
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard {...appState} />} />
            <Route path="/customer" element={<CustomerPage {...appState} />} />
            <Route path="/recommendation" element={<RecommendationPage {...appState} />} />
            <Route path="/bundle" element={<BundlePage {...appState} />} />
            <Route path="/comparison" element={<ComparisonPage {...appState} />} />
            <Route path="/assisted-sale" element={<AssistedSalePage {...appState} />} />
            <Route path="/performance" element={<PerformancePage {...appState} />} />
            <Route path="/roi" element={<ROIPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/governance" element={<GovernancePage />} />
          </Routes>
          <footer className="border-t border-slate-200 px-5 py-7 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400 lg:px-8">
            <strong>Demonstration disclaimer:</strong> {disclaimer}
          </footer>
        </main>
      </div>

      {overviewOpen && (
        <Overview
          index={overviewIndex}
          setIndex={setOverviewIndex}
          playing={overviewPlaying}
          setPlaying={setOverviewPlaying}
          onClose={() => { setOverviewOpen(false); setOverviewPlaying(false); }}
        />
      )}
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-panel fade-in">{toast}</div>}
    </div>
  );
}

type PageProps = {
  preferences: CustomerPreference;
  setPreferences: (value: CustomerPreference) => void;
  recommendation: Recommendation;
  analysisRun: boolean;
  setAnalysisRun: (value: boolean) => void;
  selectedBundle: Bundle;
  setSelectedBundle: (value: Bundle) => void;
  bundleItems: string[];
  setBundleItems: (value: string[]) => void;
  saleCompleted: boolean;
  setSaleCompleted: (value: boolean) => void;
  notify: (message: string) => void;
};

function Overview({
  index,
  setIndex,
  playing,
  setPlaying,
  onClose,
}: {
  index: number;
  setIndex: (index: number) => void;
  playing: boolean;
  setPlaying: (value: boolean) => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const openStep = (step: number) => {
    setIndex(step);
    navigate(walkthrough[step].path);
  };
  const previous = () => openStep(index === 0 ? walkthrough.length - 1 : index - 1);
  const next = () => openStep(index === walkthrough.length - 1 ? 0 : index + 1);
  const ActiveIcon = walkthrough[index].icon;
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/95 p-4 text-white backdrop-blur-md lg:p-8" role="dialog" aria-modal="true" aria-label="Executive Demo Overview">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-start gap-4">
          <div>
            <div className="eyebrow">Executive Demo Overview</div>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">A guided commercial story in eleven steps</h2>
            <p className="mt-2 max-w-3xl text-slate-300">Select any tile or use guided mode. The active step navigates the application while this control remains available.</p>
          </div>
          <button className="ml-auto rounded-xl border border-white/20 p-3 hover:bg-white/10" onClick={onClose} aria-label="Exit overview"><X /></button>
        </div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {walkthrough.map((step, stepIndex) => {
            const Icon = step.icon;
            return (
              <button
                key={step.title}
                className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${stepIndex === index ? "border-rogers-500 bg-rogers-500/15" : "border-white/10 bg-white/5 hover:border-white/30"}`}
                onClick={() => openStep(stepIndex)}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><Icon size={19} /></span>
                  <span className={`badge ${stepIndex === index ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"}`}>{stepIndex === index ? "Active" : `Step ${stepIndex + 1}`}</span>
                </div>
                <h3 className="mt-4 font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.message}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-red-300">Open Step <ChevronRight size={15} /></span>
              </button>
            );
          })}
        </div>
        <div className="sticky bottom-4 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-rogers-500"><ActiveIcon /></span>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-widest text-red-300">Step {index + 1} of {walkthrough.length}</div>
                <div className="truncate text-lg font-extrabold">{walkthrough[index].title}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary border-white/20 bg-transparent text-white" onClick={previous}><ArrowLeft size={16} /> Previous</button>
              <button className="btn-secondary border-white/20 bg-transparent text-white" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} /> : <Play size={16} />} {playing ? "Pause" : "Auto Play"}</button>
              <button className="btn-secondary border-white/20 bg-transparent text-white" onClick={() => { setPlaying(false); openStep(0); }}><RefreshCcw size={16} /> Restart</button>
              <button className="btn-primary" onClick={next}>Next <ArrowRight size={16} /></button>
              <button className="btn-secondary border-white/20 bg-transparent text-white" onClick={onClose}>Exit Overview</button>
            </div>
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">{disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-7 dark:border-slate-800 dark:bg-navy lg:flex-row lg:items-end lg:justify-between lg:px-8">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-4xl text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function Dashboard(props: PageProps) {
  const navigate = useNavigate();
  const funnel = [
    { name: "Journeys", value: 100, fill: "#3b82f6" },
    { name: "Device", value: 72, fill: "#7c3aed" },
    { name: "Accessory", value: 46, fill: "#da291c" },
    { name: "Protection", value: 39, fill: "#10b981" },
    { name: "Extra line", value: 21, fill: "#f59e0b" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Executive Sales Dashboard"
        title="Turn Every Device Interaction into a Better Customer Outcome"
        description="Agentic AI helps Rogers understand customer needs, recommend suitable products, and build transparent bundles across retail and digital channels."
        actions={<button className="btn-primary" onClick={() => navigate("/customer")}><Play size={16} /> Start Demo Scenario</button>}
      />
      <div className="space-y-6 p-5 lg:p-8">
        {props.saleCompleted && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            <BadgeCheck /> <div><strong>Simulated outcome recorded.</strong> Dashboard indicators now reflect the completed Jordan Lee journey.</div>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map(([value, label], index) => (
            <div className="metric" key={label}>
              <div className={`text-2xl font-black ${index === 0 ? "text-blue-600" : index < 5 ? "text-rogers-500" : "text-emerald-600"}`}>{props.saleCompleted && index === 0 ? "18,421" : value}</div>
              <div className="mt-1 text-sm font-semibold">{label}</div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Simulated</div>
            </div>
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          <ChartPanel title="Attach funnel" subtitle="Share of simulated sales journeys">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={funnel} layout="vertical" margin={{ left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={75} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>{funnel.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Conversion by channel" subtitle="Aggregated channel comparison">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="conversion" name="Conversion %" fill="#da291c" radius={[8, 8, 0, 0]} />
                <Bar dataKey="attach" name="Attach %" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Recommendation acceptance" subtitle="Simulated trend">
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={[58, 59, 61, 60, 63, 64].map((value, index) => ({ period: `P${index + 1}`, value }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" tick={{ fill: "#94a3b8" }} />
                <YAxis domain={[50, 70]} tick={{ fill: "#94a3b8" }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="panel p-6">
            <div className="eyebrow">Executive narrative</div>
            <blockquote className="mt-3 text-xl font-bold leading-relaxed">“The strongest simulated opportunity is improving accessory and protection attachment during premium-device upgrades. Customers receiving a simple, needs-based bundle comparison show higher simulated acceptance than customers shown a long catalogue of unrelated products.”</blockquote>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[["Protection", "39%", "+8 pts"], ["Accessories", "46%", "+8 pts"], ["Extra lines", "21%", "+5 pts"]].map(([label, value, change]) => (
                <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800" key={label}>
                  <div className="text-sm font-semibold text-slate-500">{label}</div><div className="mt-1 text-2xl font-black">{value}</div><div className="text-sm font-bold text-emerald-600">{change} simulated uplift</div>
                </div>
              ))}
            </div>
          </div>
          <AboutPanel />
        </div>
      </div>
    </>
  );
}

function CustomerPage({ preferences, setPreferences, recommendation }: PageProps) {
  const update = <K extends keyof CustomerPreference>(key: K, value: CustomerPreference[K]) => setPreferences({ ...preferences, [key]: value });
  const baseMonthly = recommendation.device.monthlyPrice + recommendation.plan.monthlyPrice;
  return (
    <>
      <PageHeader eyebrow="Customer and Basket" title="Understand Jordan’s need before recommending a product" description="Known facts, stated preferences, permitted context, and the current basket remain visible and editable." />
      <div className="grid gap-5 p-5 lg:p-8 xl:grid-cols-3">
        <section className="panel p-5">
          <div className="flex items-start justify-between">
            <div><div className="eyebrow">Simulated Customer</div><h2 className="mt-1 text-2xl font-black">{customer.name}</h2><p className="text-sm text-slate-500">{customer.id} · Retail · Buying today</p></div>
            <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Synthetic</span>
          </div>
          <p className="mt-5 rounded-xl bg-blue-50 p-4 font-semibold text-blue-950 dark:bg-blue-950/40 dark:text-blue-100">“{customer.statement}”</p>
          <DefinitionList items={[
            ["Current device", customer.currentDevice], ["Current service", "Rogers wireless"], ["Current plan", customer.currentPlan],
            ["Tenure", customer.tenure], ["Current spend", `${money(customer.monthlySpend)} / month`], ["Upgrade reason", customer.upgradeReason],
            ["Household", `${customer.household.activeLines} lines; ${customer.household.eligibleMembers} eligible member`], ["Consent", customer.consent],
          ]} />
        </section>
        <section className="panel p-5">
          <div className="flex items-center gap-2"><SlidersHorizontal className="text-rogers-500" /><h2 className="text-xl font-black">Stated needs</h2></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Field label="Monthly target">
              <input className="w-full" type="range" min="80" max="170" value={preferences.budget} onChange={(event) => update("budget", Number(event.target.value))} />
              <strong>{money(preferences.budget)} / month</strong>
            </Field>
            <Field label="Upfront budget">
              <input className="w-full" type="range" min="0" max="350" step="25" value={preferences.upfrontBudget} onChange={(event) => update("upfrontBudget", Number(event.target.value))} />
              <strong>{money(preferences.upfrontBudget)}</strong>
            </Field>
            <SelectField label="Primary use" value={preferences.primaryUse} options={["Photography", "Productivity", "Value", "Gaming"]} onChange={(value) => update("primaryUse", value as CustomerPreference["primaryUse"])} />
            <SelectField label="Travel" value={preferences.travelFrequency} options={["None", "Occasional", "Frequent"]} onChange={(value) => update("travelFrequency", value as CustomerPreference["travelFrequency"])} />
            <SelectField label="Device priority" value={preferences.devicePreference} options={["Camera", "Battery", "Compact", "Value"]} onChange={(value) => update("devicePreference", value as CustomerPreference["devicePreference"])} />
            <SelectField label="Storage" value={String(preferences.storage)} options={["128", "256", "512"]} onChange={(value) => update("storage", Number(value) as CustomerPreference["storage"])} suffix=" GB" />
            <SelectField label="Protection interest" value={preferences.protection} options={["No", "Interested", "High"]} onChange={(value) => update("protection", value as CustomerPreference["protection"])} />
            <SelectField label="Payment preference" value={preferences.paymentPreference} options={["Lower monthly", "Lower upfront"]} onChange={(value) => update("paymentPreference", value as CustomerPreference["paymentPreference"])} />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <input type="checkbox" checked={preferences.additionalLine} onChange={(event) => update("additionalLine", event.target.checked)} className="h-4 w-4 accent-red-600" />
            <span><strong>Interested in an additional line</strong><span className="block text-xs text-slate-500">Optional household opportunity only</span></span>
          </label>
        </section>
        <section className="space-y-5">
          <div className="panel p-5">
            <div className="flex items-center gap-2"><ShoppingBasket className="text-rogers-500" /><h2 className="text-xl font-black">Current basket</h2></div>
            <BasketLine product={recommendation.device} />
            <BasketLine product={recommendation.plan} />
            <BasketLine label="Accessories" value="None selected" optional />
            <BasketLine label="Protection" value="None selected" optional />
            <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
              <div><div className="text-xs uppercase tracking-widest text-slate-400">Current estimate</div><div className="text-2xl font-black">{money(baseMonthly)}<span className="text-sm font-medium text-slate-500"> / month</span></div></div>
              <div className="text-right"><div className="text-xs text-slate-400">Upfront</div><strong>{money(recommendation.device.upfrontPrice)}</strong></div>
            </div>
          </div>
          <div className="panel p-5">
            <h2 className="font-black">Context indicators</h2>
            <div className="mt-3 space-y-2">
              {[
                ["Product eligibility", "Validated", "green"], ["Inventory availability", recommendation.device.inventory, "green"],
                ["Preference match", `${recommendation.score}%`, "blue"], ["Budget fit", baseMonthly <= preferences.budget ? "Within target" : "Review needed", baseMonthly <= preferences.budget ? "green" : "amber"],
                ["Compatibility", "Validated", "green"], ["Required approvals", "None", "grey"],
              ].map(([label, value, colour]) => <StatusRow key={label} label={label} value={value} colour={colour} />)}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function RecommendationPage({ recommendation, analysisRun, setAnalysisRun, notify }: PageProps) {
  const [openReasons, setOpenReasons] = useState(true);
  const [openExclusions, setOpenExclusions] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const run = () => {
    setAnalysisRun(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setAnalysisRun(true);
      notify("Attach analysis complete. Employee review is required.");
    }, 1800);
  };
  return (
    <>
      <PageHeader
        eyebrow="Agent Recommendation"
        title="Four agents. One explainable recommendation."
        description="The team evaluates suitability, affordability, availability, compatibility, and policy—then waits for employee and customer decisions."
        actions={<button className="btn-primary" onClick={run}><Zap size={16} /> Run Attach Analysis</button>}
      />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {agents.map((agent, index) => (
            <div className={`panel p-4 ${!analysisRun ? "agent-pulse" : ""}`} key={agent.name} style={{ animationDelay: `${index * 180}ms` }}>
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Bot size={20} /></span>
                <span className={`badge ${analysisRun ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"}`}>{analysisRun ? "Complete" : "Ready"}</span>
              </div>
              <h3 className="mt-3 font-black">{agent.name}</h3><p className="text-xs font-bold text-violet-600">{agent.role}</p>
              <DefinitionList compact items={[["Task", agent.task], ["Input", agent.input], ["Output", analysisRun ? agent.output : "Awaiting analysis"], ["Confidence", analysisRun ? `${agent.confidence}%` : "—"], ["Policy", agent.policy], ["Authority", agent.authority]]} />
            </div>
          ))}
        </div>
        <div className="panel overflow-hidden">
          <div className="bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="eyebrow">Primary recommendation · Employee review required</div>
                <h2 className="mt-2 text-3xl font-black">{recommendation.device.name}</h2>
                <p className="mt-2 text-slate-300">{recommendation.device.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {recommendation.device.features.map((feature) => <span className="badge bg-white/10 text-white" key={feature}>{feature}</span>)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <ScoreRing value={recommendation.score} label="Fit score" />
                <ScoreRing value={recommendation.confidence} label="Confidence" />
              </div>
            </div>
          </div>
          <div className="grid gap-5 p-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard label="Recommended plan" value={recommendation.plan.name} sub={`${money(recommendation.plan.monthlyPrice)} / month`} icon={<PackageCheck />} />
                <InfoCard label="Device pricing" value={`${money(recommendation.device.monthlyPrice)} / month`} sub={`${money(recommendation.device.upfrontPrice)} upfront`} icon={<CircleDollarSign />} />
                <InfoCard label="Eligibility" value="Validated" sub="Synthetic result" icon={<BadgeCheck />} />
                <InfoCard label="Inventory" value={recommendation.device.inventory} sub="Illustrative store inventory" icon={<Boxes />} />
              </div>
              <Drawer title="Why this is recommended" open={openReasons} onToggle={() => setOpenReasons(!openReasons)}>
                {recommendation.reasons.map((reason) => (
                  <div className="flex gap-3 border-b border-slate-200 py-3 last:border-0 dark:border-slate-700" key={reason.label}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Check size={16} /></span>
                    <div><div className="flex items-center gap-2 font-bold">{reason.label}<span className="text-xs text-slate-400">{reason.weight}% weight</span></div><p className="text-sm text-slate-600 dark:text-slate-300">{reason.detail}</p></div>
                  </div>
                ))}
              </Drawer>
              <Drawer title="Excluded products and evidence" open={openExclusions} onToggle={() => setOpenExclusions(!openExclusions)}>
                {recommendation.exclusions.map((item) => <div className="mb-2 rounded-xl bg-slate-100 p-3 dark:bg-slate-800" key={item.product}><strong>{item.product}</strong><p className="text-sm text-slate-500">{item.reason}</p></div>)}
              </Drawer>
            </div>
            <div>
              <h3 className="font-black">Optional attachments</h3>
              <p className="mb-3 text-sm text-slate-500">Nothing is added automatically. Every item requires customer confirmation.</p>
              {recommendation.attachments.map((item) => <BasketLine product={item} optional key={item.id} />)}
              <h3 className="mt-5 font-black">Alternatives</h3>
              {recommendation.alternatives.map((item, index) => (
                <div className="mt-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700" key={item.id}>
                  <div className="flex justify-between gap-3"><div><span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{index === 0 ? "Better value" : "Premium"}</span><h4 className="mt-2 font-black">{item.name}</h4></div><strong>{money(item.monthlyPrice)}/mo</strong></div>
                  <p className="mt-2 text-sm text-slate-500">{index === 0 ? "Lower monthly cost; gives up some camera and battery capability." : "Adds storage and imaging capability; costs more and has low stock."}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
            {["Present recommendation", "Compare alternatives", "Customize bundle", "Request simulated approval", "Save simulated quote", "Record customer response"].map((action, index) => (
              <button className={index === 0 ? "btn-primary" : "btn-secondary"} key={action} onClick={() => notify(`${action}: simulated action recorded.`)}>{action}</button>
            ))}
          </div>
          <DisclaimerStrip />
        </div>
      </div>
    </>
  );
}

function BundlePage({ preferences, selectedBundle, setSelectedBundle, bundleItems, setBundleItems, notify }: PageProps) {
  const [history, setHistory] = useState<string[][]>([]);
  const extras = products.filter((item) => ["case", "screen", "charging", "protection", "travel", "line"].includes(item.category));
  const totals = bundleTotals(selectedBundle, bundleItems);
  const chooseBundle = (bundle: Bundle) => {
    setHistory([]);
    setSelectedBundle(bundle);
    setBundleItems(bundle.itemIds);
  };
  const toggle = (id: string) => {
    setHistory([...history, bundleItems]);
    setBundleItems(bundleItems.includes(id) ? bundleItems.filter((item) => item !== id) : [...bundleItems, id]);
  };
  const swap = (key: "deviceId" | "planId", id: string) => {
    setSelectedBundle({ ...selectedBundle, [key]: id });
    notify(`${key === "deviceId" ? "Device" : "Plan"} changed in this simulated bundle.`);
  };
  return (
    <>
      <PageHeader
        eyebrow="Bundle Builder"
        title="Build value transparently—never hide optional products"
        description="Start with a clear comparison, then add, remove, or swap every component while costs update immediately."
        actions={<><button className="btn-secondary" disabled={!history.length} onClick={() => { setBundleItems(history[history.length - 1]); setHistory(history.slice(0, -1)); }}><ArrowLeft size={16} /> Undo</button><button className="btn-secondary" onClick={() => chooseBundle(bundles.find((item) => item.id === selectedBundle.id)!)}><RotateCcw size={16} /> Reset bundle</button></>}
      />
      <div className="space-y-5 p-5 lg:p-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const values = bundleTotals(bundle);
            return (
              <button onClick={() => chooseBundle(bundle)} className={`panel p-5 text-left transition ${selectedBundle.id === bundle.id ? "border-rogers-500 ring-2 ring-red-500/20" : "hover:border-slate-400"}`} key={bundle.id}>
                <div className="flex items-center justify-between"><h2 className="text-xl font-black">{bundle.name}</h2>{bundle.id === "recommended" && <span className="badge bg-rogers-500 text-white">Best fit</span>}</div>
                <p className="mt-1 text-sm text-slate-500">{bundle.note}</p>
                <div className="mt-4 flex items-end justify-between"><div><div className="text-2xl font-black">{money(values.monthly)}<span className="text-sm font-normal">/mo</span></div><div className="text-sm text-slate-500">{money(values.upfront)} upfront</div></div><div className="text-right"><strong>{bundle.fitScore}%</strong><div className="text-xs text-slate-500">fit score</div></div></div>
              </button>
            );
          })}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
          <section className="panel p-5">
            <h2 className="text-xl font-black">Core choices</h2>
            <SelectField label="Device" value={selectedBundle.deviceId} options={products.filter((item) => item.category === "device").map((item) => item.id)} optionLabels={Object.fromEntries(products.map((item) => [item.id, `${item.name} · ${money(item.monthlyPrice)}/mo`]))} onChange={(value) => swap("deviceId", value)} />
            <div className="mt-4"><SelectField label="Plan" value={selectedBundle.planId} options={products.filter((item) => item.category === "plan").map((item) => item.id)} optionLabels={Object.fromEntries(products.map((item) => [item.id, `${item.name} · ${money(item.monthlyPrice)}/mo`]))} onChange={(value) => swap("planId", value)} /></div>
            <div className="mt-5 rounded-xl bg-slate-950 p-5 text-white">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Live bundle estimate</div>
              <div className="mt-2 flex items-end justify-between"><div><div className="text-3xl font-black">{money(totals.monthly)}<span className="text-base font-medium"> / month</span></div><div className="text-slate-300">{money(totals.upfront)} upfront</div></div><div className="text-right text-sm"><div>{money(selectedBundle.savings)} estimated savings</div><div className={totals.monthly <= preferences.budget ? "text-emerald-300" : "text-amber-300"}>{money(Math.abs(preferences.budget - totals.monthly))} {totals.monthly <= preferences.budget ? "under" : "over"} target</div></div></div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <strong>Customer control:</strong> Optional items are visibly marked and are not confirmed until the customer accepts them.
            </div>
          </section>
          <section className="panel p-5">
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Optional products</h2><p className="text-sm text-slate-500">Select only after discussing relevance and price.</p></div><span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{bundleItems.length} selected</span></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {extras.map((item) => {
                const selected = bundleItems.includes(item.id);
                return (
                  <button className={`rounded-xl border p-4 text-left transition ${selected ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-200 hover:border-slate-400 dark:border-slate-700"}`} onClick={() => toggle(item.id)} key={item.id}>
                    <div className="flex items-start gap-3"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{selected && <Check size={15} />}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong>{item.name}</strong><span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Optional</span></div><p className="mt-1 text-xs text-slate-500">{item.description}</p><div className="mt-2 text-sm font-bold">{item.monthlyPrice ? `${money(item.monthlyPrice)}/mo` : money(item.upfrontPrice)}</div></div></div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function ComparisonPage({ recommendation }: PageProps) {
  const compared = [recommendation.device, findProduct("dev-harbour"), findProduct("dev-apex")];
  const fields = ["Camera", "Battery", "Storage", "Screen", "Durability", "Travel suitability", "Upfront cost", "Monthly device cost", "Availability", "Fit score", "Trade-offs"];
  const values = (device: Product, index: number) => [
    device.features[0], device.features[1] ?? "All-day", device.features.find((feature) => feature.includes("GB")) ?? "256 GB", device.features.find((feature) => feature.includes("display")) ?? "Bright display",
    index === 1 ? "Good" : "Strong", index === 2 ? "Excellent" : "Very good", money(device.upfrontPrice), `${money(device.monthlyPrice)} / month`, device.inventory,
    `${index === 0 ? 96 : index === 1 ? 88 : 89}%`, index === 0 ? "Best overall balance" : index === 1 ? "Lower camera capability" : "Higher cost and low stock",
  ];
  return (
    <>
      <PageHeader eyebrow="Product Comparison" title="Compare the differences customers actually care about" description="Simple language makes cost, capability, and trade-offs easier to discuss without pressure." />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead><tr className="bg-slate-950 text-white"><th className="p-4">Device comparison</th>{compared.map((device, index) => <th className="p-4" key={device.id}><span className={index === 0 ? "text-red-300" : ""}>{device.name}</span>{index === 0 && <span className="ml-2 badge bg-rogers-500 text-white">Recommended</span>}</th>)}</tr></thead>
            <tbody>{fields.map((field, fieldIndex) => <tr className="border-t border-slate-200 dark:border-slate-700" key={field}><th className="bg-slate-50 p-4 dark:bg-slate-800">{field}</th>{compared.map((device, deviceIndex) => <td className="p-4" key={device.id}>{values(device, deviceIndex)[fieldIndex]}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div>
          <h2 className="text-2xl font-black">Bundle comparison</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {bundles.map((bundle) => {
              const totals = bundleTotals(bundle);
              return (
                <div className={`panel p-5 ${bundle.id === "recommended" ? "border-rogers-500" : ""}`} key={bundle.id}>
                  <div className="flex justify-between"><h3 className="text-xl font-black">{bundle.name}</h3><span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{bundle.fitScore}% fit</span></div>
                  <DefinitionList items={[
                    ["Device", findProduct(bundle.deviceId).name], ["Plan", findProduct(bundle.planId).name], ["Protection", bundle.itemIds.some((id) => id.startsWith("protect")) ? "Included · Optional" : "Not included"],
                    ["Accessories", `${bundle.itemIds.filter((id) => ["case", "screen", "charging", "audio"].includes(findProduct(id).category)).length} optional`], ["Travel benefit", bundle.itemIds.some((id) => id.startsWith("travel")) ? "Included · Optional" : "Plan benefit only"],
                    ["Upfront total", money(totals.upfront)], ["Monthly total", money(totals.monthly)], ["Estimated savings", money(bundle.savings)], ["Approval", findProduct(bundle.deviceId).approvalRequired ? "Required" : "Not required"],
                  ]} />
                </div>
              );
            })}
          </div>
        </div>
        <Drawer title="Why this is recommended" open onToggle={() => undefined}>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">The Recommended bundle provides Jordan’s strongest camera fit while keeping the core monthly price within target. A case, screen protection, and device protection address stated durability concerns, but remain removable optional items. The Premium bundle adds capability at a materially higher cost.</p>
        </Drawer>
      </div>
    </>
  );
}

function AssistedSalePage({ recommendation, selectedBundle, bundleItems, setBundleItems, saleCompleted, setSaleCompleted, notify }: PageProps) {
  const [conversationStep, setConversationStep] = useState(1);
  const [outcome, setOutcome] = useState("In progress");
  const totals = bundleTotals(selectedBundle, bundleItems);
  const actions = [
    "Present recommendation", "Show value alternative", "Show premium alternative", "Customize", "Remove item",
    "Request simulated approval", "Save quote", "Simulate checkout", "Record decline",
  ];
  const complete = () => {
    setSaleCompleted(true);
    setOutcome("Simulated sale completed");
    setBundleItems(["case-impact", "screen-clear", "protect-plus"]);
    notify("Sale completed in simulation. Outcome and audit event recorded.");
  };
  return (
    <>
      <PageHeader eyebrow="Assisted Sale" title="The agent recommends. The employee explains. Jordan decides." description="A three-column retail workspace keeps customer needs, conversation, and policy-aware guidance together." />
      <div className="grid gap-5 p-5 lg:p-8 xl:grid-cols-[.85fr_1.3fr_1fr]">
        <section className="panel p-5">
          <div className="eyebrow">Customer context</div><h2 className="mt-1 text-xl font-black">{customer.name}</h2>
          <DefinitionList items={[["Need", "Camera quality and battery"], ["Budget", "$115 monthly · $150 upfront"], ["Current device", customer.currentDevice], ["Eligibility", "Upgrade validated"], ["Basket", `${recommendation.device.name} + ${recommendation.plan.name}`], ["Important", "Price-conscious protection interest"]]} />
          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-950 dark:bg-blue-950/30 dark:text-blue-100">“{customer.statement}”</div>
        </section>
        <section className="panel p-5">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">Conversation</h2><span className="badge bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">Step {conversationStep} of 4</span></div>
          <div className="mt-4 space-y-3">
            <Chat who="Employee" text="What matters most to you in your new phone?" />
            <Chat who="Jordan" text="I want a great camera, but I don’t want my bill to get out of control." customer />
            {conversationStep >= 2 && <><Chat who="Employee" text="How do you use your phone most often?" /><Chat who="Jordan" text="Photos, video, messaging, maps, and travel." customer /></>}
            {conversationStep >= 3 && <><Chat who="Employee" text={`The ${recommendation.device.name} is the strongest camera fit. The device and plan are ${money(recommendation.device.monthlyPrice + recommendation.plan.monthlyPrice)} monthly before optional protection.`} /><Chat who="Jordan" text="Show me the protected bundle, but keep the charger and extra line out." customer /></>}
            {conversationStep >= 4 && <Chat who="Employee" text="I’ve confirmed the device, plan, case, screen protection, and Device Care Plus. Everything else is declined. Shall I complete the simulated checkout?" />}
          </div>
          {conversationStep < 4 && <button className="btn-primary mt-5 w-full" onClick={() => setConversationStep(conversationStep + 1)}>Advance conversation <ArrowRight size={16} /></button>}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {actions.map((action) => <button className="btn-secondary px-3 text-xs" key={action} onClick={() => action === "Remove item" && bundleItems.length ? setBundleItems(bundleItems.slice(0, -1)) : notify(`${action}: simulated action recorded.`)}>{action}</button>)}
          </div>
        </section>
        <section className="space-y-5">
          <div className="panel p-5">
            <div className="eyebrow">Agent guidance</div>
            <div className="mt-3 space-y-2">
              {[
                "Confirm whether camera quality or budget is the stronger priority.",
                "Explain monthly and upfront cost separately.",
                "Present protection as optional.",
                "Avoid adding products without direct confirmation.",
                "Explain protection versus a physical case.",
                "Ask before discussing an additional household line.",
                "Provide a lower-cost alternative.",
              ].map((guidance) => <div className="flex gap-2 text-sm" key={guidance}><Check className="mt-0.5 shrink-0 text-emerald-500" size={16} /><span>{guidance}</span></div>)}
            </div>
          </div>
          <div className="panel p-5">
            <h2 className="font-black">Outcome</h2>
            <DefinitionList compact items={[["Status", outcome], ["Monthly", money(totals.monthly)], ["Upfront", money(totals.upfront)], ["Attach categories", String(bundleItems.length)], ["Audit ID", saleCompleted ? "AUD-2026-10482-01" : "Pending"]]} />
            <div className="mt-4 space-y-2">
              <button className="btn-primary w-full" onClick={complete}><BadgeCheck size={16} /> Complete simulated sale</button>
              {["Save quote", "Customer needs time", "Customer selects different device", "Customer declines attachments", "Customer abandons journey"].map((label) => <button className="btn-secondary w-full" key={label} onClick={() => { setOutcome(label); notify(`${label} recorded.`); }}>{label}</button>)}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function PerformancePage({ saleCompleted }: PageProps) {
  const metrics = [
    ["Device conversion", saleCompleted ? "72.1%" : "72%", "+4.2 pts"], ["Accessory attach", saleCompleted ? "46.1%" : "46%", "+8 pts"], ["Protection attach", "39%", "+8 pts"],
    ["Additional-line attach", "21%", "+5 pts"], ["Plan upgrade", "44%", "+6 pts"], ["Multi-product attach", "33%", "+7 pts"],
    ["Revenue / transaction", "$286", "+$34"], ["Average monthly revenue", "$121", "+$12"], ["Recommendation acceptance", "64%", "+11 pts"],
    ["Bundle modification", "37%", "Customer control"], ["Customer decline", "28%", "Transparent"], ["Checkout completion", "78%", "+14%"],
    ["Abandonment", "22%", "-14%"], ["Employee adoption", "69%", "+18 pts"], ["Override rate", "12%", "Monitored"],
    ["Approval requests", "6%", "Within range"],
  ];
  return (
    <>
      <PageHeader eyebrow="Sales Performance" title="Measure outcomes without ranking individual employees" description="All views are synthetic, aggregated, and designed for team and channel improvement." />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="panel p-4">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {["Retail", "Premium devices", "All segments", "All regions", "Last 90 days"].map((value, index) => <SelectField key={value} label={["Channel", "Device tier", "Customer segment", "Region", "Period"][index]} value={value} options={[value]} onChange={() => undefined} />)}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, value, context]) => <div className="metric" key={label}><div className="text-sm font-semibold text-slate-500">{label}</div><div className="mt-1 text-2xl font-black">{value}</div><div className={`mt-1 text-xs font-bold ${context.includes("+") || context.includes("-") ? "text-emerald-600" : "text-blue-600"}`}>{context}</div><div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Synthetic aggregated result</div></div>)}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartPanel title="Attach rate by channel" subtitle="Accessory, protection, and line attachment">
            <ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" opacity={0.15} /><XAxis dataKey="name" tick={{ fill: "#94a3b8" }} /><YAxis tick={{ fill: "#94a3b8" }} /><Tooltip /><Bar dataKey="attach" fill="#da291c" radius={[8, 8, 0, 0]} /><Bar dataKey="acceptance" fill="#7c3aed" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Customer-decline reasons" subtitle="Why optional items are not selected">
            <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={[{ name: "Price", value: 42 }, { name: "Not needed", value: 31 }, { name: "Needs time", value: 17 }, { name: "Other", value: 10 }]} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={3}>{["#da291c", "#3b82f6", "#f59e0b", "#64748b"].map((fill) => <Cell key={fill} fill={fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          </ChartPanel>
        </div>
      </div>
    </>
  );
}

function ROIPage() {
  const [roi, setROI] = useState<ROIModel>(defaultROI);
  const calculate = (model: ROIModel) => {
    const accessoryAttachments = model.transactions * ((model.accessoryImproved - model.accessoryBaseline) / 100);
    const protectionAttachments = model.transactions * ((model.protectionImproved - model.protectionBaseline) / 100);
    const lines = model.transactions * ((model.lineImproved - model.lineBaseline) / 100);
    const totalRevenue = accessoryAttachments * model.accessoryRevenue + protectionAttachments * model.protectionRevenue + lines * model.lineMonthlyRevenue * model.retainedMonths;
    const contribution = totalRevenue * (model.grossMargin / 100);
    const net = contribution - model.operatingCost;
    return { accessoryAttachments, protectionAttachments, lines, totalRevenue, contribution, net, roi: net / model.investment };
  };
  const result = calculate(roi);
  const scenarios = [
    ["Conservative", calculate({ ...roi, accessoryImproved: roi.accessoryBaseline + 4, protectionImproved: roi.protectionBaseline + 4, lineImproved: roi.lineBaseline + 2 })],
    ["Base", result],
    ["Upside", calculate({ ...roi, accessoryImproved: roi.accessoryBaseline + 12, protectionImproved: roi.protectionBaseline + 12, lineImproved: roi.lineBaseline + 8 })],
  ] as const;
  const update = (key: keyof ROIModel, value: number) => setROI({ ...roi, [key]: value });
  return (
    <>
      <PageHeader eyebrow="Value and ROI" title="Make every assumption visible and editable" description="Illustrative scenarios estimate commercial potential; they are not forecasts, guarantees, or Rogers commitments." />
      <div className="grid gap-5 p-5 lg:p-8 xl:grid-cols-[1.1fr_1fr]">
        <section className="panel p-5">
          <h2 className="text-xl font-black">Model assumptions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {([
              ["transactions", "Annual device transactions"], ["accessoryBaseline", "Accessory baseline %"], ["accessoryImproved", "Accessory improved %"],
              ["protectionBaseline", "Protection baseline %"], ["protectionImproved", "Protection improved %"], ["lineBaseline", "Additional-line baseline %"],
              ["lineImproved", "Additional-line improved %"], ["accessoryRevenue", "Accessory revenue $"], ["protectionRevenue", "Protection revenue $"],
              ["lineMonthlyRevenue", "Line monthly revenue $"], ["retainedMonths", "Retained months"], ["grossMargin", "Gross margin %"],
              ["digitalImprovement", "Digital conversion uplift %"], ["operatingCost", "Annual operating cost $"], ["investment", "Implementation investment $"],
            ] as [keyof ROIModel, string][]).map(([key, label]) => (
              <label className="block" key={key}><span className="mb-1 block text-xs font-bold text-slate-500">{label}</span><input className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600" type="number" value={roi[key]} onChange={(event) => update(key, Number(event.target.value))} /></label>
            ))}
          </div>
        </section>
        <section className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {scenarios.map(([name, scenario], index) => <div className={`panel p-4 ${index === 1 ? "border-rogers-500" : ""}`} key={name}><div className="text-sm font-bold text-slate-500">{name}</div><div className="mt-2 text-2xl font-black">{scenario.roi.toFixed(2)}x</div><div className="text-xs text-slate-500">illustrative ROI</div><div className="mt-3 text-sm font-bold text-emerald-600">{money(scenario.net)} net value</div></div>)}
          </div>
          <div className="panel p-5">
            <h2 className="text-xl font-black">Base scenario calculation</h2>
            <DefinitionList items={[
              ["Incremental accessory attachments", Math.round(result.accessoryAttachments).toLocaleString("en-CA")],
              ["Incremental protection attachments", Math.round(result.protectionAttachments).toLocaleString("en-CA")],
              ["Incremental lines", Math.round(result.lines).toLocaleString("en-CA")],
              ["Total incremental revenue", money(result.totalRevenue)],
              ["Gross-margin contribution", money(result.contribution)],
              ["Net estimated value", money(result.net)],
              ["Illustrative ROI", `${result.roi.toFixed(2)}x`],
            ]} />
          </div>
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <strong>Illustrative only.</strong> Results depend entirely on synthetic assumptions and are not guaranteed. {disclaimer}
          </div>
        </section>
      </div>
    </>
  );
}

function ArchitecturePage() {
  const layers = [
    ["Experience layer", ["Retail point-of-sale integration", "Digital-commerce integration", "Contact-centre integration", "Copilot Studio experience", "Employee tablet", "Customer comparison", "Power BI reporting"], "blue"],
    ["Agent layer", ["Mobile Attach Supervisor", "Context Agent", "Recommendation Agent", "Bundle Optimization Agent", "Microsoft Foundry", "Azure OpenAI", "Evaluation and observability"], "violet"],
    ["Data and intelligence", ["Microsoft Fabric", "OneLake", "Fabric Data Factory", "Real-Time Intelligence", "Customer and household context", "Catalogue and eligibility", "Azure Machine Learning", "Azure AI Search"], "emerald"],
    ["Integration services", ["Azure API Management", "Azure Functions", "Azure Logic Apps", "Azure Event Hubs", "Secure APIs", "TM Forum Open APIs"], "amber"],
    ["Security and governance", ["Microsoft Entra ID", "Managed identities", "Role-based access", "Azure Key Vault", "Microsoft Purview", "Defender for Cloud", "Azure Monitor", "Application Insights"], "slate"],
  ];
  return (
    <>
      <PageHeader eyebrow="Microsoft Architecture" title="A proposed foundation for governed, measurable agentic commerce" description="The architecture illustrates conceptual integration points only; this demonstration has no connection to live Rogers systems." />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-4 xl:grid-cols-5">
          {layers.map(([title, items, colour]) => (
            <div className="panel p-4" key={title as string}>
              <div className={`mb-4 h-1.5 rounded-full ${architectureColours[colour as string]}`} />
              <h2 className="font-black">{title as string}</h2>
              <div className="mt-3 space-y-2">{(items as string[]).map((item) => <div className="flex gap-2 text-sm" key={item}><ChevronRight className="mt-0.5 shrink-0 text-rogers-500" size={15} />{item}</div>)}</div>
            </div>
          ))}
        </div>
        <div className="panel p-6">
          <div className="eyebrow">Conceptual end-to-end flow</div>
          <div className="mt-5 flex flex-col gap-2 xl:flex-row xl:items-center">
            {["Customer need and basket", "Permitted context", "Fabric and OneLake", "Catalogue and eligibility", "Recommendation models", "Agent orchestration", "Bundle recommendation", "Human decision", "Commerce workflow", "Outcome measurement"].map((step, index) => (
              <div className="contents" key={step}>
                <div className="flex min-h-20 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold dark:border-slate-700 dark:bg-slate-800">{step}</div>
                {index < 9 && <ArrowRight className="mx-auto rotate-90 text-slate-400 xl:rotate-0" size={18} />}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel p-5"><h2 className="text-xl font-black">Proposed Rogers integrations</h2><div className="mt-4 grid grid-cols-2 gap-2">{["CRM", "Customer profile", "Product catalogue", "Pricing", "Promotions", "Eligibility", "Inventory", "Order management", "Billing", "Consent", "Retail POS", "E-commerce", "Care desktop", "Outcome systems"].map((item) => <span className="rounded-lg bg-slate-100 p-2 text-sm font-semibold dark:bg-slate-800" key={item}>{item}</span>)}</div></div>
          <AboutPanel />
        </div>
      </div>
    </>
  );
}

function GovernancePage() {
  const [expanded, setExpanded] = useState("Human authority");
  const controls = [
    ["Human authority", "Agents recommend; customers and authorized employees decide. No product is added without confirmation.", "Operating"],
    ["Suitability and affordability", "Scoring balances fit, budget, value, eligibility, and inventory—not simply price.", "Operating"],
    ["Catalogue integrity", "Approved catalogue, price, promotion, and eligibility versions are recorded.", "Operating"],
    ["Compatibility", "Incompatible accessories and inactive products are excluded before ranking.", "Operating"],
    ["Consent and purpose", "Context is limited to permitted sales-assistance purposes and communication preferences.", "Operating"],
    ["Explainability", "Fit reasons, trade-offs, confidence, evidence, and excluded options remain inspectable.", "Operating"],
    ["Auditability", "Recommendations, overrides, approvals, customer choices, and outcomes are recorded.", "Operating"],
    ["Model monitoring", "Confidence, acceptance, override, outcome, and drift indicators are monitored.", "Review"],
  ];
  return (
    <>
      <PageHeader eyebrow="Governance and Controls" title="Keep authority clear, optionality visible, and every decision auditable" description="Responsible agentic commerce requires explicit controls across data, models, prompts, recommendations, approvals, and outcomes." />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[["Customer context", "Confidential · Synthetic"], ["Consent", "Permitted for demo"], ["Catalogue", "CAT-2026.09"], ["Price version", "PRICE-2026.09"], ["Rules", "ELIG-4.2"], ["Model", "REC-2.4"], ["Agent", "ATTACH-1.8"], ["Prompt", "PROMPT-3.1"], ["Confidence", "94%"], ["Evidence", "Complete"], ["Human approval", "Not required"], ["Audit history", "12 events"]].map(([label, value]) => <div className="metric" key={label}><div className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div><div className="mt-2 font-black">{value}</div></div>)}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <section className="panel p-5">
            <h2 className="text-xl font-black">Control dashboard</h2>
            <div className="mt-4 space-y-2">
              {controls.map(([name, detail, status]) => (
                <button className="w-full rounded-xl border border-slate-200 p-4 text-left dark:border-slate-700" onClick={() => setExpanded(expanded === name ? "" : name)} key={name}>
                  <div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${status === "Operating" ? "bg-emerald-500" : "bg-amber-500"}`} /><strong>{name}</strong><span className="ml-auto badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{status}</span><ChevronDown className={`transition ${expanded === name ? "rotate-180" : ""}`} size={17} /></div>
                  {expanded === name && <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{detail}</p>}
                </button>
              ))}
            </div>
          </section>
          <section className="space-y-5">
            <div className="panel p-5">
              <h2 className="text-xl font-black">Authority model</h2>
              <div className="mt-4 space-y-3">
                {[["Observe", "Read permitted context"], ["Evaluate", "Check suitability and eligibility"], ["Recommend", "Present options and reasons"], ["Customize", "Human changes optional items"], ["Approve", "Authorized human reviews exceptions"], ["Execute", "Existing commerce systems transact"], ["Learn", "Outcome feeds evaluation"]].map(([stage, detail], index) => <div className="flex gap-3" key={stage}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white">{index + 1}</span><div><strong>{stage}</strong><p className="text-sm text-slate-500">{detail}</p></div></div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-rogers-500 bg-red-50 p-5 text-sm text-red-950 dark:bg-red-950/20 dark:text-red-100">
              <strong>No autonomous customer-impacting action.</strong> This concept cannot approve discounts, modify a real order, charge a customer, or commit Rogers to a price or promotion.
            </div>
            <DisclaimerStrip />
          </section>
        </div>
      </div>
    </>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <div className="panel p-5"><h2 className="font-black">{title}</h2><p className="mb-4 text-xs text-slate-500">{subtitle} · Synthetic</p>{children}</div>;
}

function AboutPanel() {
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2"><Info className="text-blue-500" /><h2 className="text-xl font-black">About this concept</h2></div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">The Rogers Mobile Attach Agent demonstrates how a governed team of AI agents could support—not replace—retail employees and digital customers during a mobile purchase journey.</p>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{disclaimer}</p>
    </div>
  );
}

function DisclaimerStrip() {
  return <div className="border-t border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"><strong>Concept demonstration:</strong> {disclaimer}</div>;
}

function DefinitionList({ items, compact = false }: { items: [string, string][]; compact?: boolean }) {
  return <dl className={`${compact ? "mt-3" : "mt-5"} divide-y divide-slate-200 dark:divide-slate-700`}>{items.map(([label, value]) => <div className={`flex justify-between gap-4 ${compact ? "py-2 text-xs" : "py-2.5 text-sm"}`} key={label}><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>{children}</label>;
}

function SelectField({ label, value, options, onChange, suffix = "", optionLabels }: { label: string; value: string; options: string[]; onChange: (value: string) => void; suffix?: string; optionLabels?: Record<string, string> }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold text-slate-500">{label}</span><select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{optionLabels?.[option] ?? `${option}${suffix}`}</option>)}</select></label>;
}

function BasketLine({ product, label, value, optional = false }: { product?: Product; label?: string; value?: string; optional?: boolean }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{optional ? <Plus size={16} /> : <Check size={16} />}</span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="truncate">{product?.name ?? label}</strong>{optional && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Optional</span>}</div><div className="text-xs text-slate-500">{product?.description ?? value}</div></div>
      {product && <div className="shrink-0 text-right text-sm font-bold">{product.monthlyPrice ? `${money(product.monthlyPrice)}/mo` : money(product.upfrontPrice)}</div>}
    </div>
  );
}

function StatusRow({ label, value, colour }: { label: string; value: string; colour: string }) {
  const classes: Record<string, string> = { green: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500", grey: "bg-slate-400" };
  return <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"><span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${classes[colour]}`} />{label}</span><strong>{value}</strong></div>;
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  return <div className="grid h-28 w-28 place-items-center rounded-full border-[9px] border-emerald-500 bg-white/5"><div><div className="text-2xl font-black">{value}%</div><div className="text-xs text-slate-300">{label}</div></div></div>;
}

function InfoCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: ReactNode }) {
  return <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-xs font-bold uppercase tracking-widest">{label}</span></div><div className="mt-3 font-black">{value}</div><div className="text-xs text-slate-500">{sub}</div></div>;
}

function Drawer({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700"><button className="flex w-full items-center justify-between p-4 text-left font-black" onClick={onToggle}>{title}<ChevronDown className={`transition ${open ? "rotate-180" : ""}`} size={18} /></button>{open && <div className="border-t border-slate-200 p-4 dark:border-slate-700">{children}</div>}</div>;
}

function Chat({ who, text, customer: isCustomer = false }: { who: string; text: string; customer?: boolean }) {
  return <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl p-3 text-sm ${isCustomer ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}><div className={`mb-1 text-xs font-black ${isCustomer ? "text-blue-100" : "text-violet-600"}`}>{who}</div>{text}</div></div>;
}

export default App;
