/* Newton MA Investment Analyzer - app.js */
/* React.createElement-based, no JSX, no build step */

const { useState, useMemo, useCallback, useEffect } = React;
const h = React.createElement;

// ── Utilities ──────────────────────────────────────────────
const fmt = (n, style) => {
  if (n == null || isNaN(n)) return "\u2014";
  if (style === "pct") return n.toFixed(1) + "%";
  if (style === "int") return Math.round(n).toLocaleString();
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
};
const fmtK = n => {
  if (n == null || isNaN(n)) return "\u2014";
  if (Math.abs(n) >= 1e6) return "$" + (n/1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n/1e3).toFixed(0) + "K";
  return fmt(n);
};

const STRAT_COLORS = {
  Flip: {bg:"bg-emerald-50",text:"text-emerald-700",border:"border-emerald-200",dot:"bg-emerald-500"},
  Hold: {bg:"bg-blue-50",text:"text-blue-700",border:"border-blue-200",dot:"bg-blue-500"},
  BRRRR: {bg:"bg-purple-50",text:"text-purple-700",border:"border-purple-200",dot:"bg-purple-500"},
  "Value-Add": {bg:"bg-amber-50",text:"text-amber-700",border:"border-amber-200",dot:"bg-amber-500"},
};

const GRADE_COLORS = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-amber-100 text-amber-800",
  D: "bg-slate-100 text-slate-600",
};

const scoreColor = s => s >= 10 ? "bg-emerald-500 text-white" : s >= 7 ? "bg-amber-400 text-amber-900" : "bg-slate-300 text-slate-700";
const scoreTier = s => s >= 10 ? "Strong" : s >= 7 ? "Moderate" : "Worth Watching";

const MORTGAGE_RATE = 0.06;
const INSURANCE_YR = 3000;

function monthlyPayment(principal, rate, years) {
  if (principal <= 0 || rate <= 0) return 0;
  const r = rate / 12, n = (years || 30) * 12;
  return principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1);
}

// ── SVG Icons ──────────────────────────────────────────────
const LogoSVG = () => h("svg",{viewBox:"0 0 80 80",width:80,height:80,className:"mx-auto"},
  h("rect",{x:10,y:35,width:60,height:40,rx:4,fill:"#2C3E6B",stroke:"#D4A843",strokeWidth:2}),
  h("polygon",{points:"40,8 5,38 75,38",fill:"#2C3E6B",stroke:"#D4A843",strokeWidth:2}),
  h("rect",{x:30,y:50,width:20,height:25,rx:2,fill:"#D4A843",opacity:.8}),
  h("circle",{cx:58,cy:22,r:14,fill:"none",stroke:"#D4A843",strokeWidth:3}),
  h("line",{x1:68,y1:32,x2:78,y2:42,stroke:"#D4A843",strokeWidth:3,strokeLinecap:"round"}),
  h("rect",{x:18,y:45,width:8,height:8,rx:1,fill:"#D4A843",opacity:.5}),
  h("rect",{x:54,y:45,width:8,height:8,rx:1,fill:"#D4A843",opacity:.5}),
);

const PhoneRotateIcon = () => h("svg",{viewBox:"0 0 64 64",width:64,height:64,style:{animation:"rotatePhone 2s ease-in-out infinite"}},
  h("rect",{x:18,y:8,width:28,height:48,rx:4,fill:"none",stroke:"#D4A843",strokeWidth:2.5}),
  h("circle",{cx:32,cy:50,r:2,fill:"#D4A843"}),
  h("path",{d:"M52 32 c4-8 2-16-4-20",fill:"none",stroke:"#D4A843",strokeWidth:2,strokeLinecap:"round"}),
  h("polygon",{points:"48,10 50,16 44,14",fill:"#D4A843"}),
);

// ── RotatePrompt ───────────────────────────────────────────
function RotatePrompt({onContinue}) {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const check = () => {
      if (window.innerWidth > window.innerHeight) {
        setLandscape(true);
      }
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
  useEffect(() => {
    if (landscape) {
      const t = setTimeout(() => onContinue(), 800);
      return () => clearTimeout(t);
    }
  }, [landscape, onContinue]);

  return h("div",{className:"fixed inset-0 flex flex-col items-center justify-center p-8",style:{background:"#0F1A2E",zIndex:100}},
    h(LogoSVG),
    h("h1",{className:"text-white text-2xl font-bold mt-6 mb-2 text-center"},"Newton MA"),
    h("p",{style:{color:"#D4A843"},className:"text-sm font-medium mb-8"},"Investment Analyzer"),
    h("div",{className:"mb-4"},h(PhoneRotateIcon)),
    h("p",{className:"text-white text-lg font-semibold mb-2"},"Rotate to Landscape"),
    h("p",{className:"text-slate-400 text-sm mb-8 text-center"},"For the best experience on mobile"),
    h("button",{onClick:onContinue,className:"text-slate-500 text-xs underline hover:text-slate-300 transition-colors"},"Continue in portrait anyway"),
  );
}

// ── IntroGuide ─────────────────────────────────────────────
function IntroGuide({onClose}) {
  const [page, setPage] = useState(0);
  const pages = [
    // Page 0: Welcome
    () => h("div",{className:"fade-in"},
      h("h2",{className:"text-2xl font-bold text-navy mb-2"},"Welcome to Your Investment Analyzer"),
      h("p",{className:"text-slate-500 mb-6"},"We've analyzed 25,000+ Newton properties and scored each for investment potential."),
      h("div",{className:"grid grid-cols-2 gap-3"},
        ...[["Flip","Buy, renovate, sell for profit","bg-emerald-50 border-emerald-200 text-emerald-700"],
            ["Hold","Long-term rental income","bg-blue-50 border-blue-200 text-blue-700"],
            ["BRRRR","Buy, Rehab, Rent, Refinance, Repeat","bg-purple-50 border-purple-200 text-purple-700"],
            ["Value-Add","Underdeveloped land or repositioning","bg-amber-50 border-amber-200 text-amber-700"]
        ].map(([t,d,c]) => h("div",{key:t,className:"rounded-lg border p-3 "+c},
          h("div",{className:"font-bold text-sm mb-1"},t),
          h("div",{className:"text-xs opacity-75"},d)
        ))
      ),
    ),
    // Page 1: Scoring
    () => h("div",{className:"fade-in"},
      h("h2",{className:"text-2xl font-bold text-navy mb-2"},"How Properties Are Scored"),
      h("p",{className:"text-slate-500 mb-4"},"Each property is scored 0–12 across four factors (3 points each):"),
      h("div",{className:"grid grid-cols-2 gap-3 mb-4"},
        ...[["Price Efficiency","$/sqft relative to area median"],
            ["Seller Motivation","Years of ownership (tenure)"],
            ["Profit Potential","Estimated flip ROI %"],
            ["Lead Quality","Predictive lead score & grade"]
        ].map(([t,d]) => h("div",{key:t,className:"bg-slate-50 rounded-lg p-3"},
          h("div",{className:"font-semibold text-sm text-navy"},t),
          h("div",{className:"text-xs text-slate-500"},d)
        ))
      ),
      h("div",{className:"flex gap-3 items-center justify-center"},
        ...[["10–12","Strong","bg-emerald-500 text-white"],
            ["7–9","Moderate","bg-amber-400 text-amber-900"],
            ["3–6","Worth Watching","bg-slate-300 text-slate-700"]
        ].map(([r,l,c]) => h("div",{key:r,className:"flex items-center gap-2"},
          h("span",{className:"inline-block px-2 py-1 rounded-full text-xs font-bold "+c},r),
          h("span",{className:"text-sm text-slate-600"},l)
        ))
      ),
    ),
    // Page 2: How to Use
    () => h("div",{className:"fade-in"},
      h("h2",{className:"text-2xl font-bold text-navy mb-4"},"How to Use"),
      h("div",{className:"grid grid-cols-2 gap-4"},
        ...[[1,"Filter & Search","Use strategy chips, grade filters, and the search bar to narrow results"],
            [2,"Click to Expand","Tap any property row to see full financial analysis with editable inputs"],
            [3,"Star Properties","Build a shortlist by starring your favorite opportunities"],
            [4,"Send Your List","Email your shortlist or download as CSV for further analysis"]
        ].map(([n,t,d]) => h("div",{key:n,className:"flex gap-3"},
          h("div",{className:"flex-none w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center font-bold text-sm"},n),
          h("div",null,
            h("div",{className:"font-semibold text-navy text-sm"},t),
            h("div",{className:"text-xs text-slate-500"},d)
          )
        ))
      ),
    ),
    // Page 3: Data Notes
    () => h("div",{className:"fade-in"},
      h("h2",{className:"text-2xl font-bold text-navy mb-4"},"Important Data Notes"),
      h("div",{className:"space-y-3"},
        ...[["Assessed Values","City assessments typically lag market value by 10–20%. Actual purchase prices will differ.","bg-blue-50 border-blue-200"],
            ["Lead Scores","Our predictive model scores seller likelihood based on tenure, ownership patterns, and property characteristics.","bg-emerald-50 border-emerald-200"],
            ["ARV & Reno Estimates","After-repair values and renovation costs are starting points. Always verify with local comps and contractor bids.","bg-amber-50 border-amber-200"]
        ].map(([t,d,c]) => h("div",{key:t,className:"rounded-lg border p-4 "+c},
          h("div",{className:"font-bold text-sm text-navy mb-1"},t),
          h("div",{className:"text-xs text-slate-600 leading-relaxed"},d)
        ))
      ),
    ),
  ];

  return h("div",{className:"fixed inset-0 flex items-center justify-center p-4",style:{background:"rgba(15,26,46,.9)",zIndex:90}},
    h("div",{className:"bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 slide-in"},
      // Progress dots
      h("div",{className:"flex justify-center gap-2 mb-6"},
        ...pages.map((_,i) => h("div",{key:i,className:"w-2.5 h-2.5 rounded-full transition-colors "+(i===page?"bg-gold":"bg-slate-200")}))
      ),
      // Content
      pages[page](),
      // Navigation
      h("div",{className:"flex items-center justify-between mt-6 pt-4 border-t border-slate-100"},
        h("button",{onClick:onClose,className:"text-slate-400 text-sm hover:text-slate-600"},"Skip"),
        h("div",{className:"text-sm text-slate-400"},page+1+" / "+pages.length),
        page < pages.length - 1
          ? h("button",{onClick:()=>setPage(page+1),className:"bg-navy text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-navy-light transition-colors"},
              "Next \u2192")
          : h("button",{onClick:onClose,className:"bg-gold text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-gold-light transition-colors"},
              "Get Started \u2192")
      ),
    ),
  );
}

// ── Dashboard Cards ────────────────────────────────────────
function DashboardCards({stats, filteredCount}) {
  const cards = [
    {label:"Properties Analyzed",value:stats.totalAnalyzed.toLocaleString(),sub:"Newton, MA"},
    {label:"Median Value",value:fmtK(stats.medianVal),sub:"assessed"},
    {label:"Median $/sqft",value:"$"+stats.medianPsf,sub:"of scored properties"},
    {label:"Mortgage Rate",value:stats.mortgageRate.toFixed(2)+"%",sub:"30yr fixed"},
    {label:"Tax Rate",value:"$"+stats.taxRate.toFixed(2)+"/1K",sub:"annual"},
    {label:"Opportunities",value:filteredCount.toLocaleString(),sub:Object.entries(stats.strategies).map(([k,v])=>v+" "+k).join(" · ")},
  ];
  return h("div",{className:"dash-cards grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4"},
    ...cards.map((c,i) => h("div",{key:i,className:"bg-white rounded-xl shadow-sm border border-slate-200 p-3"},
      h("div",{className:"text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1"},c.label),
      h("div",{className:"text-lg font-bold text-navy"},c.value),
      h("div",{className:"text-[10px] text-slate-400"},c.sub),
    ))
  );
}

// ── Filter Bar ─────────────────────────────────────────────
function FilterBar({filters, setFilters, filtered, stats, onReset}) {
  const [expanded, setExpanded] = useState(false);
  const villages = useMemo(() => Object.keys(stats.villages || {}).sort(), [stats]);
  const toggle = (arr, val) => arr.includes(val) ? arr.filter(v=>v!==val) : [...arr, val];

  const chip = (label, active, onClick, color) =>
    h("button",{onClick,className:
      "px-3 py-1.5 rounded-full text-xs font-bold border transition-all " +
      (active ? color + " border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")
    },label);

  return h("div",{className:"filter-panel bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-4"},
    // Row 1: Search + Strategy + Grade + Count + More + Reset
    h("div",{className:"flex flex-wrap items-center gap-2"},
      h("input",{type:"text",placeholder:"Search address or owner\u2026",value:filters.search,
        onChange:e=>setFilters({...filters,search:e.target.value}),
        className:"flex-1 min-w-[140px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"}),
      // Strategy chips
      ...["Flip","Hold","BRRRR","Value-Add"].map(s => {
        const c = STRAT_COLORS[s];
        return chip(s, filters.strategies.includes(s), ()=>setFilters({...filters,strategies:toggle(filters.strategies,s)}),
          c.bg+" "+c.text);
      }),
      h("span",{className:"text-slate-300"}," | "),
      // Grade chips
      ...["A","B","C","D"].map(g =>
        chip(g, filters.grades.includes(g), ()=>setFilters({...filters,grades:toggle(filters.grades,g)}),
          GRADE_COLORS[g])
      ),
      h("span",{className:"text-sm text-slate-500 font-medium ml-2"},filtered+" results"),
      h("button",{onClick:()=>setExpanded(!expanded),className:"text-xs text-navy font-semibold hover:underline"},expanded?"Less":"More"),
      h("button",{onClick:onReset,className:"text-xs text-red-500 font-medium hover:underline"},"Reset"),
    ),
    // Expanded filters
    expanded && h("div",{className:"mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 fade-in"},
      // Min Score
      h("div",null,
        h("label",{className:"text-[10px] text-slate-400 uppercase font-medium"},"Min Score: "+filters.minScore),
        h("div",{className:"relative mt-1"},
          h("div",{className:"absolute top-[11px] left-0 right-0 h-[6px] rounded bg-slate-200"}),
          h("div",{className:"absolute top-[11px] left-0 h-[6px] rounded bg-gold",style:{width:(filters.minScore/12*100)+"%"}}),
          h("input",{type:"range",min:0,max:12,value:filters.minScore,
            onChange:e=>setFilters({...filters,minScore:+e.target.value}),
            className:"range-input"})
        )
      ),
      // Min Tenure
      h("div",null,
        h("label",{className:"text-[10px] text-slate-400 uppercase font-medium"},"Min Tenure: "+filters.minTenure+" yrs"),
        h("div",{className:"relative mt-1"},
          h("div",{className:"absolute top-[11px] left-0 right-0 h-[6px] rounded bg-slate-200"}),
          h("div",{className:"absolute top-[11px] left-0 h-[6px] rounded bg-gold",style:{width:(filters.minTenure/125*100)+"%"}}),
          h("input",{type:"range",min:0,max:125,value:filters.minTenure,
            onChange:e=>setFilters({...filters,minTenure:+e.target.value}),
            className:"range-input"})
        )
      ),
      // Min ROI
      h("div",null,
        h("label",{className:"text-[10px] text-slate-400 uppercase font-medium"},"Min ROI: "+filters.minROI+"%"),
        h("div",{className:"relative mt-1"},
          h("div",{className:"absolute top-[11px] left-0 right-0 h-[6px] rounded bg-slate-200"}),
          h("div",{className:"absolute top-[11px] left-0 h-[6px] rounded bg-gold",style:{width:filters.minROI+"%"}}),
          h("input",{type:"range",min:0,max:100,value:filters.minROI,
            onChange:e=>setFilters({...filters,minROI:+e.target.value}),
            className:"range-input"})
        )
      ),
      // Price Range
      h("div",null,
        h("label",{className:"text-[10px] text-slate-400 uppercase font-medium"},"Price Range"),
        h("div",{className:"flex gap-1 mt-1"},
          h("input",{type:"number",placeholder:"Min",value:filters.minPrice||"",
            onChange:e=>setFilters({...filters,minPrice:e.target.value?+e.target.value:""}),
            className:"w-1/2 border border-slate-200 rounded px-2 py-1 text-xs"}),
          h("input",{type:"number",placeholder:"Max",value:filters.maxPrice||"",
            onChange:e=>setFilters({...filters,maxPrice:e.target.value?+e.target.value:""}),
            className:"w-1/2 border border-slate-200 rounded px-2 py-1 text-xs"}),
        )
      ),
      // Type chips
      h("div",null,
        h("label",{className:"text-[10px] text-slate-400 uppercase font-medium"},"Type"),
        h("div",{className:"flex flex-wrap gap-1 mt-1"},
          ...["SF","MultiSmall","AptSmall","Condo"].map(t =>
            h("button",{key:t,onClick:()=>setFilters({...filters,types:toggle(filters.types,t)}),
              className:"px-2 py-1 rounded text-[10px] font-medium border transition-all "+
                (filters.types.includes(t)?"bg-navy text-white border-navy":"bg-white text-slate-500 border-slate-200")
            },t==="MultiSmall"?"Multi":t==="AptSmall"?"Apt":t)
          )
        )
      ),
      // Village
      h("div",null,
        h("label",{className:"text-[10px] text-slate-400 uppercase font-medium"},"Village"),
        h("select",{value:filters.village,onChange:e=>setFilters({...filters,village:e.target.value}),
          className:"w-full mt-1 border border-slate-200 rounded px-2 py-1.5 text-xs bg-white"},
          h("option",{value:""},"All Villages"),
          ...villages.map(v => h("option",{key:v,value:v},v))
        )
      ),
    )
  );
}

// ── Property Table ─────────────────────────────────────────
function PropertyTable({properties, page, setPage, sortKey, sortDir, onSort, onSelect, starred, onToggleStar}) {
  const PER_PAGE = 50;
  const totalPages = Math.ceil(properties.length / PER_PAGE);
  const start = page * PER_PAGE;
  const visible = properties.slice(start, start + PER_PAGE);

  const th = (label, key, extra) => h("th",{
    onClick:()=>onSort(key),
    className:"cursor-pointer select-none px-2 py-2 text-left text-[10px] uppercase tracking-wider font-semibold text-slate-400 hover:text-navy whitespace-nowrap "+(extra||""),
  }, label, sortKey===key ? h("span",{className:"ml-0.5"},sortDir==="asc"?"\u25B2":"\u25BC") : null);

  const stratBadge = s => {
    const c = STRAT_COLORS[s] || STRAT_COLORS.Flip;
    return h("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold "+c.bg+" "+c.text},s);
  };

  return h("div",{className:"bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"},
    h("div",{className:"overflow-x-auto scrollbar-thin"},
      h("table",{className:"data-table w-full text-sm"},
        h("thead",null,
          h("tr",{className:"bg-slate-50 border-b border-slate-200"},
            h("th",{className:"px-2 py-2 w-8"}),
            th("Address","addr","addr-cell"),
            th("Village","village"),
            th("Type","type"),
            th("Value","val"),
            th("Yrs","tenure"),
            th("Grd","grade"),
            th("Strategy","strategy"),
            th("Score","invScore"),
            th("ROI%","flipROI"),
            th("Profit","flipProfit"),
          )
        ),
        h("tbody",null,
          ...visible.map((p,i) => {
            const isStarred = starred.has(p.id);
            return h("tr",{key:p.id,
              onClick:()=>onSelect(p),
              className:"border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors "+(isStarred?"border-l-4 border-l-gold":""),
            },
              h("td",{className:"px-2 py-1.5 text-center",onClick:e=>{e.stopPropagation();onToggleStar(p.id)}},
                h("span",{className:"cursor-pointer "+(isStarred?"text-gold":"text-slate-300 hover:text-gold"),style:{fontSize:"16px"}},"\u2605")),
              h("td",{className:"addr-cell px-2 py-1.5 font-medium text-navy",title:p.addr},p.addr),
              h("td",{className:"px-2 py-1.5 text-slate-500 text-[11px]"},p.village),
              h("td",{className:"px-2 py-1.5 text-slate-500 text-[11px]"},p.type),
              h("td",{className:"px-2 py-1.5 font-medium"},fmtK(p.val)),
              h("td",{className:"px-2 py-1.5 text-slate-600"},Math.round(p.tenure)),
              h("td",{className:"px-2 py-1.5"},h("span",{className:"inline-block px-1.5 py-0.5 rounded text-[10px] font-bold "+GRADE_COLORS[p.grade]},p.grade)),
              h("td",{className:"px-2 py-1.5"},stratBadge(p.strategy)),
              h("td",{className:"px-2 py-1.5"},h("span",{className:"inline-block px-2 py-0.5 rounded-full text-[11px] font-bold "+scoreColor(p.invScore)},p.invScore)),
              h("td",{className:"px-2 py-1.5 font-medium "+(p.flipROI>0?"text-emerald-600":"text-red-500")},p.flipROI.toFixed(1)+"%"),
              h("td",{className:"px-2 py-1.5 font-medium "+(p.flipProfit>0?"text-emerald-600":"text-red-500")},fmtK(p.flipProfit)),
            );
          })
        ),
      )
    ),
    // Pagination
    totalPages > 1 && h("div",{className:"flex items-center justify-between px-4 py-3 border-t border-slate-100"},
      h("button",{onClick:()=>setPage(Math.max(0,page-1)),disabled:page===0,
        className:"px-3 py-1.5 rounded-lg text-sm font-medium "+(page===0?"text-slate-300 cursor-not-allowed":"text-navy hover:bg-slate-100")
      },"Prev"),
      h("div",{className:"flex gap-1"},
        ...(() => {
          const btns = [];
          const show = new Set([0, totalPages-1, page-1, page, page+1].filter(p=>p>=0&&p<totalPages));
          let last = -1;
          for (const p of [...show].sort((a,b)=>a-b)) {
            if (last >= 0 && p - last > 1) btns.push(h("span",{key:"e"+p,className:"px-1 text-slate-400"},"\u2026"));
            btns.push(h("button",{key:p,onClick:()=>setPage(p),
              className:"w-8 h-8 rounded-lg text-xs font-medium "+(p===page?"bg-navy text-white":"text-slate-500 hover:bg-slate-100")
            },p+1));
            last = p;
          }
          return btns;
        })()
      ),
      h("button",{onClick:()=>setPage(Math.min(totalPages-1,page+1)),disabled:page>=totalPages-1,
        className:"px-3 py-1.5 rounded-lg text-sm font-medium "+(page>=totalPages-1?"text-slate-300 cursor-not-allowed":"text-navy hover:bg-slate-100")
      },"Next"),
    ),
  );
}

// ── Property Detail Modal ──────────────────────────────────
function DetailModal({prop, onClose, starred, onToggleStar}) {
  const p = prop;
  const [btnText, setBtnText] = useState("Recalculate Analysis");
  const parseNum = s => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  const [inputs, setInputs] = useState(function() {
    var f = function(n) { return String(Math.round(n || 0)); };
    return {
      purchase: f(p.purchase), reno: f(p.reno),
      arv: f(p.arv), rent: f(p.rent),
      rate: (MORTGAGE_RATE * 100).toFixed(1), down: "25", hold: "6", comm: "4.0"
    };
  });


  const runCalc = (vals) => {
    const purchase = vals.purchase;
    const reno = vals.reno;
    const arv = vals.arv;
    const rent = vals.rent;
    const rate = vals.rate / 100;
    const downPct = vals.down / 100;
    const holdMo = vals.hold;
    const commPct = vals.comm / 100;

    const loan = purchase * (1 - downPct);
    const mp = monthlyPayment(loan, rate, 30);
    const purchaseComm = purchase * commPct;
    const selling = arv * 0.05;
    const holdCost = purchase * (rate / 12) * holdMo;
    const totalCost = purchase + reno + holdCost + purchaseComm + selling;
    const flipProfit = arv - totalCost;
    const flipROI = (purchase + reno) > 0 ? flipProfit / (purchase + reno) * 100 : 0;

    const cashIn = purchase * downPct + reno + purchaseComm;
    const refiVal = arv * 0.75;
    const brrrrCashLeft = cashIn - (refiVal - loan);
    const refiPmt = monthlyPayment(refiVal, rate, 30);
    const annTax = purchase * 0.0098;
    const annMaint = purchase * 0.01;
    const annVacancy = rent * 12 * 0.05;
    const brrrrCF = rent - refiPmt - annTax/12 - INSURANCE_YR/12 - annMaint/12 - annVacancy/12;

    const annRent = rent * 12;
    const monthCF = rent - mp - annTax/12 - INSURANCE_YR/12 - annMaint/12 - annVacancy/12;
    const noi = annRent - annTax - INSURANCE_YR - annMaint - annVacancy;
    const grossYield = purchase > 0 ? annRent / purchase * 100 : 0;
    const capRate = purchase > 0 ? noi / purchase * 100 : 0;

    return {purchase,reno,arv,rent,loan,mp,selling,purchaseComm,holdCost,totalCost,flipProfit,cashIn,flipROI,
      refiVal,brrrrCashLeft,refiPmt,brrrrCF,
      annRent,annTax,annMaint,annVacancy,mortgageMo:mp,monthCF,noi,grossYield,capRate};
  };

  const [calc, setCalc] = useState(() => runCalc({
    purchase: p.purchase, reno: p.reno, arv: p.arv, rent: p.rent,
    rate: MORTGAGE_RATE * 100, down: 25, hold: 6, comm: 4
  }));

  const handleRecalc = () => {
    setBtnText("Calculating...");
    setCalc(runCalc({
      purchase: parseNum(inputs.purchase), reno: parseNum(inputs.reno),
      arv: parseNum(inputs.arv), rent: parseNum(inputs.rent),
      rate: parseNum(inputs.rate), down: parseNum(inputs.down),
      hold: parseNum(inputs.hold), comm: parseNum(inputs.comm)
    }));
    setTimeout(() => {
      setBtnText("Updated \u2713");
      setTimeout(() => setBtnText("Recalculate Analysis"), 1500);
    }, 100);
  };

  const isStarred = starred.has(p.id);

  const inputRow = (label, field, prefix, suffix) =>
    h("div",{className:"flex items-center justify-between py-1.5 border-b border-slate-100"},
      h("span",{className:"text-xs text-slate-500"},label),
      h("div",{className:"flex items-center gap-1"},
        prefix && h("span",{className:"text-xs text-slate-400"},prefix),
        h("input",{type:"text",inputMode:"decimal",value:inputs[field]||"",
          onChange:e=>setInputs(prev=>({...prev,[field]:e.target.value})),
          className:"w-24 text-right text-sm font-medium border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gold"}),
        suffix && h("span",{className:"text-xs text-slate-400"},suffix),
      )
    );


  const lineItem = (label, val, bold, color) =>
    h("div",{className:"flex items-center justify-between py-1 "+(bold?"font-bold":"")},
      h("span",{className:"text-xs "+(bold?"text-navy":"text-slate-500")},label),
      h("span",{className:"text-sm "+(color||"text-slate-700")+(bold?" text-base":"")},
        typeof val === "number" ? fmt(val) : val),
    );

  return h("div",{className:"detail-modal",onClick:onClose},
    h("div",{className:"bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-auto overflow-hidden slide-in",key:p.id,onClick:e=>e.stopPropagation()},
      h("div",{className:"bg-navy-dark p-4 flex items-start justify-between"},
        h("div",{className:"flex-1"},
          h("h2",{className:"text-white text-lg font-bold"},p.addr),
          h("p",{className:"text-slate-400 text-sm"},
            [p.village, p.zip, p.type, p.owner].filter(Boolean).join(" \xB7 ")),
        ),
        h("div",{className:"flex items-center gap-2"},
          h("button",{onClick:()=>onToggleStar(p.id),className:"text-2xl "+(isStarred?"text-gold":"text-slate-500 hover:text-gold")},"\u2605"),
          h("button",{onClick:onClose,className:"w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-lg font-bold"},"\u2715"),
        )
      ),
      h("div",{className:"flex flex-wrap gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200"},
        h("span",{className:"px-3 py-1 rounded-full text-xs font-bold "+(STRAT_COLORS[p.strategy]?STRAT_COLORS[p.strategy].bg+" "+STRAT_COLORS[p.strategy].text:"bg-slate-100 text-slate-600")},p.strategy),
        h("span",{className:"px-3 py-1 rounded-full text-xs font-bold "+scoreColor(p.invScore)},p.invScore+"/12 \xB7 "+scoreTier(p.invScore)),
        h("span",{className:"px-3 py-1 rounded-full text-xs font-bold "+GRADE_COLORS[p.grade]},"Grade "+p.grade),
        p.yrBuilt && h("span",{className:"px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600"},"Built "+p.yrBuilt),
      ),
      h("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-4 p-4"},
        h("div",null,
          h("div",{className:"bg-gold/10 border border-gold/30 rounded-t-lg px-3 py-2"},
            h("h3",{className:"text-sm font-bold text-gold"},"Adjustable Inputs")),
          h("div",{className:"border border-t-0 border-slate-200 rounded-b-lg p-3 mb-4"},
            inputRow("Purchase","purchase","$"),
            inputRow("Reno Budget","reno","$"),
            inputRow("ARV","arv","$"),
            inputRow("Rent/mo","rent","$"),
            inputRow("Rate","rate","","%"),
            inputRow("Down Pmt","down","","%"),
            inputRow("Hold","hold","","mo"),
            inputRow("Purchase Comm","comm","","%"),
            h("button",{onClick:handleRecalc,
              className:"w-full mt-3 py-2.5 rounded-lg font-bold text-white text-sm transition-all "+
                (btnText==="Updated \u2713"?"bg-emerald-500":"bg-gold hover:bg-gold-light")},
              btnText),
          ),
        ),
        h("div",null,
          h("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-t-lg px-3 py-2"},
            h("h3",{className:"text-sm font-bold text-emerald-600"},"Flip Analysis")),
          h("div",{className:"border border-t-0 border-slate-200 rounded-b-lg p-3 mb-3"},
            lineItem("Purchase",calc.purchase),
            lineItem("+ Reno",calc.reno),
            lineItem("+ Hold Cost",calc.holdCost),
            lineItem("+ Purch Comm",calc.purchaseComm),
            lineItem("+ Selling (5%)",calc.selling),
            h("hr",{className:"my-2 border-slate-200"}),
            lineItem("Profit",calc.flipProfit,true,calc.flipProfit>0?"text-emerald-600":"text-red-500"),
            lineItem("ROI",calc.flipROI.toFixed(1)+"%",true,calc.flipROI>0?"text-emerald-600":"text-red-500"),
          ),
          h("div",{className:"bg-purple-500/10 border border-purple-500/30 rounded-t-lg px-3 py-2"},
            h("h3",{className:"text-sm font-bold text-purple-600"},"BRRRR")),
          h("div",{className:"border border-t-0 border-slate-200 rounded-b-lg p-3 mb-4"},
            lineItem("Cash In",calc.cashIn),
            lineItem("Refi (75% ARV)",calc.refiVal),
            lineItem("Cash Left",calc.brrrrCashLeft,true),
            lineItem("CF/mo",calc.brrrrCF,false,calc.brrrrCF>0?"text-emerald-600":"text-red-500"),
          ),
        ),
        h("div",null,
          h("div",{className:"bg-blue-500/10 border border-blue-500/30 rounded-t-lg px-3 py-2"},
            h("h3",{className:"text-sm font-bold text-blue-600"},"Hold / Rental")),
          h("div",{className:"border border-t-0 border-slate-200 rounded-b-lg p-3 mb-3"},
            lineItem("Rent/mo",calc.rent),
            lineItem("- Mortgage",calc.mortgageMo),
            lineItem("- Tax/mo",calc.annTax/12),
            lineItem("- Insurance",INSURANCE_YR/12),
            lineItem("- Maintenance",calc.annMaint/12),
            lineItem("- Vacancy",calc.annVacancy/12),
            h("hr",{className:"my-2 border-slate-200"}),
            lineItem("Cashflow/mo",calc.monthCF,true,calc.monthCF>0?"text-emerald-600":"text-red-500"),
            lineItem("NOI/yr",calc.noi),
            lineItem("Gross Yield",calc.grossYield.toFixed(2)+"%",false),
            lineItem("Cap Rate",calc.capRate.toFixed(2)+"%",false),
          ),
        ),
      ),
      h("div",{className:"bg-slate-50 border-t border-slate-200 px-4 py-3"},
        h("div",{className:"text-[10px] uppercase text-slate-400 font-semibold mb-2"},"Property Data"),
        h("div",{className:"flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500"},
          h("span",null,"Assessed: "+fmt(p.val)),
          h("span",null,"SqFt: "+p.sqft.toLocaleString()),
          h("span",null,"$/sqft: $"+p.psf),
          h("span",null,"Tenure: "+p.tenure+" yrs"),
          h("span",null,"Lead Score: "+p.leadScore),
          h("span",null,"Segment: "+p.segment),
          p.lotSize && h("span",null,"Lot: "+p.lotSize+" acres"),
          p.zoning && h("span",null,"Zoning: "+p.zoning),
          p.style && h("span",null,"Style: "+p.style),
          p.rooms && h("span",null,"Rooms: "+p.rooms),
          h("span",null,"Score: "+p.s1+"+"+p.s2+"+"+p.s3+"+"+p.s4+"="+p.invScore),
        )
      ),
    )
  );
}

// ── Shortlist Bar ──────────────────────────────────────────
function ShortlistBar({starred, properties, onToggleStar, onCompare}) {
  const items = useMemo(() => properties.filter(p => starred.has(p.id)), [starred, properties]);
  if (items.length === 0) return null;

  const sendEmail = () => {
    const body = items.map(p =>
      p.addr + " (" + p.village + ")\n" +
      "  Value: " + fmt(p.val) + " | Score: " + p.invScore + "/12 | " + p.strategy + "\n" +
      "  Flip ROI: " + p.flipROI.toFixed(1) + "% | Profit: " + fmt(p.flipProfit) + "\n" +
      "  Cashflow: " + fmt(p.cashflow) + "/mo | Cap: " + p.capRate.toFixed(2) + "%\n"
    ).join("\n");
    window.open("mailto:zev.steinmetz@raveis.com?subject=Newton%20Investment%20Shortlist%20("+items.length+"%20properties)&body="+encodeURIComponent("My Newton Investment Shortlist\n\n"+body));
  };

  const downloadCSV = () => {
    const headers = ["Address","Village","Type","Value","SqFt","$/sqft","Tenure","Grade","Strategy","Score","FlipROI","FlipProfit","Rent","Cashflow","CapRate"];
    const rows = items.map(p => [p.addr,p.village,p.type,p.val,p.sqft,p.psf,p.tenure,p.grade,p.strategy,p.invScore,p.flipROI.toFixed(1),p.flipProfit,p.rent,p.cashflow,p.capRate.toFixed(2)]);
    const csv = [headers,...rows].map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "newton_shortlist.csv";
    a.click();
  };

  return h("div",{className:"shortlist-bar bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4 fade-in"},
    h("div",{className:"flex flex-wrap items-center gap-2 mb-2"},
      h("span",{className:"text-sm font-bold text-gold"},"Your Shortlist ("+items.length+" properties)"),
      h("div",{className:"flex-1"}),
      h("button",{onClick:sendEmail,className:"bg-navy text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-navy-light transition-colors"},"Send List to Zev"),
      h("button",{onClick:downloadCSV,className:"bg-white text-navy border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"},"Download CSV"),
      items.length >= 2 && items.length <= 4 && h("button",{onClick:()=>onCompare(items),className:"bg-gold text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gold-light transition-colors"},"Compare"),
      h("button",{onClick:()=>items.forEach(i=>onToggleStar(i.id)),className:"text-red-500 text-xs font-medium hover:underline"},"Clear"),
    ),
    h("div",{className:"flex flex-wrap gap-2"},
      ...items.map(p => h("div",{key:p.id,className:"flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 border border-slate-200 text-xs"},
        h("span",{className:"font-medium text-navy"},p.addr.length > 20 ? p.addr.slice(0,20)+"\u2026" : p.addr),
        h("span",{className:"text-slate-400"},p.village),
        h("span",{className:"px-1 py-0.5 rounded text-[9px] font-bold "+scoreColor(p.invScore)},p.invScore),
        h("button",{onClick:()=>onToggleStar(p.id),className:"text-slate-300 hover:text-red-400 font-bold"},"\u2715"),
      ))
    ),
  );
}

// ── Compare Modal ──────────────────────────────────────────
function CompareModal({items, onClose}) {
  if (!items || items.length === 0) return null;
  const metrics = [
    ["Value", p => fmt(p.val)],
    ["SqFt", p => p.sqft.toLocaleString()],
    ["$/sqft", p => "$"+p.psf],
    ["Strategy", p => p.strategy],
    ["Score", p => p.invScore+"/12"],
    ["Grade", p => p.grade],
    ["Tenure", p => Math.round(p.tenure)+" yrs"],
    ["Flip Profit", p => fmt(p.flipProfit)],
    ["Flip ROI", p => p.flipROI.toFixed(1)+"%"],
    ["Rent/mo", p => fmt(p.rent)],
    ["Cashflow/mo", p => fmt(p.cashflow)],
    ["Cap Rate", p => p.capRate.toFixed(2)+"%"],
    ["ARV", p => fmt(p.arv)],
    ["Reno Cost", p => fmt(p.reno)],
  ];

  return h("div",{className:"detail-modal",onClick:onClose},
    h("div",{className:"bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden slide-in",onClick:e=>e.stopPropagation()},
      h("div",{className:"bg-navy-dark p-4 flex items-center justify-between"},
        h("h2",{className:"text-white font-bold"},"Compare Properties"),
        h("button",{onClick:onClose,className:"w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-lg font-bold"},"\u2715"),
      ),
      h("div",{className:"overflow-x-auto p-4"},
        h("table",{className:"w-full text-sm"},
          h("thead",null,
            h("tr",{className:"border-b border-slate-200"},
              h("th",{className:"text-left py-2 px-3 text-xs text-slate-400"},"Metric"),
              ...items.map(p => h("th",{key:p.id,className:"text-left py-2 px-3 text-xs font-bold text-navy"},p.addr.length>25?p.addr.slice(0,25)+"\u2026":p.addr))
            ),
          ),
          h("tbody",null,
            ...metrics.map(([label, fn], i) =>
              h("tr",{key:label,className:i%2?"bg-slate-50":""},
                h("td",{className:"py-1.5 px-3 text-xs text-slate-500 font-medium"},label),
                ...items.map(p => h("td",{key:p.id,className:"py-1.5 px-3 text-xs font-medium text-navy"},fn(p)))
              )
            )
          ),
        )
      ),
    )
  );
}

// ── Main App ───────────────────────────────────────────────
function App() {
  const data = window.__PROPERTIES__ || [];
  const stats = window.__STATS__ || {};

  const [phase, setPhase] = useState("rotate");
  const [selectedProp, setSelectedProp] = useState(null);
  const [compareProp, setCompareProp] = useState(null);
  const [starred, setStarred] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem("newton_starred")||"[]"); return new Set(s); }
    catch { return new Set(); }
  });
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState("invScore");
  const [sortDir, setSortDir] = useState("desc");
  const defaultFilters = {search:"",strategies:[],grades:[],minScore:0,minTenure:0,minROI:0,minPrice:"",maxPrice:"",types:[],village:""};
  const [filters, setFilters] = useState(defaultFilters);

  // Persist stars
  useEffect(() => {
    localStorage.setItem("newton_starred", JSON.stringify([...starred]));
  }, [starred]);

  const toggleStar = useCallback(id => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Filter + Sort
  const filtered = useMemo(() => {
    let arr = data;
    const s = filters.search.toLowerCase();
    if (s) arr = arr.filter(p => p.addr.toLowerCase().includes(s) || p.owner.toLowerCase().includes(s));
    if (filters.strategies.length) arr = arr.filter(p => filters.strategies.includes(p.strategy));
    if (filters.grades.length) arr = arr.filter(p => filters.grades.includes(p.grade));
    if (filters.minScore > 0) arr = arr.filter(p => p.invScore >= filters.minScore);
    if (filters.minTenure > 0) arr = arr.filter(p => p.tenure >= filters.minTenure);
    if (filters.minROI > 0) arr = arr.filter(p => p.flipROI >= filters.minROI);
    if (filters.minPrice) arr = arr.filter(p => p.val >= filters.minPrice);
    if (filters.maxPrice) arr = arr.filter(p => p.val <= filters.maxPrice);
    if (filters.types.length) arr = arr.filter(p => filters.types.includes(p.type));
    if (filters.village) arr = arr.filter(p => p.village === filters.village);

    arr = [...arr].sort((a,b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data, filters, sortKey, sortDir]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [filters, sortKey, sortDir]);

  const onSort = useCallback(key => {
    if (key === sortKey) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }, [sortKey]);

  // Phase: Rotate
  if (phase === "rotate") {
    return h(RotatePrompt, {onContinue: () => setPhase("guide")});
  }

  // Phase: Guide
  if (phase === "guide") {
    return h(IntroGuide, {onClose: () => setPhase("app")});
  }

  // Phase: App
  return h("div",{className:"min-h-screen",style:{background:"#f1f5f9"}},
    // Header
    h("div",{className:"app-header bg-navy-dark px-4 py-3 flex items-center justify-between sticky top-0 z-40"},
      h("div",null,
        h("h1",{className:"text-white font-bold text-lg"},"Newton MA \u2014 Investment Analyzer"),
        h("p",{className:"text-slate-400 text-xs"},"Steinmetz Real Estate | William Raveis"),
      ),
      h("button",{onClick:()=>setPhase("guide"),className:"bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"},"? Guide"),
    ),
    // Main content
    h("div",{className:"main-content max-w-7xl mx-auto px-3 py-4"},
      h(DashboardCards, {stats, filteredCount: filtered.length}),
      h(ShortlistBar, {starred, properties: data, onToggleStar: toggleStar, onCompare: items => setCompareProp(items)}),
      h(FilterBar, {filters, setFilters, filtered: filtered.length, stats, onReset: ()=>setFilters(defaultFilters)}),
      h(PropertyTable, {
        properties: filtered,
        page, setPage,
        sortKey, sortDir, onSort,
        onSelect: p => setSelectedProp(p),
        starred, onToggleStar: toggleStar,
      }),
    ),
    // Footer
    h("div",{className:"app-footer bg-navy-dark text-slate-500 text-center text-xs py-3 mt-4"},
      "Newton MA Investment Analysis \xB7 Steinmetz Real Estate \xB7 William Raveis \xB7 Generated "+new Date().toLocaleDateString()
    ),
    // Modals
    selectedProp && h(DetailModal, {prop: selectedProp, onClose: ()=>setSelectedProp(null), starred, onToggleStar: toggleStar}),
    compareProp && h(CompareModal, {items: compareProp, onClose: ()=>setCompareProp(null)}),
  );
}

// ── Mount ──────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
