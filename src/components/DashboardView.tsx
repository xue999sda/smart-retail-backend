import { useState, useMemo, useEffect } from "react";
import {
  Download,
  FileText,
  Calendar,
  MapPin,
  Building2,
  TrendingUp,
  TrendingDown,
  Info,
  Loader2,
  Link2,
  CheckCircle2,
} from "lucide-react";
import { Language, CategoryData, StoreRank } from "../types";
import {
  INITIAL_CATEGORY_PIE,
  INITIAL_MONTHLY_PERFORMANCE,
  INITIAL_STORE_RANKING,
  INITIAL_HISTORICAL_TRENDS,
} from "../data";

interface DashboardViewProps {
  lang: Language;
  t: (key: string) => string;
  searchQuery: string;
}

interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "info";
}

export default function DashboardView({
  lang,
  t,
  searchQuery,
}: DashboardViewProps) {
  // Global Filters State
  const [dateRange, setDateRange] = useState("2023-10-06");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");

  // Cloud/Sandbox Real-time Database state
  const [dbData, setDbData] = useState<{
    categoriesPie: any[];
    monthlyPerformances: any[];
    storeRankings: any[];
    historicalTrends: any[];
    recentTransactions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real aggregated data from NodeJS backend API Gateway
  const fetchDashboardData = () => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDbData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
    // Enable active synchronization for live blockchain transaction confirmations visual updates
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Active hover states for charts
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(
    null,
  );
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  // Static options
  const countryOptions = [
    { value: "all", labelKey: "all_countries" },
    { value: "pk", labelKey: "巴基斯坦 (Pakistan)" },
  ];

  const storeOptions = [
    { value: "all", labelKey: "all_stores" },
    { value: "store_1", labelKey: "store_1" },
    { value: "store_2", labelKey: "store_2" },
    { value: "store_3", labelKey: "store_3" },
  ];

  // Dynamic values reactive to filters & search matches to simulate live backend queries
  const filterFactor = useMemo(() => {
    let factor = 1.0;
    const country = selectedCountry.toLowerCase().trim();
    if (country === "pk" || country === "pakistan" || country === "巴基斯坦")
      factor *= 1.0;

    const store = selectedStore.toLowerCase().trim();
    if (
      store === "store_1" ||
      store === "店铺1" ||
      store === "店铺 1" ||
      store === "store1" ||
      store === "1"
    )
      factor *= 0.55;
    if (
      store === "store_2" ||
      store === "店铺2" ||
      store === "店铺 2" ||
      store === "store2" ||
      store === "2"
    )
      factor *= 0.35;
    if (
      store === "store_3" ||
      store === "店铺3" ||
      store === "店铺 3" ||
      store === "store3" ||
      store === "3"
    )
      factor *= 0.0;

    return factor;
  }, [selectedCountry, selectedStore]);

  // Reactive Category Pie Data
  const categoriesPieData = useMemo(() => {
    const base = dbData?.categoriesPie || INITIAL_CATEGORY_PIE;
    return base.map((item) => ({
      ...item,
      value: Math.round(item.value * filterFactor),
      qty: Math.round(item.qty * filterFactor),
    }));
  }, [dbData, filterFactor]);

  // Highlight search components or match category names
  const highlightedCategory = useMemo(() => {
    if (!searchQuery) return null;
    const query = searchQuery.toLowerCase().trim();

    // 1. 智能手机类关联词
    if (
      "手机".includes(query) ||
      "phone".includes(query) ||
      "iphone".includes(query) ||
      "galaxy".includes(query) ||
      "xiaomi".includes(query) ||
      "mate".includes(query) ||
      "小米".includes(query) ||
      "苹果".includes(query) ||
      "三星".includes(query) ||
      "华为".includes(query)
    ) {
      return "mobile";
    }

    // 2. 专属配件类关联词
    if (
      "配件".includes(query) ||
      "access".includes(query) ||
      "airpods".includes(query) ||
      "耳机".includes(query) ||
      "power".includes(query) ||
      "bank".includes(query) ||
      "充电宝".includes(query) ||
      "magsafe".includes(query) ||
      "charger".includes(query) ||
      "充电器".includes(query) ||
      "usb".includes(query) ||
      "adapter".includes(query) ||
      "适配器".includes(query)
    ) {
      return "accessories";
    }

    // 3. 智能大家电关联词
    if (
      "大家电".includes(query) ||
      "large".includes(query) ||
      "tv".includes(query) ||
      "电视".includes(query) ||
      "refrigerator".includes(query) ||
      "冰箱".includes(query) ||
      "ac".includes(query) ||
      "air".includes(query) ||
      "空调".includes(query) ||
      "wash".includes(query) ||
      "洗衣机".includes(query)
    ) {
      return "large";
    }

    // 4. 极客小家电关联词
    if (
      "小家电".includes(query) ||
      "small".includes(query) ||
      "coffee".includes(query) ||
      "咖啡".includes(query) ||
      "robot".includes(query) ||
      "cybervac".includes(query) ||
      "扫地机".includes(query) ||
      "fryer".includes(query) ||
      "空气炸锅".includes(query) ||
      "kettle".includes(query) ||
      "热水壶".includes(query) ||
      "电水壶".includes(query)
    ) {
      return "small";
    }

    return null;
  }, [searchQuery]);

  // Overall statistics
  const totalFinancialSum = useMemo(() => {
    if (highlightedCategory) {
      const matched = categoriesPieData.find(
        (c) => c.id === highlightedCategory,
      );
      if (matched) return matched.value;
    }
    return categoriesPieData.reduce((sum, item) => sum + item.value, 0);
  }, [categoriesPieData, highlightedCategory]);

  const totalQuantitySum = useMemo(() => {
    if (highlightedCategory) {
      const matched = categoriesPieData.find(
        (c) => c.id === highlightedCategory,
      );
      if (matched) return matched.qty;
    }
    return categoriesPieData.reduce((sum, item) => sum + item.qty, 0);
  }, [categoriesPieData, highlightedCategory]);

  // Filter Monthly Performance
  const monthlyData = useMemo(() => {
    const base = dbData?.monthlyPerformances || INITIAL_MONTHLY_PERFORMANCE;
    return base.map((m) => ({
      ...m,
      data: {
        mobile: Math.round(m.data.mobile * filterFactor),
        accessories: Math.round(m.data.accessories * filterFactor),
        largeAppliances: Math.round(m.data.largeAppliances * filterFactor),
        smallAppliances: Math.round(m.data.smallAppliances * filterFactor),
      },
    }));
  }, [dbData, filterFactor]);

  // Store ranking sorted or highlighted by search
  const storeRanking = useMemo(() => {
    const base = dbData?.storeRankings || INITIAL_STORE_RANKING;
    const rawRankings = base
      .map((store) => {
        // Modify values based on country filters
        let baseSales = store.sales;
        const country = selectedCountry.toLowerCase().trim();
        const isCn =
          country === "cn" || country === "china" || country === "中国";
        const isUs =
          country === "us" || country === "usa" || country === "美国";
        if (isCn && store.storeKey !== "store_1") baseSales *= 0.7;
        if (isUs && store.storeKey === "store_3") baseSales *= 1.4;
        return {
          ...store,
          sales: Math.round(baseSales),
        };
      })
      .sort((a, b) => b.sales - a.sales);

    if (!searchQuery) return rawRankings;

    const query = searchQuery.toLowerCase().trim();
    return rawRankings.filter((store) => {
      const storeName = t(store.storeKey).toLowerCase();
      const rawKey = store.storeKey.toLowerCase();
      return storeName.includes(query) || rawKey.includes(query);
    });
  }, [dbData, selectedCountry, searchQuery, lang]);

  // Filter Historical trends
  const lineTrendsData = useMemo(() => {
    const base = dbData?.historicalTrends || INITIAL_HISTORICAL_TRENDS;
    return base.map((tData) => ({
      ...tData,
      mobile: Math.round(tData.mobile * filterFactor),
      accessories: Math.round(tData.accessories * filterFactor),
      largeAppliances: Math.round(tData.largeAppliances * filterFactor),
      smallAppliances: Math.round(tData.smallAppliances * filterFactor),
    }));
  }, [dbData, filterFactor]);

  // Filter Blockchain Consensus Audit logs by Search Query
  const filteredTransactions = useMemo(() => {
    const txs = dbData?.recentTransactions || [];
    if (!searchQuery) return txs;
    const q = searchQuery.toLowerCase().trim();
    return txs.filter((tx) => {
      const hash = (tx.tx_hash || "").toLowerCase();
      const store = (tx.store_id || "").toLowerCase();
      const country = (tx.country || "").toLowerCase();
      const category = (tx.category_id || "").toLowerCase();
      return (
        hash.includes(q) ||
        store.includes(q) ||
        country.includes(q) ||
        category.includes(q)
      );
    });
  }, [dbData, searchQuery]);

  // Handlers
  const handleExportCSV = () => {
    const rows = [];
    rows.push(["Smart Retail 智能零售系统 - 销售业绩导出报表"]);
    rows.push([`导出时间: ${new Date().toLocaleString()}`]);
    rows.push([`报告语言: ${lang === "zh" ? "简体中文" : "English"}`]);
    rows.push([]);

    // 1. 大类汇总
    rows.push(["品类业绩汇总 (Category Performance Summary)"]);
    rows.push([
      "品类 (Category ID)",
      "大类键值 (Name Key)",
      "销量 (Quantity PCS)",
      "总销售额 (Value USD)",
      "占比 (Percentage)",
    ]);
    categoriesPieData.forEach((item) => {
      rows.push([
        item.id,
        t(item.nameKey),
        item.qty,
        item.value,
        `${item.percentage}%`,
      ]);
    });
    rows.push([]);

    // 2. 门店排行
    rows.push(["门店销售排行 (Store Sales Ranking)"]);
    rows.push([
      "名次 (Rank)",
      "门店标识 (Store ID)",
      "门店译名 (Store Name)",
      "销售额 (Sales USD)",
      "进度比 (Percentage)",
    ]);
    storeRanking.forEach((store, idx) => {
      rows.push([
        idx + 1,
        store.storeKey,
        t(store.storeKey),
        store.sales,
        `${store.percentage}%`,
      ]);
    });
    rows.push([]);

    // 3. 历史宏观趋势
    rows.push(["历史宏观销量趋势 (Historical Trends)"]);
    rows.push([
      "月份 (Month)",
      `${t("cat_phone")} (PCS)`,
      `${t("cat_acc")} (PCS)`,
      `${t("cat_large")} (PCS)`,
      `${t("cat_small")} (PCS)`,
    ]);
    lineTrendsData.forEach((item) => {
      rows.push([
        t(item.ymKey),
        item.mobile,
        item.accessories,
        item.largeAppliances,
        item.smallAppliances,
      ]);
    });

    // 转换为 CSV 字符串（带 UTF-8 BOM \uFEFF 完美防止 Windows Excel 打开中文乱码）
    const csvContent =
      "\uFEFF" +
      rows
        .map((e) =>
          e
            .map((val) => {
              const cell = val === undefined || val === null ? "" : String(val);
              if (
                cell.includes(",") ||
                cell.includes('"') ||
                cell.includes("\n")
              ) {
                return `"${cell.replace(/"/g, '""')}"`;
              }
              return cell;
            })
            .join(","),
        )
        .join("\n");

    // 触发 Blob 下载
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smart_retail_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(t("toast_csv_exported"), "success");
  };

  const handleExportPDF = () => {
    addToast(
      t("toast_pdf_generating") || "Generating high-fidelity PDF report...",
      "info",
    );

    const runExport = () => {
      const element = document.getElementById("dashboard-view-root");
      if (!element) return;

      // 临时隐藏那些不需要打印在大屏报告中的按钮及过滤器，以提供干净的重新排版
      const buttons = element.querySelectorAll(
        "button, .no-print, input, select",
      );
      buttons.forEach((btn) =>
        btn.setAttribute("style", "display: none !important;"),
      );

      const opt = {
        margin: 10,
        filename: `smart_retail_dashboard_${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 1.5, useCORS: true, backgroundColor: "#0a0e17" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // 自动静默渲染并直接触发浏览器底层下载
      (window as any)
        .html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          buttons.forEach((btn) => btn.removeAttribute("style"));
          addToast(
            t("toast_pdf_ready") || "PDF downloaded successfully!",
            "success",
          );
        })
        .catch((err: any) => {
          console.error("PDF generation failed:", err);
          buttons.forEach((btn) => btn.removeAttribute("style"));
          addToast("PDF Generation Failed", "info");
        });
    };

    if ((window as any).html2pdf) {
      runExport();
    } else {
      // 动态轻量化加载 html2pdf.js，完全不影响 Render 的服务端打包构建
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        runExport();
      };
      script.onerror = () => {
        addToast("Failed to load PDF library. Please try again.", "info");
      };
      document.head.appendChild(script);
    }
  };

  return (
    <div id="dashboard-view-root" className="space-y-6">
      {/* 仅在打印/导出 PDF 时显现的奢华报表页眉栏 (Luxury Print-Only Report Header Header) */}
      <div className="hidden print:block border-b-2 border-emerald-500 pb-5 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-sans tracking-wider">
              SMART RETAIL 智能零售年度宏观业绩报告
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1.5 uppercase tracking-widest">
              Report Category: Dynamic Executive Business Ledger | Secure
              Consensus Chain Integrated
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-mono font-bold">
              ORIGIN: SANDBOX ACTIVE
            </span>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5">
              Exported: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      {/* Global Filters Overlay UI Block */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 p-5 rounded-[24px] shadow-2xl relative">
        <div className="flex flex-wrap items-center flex-1 gap-3">
          {/* Date Picker Input Box */}
          <div
            className="flex flex-col min-w-[130px] bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 focus-within:bg-[#0c1222]"
            onClick={() =>
              document.getElementById("db-filter-date-input")?.focus()
            }
          >
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1 flex items-center gap-1 select-none">
              <Calendar className="w-3 h-3" /> {t("filter_date")}
            </span>
            <input
              type="text"
              id="db-filter-date-input"
              className="bg-transparent border-none text-slate-200 text-xs font-bold p-0 w-full focus:ring-0 cursor-text outline-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>

          {/* Country Input Syle Box */}
          <div
            className="flex flex-col min-w-[160px] bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 focus-within:bg-[#0c1222]"
            onClick={() =>
              document.getElementById("db-filter-country-input")?.focus()
            }
          >
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1 flex items-center gap-1 select-none">
              <MapPin className="w-3 h-3" /> {t("filter_country")}
            </span>
            <input
              type="text"
              id="db-filter-country-input"
              className="bg-transparent border-none text-slate-200 text-xs font-bold p-0 w-full focus:ring-0 cursor-text outline-none"
              value={
                selectedCountry === "all"
                  ? lang === "zh"
                    ? "全部国家"
                    : "All Countries"
                  : selectedCountry
              }
              onChange={(e) => setSelectedCountry(e.target.value)}
              onFocus={() => {
                if (selectedCountry === "all") {
                  setSelectedCountry("");
                }
              }}
              onBlur={() => {
                if (selectedCountry.trim() === "") {
                  setSelectedCountry("all");
                }
              }}
              placeholder={lang === "zh" ? "全部国家" : "All Countries"}
            />
          </div>

          {/* Store Input Syle Box */}
          <div
            className="flex flex-col min-w-[200px] bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 focus-within:bg-[#0c1222]"
            onClick={() =>
              document.getElementById("db-filter-store-input")?.focus()
            }
          >
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1 flex items-center gap-1 select-none">
              <Building2 className="w-3 h-3" /> {t("filter_store")}
            </span>
            <input
              type="text"
              id="db-filter-store-input"
              className="bg-transparent border-none text-slate-200 text-xs font-bold p-0 w-full focus:ring-0 cursor-text outline-none animate-fadeIn"
              value={
                selectedStore === "all"
                  ? lang === "zh"
                    ? "全部店铺"
                    : "All Stores"
                  : selectedStore
              }
              onChange={(e) => setSelectedStore(e.target.value)}
              onFocus={() => {
                if (selectedStore === "all") {
                  setSelectedStore("");
                }
              }}
              onBlur={() => {
                if (selectedStore.trim() === "") {
                  setSelectedStore("all");
                }
              }}
              placeholder={lang === "zh" ? "全部店铺" : "All Stores"}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 text-xs font-semibold text-slate-100 transition-all shadow-xl shadow-black/10"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("btn_export_csv")}</span>
          </button>
          <button
            id="btn-pdf-report"
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 text-xs font-semibold text-slate-100 transition-all shadow-xl shadow-black/10"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t("btn_pdf_report")}</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Top Widgets */}
      <div className="grid grid-cols-12 gap-6">
        {/* Widget 1: Revenue Category Pie Chart (Translucent Card) */}
        <div
          id="widget-revenue-distribution"
          className={`col-span-12 lg:col-span-4 bg-white/5 backdrop-blur-3xl border p-8 rounded-[32px] flex flex-col justify-between shadow-2xl transition-all duration-300 ${
            highlightedCategory
              ? "ring-2 ring-indigo-500/40 bg-white/10"
              : "border-white/10"
          }`}
        >
          <div>
            <h3 className="font-sans font-bold text-xl text-white mb-0.5">
              {t("chart_pie_title")}
            </h3>
            <p className="text-slate-400 text-xs opacity-75 mb-6">
              {t("chart_pie_sub")}
            </p>
          </div>

          {/* Large SVG interactive representation */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            {/* Standard Circular Arc render inside SVG for responsive design compatibility */}
            <svg
              className="w-full h-full transform -rotate-90 select-none"
              viewBox="0 0 100 100"
            >
              {/* Shadow Base circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="8"
              ></circle>
              {/* Reactive Slices represented with stroke-dash offsets */}
              {/* Slice 1: Mobile (42%) -> stroke-dashoffset changes based on active percentage */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#6366f1"
                strokeWidth={hoveredPieIndex === 0 ? 11 : 8}
                strokeDasharray="238.7"
                strokeDashoffset="138.4"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredPieIndex(0)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
              {/* Slice 2: Accessories (28%) -> rotated by stroke count */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#10b981"
                strokeWidth={hoveredPieIndex === 1 ? 11 : 8}
                strokeDasharray="238.7"
                strokeDashoffset="171.86"
                transform="rotate(151.2 50 50)"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredPieIndex(1)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
              {/* Slice 3: Large appliances (18%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth={hoveredPieIndex === 2 ? 11 : 8}
                strokeDasharray="238.7"
                strokeDashoffset="195.7"
                transform="rotate(252 50 50)"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredPieIndex(2)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
              {/* Slice 4: Small Tech (12%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#a855f7"
                strokeWidth={hoveredPieIndex === 3 ? 11 : 8}
                strokeDasharray="238.7"
                strokeDashoffset="210.05"
                transform="rotate(316.8 50 50)"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredPieIndex(3)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
            </svg>

            {/* Central dynamic financial readouts */}
            <div className="absolute text-center select-none pointer-events-none">
              <span className="block text-xl font-mono font-bold text-white tracking-tight">
                {hoveredPieIndex !== null
                  ? `$${categoriesPieData[hoveredPieIndex].value.toLocaleString()}`
                  : `$${totalFinancialSum.toLocaleString()}`}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#4edea3] bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                {hoveredPieIndex !== null
                  ? `${t(categoriesPieData[hoveredPieIndex].nameKey)} (${categoriesPieData[hoveredPieIndex].percentage}%)`
                  : highlightedCategory
                    ? `${t(categoriesPieData.find((c) => c.id === highlightedCategory)?.nameKey || "")} (${categoriesPieData.find((c) => c.id === highlightedCategory)?.percentage}%)`
                    : "+12.4%"}
              </span>
            </div>
          </div>

          {/* Map legend blocks */}
          <div className="mt-6 grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
            {categoriesPieData.map((item, index) => {
              const isDimmed =
                highlightedCategory && highlightedCategory !== item.id;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2.5 p-1.5 rounded-lg transition-all ${
                    hoveredPieIndex === index || highlightedCategory === item.id
                      ? "bg-white/10 ring-1 ring-white/10"
                      : ""
                  } ${isDimmed ? "opacity-20 scale-95" : "opacity-100"}`}
                  onMouseEnter={() => setHoveredPieIndex(index)}
                  onMouseLeave={() => setHoveredPieIndex(null)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs font-semibold text-slate-300">
                    {t(item.nameKey)} ({item.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 2: Category volume bar chart (Monthly performace) */}
        <div
          id="widget-monthly-performance"
          className="col-span-12 lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl transition-all duration-300 relative"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-sans font-bold text-xl text-white mb-0.5">
                {t("chart_bar_title")}
              </h3>
              <p className="text-slate-400 text-xs opacity-75">
                {t("chart_bar_sub")}
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-mono font-bold select-none tracking-widest leading-none">
              {t("tag_live")}
            </span>
          </div>

          {/* Interactive Responsive Monthly Bars */}
          <div className="h-60 w-full relative flex items-end">
            {/* Y axis helpers lines overlay */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 text-[10px] font-mono text-slate-500 opacity-60">
              <div className="border-b border-white/10 w-full pt-1">80 PCS</div>
              <div className="border-b border-white/10 w-full pt-1">50 PCS</div>
              <div className="border-b border-white/10 w-full pt-1">20 PCS</div>
              <div className="w-full"></div>
            </div>

            {/* Bars container */}
            <div className="flex-1 flex justify-around items-end h-[90%] pb-1 z-10 relative">
              {monthlyData.map((month, mIdx) => {
                // Calculate percentage heights recursively
                const hMobile = Math.min(100, (month.data.mobile / 100) * 100);
                const hAcc = Math.min(
                  100,
                  (month.data.accessories / 100) * 100,
                );
                const hLarge = Math.min(
                  100,
                  (month.data.largeAppliances / 100) * 100,
                );
                const hSmall = Math.min(
                  100,
                  (month.data.smallAppliances / 100) * 100,
                );

                const isActive = hoveredMonthIndex === mIdx;

                return (
                  <div
                    key={month.monthKey}
                    className={`flex-1 flex items-end justify-center gap-0.5 px-1.5 h-full group relative cursor-pointer rounded-t-lg transition-all ${
                      isActive
                        ? "bg-white/10 border border-white/15"
                        : "border border-transparent"
                    }`}
                    onMouseEnter={() => setHoveredMonthIndex(mIdx)}
                    onMouseLeave={() => setHoveredMonthIndex(null)}
                  >
                    {/* Columns structure */}
                    <div
                      className={`flex-1 bg-indigo-500/70 group-hover:bg-indigo-400 rounded-t-sm transition-all ${
                        highlightedCategory && highlightedCategory !== "mobile"
                          ? "opacity-15"
                          : "opacity-100"
                      }`}
                      style={{ height: `${hMobile}%` }}
                    />
                    <div
                      className={`flex-1 bg-emerald-500/70 group-hover:bg-emerald-400 rounded-t-sm transition-all ${
                        highlightedCategory &&
                        highlightedCategory !== "accessories"
                          ? "opacity-15"
                          : "opacity-100"
                      }`}
                      style={{ height: `${hAcc}%` }}
                    />
                    <div
                      className={`flex-1 bg-red-500/70 group-hover:bg-red-400 rounded-t-sm transition-all ${
                        highlightedCategory && highlightedCategory !== "large"
                          ? "opacity-15"
                          : "opacity-100"
                      }`}
                      style={{ height: `${hLarge}%` }}
                    />
                    <div
                      className={`flex-1 bg-purple-500/70 group-hover:bg-purple-400 rounded-t-sm transition-all ${
                        highlightedCategory && highlightedCategory !== "small"
                          ? "opacity-15"
                          : "opacity-100"
                      }`}
                      style={{ height: `${hSmall}%` }}
                    />

                    {/* Active Month Floating Tooltip */}
                    {isActive && (
                      <div className="absolute bottom-28 bg-white/10 backdrop-blur-3xl border border-white/20 p-3 rounded-xl shadow-2xl w-40 z-50 text-[10px] space-y-1 animate-fadeIn select-none text-slate-200">
                        <span className="font-bold text-slate-100 block mb-1 font-sans">
                          {t(month.monthKey)}{" "}
                          {lang === "zh" ? "细分数据" : "Details"}
                        </span>
                        <div className="flex justify-between text-indigo-300">
                          <span>{t("cat_phone")}:</span>
                          <span className="font-mono font-bold">
                            {month.data.mobile} {t("unit_pcs")}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-300">
                          <span>{t("cat_acc")}:</span>
                          <span className="font-mono font-bold">
                            {month.data.accessories} {t("unit_pcs")}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-300">
                          <span>{t("cat_large")}:</span>
                          <span className="font-mono font-bold">
                            {month.data.largeAppliances} {t("unit_pcs")}
                          </span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>{t("cat_small")}:</span>
                          <span className="font-mono font-bold">
                            {month.data.smallAppliances} {t("unit_pcs")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Month labels footer */}
          <div className="flex justify-between mt-3 text-[10px] font-mono text-[#c2c6d6] uppercase tracking-wider px-2">
            {monthlyData.map((month) => (
              <span
                key={month.monthKey}
                className="flex-1 text-center font-semibold"
              >
                {t(month.monthKey)}
              </span>
            ))}
          </div>

          {/* Color labels map legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-5 pt-3 border-t border-white/10 text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span>{t("cat_phone")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>{t("cat_acc")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{t("cat_large")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>{t("cat_small")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Middle Widgets */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Widget 3: Sales Volume Donut with center piece count (3 columns) */}
        <div
          id="widget-sales-volume-donut"
          className="col-span-12 md:col-span-4 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] flex flex-col justify-between shadow-2xl"
        >
          <div>
            <h3 className="font-sans font-bold text-xl text-white text-center mb-6">
              {t("chart_donut_title")}
            </h3>
          </div>

          <div className="relative flex justify-center items-center h-44">
            {/* SVG structure */}
            <svg
              className="w-40 h-40 transform -rotate-90 select-none"
              viewBox="0 0 160 160"
            >
              {/* Outer stroke gray base */}
              <circle
                className="text-white/5"
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="9"
              />
              {/* Mobile segment - 37% */}
              <circle
                className="text-emerald-500 cursor-pointer hover:stroke-[11px] transition-all duration-200"
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="9"
                strokeDasharray="440"
                strokeDashoffset="277.2"
                onMouseEnter={() => setHoveredPieIndex(0)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
              {/* Accessories - 26% */}
              <circle
                className="text-indigo-500 cursor-pointer hover:stroke-[11px] transition-all duration-200"
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="9"
                strokeDasharray="440"
                strokeDashoffset="325.6"
                transform="rotate(133.2 80 80)"
                onMouseEnter={() => setHoveredPieIndex(1)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
              {/* Large appliances - 25% */}
              <circle
                className="text-red-500 cursor-pointer hover:stroke-[11px] transition-all duration-200"
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="9"
                strokeDasharray="440"
                strokeDashoffset="330"
                transform="rotate(226.8 80 80)"
                onMouseEnter={() => setHoveredPieIndex(2)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
              {/* Small Tech - 12% */}
              <circle
                className="text-purple-400 cursor-pointer hover:stroke-[11px] transition-all duration-200"
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="9"
                strokeDasharray="440"
                strokeDashoffset="387.2"
                transform="rotate(316.8 80 80)"
                onMouseEnter={() => setHoveredPieIndex(3)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              />
            </svg>

            <div className="absolute text-center select-none pointer-events-none">
              <span className="block font-mono text-2xl font-bold text-white">
                {hoveredPieIndex !== null
                  ? categoriesPieData[hoveredPieIndex].qty.toLocaleString()
                  : totalQuantitySum.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-widest block mt-0.5">
                {hoveredPieIndex !== null
                  ? t(categoriesPieData[hoveredPieIndex].nameKey)
                  : highlightedCategory
                    ? t(
                        categoriesPieData.find(
                          (c) => c.id === highlightedCategory,
                        )?.nameKey || "",
                      )
                    : t("unit_pcs")}
              </span>
            </div>
          </div>

          <ul className="mt-6 space-y-2 border-t border-white/10 pt-3">
            <li
              className={`flex justify-between text-xs font-semibold py-1 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "mobile" ? "opacity-20 scale-95" : "opacity-100"}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-slate-300 font-sans">
                  {t("cat_phone")}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-bold opacity-70">
                  (37%)
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {categoriesPieData[0].qty}
                </span>
              </div>
            </li>
            <li
              className={`flex justify-between text-xs font-semibold py-1 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "accessories" ? "opacity-20 scale-95" : "opacity-100"}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-slate-300 font-sans">{t("cat_acc")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-bold opacity-70">
                  (26%)
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {categoriesPieData[1].qty}
                </span>
              </div>
            </li>
            <li
              className={`flex justify-between text-xs font-semibold py-1 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "large" ? "opacity-20 scale-95" : "opacity-100"}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-slate-300 font-sans">
                  {t("cat_large")}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-bold opacity-70">
                  (25%)
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {categoriesPieData[2].qty}
                </span>
              </div>
            </li>
            <li
              className={`flex justify-between text-xs font-semibold py-1 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "small" ? "opacity-20 scale-95" : "opacity-100"}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
                <span className="text-slate-300 font-sans">
                  {t("cat_small")}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-bold opacity-70">
                  (12%)
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {categoriesPieData[3].qty}
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Widget 4: Store Performance Ranking (9 Columns) */}
        <div
          id="widget-store-ranking"
          className="col-span-12 md:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl flex flex-col justify-between"
        >
          <div>
            <h3 className="font-sans font-bold text-xl text-white mb-6">
              {t("chart_rank_title")}
            </h3>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-around">
            {storeRanking.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                {lang === "zh"
                  ? "没有找到符合当前搜索语的店面"
                  : "No matching stores found for search query"}
              </div>
            ) : (
              storeRanking.map((store, index) => {
                // Highlight item based on search match
                const storeLabelNormalized = t(store.storeKey).toLowerCase();
                const isSearchingThisStore =
                  searchQuery &&
                  storeLabelNormalized.includes(searchQuery.toLowerCase());

                // Colors for rankings
                const rankColorText =
                  store.rank === 1
                    ? "text-emerald-400 font-bold"
                    : store.rank === 2
                      ? "text-indigo-400 font-bold"
                      : "text-purple-300 font-semibold";
                const rankColorBar =
                  store.rank === 1
                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : store.rank === 2
                      ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : "bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]";

                return (
                  <div
                    key={store.storeKey}
                    className={`p-2.5 rounded-xl transition-all ${
                      isSearchingThisStore
                        ? "bg-indigo-500/10 border border-indigo-400/20"
                        : "border border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-end mb-2 select-none">
                      <div>
                        <span className={`text-indigo-300 ${rankColorText}`}>
                          #{store.rank}
                        </span>
                        <span className="ml-2.5 font-sans font-semibold text-xs text-slate-200">
                          {t(store.storeKey)}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-200 font-bold">
                        ${store.sales.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-sans font-normal ml-1">
                          {t(store.dateKey)}
                        </span>
                      </span>
                    </div>

                    {/* Progress slide bar */}
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${rankColorBar}`}
                        style={{ width: `${store.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Widget 5: Volume Historical Trends multi-path Line Chart (Full 12 Columns card) */}
      <div
        id="widget-volume-trends"
        className="col-span-12 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl overflow-hidden relative"
      >
        <h3 className="font-sans font-bold text-xl text-white mb-4">
          {t("chart_line_title")}
        </h3>

        <div className="relative h-64 w-full mt-2 mb-8 select-none">
          {/* SVG line plotter targeting responsive 1000x300 canvas size */}
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
          >
            {/* Horizontal supportive guidelines */}
            <line
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              x1="0"
              x2="1000"
              y1="0"
              y2="0"
            ></line>
            <line
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              x1="0"
              x2="1000"
              y1="75"
              y2="75"
            ></line>
            <line
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              x1="0"
              x2="1000"
              y1="150"
              y2="150"
            ></line>
            <line
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              x1="0"
              x2="1000"
              y1="225"
              y2="225"
            ></line>
            <line
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
              x1="0"
              x2="1000"
              y1="300"
              y2="300"
            ></line>

            {/* Vertical Supportive guidelines for interactive hovering check-zones */}
            {[0, 200, 400, 600, 800, 1000].map((x, index) => (
              <line
                key={index}
                stroke={
                  hoveredLineIndex === index
                    ? "rgba(99, 102, 241, 0.25)"
                    : "rgba(255, 255, 255, 0.03)"
                }
                strokeWidth={hoveredLineIndex === index ? 2 : 1}
                x1={x}
                x2={x}
                y1={0}
                y2={300}
                className="transition-all"
              />
            ))}

            {/* Category paths configured by spline curves */}
            {/* Curve 1: Phones (Indigo) */}
            <path
              d="M0,220 C100,200 100,180 200,180 C300,180 300,120 400,120 C500,120 500,150 600,150 C700,150 700,80 800,80 C900,80 900,60 1000,60"
              fill="none"
              stroke="#6366f1"
              strokeWidth={highlightedCategory === "mobile" ? "5" : "3"}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-300 ${
                highlightedCategory && highlightedCategory !== "mobile"
                  ? "opacity-[0.13]"
                  : "opacity-100"
              }`}
            />

            {/* Curve 2: Accessories (Emerald) */}
            <path
              d="M0,250 C100,230 100,210 200,210 C300,210 300,240 400,240 C500,240 500,190 600,190 C700,190 700,140 800,140 C900,140 900,110 1000,110"
              fill="none"
              stroke="#10b981"
              strokeWidth={highlightedCategory === "accessories" ? "5" : "3"}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-300 ${
                highlightedCategory && highlightedCategory !== "accessories"
                  ? "opacity-[0.13]"
                  : "opacity-100"
              }`}
            />

            {/* Curve 3: Large appliances (Red) */}
            <path
              d="M0,280 C100,270 100,260 200,260 C300,260 300,220 400,220 C500,220 500,230 600,230 C700,230 700,180 800,180 C900,180 900,190 1000,190"
              fill="none"
              stroke="#ef4444"
              strokeWidth={highlightedCategory === "large" ? "5" : "3"}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-300 ${
                highlightedCategory && highlightedCategory !== "large"
                  ? "opacity-[0.13]"
                  : "opacity-100"
              }`}
            />

            {/* Curve 4: Small Tech (Purple) */}
            <path
              d="M0,290 C100,288 100,285 200,285 C300,285 300,270 400,270 C500,270 500,265 600,265 C700,265 700,250 800,250 C900,250 900,240 1000,240"
              fill="none"
              stroke="#a855f7"
              strokeWidth={highlightedCategory === "small" ? "5" : "3"}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-300 ${
                highlightedCategory && highlightedCategory !== "small"
                  ? "opacity-[0.13]"
                  : "opacity-100"
              }`}
            />

            {/* Hover Hotspot zones overlays (Invisible wide rect overlay panels) */}
            {[0, 200, 400, 600, 800, 1000].map((x, index) => (
              <rect
                key={index}
                x={x === 0 ? 0 : x - 50}
                y={0}
                width={100}
                height={300}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredLineIndex(index)}
                onMouseLeave={() => setHoveredLineIndex(null)}
              />
            ))}
          </svg>

          {/* Interactive timeline data floating panel */}
          {hoveredLineIndex !== null && (
            <div
              className="absolute bg-white/10 backdrop-blur-3xl border border-white/20 p-4 rounded-xl shadow-2xl z-50 text-[10px] space-y-1 w-44 pointer-events-none select-none animate-fadeIn text-slate-200"
              style={{
                left: `${Math.min(75, (hoveredLineIndex * 200) / 10 + 2)}%`,
                top: "10%",
              }}
            >
              <div className="font-bold text-slate-100 flex items-center justify-between border-b border-white/10 pb-1 mb-1 font-sans">
                <span>{t(lineTrendsData[hoveredLineIndex].ymKey)}</span>
                <span className="text-[9px] text-indigo-400">
                  EPOCH DETECTED
                </span>
              </div>
              <div className="flex justify-between text-indigo-300">
                <span>{t("cat_phone")}:</span>
                <span className="font-mono font-bold">
                  {lineTrendsData[hoveredLineIndex].mobile} PCS
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>{t("cat_acc")}:</span>
                <span className="font-mono font-bold">
                  {lineTrendsData[hoveredLineIndex].accessories} PCS
                </span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>{t("cat_large")}:</span>
                <span className="font-mono font-bold">
                  {lineTrendsData[hoveredLineIndex].largeAppliances} PCS
                </span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>{t("cat_small")}:</span>
                <span className="font-mono font-bold">
                  {lineTrendsData[hoveredLineIndex].smallAppliances} PCS
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend pills */}
        <div className="flex justify-center flex-wrap gap-8 mb-4 border-t border-white/10 pt-5 text-xs text-slate-300 font-semibold tracking-wide select-none">
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "mobile" ? "opacity-25 scale-95" : "opacity-100"}`}
          >
            <div className="w-4 h-1.5 rounded-full bg-indigo-500"></div>
            <span>{t("cat_phone")}</span>
          </div>
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "accessories" ? "opacity-25 scale-95" : "opacity-100"}`}
          >
            <div className="w-4 h-1.5 rounded-full bg-emerald-500"></div>
            <span>{t("cat_acc")}</span>
          </div>
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "large" ? "opacity-25 scale-95" : "opacity-100"}`}
          >
            <div className="w-4 h-1.5 rounded-full bg-red-500"></div>
            <span>{t("cat_large")}</span>
          </div>
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${highlightedCategory && highlightedCategory !== "small" ? "opacity-25 scale-95" : "opacity-100"}`}
          >
            <div className="w-4 h-1.5 rounded-full bg-purple-500"></div>
            <span>{t("cat_small")}</span>
          </div>
        </div>

        {/* Timeline labels footer */}
        <div className="grid grid-cols-6 text-center text-[10px] font-mono text-[#c2c6d6] uppercase tracking-wider select-none px-4 pb-2">
          {lineTrendsData.map((item) => (
            <span key={item.ymKey} className="font-semibold block">
              {t(item.ymKey)}
            </span>
          ))}
        </div>
      </div>

      {/* Widget 6: Real-time blockchain transactions audit ledger */}
      <div
        id="widget-blockchain-ledger"
        className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl overflow-hidden relative"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="font-sans font-bold text-xl text-white">
              最新链上安全核验日志 (Consensus Verification Audit Log)
            </h3>
          </div>
          <span className="px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold select-none tracking-widest leading-none">
            SECURED LEDGER
          </span>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-semibold bg-white/5 border border-dashed border-white/10 rounded-2xl">
              {searchQuery
                ? `🔍 暂无匹配关键词 "${searchQuery}" 的链上核验日志区块`
                : "⏳ 暂无已提交的链上核验区块记录，请至“销售录入”页面进行提交。"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTransactions.map((tx) => {
                const isPending = tx.status === "pending";
                return (
                  <div
                    key={tx.id}
                    className={`bg-white/5 border p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 hover:bg-white/10 ${
                      isPending
                        ? "border-amber-500/20"
                        : "border-emerald-500/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="overflow-hidden pr-4">
                        <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1">
                          TRANSACTION HASH
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-200 block truncate select-all">
                          {tx.tx_hash}
                        </span>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono tracking-wider ${
                          isPending
                            ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 animate-pulse"
                            : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {isPending ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        )}
                        {isPending ? "PENDING" : "SUCCESS"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-xl border border-white/5 text-[10px]">
                      <div>
                        <span className="opacity-60 block">
                          确认深度 (Confirmations)
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {tx.confirmations} / 6
                        </span>
                      </div>
                      <div>
                        <span className="opacity-60 block">
                          提交时间 (Block Time)
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {new Date(tx.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Animated Toasts Overlay */}
      <div
        id="toast-notifications-system-portal"
        className="fixed bottom-8 right-8 space-y-3 w-80 z-50 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-white/10 backdrop-blur-3xl border border-white/15 p-4 rounded-xl shadow-2xl animate-slideIn border-l-4 border-indigo-400"
          >
            <div
              className={`p-1 rounded-full ${toast.type === "success" ? "bg-emerald-500/15 text-emerald-300" : "bg-indigo-500/15 text-indigo-300"}`}
            >
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span
                className={`block text-xs font-bold uppercase ${toast.type === "success" ? "text-emerald-400" : "text-indigo-400"}`}
              >
                {toast.type === "success" ? "SUCCESS" : "COMPILING"}
              </span>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                {toast.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
