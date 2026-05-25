import { useState, useEffect } from "react";
import { TRANSLATIONS } from "./data";
import { Language } from "./types";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import SalesEntryView from "./components/SalesEntryView";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  // Navigation states
  const [currentView, setView] = useState<"dashboard" | "sales">("dashboard");

  // Cloud backend & Supabase DB connection state
  const [dbMode, setDbMode] = useState<"supabase" | "sandbox" | "loading">(
    "loading",
  );

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setDbMode(data.mode || "sandbox");
      })
      .catch(() => {
        setDbMode("sandbox");
      });
  }, []);

  // Multilingual localization translation states
  const [lang, setLang] = useState<Language>("zh");

  // Interactive search state passed to active dashboard/ledger views
  const [searchQuery, setSearchQuery] = useState("");

  // Global alert modal state
  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Store Manager/Owner Customizable Settings State Hooks
  const [storeName, setStoreName] = useState(
    () => localStorage.getItem("sr_store_name") || "Smart Retail",
  );
  const [monthlyTarget, setMonthlyTarget] = useState(
    () => Number(localStorage.getItem("sr_monthly_target")) || 100000,
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    () => Number(localStorage.getItem("sr_low_stock_threshold")) || 15,
  );
  const [autoSyncLedger, setAutoSyncLedger] = useState(
    () => localStorage.getItem("sr_auto_sync") !== "false",
  );
  const [securityLevel, setSecurityLevel] = useState(
    () => localStorage.getItem("sr_security_level") || "high",
  );
  const [shiftMode, setShiftMode] = useState(
    () => localStorage.getItem("sr_shift_mode") || "automatic",
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const triggerAlert = (title: string, message: string) => {
    setAlertModal({ title, message });
  };

  // Translation router utility matching our data dictionaries keys
  const t = (key: string): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS["zh"][key] || key;
  };

  return (
    <div
      id="smart-retail-app-frame"
      className="bg-[#020617] text-slate-100 min-h-screen font-sans flex text-sm relative"
    >
      {/* Left Sidebar Layout */}
      <Sidebar
        currentView={currentView}
        setView={setView}
        lang={lang}
        t={t}
        onPopupAlert={triggerAlert}
        onOpenSettings={() => setIsSettingsOpen(true)}
        storeName={storeName}
      />

      {/* Main Container Layer */}
      <div className="flex-1 ml-[260px] min-h-screen flex flex-col pt-16 relative z-10">
        {/* Top Header Controls bar */}
        <Header
          currentView={currentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          lang={lang}
          setLang={setLang}
          t={t}
          onPopupAlert={triggerAlert}
          dbMode={dbMode}
        />

        {/* Dashboard Canvas & Main Content viewport */}
        <main className="p-8 flex-1">
          {currentView === "dashboard" ? (
            <DashboardView lang={lang} t={t} searchQuery={searchQuery} />
          ) : (
            <SalesEntryView lang={lang} t={t} searchQuery={searchQuery} />
          )}
        </main>

        {/* System Ledger Brand Footer */}
        <footer className="py-8 text-center opacity-40 select-none border-t border-white/5 mx-8 font-mono text-[10px] tracking-widest uppercase">
          {t("footer")}
        </footer>
      </div>

      {/* Futuristic Web3 Content Backdrop ambient background bubbles lights */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[140px] animate-pulse duration-[10000ms]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse duration-[12000ms]"></div>
      </div>

      {/* Global Custom Alert Dialog Modal overriding alerts */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-fadeIn font-sans">
          <div className="bg-[#0c1222] border border-white/20 w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative text-center">
            <h4 className="font-sans font-bold text-lg text-white mb-3">
              {alertModal.title}
            </h4>
            <p className="text-slate-300 text-xs mb-6 leading-relaxed font-sans">
              {alertModal.message}
            </p>
            <button
              onClick={() => setAlertModal(null)}
              className="bg-indigo-600 text-white hover:bg-indigo-500 px-6 py-2.5 rounded-full text-xs font-bold font-sans shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all w-full cursor-pointer leading-none"
            >
              {lang === "zh" ? "确定" : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {/* Store Manager & Owner Panel Config modal overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        t={t}
        storeName={storeName}
        setStoreName={setStoreName}
        monthlyTarget={monthlyTarget}
        setMonthlyTarget={setMonthlyTarget}
        lowStockThreshold={lowStockThreshold}
        setLowStockThreshold={setLowStockThreshold}
        autoSyncLedger={autoSyncLedger}
        setAutoSyncLedger={setAutoSyncLedger}
        securityLevel={securityLevel}
        setSecurityLevel={setSecurityLevel}
        shiftMode={shiftMode}
        setShiftMode={setShiftMode}
      />
    </div>
  );
}
