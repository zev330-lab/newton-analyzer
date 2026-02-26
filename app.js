tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1B2A4A', light: '#2C3E6B', dark: '#0F1A2E' },
        gold: { DEFAULT: '#D4A843', light: '#E8C97A', dark: '#8B6914' },
        slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' }
      }
    }
  }
}

window.__MARKET__ = {"medianPrice":1450000,"avgPSF_overall":596,"avgPSF_byVillage":{"NEWTON":650,"NEWTON CENTRE":750,"WEST NEWTON":620,"NEWTONVILLE":600,"CHESTNUT HILL":800,"WABAN":700,"AUBURNDALE":580,"NEWTON HIGHLANDS":650,"NEWTON UPPER FALLS":550,"NEWTON LOWER FALLS":560},"premiumPSF_byVillage":{"NEWTON":720,"NEWTON CENTRE":830,"WEST NEWTON":700,"NEWTONVILLE":680,"CHESTNUT HILL":900,"WABAN":790,"AUBURNDALE":660,"NEWTON HIGHLANDS":720,"NEWTON UPPER FALLS":620,"NEWTON LOWER FALLS":640},"avgRentPSF":2.0,"rent2BR":3200,"rent3BR":4500,"taxRate":0.0098,"insuranceAnnual":3000,"maintenancePct":0.01,"mortgageRate":0.06,"downPaymentPct":0.25,"closingCostPct":0.03,"sellingCostPct":0.05,"renoPerSqft":85,"holdingMonths_flip":6,"vacancyRate":0.05,"medianDOM":45,"capRate_stabilized":0.05,"capRate_valueAdd":0.065,"refiLTV":0.75};
window.__STATS__ = {total: 25606, opportunities: 8197, flips: 2168, holds: 94, brrrrs: 1471, valueAdds: 34};

const { useState, useMemo, useCallback, useEffect, useRef } = React;
const fmt = (n, style = "currency") => {
  if (n == null || isNaN(n)) return "\u2014";
  if (style === "currency") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  if (style === "percent") return n.toFixed(1) + "%";
  if (style === "number") return new Intl.NumberFormat("en-US").format(Math.round(n));
  return String(n);
};
const calcMortgage = (principal, rate, years = 30) => {
  if (principal <= 0 || rate <= 0) return 0;
  const r = rate / 12, n = years * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};
const scoreColor = (s) => s >= 10 ? "text-emerald-700 bg-emerald-50" : s >= 8 ? "text-amber-700 bg-amber-50" : s >= 5 ? "text-blue-700 bg-blue-50" : "text-slate-500 bg-slate-50";
const scoreEmoji = (s) => s >= 10 ? "\u{1F7E2}" : s >= 7 ? "\u{1F7E1}" : "\u{1F534}";
const gradeColor = (g) => g === "A" ? "bg-emerald-100 text-emerald-800" : g === "B" ? "bg-blue-100 text-blue-800" : g === "C" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600";
const stratColor = (s) => s === "Flip" ? "bg-emerald-600" : s === "Hold" ? "bg-blue-600" : s === "BRRRR" ? "bg-purple-600" : s === "Value-Add" ? "bg-amber-600" : "bg-slate-400";
const Logo = ({ size = 80, className = "" }) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 64 64", width: size, height: size, className }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "navyGrad", x1: "0", y1: "0", x2: "1", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#1B2A4A" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#0F1A2E" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "goldGrad", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#E8C97A" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#D4A843" }))), /* @__PURE__ */ React.createElement("rect", { width: "64", height: "64", rx: "15", fill: "url(#navyGrad)" }), /* @__PURE__ */ React.createElement("rect", { x: "2", y: "2", width: "60", height: "60", rx: "13", fill: "none", stroke: "#D4A843", strokeWidth: "0.5", opacity: "0.15" }), /* @__PURE__ */ React.createElement("path", { d: "M32 11L12 24v2h40v-2L32 11z", fill: "url(#goldGrad)", opacity: "0.12" }), /* @__PURE__ */ React.createElement("path", { d: "M12 24l20-13 20 13", stroke: "url(#goldGrad)", strokeWidth: "2.5", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M16 24v20h32V24", stroke: "#D4A843", strokeWidth: "1.5", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", opacity: "0.6" }), /* @__PURE__ */ React.createElement("rect", { x: "27", y: "33", width: "10", height: "11", rx: "1.5", stroke: "#D4A843", strokeWidth: "1.5", fill: "rgba(212,168,67,0.08)" }), /* @__PURE__ */ React.createElement("circle", { cx: "35", cy: "39", r: "0.8", fill: "#D4A843" }), /* @__PURE__ */ React.createElement("rect", { x: "19", y: "28", width: "6", height: "5", rx: "1", stroke: "#D4A843", strokeWidth: "1.2", fill: "rgba(212,168,67,0.06)" }), /* @__PURE__ */ React.createElement("rect", { x: "39", y: "28", width: "6", height: "5", rx: "1", stroke: "#D4A843", strokeWidth: "1.2", fill: "rgba(212,168,67,0.06)" }), /* @__PURE__ */ React.createElement("circle", { cx: "44", cy: "18", r: "6", stroke: "#D4A843", strokeWidth: "1.5", fill: "none", opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "44", cy: "18", r: "2", fill: "#D4A843", opacity: "0.7" }), /* @__PURE__ */ React.createElement("path", { d: "M44 10.5v3M44 22.5v3M36.5 18h3M49.5 18h3", stroke: "#D4A843", strokeWidth: "1", strokeLinecap: "round", opacity: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: "M8 48h48", stroke: "#D4A843", strokeWidth: "1.5", strokeLinecap: "round", opacity: "0.25" }), /* @__PURE__ */ React.createElement("path", { d: "M50 47l4-5", stroke: "#D4A843", strokeWidth: "1.5", strokeLinecap: "round", opacity: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: "M52 42h2v2", stroke: "#D4A843", strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round", opacity: "0.5" }));
const RotatePrompt = ({ onContinue }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", () => setTimeout(check, 200));
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
  useEffect(() => {
    if (isLandscape) {
      const t = setTimeout(onContinue, 800);
      return () => clearTimeout(t);
    }
  }, [isLandscape, onContinue]);
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[9999] bg-navy flex flex-col items-center justify-center text-center p-6" }, /* @__PURE__ */ React.createElement(Logo, { size: 72, className: "mb-6 opacity-80" }), !isLandscape ? /* @__PURE__ */ React.createElement("div", { className: "fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "mb-8" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 100", width: "100", height: "100", className: "mx-auto" }, /* @__PURE__ */ React.createElement("rect", { x: "30", y: "10", width: "40", height: "68", rx: "6", stroke: "#64748B", strokeWidth: "2", fill: "none", strokeDasharray: "4 3" }), /* @__PURE__ */ React.createElement("circle", { cx: "50", cy: "70", r: "2.5", fill: "#64748B" }), /* @__PURE__ */ React.createElement("path", { d: "M72 44c8-2 14 4 12 14", stroke: "#D4A843", strokeWidth: "2.5", strokeLinecap: "round", fill: "none" }), /* @__PURE__ */ React.createElement("path", { d: "M82 54l2 4-4.5 0.5", stroke: "#D4A843", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "78", width: "72", height: "40", rx: "6", stroke: "#D4A843", strokeWidth: "2.5", fill: "rgba(212,168,67,0.08)" }), /* @__PURE__ */ React.createElement("circle", { cx: "78", cy: "98", r: "2.5", fill: "#D4A843" }), /* @__PURE__ */ React.createElement("line", { x1: "22", y1: "86", x2: "66", y2: "86", stroke: "#D4A843", strokeWidth: "1", opacity: "0.4" }), /* @__PURE__ */ React.createElement("line", { x1: "22", y1: "92", x2: "66", y2: "92", stroke: "#D4A843", strokeWidth: "1", opacity: "0.3" }), /* @__PURE__ */ React.createElement("line", { x1: "22", y1: "98", x2: "66", y2: "98", stroke: "#D4A843", strokeWidth: "1", opacity: "0.3" }), /* @__PURE__ */ React.createElement("line", { x1: "22", y1: "104", x2: "66", y2: "104", stroke: "#D4A843", strokeWidth: "1", opacity: "0.3" }), /* @__PURE__ */ React.createElement("line", { x1: "22", y1: "110", x2: "66", y2: "110", stroke: "#D4A843", strokeWidth: "1", opacity: "0.3" }))), /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-white mb-2" }, "Now Rotate to Landscape"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm max-w-xs mx-auto mb-10 leading-relaxed" }, "The property search and results table is optimized for landscape view. Turn your phone sideways for the best experience."), /* @__PURE__ */ React.createElement("button", { onClick: onContinue, className: "text-slate-500 text-xs underline underline-offset-4 hover:text-slate-300 transition-colors" }, "Continue in portrait anyway")) : /* @__PURE__ */ React.createElement("div", { className: "fade-in flex flex-col items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-3 h-3 rounded-full bg-emerald-400 animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-emerald-400 font-medium" }, "Landscape detected")), /* @__PURE__ */ React.createElement("p", { className: "text-white text-lg font-bold mb-1" }, "Loading analyzer...")));
};
const IntroOverlay = ({ onClose }) => {
  const [pg, setPg] = useState(0);
  const pages = [
    {
      title: "Welcome to Your Newton Investment Analyzer",
      content: /* @__PURE__ */ React.createElement("div", { className: "space-y-4 text-slate-600" }, /* @__PURE__ */ React.createElement("p", { className: "text-lg" }, "This tool was built specifically for you to identify, evaluate, and prioritize real estate investment opportunities across ", /* @__PURE__ */ React.createElement("strong", { className: "text-navy" }, "all 25,000+ properties in Newton, MA"), "."), /* @__PURE__ */ React.createElement("p", null, "Every property has been scored using a proprietary model that combines ", /* @__PURE__ */ React.createElement("strong", null, "public assessor data"), ", ", /* @__PURE__ */ React.createElement("strong", null, "predictive lead scoring"), " (how likely the owner is to sell), and ", /* @__PURE__ */ React.createElement("strong", null, "real-time market analysis"), " to surface the best deals across four strategies:"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-emerald-50 rounded-lg p-3 border border-emerald-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-emerald-700 uppercase" }, "Fix & Flip"), /* @__PURE__ */ React.createElement("p", { className: "text-sm mt-1" }, "Buy, renovate, sell for profit. The primary strategy for Newton.")), /* @__PURE__ */ React.createElement("div", { className: "bg-blue-50 rounded-lg p-3 border border-blue-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-blue-700 uppercase" }, "Buy & Hold"), /* @__PURE__ */ React.createElement("p", { className: "text-sm mt-1" }, "Multifamily properties with rental income potential.")), /* @__PURE__ */ React.createElement("div", { className: "bg-purple-50 rounded-lg p-3 border border-purple-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-purple-700 uppercase" }, "BRRRR"), /* @__PURE__ */ React.createElement("p", { className: "text-sm mt-1" }, "Buy, Rehab, Rent, Refinance, Repeat. Pull your capital back out.")), /* @__PURE__ */ React.createElement("div", { className: "bg-amber-50 rounded-lg p-3 border border-amber-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-amber-700 uppercase" }, "Value-Add"), /* @__PURE__ */ React.createElement("p", { className: "text-sm mt-1" }, "Teardown/rebuild, ADU, or expansion opportunities."))))
    },
    {
      title: "How the Scoring Works",
      content: /* @__PURE__ */ React.createElement("div", { className: "space-y-4 text-slate-600" }, /* @__PURE__ */ React.createElement("p", null, "Every property receives an ", /* @__PURE__ */ React.createElement("strong", { className: "text-navy" }, "Investment Score from 0 to 12"), ", calculated from four equally weighted factors:"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3 bg-slate-50 rounded-lg p-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-navy w-8 text-center" }, "1"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Price Efficiency (0-3 pts)"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "How far below market the assessed $/sqft is. Lower = more upside."))), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3 bg-slate-50 rounded-lg p-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-navy w-8 text-center" }, "2"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Seller Motivation (0-3 pts)"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "How long the owner has held the property. 50+ years = very likely to sell."))), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3 bg-slate-50 rounded-lg p-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-navy w-8 text-center" }, "3"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Profit Potential (0-3 pts)"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "Estimated ROI based on purchase price, renovation costs, and ARV."))), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3 bg-slate-50 rounded-lg p-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-navy w-8 text-center" }, "4"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Lead Quality (0-3 pts)"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "Predictive lead score and grade \u2014 how likely the owner is to sell soon.")))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4 mt-3 text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold" }, "10-12 = Strong"), /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold" }, "7-9 = Moderate"), /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold" }, "3-6 = Worth Watching")))
    },
    {
      title: "How to Use This Tool",
      content: /* @__PURE__ */ React.createElement("div", { className: "space-y-4 text-slate-600" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gold text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0" }, "1"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Filter & Search"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "Use the sidebar to narrow results by strategy, village, score, price, lead grade, and more. Type an address or owner name in the search bar."))), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gold text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0" }, "2"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Click Any Row to Expand"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "See full investment analysis with flip, hold, and BRRRR breakdowns. ", /* @__PURE__ */ React.createElement("strong", null, "Edit any number"), " (purchase price, reno budget, ARV, rent) and watch all metrics recalculate in real time."))), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gold text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0" }, "3"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Star Properties to Build Your List"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, 'Click the star icon on any property to add it to your shortlist. Add as many as you want. Use "Compare" to view side-by-side metrics.'))), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gold text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0" }, "4"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Send Your List"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "When you have properties you want to pursue, hit ", /* @__PURE__ */ React.createElement("strong", null, '"Send List to Zev"'), " to email your shortlist directly. You can also download it as a CSV.")))), /* @__PURE__ */ React.createElement("div", { className: "bg-navy/5 rounded-lg p-4 mt-4 border border-navy/10" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, /* @__PURE__ */ React.createElement("strong", null, "Tip:"), " All estimated values (ARV, reno budget, rent) are starting points based on market data. When you expand a property, override any field with your own numbers to get a custom analysis. The market assumptions used are documented in the app.")))
    },
    {
      title: "Important Notes on the Data",
      content: /* @__PURE__ */ React.createElement("div", { className: "space-y-4 text-slate-600" }, /* @__PURE__ */ React.createElement("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-amber-800 mb-2" }, "Assessed values are NOT market values"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, `Newton's FY2025 assessed values typically lag true market value by 10-20%. This means the "Assessed Value" column is usually `, /* @__PURE__ */ React.createElement("em", null, "below"), " what the owner would actually accept. Always verify with comps before making an offer.")), /* @__PURE__ */ React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-blue-800 mb-2" }, "Lead Score predicts seller likelihood"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "Grade A (score 9-12) owners are statistically the most likely to sell \u2014 often long-tenure seniors, estate situations, or investors looking to exit. Prioritize Grade A and B for outreach.")), /* @__PURE__ */ React.createElement("div", { className: "bg-emerald-50 border border-emerald-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-emerald-800 mb-2" }, "ARV & renovation estimates are starting points"), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "The estimated After-Repair Value uses village-specific $/sqft from recent comps. Renovation budgets default to $85/sqft. Override these in the property detail view with your own research for a more accurate analysis.")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-3" }, "Market data sourced from Redfin, Zillow, RentCafe, Freddie Mac, and Newton Assessor's Office (Feb 2026). Full methodology is documented in the companion XLSX report."))
    }
  ];
  const p = pages[pg];
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 overlay-bg flex items-end md:items-center justify-center p-0 md:p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white md:rounded-2xl rounded-t-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1.5 px-5 md:px-8 pt-5 md:pt-6" }, pages.map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `h-1.5 flex-1 rounded-full transition-colors ${i <= pg ? "bg-gold" : "bg-slate-200"}` }))), /* @__PURE__ */ React.createElement("div", { className: "px-5 md:px-8 py-5 md:py-6 flex-1 overflow-y-auto slide-in", key: pg }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl md:text-2xl font-bold text-navy mb-3 md:mb-4" }, p.title), p.content), /* @__PURE__ */ React.createElement("div", { className: "px-5 md:px-8 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50" }, /* @__PURE__ */ React.createElement("button", { onClick: () => pg > 0 ? setPg(pg - 1) : onClose(), className: "px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700" }, pg > 0 ? "\u2190 Back" : "Skip"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, pg + 1, " of ", pages.length), pg < pages.length - 1 ? /* @__PURE__ */ React.createElement("button", { onClick: () => setPg(pg + 1), className: "px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-light transition-colors" }, "Next ", "\u2192") : /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "px-6 py-2.5 bg-gold text-white rounded-lg text-sm font-bold hover:bg-gold-dark transition-colors" }, "Get Started ", "\u2192"))));
};
const Card = ({ label, value, sub, icon }) => /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl shadow-sm border border-slate-200 p-2.5 md:p-4 flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5" }, icon, " ", label), /* @__PURE__ */ React.createElement("div", { className: "text-lg md:text-2xl font-bold text-navy leading-tight" }, value), sub && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] md:text-xs text-slate-500 mt-0.5" }, sub));
const RangeSlider = ({ min, max, step = 1, value, onChange, label, suffix = "" }) => {
  const pct = (value - min) / (max - min) * 100;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 uppercase tracking-wide" }, label), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-navy bg-navy/5 px-1.5 py-0.5 rounded" }, value, suffix)), /* @__PURE__ */ React.createElement("div", { className: "relative h-6 flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: "absolute left-0 right-0 h-1.5 bg-slate-200 rounded-full overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "h-full bg-gold rounded-full transition-all", style: { width: pct + "%" } })), /* @__PURE__ */ React.createElement("input", { type: "range", min, max, step, value, onChange, className: "range-input absolute w-full" })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[9px] text-slate-300" }, /* @__PURE__ */ React.createElement("span", null, min, suffix), /* @__PURE__ */ React.createElement("span", null, max, suffix)));
};
const FilterBar = ({ filters, setFilters, villages, filtered }) => {
  const strategies = ["Flip", "Hold", "BRRRR", "Value-Add"];
  const grades = ["A", "B", "C", "D"];
  const types = ["SF", "Multi", "Apt", "Condo"];
  const typeMap = { "SF": "SF", "Multi": "MultiSmall", "Apt": "AptSmall", "Condo": "Condo" };
  const typeMapReverse = { "SF": "SF", "MultiSmall": "Multi", "AptSmall": "Apt", "Condo": "Condo" };
  const toggle = (key, val) => {
    setFilters((f) => {
      const arr = [...f[key]];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(val);
      return { ...f, [key]: arr };
    });
  };
  const [showMore, setShowMore] = useState(false);
  const Chip = ({ active, label, onClick, color, small }) => /* @__PURE__ */ React.createElement("button", { onClick, className: `${small ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[11px]"} rounded-full font-semibold transition-all ${active ? color || "bg-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}` }, label);
  const resetFilters = () => setFilters({ strategies: [], villages: [], grades: [], types: [], minScore: 3, minPrice: 0, maxPrice: 1e7, minTenure: 0, minROI: 0, search: "" });
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl shadow-sm border border-slate-200 p-2 lg:p-3 no-print" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "Search address, owner...", value: filters.search, onChange: (e) => setFilters((f) => ({ ...f, search: e.target.value })), className: "flex-1 min-w-[120px] max-w-[200px] lg:max-w-[260px] px-2.5 py-1.5 text-[11px] lg:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/40" }), strategies.map((s) => /* @__PURE__ */ React.createElement(Chip, { key: s, label: s, active: filters.strategies.includes(s), onClick: () => toggle("strategies", s), color: filters.strategies.includes(s) ? stratColor(s) + " text-white" : "", small: true })), grades.map((g) => /* @__PURE__ */ React.createElement(Chip, { key: g, label: g, active: filters.grades.includes(g), onClick: () => toggle("grades", g), small: true })), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 font-medium ml-auto" }, filtered, " results"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowMore(!showMore), className: "text-[10px] text-gold font-semibold hover:text-gold-dark" }, showMore ? "Less" : "More"), /* @__PURE__ */ React.createElement("button", { onClick: resetFilters, className: "text-[10px] text-slate-400 hover:text-red-400" }, "Reset")), showMore && /* @__PURE__ */ React.createElement("div", { className: "mt-2 pt-2 border-t border-slate-100 fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2" }, /* @__PURE__ */ React.createElement(RangeSlider, { label: "Min Score", min: 0, max: 12, value: filters.minScore, onChange: (e) => setFilters((f) => ({ ...f, minScore: +e.target.value })) }), /* @__PURE__ */ React.createElement(RangeSlider, { label: "Min Tenure", min: 0, max: 125, value: filters.minTenure, onChange: (e) => setFilters((f) => ({ ...f, minTenure: +e.target.value })), suffix: " yrs" }), /* @__PURE__ */ React.createElement(RangeSlider, { label: "Min ROI", min: 0, max: 100, step: 5, value: filters.minROI, onChange: (e) => setFilters((f) => ({ ...f, minROI: +e.target.value })), suffix: "%" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1" }, "Price Range"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1" }, /* @__PURE__ */ React.createElement("input", { type: "number", step: "50000", placeholder: "Min", value: filters.minPrice || "", onChange: (e) => setFilters((f) => ({ ...f, minPrice: +e.target.value })), className: "w-full px-1.5 py-1 text-[11px] border border-slate-200 rounded" }), /* @__PURE__ */ React.createElement("input", { type: "number", step: "50000", placeholder: "Max", value: filters.maxPrice < 1e7 ? filters.maxPrice : "", onChange: (e) => setFilters((f) => ({ ...f, maxPrice: +e.target.value || 1e7 })), className: "w-full px-1.5 py-1 text-[11px] border border-slate-200 rounded" })))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mt-2 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 font-semibold" }, "Type:"), types.map((t) => /* @__PURE__ */ React.createElement(Chip, { key: t, label: t, active: filters.types.includes(typeMap[t]), onClick: () => toggle("types", typeMap[t]), small: true })), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 font-semibold ml-2" }, "Village:"), /* @__PURE__ */ React.createElement("select", { value: filters.villages[0] || "", onChange: (e) => setFilters((f) => ({ ...f, villages: e.target.value ? [e.target.value] : [] })), className: "text-[11px] border border-slate-200 rounded px-1.5 py-1" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "All"), villages.map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v))))));
};
const PropertyDetail = ({ prop, market, onClose, onToggleStar, isStarred }) => {
  const [overrides, setOverrides] = useState({
    purchasePrice: prop.assessedValue,
    renoBudget: prop.estRenoBudget,
    arvEstimate: prop.estARV,
    monthlyRent: prop.estMonthlyRent,
    interestRate: market.mortgageRate * 100,
    downPayment: market.downPaymentPct * 100,
    holdingMonths: prop.strategy === "Flip" ? market.holdingMonths_flip : 12
  });
  const set = (k, v) => setOverrides((o) => ({ ...o, [k]: v }));
  const calc = useMemo(() => {
    const pp = overrides.purchasePrice;
    const reno = overrides.renoBudget;
    const arv = overrides.arvEstimate;
    const rent = overrides.monthlyRent;
    const rate = overrides.interestRate / 100;
    const dp = overrides.downPayment / 100;
    const months = overrides.holdingMonths;
    const holdCost = pp * (rate * months / 12);
    const closingCost = pp * market.closingCostPct;
    const sellingCost = arv * market.sellingCostPct;
    const totalCost = reno + holdCost + closingCost + sellingCost;
    const netProfit = arv - pp - totalCost;
    const roi = pp + reno > 0 ? netProfit / (pp + reno) * 100 : 0;
    const loanAmt = pp * (1 - dp);
    const monthlyMortgage = calcMortgage(loanAmt, rate);
    const monthlyTax = pp * market.taxRate / 12;
    const monthlyIns = market.insuranceAnnual / 12;
    const monthlyMaint = pp * market.maintenancePct / 12;
    const monthlyVacancy = rent * market.vacancyRate;
    const totalExpense = monthlyMortgage + monthlyTax + monthlyIns + monthlyMaint + monthlyVacancy;
    const cashflow = rent - totalExpense;
    const annualRent = rent * 12;
    const annualNOI = annualRent * (1 - market.vacancyRate) - pp * market.taxRate - market.insuranceAnnual - pp * market.maintenancePct;
    const capRate = pp > 0 ? annualNOI / pp * 100 : 0;
    const grossYield = pp > 0 ? annualRent / pp * 100 : 0;
    const refiAmt = arv * market.refiLTV;
    const cashIn = pp + reno;
    const cashLeft = cashIn - refiAmt;
    const refiMortgage = calcMortgage(refiAmt, rate);
    const brrrCashflow = rent - (refiMortgage + monthlyTax + monthlyIns + monthlyMaint + monthlyVacancy);
    const score = (() => {
      let s = 0;
      const psf = prop.sqft > 0 ? pp / prop.sqft : 999;
      if (psf < 350) s += 3;
      else if (psf < 450) s += 2;
      else if (psf < 550) s += 1;
      if (prop.tenure >= 50) s += 3;
      else if (prop.tenure >= 35) s += 2;
      else if (prop.tenure >= 25) s += 1;
      if (roi > 30) s += 3;
      else if (roi > 20) s += 2;
      else if (roi > 10) s += 1;
      if (prop.leadScore >= 11 && prop.leadGrade === "A") s += 3;
      else if (prop.leadScore >= 9 || prop.leadGrade === "A") s += 2;
      else if (prop.leadScore >= 7 || prop.leadGrade === "B") s += 1;
      return s;
    })();
    return { netProfit, roi, holdCost, closingCost, sellingCost, totalCost, cashflow, monthlyMortgage, monthlyTax, monthlyIns, monthlyMaint, monthlyVacancy, totalExpense, capRate, grossYield, annualRent, annualNOI, refiAmt, cashIn, cashLeft, refiMortgage, brrrCashflow, score };
  }, [overrides, market, prop]);
  const InputField = ({ label, value, onChange, prefix, suffix }) => /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between py-1 border-b border-slate-100" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] lg:text-xs text-slate-600" }, label), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-0.5" }, prefix && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400" }, prefix), /* @__PURE__ */ React.createElement("input", { type: "number", value, onChange: (e) => onChange(+e.target.value), className: "w-20 lg:w-24 text-right text-[11px] lg:text-sm font-medium px-1.5 py-0.5 border border-slate-200 rounded focus:ring-2 focus:ring-gold/40 focus:outline-none" }), suffix && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400" }, suffix)));
  const Row = ({ label, value, highlight }) => /* @__PURE__ */ React.createElement("div", { className: `flex justify-between py-0.5 text-[11px] lg:text-sm ${highlight ? "font-bold text-navy" : "text-slate-600"}` }, /* @__PURE__ */ React.createElement("span", null, label), /* @__PURE__ */ React.createElement("span", { className: highlight ? "text-sm lg:text-lg" : "" }, value));
  return /* @__PURE__ */ React.createElement("div", { className: "detail-modal", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-auto my-2 lg:my-6 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "bg-navy text-white px-3 lg:px-6 py-3 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm lg:text-xl font-bold truncate" }, prop.address), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] lg:text-sm text-slate-300 truncate" }, prop.village, ", MA ", prop.zip, " \xB7 ", prop.homeType, " \xB7 ", prop.owner)), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 flex-shrink-0 ml-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => onToggleStar(prop.id), className: `px-2 lg:px-3 py-1.5 rounded-lg text-[11px] lg:text-sm font-medium transition-all ${isStarred ? "bg-gold text-white" : "bg-white/10 text-white hover:bg-white/20"}` }, isStarred ? "\u2605" : "\u2606"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "px-2 lg:px-3 py-1.5 rounded-lg text-[11px] lg:text-sm bg-white/10 text-white hover:bg-white/20" }, "\u2715"))), /* @__PURE__ */ React.createElement("div", { className: "px-3 lg:px-6 py-3 lg:py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-3 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold text-white ${stratColor(prop.strategy)}` }, prop.strategy), /* @__PURE__ */ React.createElement("span", { className: `px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold ${scoreColor(calc.score)}` }, "Score: ", calc.score, "/12"), /* @__PURE__ */ React.createElement("span", { className: `px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold ${gradeColor(prop.leadGrade)}` }, "Grade ", prop.leadGrade), prop.yearBuilt && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400" }, "Built ", prop.yearBuilt)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5 col-span-2 lg:col-span-1" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-[11px] lg:text-sm text-navy mb-1 border-b-2 border-gold pb-1" }, "Adjustable Inputs"), /* @__PURE__ */ React.createElement(InputField, { label: "Purchase", value: overrides.purchasePrice, onChange: (v) => set("purchasePrice", v), prefix: "$" }), /* @__PURE__ */ React.createElement(InputField, { label: "Reno Budget", value: overrides.renoBudget, onChange: (v) => set("renoBudget", v), prefix: "$" }), /* @__PURE__ */ React.createElement(InputField, { label: "ARV", value: overrides.arvEstimate, onChange: (v) => set("arvEstimate", v), prefix: "$" }), /* @__PURE__ */ React.createElement(InputField, { label: "Rent/mo", value: overrides.monthlyRent, onChange: (v) => set("monthlyRent", v), prefix: "$" }), /* @__PURE__ */ React.createElement(InputField, { label: "Rate", value: overrides.interestRate, onChange: (v) => set("interestRate", v), suffix: "%" }), /* @__PURE__ */ React.createElement(InputField, { label: "Down Pmt", value: overrides.downPayment, onChange: (v) => set("downPayment", v), suffix: "%" }), /* @__PURE__ */ React.createElement(InputField, { label: "Hold", value: overrides.holdingMonths, onChange: (v) => set("holdingMonths", v), suffix: "mo" })), /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-[11px] lg:text-sm text-navy mb-1 border-b-2 border-emerald-500 pb-1" }, "Flip Analysis"), /* @__PURE__ */ React.createElement(Row, { label: "Purchase", value: fmt(overrides.purchasePrice) }), /* @__PURE__ */ React.createElement(Row, { label: "+ Reno", value: fmt(overrides.renoBudget) }), /* @__PURE__ */ React.createElement(Row, { label: "+ Hold", value: fmt(calc.holdCost) }), /* @__PURE__ */ React.createElement(Row, { label: "+ Closing", value: fmt(calc.closingCost) }), /* @__PURE__ */ React.createElement(Row, { label: "+ Selling", value: fmt(calc.sellingCost) }), /* @__PURE__ */ React.createElement(Row, { label: "ARV", value: fmt(overrides.arvEstimate) }), /* @__PURE__ */ React.createElement("div", { className: "border-t-2 border-navy pt-1 mt-1" }, /* @__PURE__ */ React.createElement(Row, { label: "Profit", value: fmt(calc.netProfit), highlight: true }), /* @__PURE__ */ React.createElement(Row, { label: "ROI", value: fmt(calc.roi, "percent"), highlight: true })), /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-[11px] lg:text-sm text-navy mt-3 mb-1 border-b-2 border-purple-500 pb-1" }, "BRRRR"), /* @__PURE__ */ React.createElement(Row, { label: "Cash In", value: fmt(calc.cashIn) }), /* @__PURE__ */ React.createElement(Row, { label: "Refi (75%)", value: fmt(calc.refiAmt) }), /* @__PURE__ */ React.createElement(Row, { label: "Cash Left", value: fmt(calc.cashLeft), highlight: true }), /* @__PURE__ */ React.createElement(Row, { label: "CF/mo", value: fmt(calc.brrrCashflow) })), /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-[11px] lg:text-sm text-navy mb-1 border-b-2 border-blue-500 pb-1" }, "Hold / Rental"), /* @__PURE__ */ React.createElement(Row, { label: "Rent", value: fmt(overrides.monthlyRent) }), /* @__PURE__ */ React.createElement(Row, { label: "- Mortgage", value: fmt(-calc.monthlyMortgage) }), /* @__PURE__ */ React.createElement(Row, { label: "- Tax", value: fmt(-calc.monthlyTax) }), /* @__PURE__ */ React.createElement(Row, { label: "- Ins", value: fmt(-calc.monthlyIns) }), /* @__PURE__ */ React.createElement(Row, { label: "- Maint", value: fmt(-calc.monthlyMaint) }), /* @__PURE__ */ React.createElement(Row, { label: "- Vacancy", value: fmt(-calc.monthlyVacancy) }), /* @__PURE__ */ React.createElement("div", { className: "border-t-2 border-navy pt-1 mt-1" }, /* @__PURE__ */ React.createElement(Row, { label: "CF/mo", value: fmt(calc.cashflow), highlight: true }), /* @__PURE__ */ React.createElement(Row, { label: "NOI/yr", value: fmt(calc.annualNOI) }), /* @__PURE__ */ React.createElement(Row, { label: "Yield", value: fmt(calc.grossYield, "percent") }), /* @__PURE__ */ React.createElement(Row, { label: "Cap Rate", value: fmt(calc.capRate, "percent") })))), /* @__PURE__ */ React.createElement("div", { className: "mt-3 bg-slate-50 rounded-lg p-2 text-[10px] lg:text-xs text-slate-500" }, /* @__PURE__ */ React.createElement("strong", null, "Data:"), " ", fmt(prop.assessedValue), " \xB7 ", fmt(prop.sqft, "number"), " sqft \xB7 ", fmt(prop.pricePerSqft), "/sqft \xB7 Tenure: ", prop.tenure, " yrs \xB7 Lead: ", prop.leadScore, " \xB7 ", prop.segment, prop.lotSize && ` \xB7 Lot: ${prop.lotSize} ac`, prop.zoning && ` \xB7 Zone: ${prop.zoning}`))));
};
const CompareView = ({ properties, market, onClose }) => {
  if (properties.length === 0) return null;
  const metrics = [
    ["Assessed Value", (p) => fmt(p.assessedValue)],
    ["Sqft", (p) => fmt(p.sqft, "number")],
    ["$/Sqft", (p) => fmt(p.pricePerSqft)],
    ["Year Built", (p) => p.yearBuilt || "\u2014"],
    ["Tenure (yrs)", (p) => p.tenure],
    ["Lead Score", (p) => p.leadScore],
    ["Grade", (p) => p.leadGrade],
    ["Strategy", (p) => p.strategy],
    ["Inv Score", (p) => p.investmentScore + "/12"],
    ["Est ARV", (p) => fmt(p.estARV)],
    ["Reno Budget", (p) => fmt(p.estRenoBudget)],
    ["Est Profit", (p) => fmt(p.estProfit)],
    ["Est ROI", (p) => fmt(p.estROI, "percent")],
    ["Monthly Rent", (p) => fmt(p.estMonthlyRent)],
    ["Gross Yield", (p) => fmt(p.estGrossYield, "percent")],
    ["BRRRR Cash Left", (p) => fmt(p.brrrr_cashLeft)]
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6 fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-navy text-lg" }, "Property Comparison (", properties.length, ")"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "text-sm text-slate-500 hover:text-slate-700" }, "Close Comparison")), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-navy text-white" }, /* @__PURE__ */ React.createElement("th", { className: "text-left px-3 py-2 font-semibold" }, "Metric"), properties.map((p) => /* @__PURE__ */ React.createElement("th", { key: p.id, className: "text-right px-3 py-2 font-semibold" }, p.address.substring(0, 25))))), /* @__PURE__ */ React.createElement("tbody", null, metrics.map(([label, fn], i) => /* @__PURE__ */ React.createElement("tr", { key: label, className: i % 2 === 0 ? "bg-slate-50" : "" }, /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 font-medium text-slate-600" }, label), properties.map((p) => /* @__PURE__ */ React.createElement("td", { key: p.id, className: "text-right px-3 py-1.5" }, fn(p)))))))));
};
const App = () => {
  const [allData, setAllData] = useState(window.__PROPERTIES__ || null);
  const market = window.__MARKET__;
  const stats = window.__STATS__;
  useEffect(() => {
    var sp = document.getElementById("splash");
    if (sp) sp.parentNode.removeChild(sp);
  }, []);
  useEffect(() => {
    if (!allData) {
      const s = document.createElement("script");
      s.src = "data.js";
      s.onload = () => setAllData(window.__PROPERTIES__);
      document.body.appendChild(s);
    }
  }, []);
  const [filters, setFilters] = useState({
    strategies: [],
    villages: [],
    grades: [],
    types: [],
    minScore: 3,
    minPrice: 0,
    maxPrice: 1e7,
    minTenure: 0,
    minROI: 0,
    search: ""
  });
  const [appPhase, setAppPhase] = useState("guide");
  const [sortKey, setSortKey] = useState("investmentScore");
  const [sortDir, setSortDir] = useState(-1);
  const [expandedId, setExpandedId] = useState(null);
  const [starred, setStarred] = useState(/* @__PURE__ */ new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const villages = useMemo(() => [...new Set(allData.map((p) => p.village))].sort(), [allData]);
  const filtered = useMemo(() => {
    let d = allData.filter((p) => {
      if (filters.strategies.length && !filters.strategies.includes(p.strategy)) return false;
      if (filters.villages.length && !filters.villages.includes(p.village)) return false;
      if (filters.grades.length && !filters.grades.includes(p.leadGrade)) return false;
      if (filters.types.length && !filters.types.includes(p.homeType)) return false;
      if (p.investmentScore < filters.minScore) return false;
      if (p.assessedValue < filters.minPrice || p.assessedValue > filters.maxPrice) return false;
      if (p.tenure < filters.minTenure) return false;
      if (p.estROI < filters.minROI) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!p.address.toLowerCase().includes(s) && !p.owner.toLowerCase().includes(s) && !p.segment.toLowerCase().includes(s) && !p.village.toLowerCase().includes(s)) return false;
      }
      return true;
    });
    d.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (av == null) av = -Infinity;
      if (bv == null) bv = -Infinity;
      return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
    });
    return d;
  }, [allData, filters, sortKey, sortDir]);
  const paged = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  useEffect(() => setPage(0), [filters, sortKey, sortDir]);
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d * -1);
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  };
  const toggleStar = (id) => setStarred((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
  const starredProps = useMemo(() => allData.filter((p) => starred.has(p.id)), [allData, starred]);
  const buildListText = (props) => {
    let txt = `Newton MA \u2014 Property Shortlist (${props.length} properties)
`;
    txt += `Sent from Newton Investment Analyzer on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}

`;
    props.forEach((p, i) => {
      txt += `${i + 1}. ${p.address}, ${p.village} MA ${p.zip}
`;
      txt += `   Owner: ${p.owner} | Type: ${p.homeType} | Strategy: ${p.strategy}
`;
      txt += `   Assessed: ${fmt(p.assessedValue)} | ${fmt(p.sqft, "number")} sqft | $/sqft: ${fmt(p.pricePerSqft)}
`;
      txt += `   Score: ${p.investmentScore}/12 | Grade: ${p.leadGrade} | Tenure: ${p.tenure} yrs
`;
      txt += `   Est ARV: ${fmt(p.estARV)} | Reno: ${fmt(p.estRenoBudget)} | Profit: ${fmt(p.estProfit)} | ROI: ${fmt(p.estROI, "percent")}
`;
      if (p.homeType === "MultiSmall" || p.homeType === "AptSmall") {
        txt += `   Rent: ${fmt(p.estMonthlyRent)}/mo | Yield: ${fmt(p.estGrossYield, "percent")} | Cashflow: ${fmt(p.estMonthlyCashflow)}/mo
`;
      }
      txt += `   Segment: ${p.segment}

`;
    });
    return txt;
  };
  const sendListToZev = () => {
    if (starredProps.length === 0) return;
    const subject = encodeURIComponent(`Newton Investment Shortlist \u2014 ${starredProps.length} Properties`);
    const body = encodeURIComponent(buildListText(starredProps));
    const mailtoUrl = `mailto:zev.steinmetz@raveis.com?subject=${subject}&body=${body}`;
    if (mailtoUrl.length > 2e3) {
      navigator.clipboard.writeText(buildListText(starredProps)).then(() => {
        setSendStatus("copied");
        setTimeout(() => setSendStatus(null), 4e3);
      });
      const shortBody = encodeURIComponent(`Newton Investment Shortlist \u2014 ${starredProps.length} properties

Full list copied to clipboard. Please paste below.

Properties: ${starredProps.map((p) => p.address).join(", ")}`);
      window.open(`mailto:zev.steinmetz@raveis.com?subject=${subject}&body=${shortBody}`, "_self");
    } else {
      window.open(mailtoUrl, "_self");
      setSendStatus("sent");
      setTimeout(() => setSendStatus(null), 3e3);
    }
  };
  const downloadCSV = () => {
    if (starredProps.length === 0) return;
    const headers = ["Address", "Village", "ZIP", "Owner", "Type", "Assessed Value", "Sqft", "$/Sqft", "Tenure", "Lead Score", "Grade", "Strategy", "Inv Score", "Est ARV", "Reno Budget", "Est Profit", "ROI%", "Monthly Rent", "Gross Yield%", "Segment"];
    const rows = starredProps.map((p) => [
      p.address,
      p.village,
      p.zip,
      p.owner,
      p.homeType,
      p.assessedValue,
      p.sqft,
      p.pricePerSqft,
      p.tenure,
      p.leadScore,
      p.leadGrade,
      p.strategy,
      p.investmentScore,
      p.estARV,
      p.estRenoBudget,
      p.estProfit,
      p.estROI,
      p.estMonthlyRent,
      p.estGrossYield,
      p.segment
    ]);
    let csv = headers.join(",") + "\n";
    rows.forEach((r) => {
      csv += r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Newton_Shortlist_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const clearList = () => setStarred(/* @__PURE__ */ new Set());
  const SortHeader = ({ k, label }) => /* @__PURE__ */ React.createElement("th", { onClick: () => handleSort(k), className: "px-1 py-1.5 lg:px-2 lg:py-2.5 text-left text-[10px] lg:text-xs font-semibold cursor-pointer hover:bg-navy-light select-none whitespace-nowrap" }, label, " ", sortKey === k ? sortDir === 1 ? "\u25B2" : "\u25BC" : "");
  if (appPhase === "guide") {
    return /* @__PURE__ */ React.createElement(IntroOverlay, { onClose: () => setAppPhase("rotate") });
  }
  if (appPhase === "rotate") {
    return /* @__PURE__ */ React.createElement(RotatePrompt, { onContinue: () => setAppPhase("app") });
  }
  if (!allData) {
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-navy flex flex-col items-center justify-center" }, /* @__PURE__ */ React.createElement(Logo, { size: 60, className: "mb-4 opacity-80" }), /* @__PURE__ */ React.createElement("div", { className: "text-gold font-bold text-sm mb-2" }, "Loading properties..."), /* @__PURE__ */ React.createElement("div", { style: { width: 100, height: 3, background: "#2C3E6B", borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "40%", height: "100%", background: "#D4A843", borderRadius: 3, animation: "loadbar 1.2s ease-in-out infinite" } })), /* @__PURE__ */ React.createElement("style", null, "@keyframes loadbar{0%{width:10%;margin-left:0}50%{width:50%;margin-left:25%}100%{width:10%;margin-left:90%}}"));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen", style: { background: "#F8FAFC" } }, showIntro && /* @__PURE__ */ React.createElement(IntroOverlay, { onClose: () => setShowIntro(false) }), /* @__PURE__ */ React.createElement("header", { className: "bg-navy text-white py-3 md:py-5 px-4 md:px-6 shadow-lg app-header" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1600px] mx-auto flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 min-w-0" }, /* @__PURE__ */ React.createElement(Logo, { size: 36, className: "flex-shrink-0 hidden sm:block" }), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h1", { className: "text-base md:text-2xl font-bold tracking-tight truncate" }, "Newton MA \u2014 Investment Analyzer"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-[11px] md:text-xs mt-0.5" }, "Steinmetz Real Estate | William Raveis"))), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowIntro(true), className: "px-3 py-2 rounded-lg text-xs md:text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors no-print flex-shrink-0", title: "How to use this tool" }, "? Guide"))), /* @__PURE__ */ React.createElement("div", { className: "max-w-[1600px] mx-auto px-3 md:px-4 -mt-3 md:-mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 dash-cards" }, /* @__PURE__ */ React.createElement(Card, { label: "Properties Analyzed", value: fmt(stats.total, "number"), icon: "" }), /* @__PURE__ */ React.createElement(Card, { label: "Median Price", value: fmt(market.medianPrice), sub: "Newton overall", icon: "" }), /* @__PURE__ */ React.createElement(Card, { label: "Median $/sqft", value: fmt(market.avgPSF_overall), sub: "All conditions", icon: "" }), /* @__PURE__ */ React.createElement(Card, { label: "Mortgage Rate", value: "6.00%", sub: "30yr fixed", icon: "" }), /* @__PURE__ */ React.createElement(Card, { label: "Tax Rate", value: "$9.80/1K", sub: "FY2025", icon: "" }), /* @__PURE__ */ React.createElement(Card, { label: "Opportunities", value: fmt(stats.opportunities, "number"), sub: `${stats.flips} flip \xB7 ${stats.holds} hold \xB7 ${stats.brrrrs} BRRRR`, icon: "" }))), starred.size > 0 && /* @__PURE__ */ React.createElement("div", { className: "max-w-[1600px] mx-auto px-3 md:px-4 mt-4 no-print shortlist-bar" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gold/10 border border-gold/30 rounded-xl px-3 md:px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-bold text-gold-dark" }, "Your Shortlist (", starred.size, " properties)"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("button", { onClick: sendListToZev, className: "px-3 md:px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-light transition-colors flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" })), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Send List to Zev"), /* @__PURE__ */ React.createElement("span", { className: "sm:hidden" }, "Send")), /* @__PURE__ */ React.createElement("button", { onClick: downloadCSV, className: "px-3 md:px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" })), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Download CSV"), /* @__PURE__ */ React.createElement("span", { className: "sm:hidden" }, "CSV")), starred.size <= 4 && /* @__PURE__ */ React.createElement("button", { onClick: () => setShowCompare(!showCompare), className: "px-3 md:px-4 py-2 bg-gold text-white rounded-lg text-sm font-bold hover:bg-gold-dark transition-colors" }, showCompare ? "Hide" : "Compare"), /* @__PURE__ */ React.createElement("button", { onClick: clearList, className: "px-3 py-2 text-red-400 hover:text-red-600 text-sm font-medium", title: "Clear all" }, "Clear"))), sendStatus === "copied" && /* @__PURE__ */ React.createElement("div", { className: "mb-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium" }, "List copied to clipboard \u2014 paste it into the email that just opened."), sendStatus === "sent" && /* @__PURE__ */ React.createElement("div", { className: "mb-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium" }, "Opening email client with your shortlist..."), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, starredProps.map((p) => /* @__PURE__ */ React.createElement("span", { key: p.id, className: "px-2 py-1.5 bg-white rounded-lg text-xs font-medium text-navy shadow-sm flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: `w-2 h-2 rounded-full flex-shrink-0 ${stratColor(p.strategy)}` }), /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[140px] sm:max-w-none" }, p.address), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline text-slate-400" }, p.village), /* @__PURE__ */ React.createElement("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-bold ${scoreColor(p.investmentScore)}` }, p.investmentScore), /* @__PURE__ */ React.createElement("button", { onClick: () => toggleStar(p.id), className: "ml-0.5 text-red-400 hover:text-red-600" }, "\xD7")))))), showCompare && /* @__PURE__ */ React.createElement("div", { className: "max-w-[1600px] mx-auto px-4 mt-4" }, /* @__PURE__ */ React.createElement(CompareView, { properties: starredProps, market, onClose: () => setShowCompare(false) })), /* @__PURE__ */ React.createElement("div", { className: "max-w-[1600px] mx-auto px-2 lg:px-4 py-2 lg:py-4 main-content" }, /* @__PURE__ */ React.createElement(FilterBar, { filters, setFilters, villages, filtered: filtered.length }), /* @__PURE__ */ React.createElement("div", { className: "mt-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-hidden" }, /* @__PURE__ */ React.createElement("table", { className: "w-full data-table", style: { tableLayout: "auto" } }, /* @__PURE__ */ React.createElement("thead", { className: "bg-navy text-white sticky top-0 z-10" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "px-1 py-1.5 w-6" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "address", label: "Address" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "village", label: "Village" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "homeType", label: "Type" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "assessedValue", label: "Value" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "tenure", label: "Yrs" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "leadGrade", label: "Grd" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "strategy", label: "Strategy" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "investmentScore", label: "Score" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "estROI", label: "ROI%" }), /* @__PURE__ */ React.createElement(SortHeader, { k: "estProfit", label: "Profit" }))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, paged.map((p) => /* @__PURE__ */ React.createElement("tr", { key: p.id, onClick: () => setExpandedId(expandedId === p.id ? null : p.id), className: `cursor-pointer hover:bg-slate-50 transition-colors ${expandedId === p.id ? "bg-blue-50" : ""} ${starred.has(p.id) ? "border-l-4 border-l-gold" : ""}` }, /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-center" }, /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    toggleStar(p.id);
  }, className: `text-xs ${starred.has(p.id) ? "text-gold" : "text-slate-300 hover:text-slate-400"}` }, starred.has(p.id) ? "\u2605" : "\u2606")), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-[11px] lg:text-[13px] font-medium text-navy addr-cell", title: p.address }, p.address), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-[10px] lg:text-[11px] text-slate-600 whitespace-nowrap" }, p.village), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-[10px] lg:text-[11px] text-slate-600" }, p.homeType), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-[11px] lg:text-[13px] font-medium text-right whitespace-nowrap" }, fmt(p.assessedValue)), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-[11px] lg:text-[13px] text-center" }, p.tenure), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1" }, /* @__PURE__ */ React.createElement("span", { className: `px-1 py-0.5 rounded text-[9px] lg:text-[10px] font-bold ${gradeColor(p.leadGrade)}` }, p.leadGrade)), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1" }, /* @__PURE__ */ React.createElement("span", { className: `px-1 py-0.5 rounded text-[9px] lg:text-[10px] font-bold text-white ${stratColor(p.strategy)}` }, p.strategy)), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1" }, /* @__PURE__ */ React.createElement("span", { className: `px-1 py-0.5 rounded text-[9px] lg:text-[10px] font-bold ${scoreColor(p.investmentScore)}` }, p.investmentScore)), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-[11px] lg:text-[13px] text-right font-medium", style: { color: p.estROI > 20 ? "#059669" : p.estROI > 10 ? "#D97706" : "#64748B" } }, fmt(p.estROI, "percent")), /* @__PURE__ */ React.createElement("td", { className: "px-1 py-1 text-[11px] lg:text-[13px] text-right font-medium whitespace-nowrap" }, fmt(p.estProfit))))))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-2 lg:px-4 py-1.5 lg:py-3 border-t border-slate-200 bg-slate-50" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] lg:text-xs text-slate-500" }, page * PAGE_SIZE + 1, "\u2013", Math.min((page + 1) * PAGE_SIZE, filtered.length), " of ", fmt(filtered.length, "number")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1" }, /* @__PURE__ */ React.createElement("button", { disabled: page === 0, onClick: () => setPage((p) => p - 1), className: "px-2 lg:px-3 py-1 rounded text-xs lg:text-sm bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50" }, "Prev"), Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    let pg = i;
    if (totalPages > 5) {
      if (page < 3) pg = i;
      else if (page > totalPages - 3) pg = totalPages - 5 + i;
      else pg = page - 2 + i;
    }
    return /* @__PURE__ */ React.createElement("button", { key: pg, onClick: () => setPage(pg), className: `px-2 lg:px-3 py-1 rounded text-xs lg:text-sm ${page === pg ? "bg-navy text-white" : "bg-white border border-slate-200 hover:bg-slate-50"}` }, pg + 1);
  }), /* @__PURE__ */ React.createElement("button", { disabled: page >= totalPages - 1, onClick: () => setPage((p) => p + 1), className: "px-2 lg:px-3 py-1 rounded text-xs lg:text-sm bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50" }, "Next"))))), expandedId && (() => {
    const p = allData.find((x) => x.id === expandedId);
    return p ? /* @__PURE__ */ React.createElement(PropertyDetail, { prop: p, market, onClose: () => setExpandedId(null), onToggleStar: toggleStar, isStarred: starred.has(p.id) }) : null;
  })(), /* @__PURE__ */ React.createElement("footer", { className: "bg-navy text-slate-400 text-xs text-center py-3 mt-4 app-footer" }, "Newton MA Investment Analysis \xB7 Steinmetz Real Estate \xB7 William Raveis \xB7 Generated ", (/* @__PURE__ */ new Date()).toLocaleDateString()));
};
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));

// Generate favicon via canvas (deferred to not block page load)
setTimeout(function(){
  var s=32,c=document.createElement('canvas');c.width=s;c.height=s;var x=c.getContext('2d');
  var r=5;x.beginPath();x.moveTo(r,0);x.lineTo(s-r,0);x.quadraticCurveTo(s,0,s,r);x.lineTo(s,s-r);x.quadraticCurveTo(s,s,s-r,s);x.lineTo(r,s);x.quadraticCurveTo(0,s,0,s-r);x.lineTo(0,r);x.quadraticCurveTo(0,0,r,0);x.closePath();
  var g=x.createLinearGradient(0,0,s,s);g.addColorStop(0,'#1B2A4A');g.addColorStop(1,'#0F1A2E');x.fillStyle=g;x.fill();
  x.strokeStyle='#D4A843';x.lineWidth=2;x.lineCap='round';x.lineJoin='round';
  x.beginPath();x.moveTo(6,14);x.lineTo(16,6);x.lineTo(26,14);x.stroke();
  x.lineWidth=1.2;x.globalAlpha=0.7;x.beginPath();x.moveTo(8,14);x.lineTo(8,24);x.lineTo(24,24);x.lineTo(24,14);x.stroke();
  x.globalAlpha=1;x.lineWidth=1;x.beginPath();x.rect(14,19,4,5);x.stroke();
  x.beginPath();x.rect(9.5,16,4,3);x.stroke();x.beginPath();x.rect(18.5,16,4,3);x.stroke();
  x.globalAlpha=0.8;x.lineWidth=1.2;x.beginPath();x.arc(24,10,5,0,Math.PI*2);x.stroke();
  x.beginPath();x.arc(24,10,1.5,0,Math.PI*2);x.fillStyle='#D4A843';x.fill();
  var lnk=document.getElementById('dynamic-favicon');if(lnk)lnk.href=c.toDataURL('image/png');
},100);