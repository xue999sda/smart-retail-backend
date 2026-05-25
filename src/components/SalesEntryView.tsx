import { useState, useMemo, useEffect, FormEvent } from "react";
import {
  Smartphone,
  Headphones,
  Tv,
  Zap,
  Trash2,
  Plus,
  CheckCircle2,
  CloudLightning,
  TrendingUp,
  TrendingDown,
  Loader2,
  Lock,
  PlusCircle,
  X,
  Calendar,
  MapPin,
  Building2,
  Download,
  FileText,
  Info,
} from "lucide-react";
import {
  Language,
  SalesCategory,
  SalesItem,
  TransactionStatus,
} from "../types";
import { INITIAL_SALES_CATEGORIES } from "../data";

interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "info";
}

interface SalesEntryViewProps {
  lang: Language;
  t: (key: string) => string;
  searchQuery: string;
}

export default function SalesEntryView({
  lang,
  t,
  searchQuery,
}: SalesEntryViewProps) {
  // Global Filters State
  const [dateRange, setDateRange] = useState("2023-10-06");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const handleExportCSV = () => {
    const rows = [];
    rows.push(["Smart Retail 智能零售系统 - 销售录入物料清单明细"]);
    rows.push([`导出时间: ${new Date().toLocaleString()}`]);
    rows.push([`报告语言: ${lang === "zh" ? "简体中文" : "English"}`]);
    rows.push([]);

    rows.push([
      "商品大类 (Category ID)",
      "大类译名 (Category Name)",
      "物料ID (Item ID)",
      "物料名-中文 (Name ZH)",
      "物料名-英文 (Name EN)",
      "销售录入数量 (Quantity)",
      "商品单价 (Unit Price USD)",
      "总额 (Subtotal USD)",
      "自有品牌 (Is Internal)",
    ]);

    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        const subtotal = item.quantity * item.unitPrice;
        rows.push([
          cat.id,
          t(cat.nameKey),
          item.id,
          item.nameZh,
          item.nameEn,
          item.quantity,
          item.unitPrice,
          subtotal,
          item.isInternal
            ? lang === "zh"
              ? "是"
              : "Yes"
            : lang === "zh"
              ? "否"
              : "No",
        ]);
      });
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
    link.setAttribute("download", `smart_retail_materials_${Date.now()}.csv`);
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
      const element = document.getElementById("sales-entry-view-root");
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
        filename: `smart_retail_materials_${Date.now()}.pdf`,
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

  // Configured Categories and Items state pre-loaded with mock database values
  const [categories, setCategories] = useState<SalesCategory[]>(
    INITIAL_SALES_CATEGORIES,
  );

  // Web 3.0 transaction ledger states
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [blockConfirmations, setBlockConfirmations] = useState(0);

  // Modal dialog states for adding custom products
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetCategoryAddId, setTargetCategoryAddId] = useState("");

  // Custom item form inputs
  const [newItemNameZh, setNewItemNameZh] = useState("");
  const [newItemNameEn, setNewItemNameEn] = useState("");
  const [newItemQty, setNewItemQty] = useState<number>(10);
  const [newItemPrice, setNewItemPrice] = useState<number>(350);
  const [newItemIsInternal, setNewItemIsInternal] = useState(false);

  // Fetch all items from database via NodeJS API Gateway
  const fetchCategories = () => {
    const url = searchQuery
      ? `/api/sales-categories?search=${encodeURIComponent(searchQuery)}`
      : "/api/sales-categories";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.error("Error fetching sales categories:", err));
  };

  useEffect(() => {
    fetchCategories();
  }, [searchQuery]);

  // Calculate dynamic metrics on-the-fly from actual rows
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {
      mobile: 0,
      accessories: 0,
      large: 0,
      small: 0,
    };

    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        totals[cat.id] += item.quantity * item.unitPrice;
      });
    });

    return totals;
  }, [categories]);

  // Handle live inputs quantities changes (with highly premium Optimistic Updates!)
  const handleQuantityChange = (
    catId: string,
    itemId: string,
    newQty: number,
  ) => {
    if (newQty < 0) return;

    // 1. Optimistically update local UI state immediately
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, quantity: newQty };
          }),
        };
      }),
    );

    // 2. Perform background database synchronization
    fetch(`/api/sales-items/${itemId}/quantity`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    }).catch((err) => {
      console.error("Error syncing quantity to DB, rolling back:", err);
      fetchCategories(); // Rollback if API fails
    });
  };

  // Delete live item category rows (with Optimistic Updates!)
  const handleDeleteItem = (catId: string, itemId: string) => {
    // 1. Optimistically delete item locally
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      }),
    );

    // 2. Perform background deletion API request
    fetch(`/api/sales-items/${itemId}`, {
      method: "DELETE",
    }).catch((err) => {
      console.error("Error deleting item from DB, rolling back:", err);
      fetchCategories(); // Rollback
    });
  };

  // Open product insertion popup
  const openAddModal = (catId: string) => {
    setTargetCategoryAddId(catId);
    setNewItemNameZh("");
    setNewItemNameEn("");
    setNewItemQty(10);
    setNewItemPrice(120);
    setNewItemIsInternal(false);
    setShowAddModal(true);
  };

  // Add custom class parameters to cloud database
  const handleAddNewItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemNameZh.trim() || !newItemNameEn.trim()) return;

    fetch("/api/sales-categories/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: targetCategoryAddId,
        nameZh: newItemNameZh.trim(),
        nameEn: newItemNameEn.trim(),
        quantity: Math.max(0, newItemQty),
        unitPrice: Math.max(0, newItemPrice),
        isInternal: newItemIsInternal,
      }),
    })
      .then((res) => res.json())
      .then((createdItem) => {
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== targetCategoryAddId) return cat;
            return {
              ...cat,
              items: [...cat.items, createdItem],
            };
          }),
        );
        setShowAddModal(false);
      })
      .catch((err) => console.error("Error creating product in DB:", err));
  };

  // Simulated Web 3 on-chain submission sequence + Database Persistence
  const handleOnChainSubmission = () => {
    if (txStatus === "pending") return;

    setTxStatus("pending");
    setBlockConfirmations(0);
    setTxHash("");

    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: categories }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTxHash(data.txHash);
        setTxStatus("pending");

        // Poll confirmations count until it successfully finishes consensus checks
        let confirmations = 0;
        const interval = setInterval(() => {
          fetch("/api/dashboard")
            .then((r) => r.json())
            .then((db) => {
              const currentTx = db.recentTransactions.find(
                (t: any) => t.tx_hash === data.txHash,
              );
              if (currentTx) {
                setBlockConfirmations(currentTx.confirmations);
                if (currentTx.confirmations >= 6) {
                  setTxStatus("success");
                  clearInterval(interval);
                }
              }
            })
            .catch((err) => {
              console.error("Error polling tx status:", err);
              clearInterval(interval);
              setTxStatus("success"); // Fallback to success
            });
        }, 1000);
      })
      .catch((err) => {
        console.error("Error submitting transaction:", err);
        setTxStatus("idle");
      });
  };

  // Search filter highlighting rules
  const getSubItemsFiltered = (items: SalesItem[], catId: string) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase().trim();

    // Check if category name matches
    let matchesCategory = false;
    if (
      catId === "mobile" &&
      ("手机".includes(q) || "phone".includes(q) || "devices".includes(q))
    )
      matchesCategory = true;
    if (catId === "accessories" && ("配件".includes(q) || "access".includes(q)))
      matchesCategory = true;
    if (
      catId === "large" &&
      ("大家电".includes(q) || "large".includes(q) || "appliances".includes(q))
    )
      matchesCategory = true;
    if (
      catId === "small" &&
      ("小家电".includes(q) || "small".includes(q) || "tech".includes(q))
    )
      matchesCategory = true;

    if (matchesCategory) return items;

    return items.filter(
      (i) =>
        i.nameZh.toLowerCase().includes(q) ||
        i.nameEn.toLowerCase().includes(q),
    );
  };

  return (
    <div id="sales-entry-view-root" className="space-y-8">
      {/* 仅在打印/导出 PDF 时显现的奢华物料明细页眉栏 (Luxury Print-Only Materials Header) */}
      <div className="hidden print:block border-b-2 border-indigo-500 pb-5 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-sans tracking-wider">
              SMART RETAIL 销售录入物料清单核算报告
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1.5 uppercase tracking-widest">
              Report Category: Granular Materials Inventory & Blockchain
              Consensus Ledger
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-md text-[10px] font-mono font-bold">
              ORIGIN: SANDBOX ACTIVE
            </span>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5">
              Exported: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      {/* Global Filters Overlay UI Block */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 p-5 rounded-[24px] shadow-2xl relative animate-fadeIn">
        <div className="flex flex-wrap items-center flex-1 gap-3">
          {/* Date Picker Input Box */}
          <div
            className="flex flex-col min-w-[130px] bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 focus-within:bg-[#0c1222]"
            onClick={() =>
              document.getElementById("se-filter-date-input")?.focus()
            }
          >
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1 flex items-center gap-1 select-none">
              <Calendar className="w-3 h-3" /> {t("filter_date")}
            </span>
            <input
              type="text"
              id="se-filter-date-input"
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
              document.getElementById("se-filter-country-input")?.focus()
            }
          >
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1 flex items-center gap-1 select-none">
              <MapPin className="w-3 h-3" /> {t("filter_country")}
            </span>
            <input
              type="text"
              id="se-filter-country-input"
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
              document.getElementById("se-filter-store-input")?.focus()
            }
          >
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1 flex items-center gap-1 select-none">
              <Building2 className="w-3 h-3" /> {t("filter_store")}
            </span>
            <input
              type="text"
              id="se-filter-store-input"
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
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 text-xs font-semibold text-slate-100 transition-all shadow-xl shadow-black/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("btn_export_csv")}</span>
          </button>
          <button
            id="btn-pdf-report"
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 text-xs font-semibold text-slate-100 transition-all shadow-xl shadow-black/10 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t("btn_pdf_report")}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards Bento Grid reflecting real-time row totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Mobile Devices Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[24px] shadow-2xl relative overflow-hidden group select-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-mono mb-2 uppercase tracking-widest leading-none font-bold">
            {t("cat_phone")}
          </p>
          <h3 className="text-2xl font-bold font-sans text-white transition-all">
            $
            {categoryTotals.mobile.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </h3>
          <div className="flex items-center gap-1 mt-3 text-emerald-400 text-[10px] font-semibold leading-none">
            <TrendingUp className="w-3 h-3" />
            <span>{t("stat_up")}</span>
          </div>
        </div>

        {/* Accessories Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[24px] shadow-2xl relative overflow-hidden group select-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-mono mb-2 uppercase tracking-widest leading-none font-bold">
            {t("accessories")}
          </p>
          <h3 className="text-2xl font-bold font-sans text-white transition-all">
            $
            {categoryTotals.accessories.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </h3>
          <div className="flex items-center gap-1 mt-3 text-emerald-400 text-[10px] font-semibold leading-none">
            <TrendingUp className="w-3 h-3" />
            <span>{t("stat_up_acc")}</span>
          </div>
        </div>

        {/* Large Appliances Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[24px] shadow-2xl relative overflow-hidden group select-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-mono mb-2 uppercase tracking-widest leading-none font-bold">
            {t("large_appliances")}
          </p>
          <h3 className="text-2xl font-bold font-sans text-white transition-all">
            $
            {categoryTotals.large.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </h3>
          <div className="flex items-center gap-1 mt-3 text-red-400 text-[10px] font-semibold leading-none">
            <TrendingDown className="w-3 h-3" />
            <span>{t("stat_down")}</span>
          </div>
        </div>

        {/* Small Appliances Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[24px] shadow-2xl relative overflow-hidden group select-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-mono mb-2 uppercase tracking-widest leading-none font-bold">
            {t("small_appliances")}
          </p>
          <h3 className="text-2xl font-bold font-sans text-white transition-all">
            $
            {categoryTotals.small.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </h3>
          <div className="flex items-center gap-1 mt-3 text-emerald-400 text-[10px] font-semibold leading-none">
            <TrendingUp className="w-3 h-3" />
            <span>{t("stat_up_small")}</span>
          </div>
        </div>
      </div>

      {/* Structured Category Spreadsheet Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Panel 1: Mobile Devices */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-lg text-white">
                {t("phone_devices")}
              </h4>
            </div>
            <span className="font-mono text-xs text-indigo-400/70 font-semibold">
              {t("sku_active_3")}
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-12 text-[10px] font-mono text-[#c2c6d6] border-b border-white/10 pb-2 px-1 tracking-wider uppercase">
              <div className="col-span-5">{t("th_category")}</div>
              <div className="col-span-3 text-right">{t("th_quantity")}</div>
              <div className="col-span-3 text-right">{t("th_amount")}</div>
              <div className="col-span-1"></div>
            </div>

            {getSubItemsFiltered(categories[0].items, "mobile").length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">
                {t("search_nodata")}
              </p>
            ) : (
              getSubItemsFiltered(categories[0].items, "mobile").map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center px-1.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="col-span-5 text-slate-100 font-bold text-xs">
                    {lang === "zh" ? item.nameZh : item.nameEn}
                  </div>
                  <div className="col-span-3 text-right">
                    <input
                      type="number"
                      className="bg-white/5 border border-white/10 text-right rounded-lg w-20 text-xs text-slate-100 leading-none py-1.5 px-2.5 focus:ring-1 focus:ring-indigo-400 focus:bg-white/10 outline-none font-sans font-semibold"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          "mobile",
                          item.id,
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-[#4edea3] font-bold">
                    $
                    {(item.quantity * item.unitPrice).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 0 },
                    )}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleDeleteItem("mobile", item.id)}
                      className="text-[#c2c6d6] hover:text-[#ef4444] transition-colors cursor-pointer"
                      title="Delete Product Code"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => openAddModal("mobile")}
              className="w-full mt-4 py-3 border border-dashed border-white/15 rounded-xl flex items-center justify-center gap-1.5 text-slate-400 hover:border-indigo-400/40 hover:text-indigo-300 hover:bg-white/5 transition-all text-xs font-bold group cursor-pointer"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>
                {lang === "zh"
                  ? `添加 ${t("phone_devices")} 商品`
                  : `Add ${t("phone_devices")} Item`}
              </span>
            </button>
          </div>
        </div>

        {/* Panel 2: Accessories Section */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-lg text-white">
                {t("accessories")}
              </h4>
            </div>
            <span className="font-mono text-xs text-[#4edea3]/70 font-semibold">
              {t("sku_active_2")}
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-12 text-[10px] font-mono text-[#c2c6d6] border-b border-white/10 pb-2 px-1 tracking-wider uppercase">
              <div className="col-span-5">{t("th_category")}</div>
              <div className="col-span-3 text-right">{t("th_quantity")}</div>
              <div className="col-span-3 text-right">{t("th_amount")}</div>
              <div className="col-span-1"></div>
            </div>

            {getSubItemsFiltered(categories[1].items, "accessories").length ===
            0 ? (
              <p className="text-slate-500 text-xs text-center py-6">
                {t("search_nodata")}
              </p>
            ) : (
              getSubItemsFiltered(categories[1].items, "accessories").map(
                (item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center px-1.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      <span className="text-slate-100 font-bold text-xs">
                        {lang === "zh" ? item.nameZh : item.nameEn}
                      </span>
                      {item.isInternal && (
                        <span className="bg-indigo-500/15 text-[9px] text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                          {t("label_internal")}
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 text-right">
                      <input
                        type="number"
                        className="bg-white/5 border border-white/10 text-right rounded-lg w-20 text-xs text-slate-100 leading-none py-1.5 px-2.5 focus:ring-1 focus:ring-indigo-400 focus:bg-white/10 outline-none font-sans font-semibold"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            "accessories",
                            item.id,
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3 text-right font-mono text-xs text-[#4edea3] font-bold">
                      $
                      {(item.quantity * item.unitPrice).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => handleDeleteItem("accessories", item.id)}
                        className="text-[#c2c6d6] hover:text-[#ef4444] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </div>
                ),
              )
            )}

            <button
              onClick={() => openAddModal("accessories")}
              className="w-full mt-4 py-3 border border-dashed border-white/15 rounded-xl flex items-center justify-center gap-1.5 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-white/5 transition-all text-xs font-bold group cursor-pointer"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>
                {lang === "zh"
                  ? `添加 ${t("accessories")} 商品`
                  : `Add ${t("accessories")} Item`}
              </span>
            </button>
          </div>
        </div>

        {/* Panel 3: Large Appliances Section (Full width 12 columns grid item) */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5">
              <Tv className="w-5 h-5 text-red-400" />
              <h4 className="font-bold text-lg text-white">
                {t("large_appliances")}
              </h4>
            </div>
            <div className="flex gap-4 items-center">
              <span className="font-mono text-xs text-slate-400 font-semibold">
                {t("sku_active_8")}
              </span>
              <div className="flex items-center gap-1 text-[10px] bg-white/10 border border-white/20 py-1 px-3 rounded-full font-sans select-none tracking-widest leading-none text-amber-300 font-bold">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{t("label_high_power")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {/* Left Column spreadsheet */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-mono text-[#c2c6d6] border-b border-white/10 pb-2 px-1 text-left upper tracking-wider uppercase">
                <div className="col-span-6">{t("th_item_name")}</div>
                <div className="col-span-3 text-right">{t("th_qty_short")}</div>
                <div className="col-span-3 text-right">{t("th_amt_short")}</div>
              </div>

              {getSubItemsFiltered(categories[2].items.slice(0, 4), "large")
                .length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">
                  {t("search_nodata")}
                </p>
              ) : (
                getSubItemsFiltered(
                  categories[2].items.slice(0, 4),
                  "large",
                ).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center px-1.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="col-span-6 text-slate-100 font-bold text-xs">
                      {lang === "zh" ? item.nameZh : item.nameEn}
                    </div>
                    <div className="col-span-3 text-right">
                      <input
                        type="number"
                        className="bg-white/5 border border-white/10 text-right rounded-lg w-16 text-xs text-white leading-none py-1.5 px-1.5 focus:ring-1 focus:ring-indigo-400 focus:bg-white/10 outline-none font-sans font-semibold"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            "large",
                            item.id,
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3 text-right font-mono text-xs text-[#4edea3] font-bold">
                      $
                      {(item.quantity * item.unitPrice).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column spreadsheet */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-mono text-[#c2c6d6] border-b border-white/10 pb-2 px-1 text-left upper tracking-wider uppercase">
                <div className="col-span-6">{t("th_item_name")}</div>
                <div className="col-span-3 text-right">{t("th_qty_short")}</div>
                <div className="col-span-3 text-right">{t("th_amt_short")}</div>
              </div>

              {getSubItemsFiltered(categories[2].items.slice(4), "large")
                .length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">
                  {t("search_nodata")}
                </p>
              ) : (
                getSubItemsFiltered(categories[2].items.slice(4), "large").map(
                  (item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 items-center px-1.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <div className="col-span-6 text-slate-100 font-bold text-xs">
                        {lang === "zh" ? item.nameZh : item.nameEn}
                      </div>
                      <div className="col-span-3 text-right">
                        <input
                          type="number"
                          className="bg-white/5 border border-white/10 text-right rounded-lg w-16 text-xs text-white leading-none py-1.5 px-1.5 focus:ring-1 focus:ring-indigo-400 focus:bg-white/10 outline-none font-sans font-semibold"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              "large",
                              item.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-3 text-right font-mono text-xs text-[#4edea3] font-bold">
                        $
                        {(item.quantity * item.unitPrice).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 0 },
                        )}
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </div>

          <button
            onClick={() => openAddModal("large")}
            className="w-full mt-6 py-3 border border-dashed border-white/15 rounded-xl flex items-center justify-center gap-1.5 text-slate-400 hover:border-indigo-400/40 hover:text-indigo-300 hover:bg-white/5 transition-all text-xs font-bold group cursor-pointer"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>
              {lang === "zh"
                ? `添加 ${t("large_appliances")} 商品`
                : `Add ${t("large_appliances")} Item`}
            </span>
          </button>
        </div>

        {/* Panel 4: Small Appliances Section */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5">
              <CloudLightning className="w-5 h-5 text-purple-400" />
              <h4 className="font-bold text-lg text-white">
                {t("small_appliances")}
              </h4>
            </div>
            <span className="font-mono text-xs text-purple-400/70 font-semibold">
              {t("sku_active_2")}
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-12 text-[10px] font-mono text-[#c2c6d6] border-b border-white/10 pb-2 px-1 tracking-wider uppercase">
              <div className="col-span-5">{t("th_category")}</div>
              <div className="col-span-3 text-right">{t("th_quantity")}</div>
              <div className="col-span-3 text-right">{t("th_amount")}</div>
              <div className="col-span-1"></div>
            </div>

            {getSubItemsFiltered(categories[3].items, "small").length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">
                {t("search_nodata")}
              </p>
            ) : (
              getSubItemsFiltered(categories[3].items, "small").map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center px-1.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="col-span-5 text-slate-100 font-bold text-xs">
                    {lang === "zh" ? item.nameZh : item.nameEn}
                  </div>
                  <div className="col-span-3 text-right">
                    <input
                      type="number"
                      className="bg-white/5 border border-white/10 text-right rounded-lg w-20 text-xs text-slate-100 leading-none py-1.5 px-2.5 focus:ring-1 focus:ring-indigo-400 focus:bg-white/10 outline-none font-sans font-semibold"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          "small",
                          item.id,
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-[#4edea3] font-bold">
                    $
                    {(item.quantity * item.unitPrice).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 0 },
                    )}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleDeleteItem("small", item.id)}
                      className="text-[#c2c6d6] hover:text-[#ef4444] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => openAddModal("small")}
              className="w-full mt-4 py-3 border border-dashed border-white/15 rounded-xl flex items-center justify-center gap-1.5 text-slate-400 hover:border-purple-400/40 hover:text-purple-300 hover:bg-white/5 transition-all text-xs font-bold group cursor-pointer"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>
                {lang === "zh"
                  ? `添加 ${t("small_appliances")} 商品`
                  : `Add ${t("small_appliances")} Item`}
              </span>
            </button>
          </div>
        </div>

        {/* Panel 5: Web 3 blockchain verified block controller */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,50 Q25,30 50,50 T100,50"
                fill="none"
                stroke="#6366f1"
                strokeWidth="0.5"
              />
              <path
                d="M0,60 Q25,40 50,60 T100,60"
                fill="none"
                stroke="#10b981"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          <div className="z-10 select-none py-4">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <h5 className="text-base font-bold text-white mb-2">
              {t("verify_title")}
            </h5>
            <p className="text-slate-400 text-xs mb-6 max-w-xs opacity-75 leading-relaxed">
              {t("verify_desc")}
            </p>
            <button
              onClick={handleOnChainSubmission}
              disabled={txStatus === "pending"}
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-500/40 disabled:text-slate-400 px-9 py-3 rounded-full text-xs font-bold font-sans shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all text-center leading-none inline-flex items-center gap-2 cursor-pointer"
            >
              {txStatus === "pending" && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>
                {txStatus === "pending"
                  ? t("notif_pending")
                  : t("btn_submit_verify")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating real-time consensus ledger status alerts */}
      <div
        id="ledger-notifications-alerts"
        className="fixed bottom-8 right-8 space-y-4 w-80 z-50 pointer-events-none"
      >
        {txStatus === "pending" && (
          <div className="pointer-events-auto bg-white/10 backdrop-blur-3xl border border-white/15 p-4 rounded-xl shadow-2xl border-l-4 border-amber-400 flex items-start gap-3.5 animate-slideIn">
            <div className="flex-shrink-0 animate-spin text-amber-400 mt-0.5">
              <Loader2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wide leading-none">
                {t("notif_pending")}
              </p>
              <p className="text-[10px] text-slate-300 font-sans mt-1 leading-normal">
                {t("notif_pending_desc")}
              </p>
            </div>
          </div>
        )}

        {txStatus === "success" && (
          <div className="pointer-events-auto bg-white/10 backdrop-blur-3xl border border-white/15 p-4 rounded-xl shadow-2xl border-l-4 border-emerald-500 flex items-start gap-4 animate-slideIn relative text-slate-200">
            <button
              onClick={() => setTxStatus("idle")}
              className="absolute top-2 right-2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ×
            </button>
            <div className="flex-shrink-0 text-emerald-400 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="w-full overflow-hidden">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide leading-none">
                {t("notif_success")}
              </p>
              <p
                className="text-[10px] font-mono text-slate-300 truncate mt-1.5 select-all"
                title={txHash}
              >
                HASH: {txHash.slice(0, 8)}...{txHash.slice(-8)}
              </p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                <span className="text-[9px] text-[#c2c6d6]/60 font-mono">
                  {blockConfirmations}{" "}
                  {lang === "zh" ? "次区块确认" : "Confirmations"}
                </span>
                <span className="text-[9px] text-emerald-400 hover:text-emerald-300 hover:underline font-bold font-sans uppercase cursor-pointer">
                  {t("explorer")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Dialog Modal for adding custom products categories */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-[#0c1222] border border-white/20 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-sans font-bold text-base text-white mb-5 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#6366f1]" />
              <span>
                {lang === "zh"
                  ? `添加新品目 (${t(categories.find((c) => c.id === targetCategoryAddId)?.nameKey || "")})`
                  : `Add New Item to ${t(categories.find((c) => c.id === targetCategoryAddId)?.nameKey || "")}`}
              </span>
            </h3>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  {t("dialog_add_name_zh")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 折叠屏手机"
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-xs font-semibold py-2.5 px-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
                  value={newItemNameZh}
                  onChange={(e) => setNewItemNameZh(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  {t("dialog_add_name_en")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Folding Phone"
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-xs font-semibold py-2.5 px-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
                  value={newItemNameEn}
                  onChange={(e) => setNewItemNameEn(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                    {t("dialog_add_qty")}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-xs font-mono font-semibold py-2.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-400"
                    value={newItemQty}
                    onChange={(e) =>
                      setNewItemQty(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                    {t("dialog_add_price")}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-xs font-mono font-semibold py-2.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-400"
                    value={newItemPrice}
                    onChange={(e) =>
                      setNewItemPrice(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              {targetCategoryAddId === "accessories" && (
                <div className="flex items-center gap-2.5 pt-2 select-none">
                  <input
                    type="checkbox"
                    id="is-internal-checkbox"
                    className="bg-white/5 border-white/10 rounded text-indigo-500 focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                    checked={newItemIsInternal}
                    onChange={(e) => setNewItemIsInternal(e.target.checked)}
                  />
                  <label
                    htmlFor="is-internal-checkbox"
                    className="text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    {t("dialog_is_internal")}
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  {t("dialog_cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {lang === "zh" ? "确认添加商品" : "Confirm Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
