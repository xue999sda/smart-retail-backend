import { useState } from "react";
import { Search, Bell, Wallet, Globe } from "lucide-react";
import { Language } from "../types";

interface HeaderProps {
  currentView: "dashboard" | "sales";
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  onPopupAlert: (title: string, message: string) => void;
  dbMode?: "supabase" | "sandbox" | "loading";
}

export default function Header({
  currentView,
  searchQuery,
  setSearchQuery,
  lang,
  setLang,
  t,
  onPopupAlert,
  dbMode,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  const notificationsCount = 2;

  const toggleLanguage = () => {
    const newLang: Language = lang === "zh" ? "en" : "zh";
    setLang(newLang);
    // Apply language tag to document
    document.documentElement.lang = newLang === "zh" ? "zh-Hans" : "en";
  };

  return (
    <header
      id="top-header"
      className="fixed top-0 right-0 left-[260px] z-40 h-16 bg-white/5 backdrop-blur-2xl border-b border-white/10 flex justify-between items-center px-8 transition-all duration-300"
    >
      {/* Left Search Bar */}
      <div className="flex items-center">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#c2c6d6] opacity-65 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            className="bg-white/5 border border-white/10 text-slate-100 text-xs rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 backdrop-blur-md transition-all w-64 h-9 font-sans"
            placeholder={
              currentView === "dashboard"
                ? t("search_placeholder_dashboard")
                : t("search_placeholder_sales")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-[#c2c6d6] hover:text-white text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-5 relative">
          {/* Notification Button */}
          <button
            id="notification-pill-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
          </button>

          {/* Wallet Balance Badge */}
          <button
            id="wallet-pill-btn"
            onClick={() => setShowWalletInfo(!showWalletInfo)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-slate-200 hover:border-indigo-500/30 transition-all h-8"
            title="On-Chain Gas Balance"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>0.84 ETH</span>
          </button>

          {/* dbMode Status Badge */}
          {dbMode && (
            <div
              className={`flex items-center gap-1.5 border px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider h-8 select-none shadow-lg transition-all ${
                dbMode === "supabase"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5 hover:border-emerald-500/50"
                  : dbMode === "sandbox"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/5 hover:border-blue-500/50"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/5 animate-pulse"
              }`}
              title={
                dbMode === "supabase"
                  ? "Cloud database engine actively synchronized via Supabase"
                  : "Local sandbox memory database module active"
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dbMode === "supabase"
                    ? "bg-emerald-400 animate-pulse"
                    : dbMode === "sandbox"
                      ? "bg-blue-400 animate-pulse"
                      : "bg-amber-400 animate-pulse"
                }`}
              />
              <span>
                {dbMode === "supabase"
                  ? "⚡ SUPABASE CONNECTED"
                  : dbMode === "sandbox"
                    ? "🔵 SANDBOX ACTIVE"
                    : "⏳ ENGINE SYNCING..."}
              </span>
            </div>
          )}

          {/* Bilingual Language Switcher */}
          <button
            id="language-toggle"
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1 rounded-full hover:bg-white/10 hover:border-indigo-500/20 active:scale-95 transition-all h-8 select-none"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold font-sans text-slate-200">
              {lang === "en" ? (
                <>
                  <span className="text-indigo-400">EN</span> / 中
                </>
              ) : (
                <>
                  EN / <span className="text-indigo-400">中</span>
                </>
              )}
            </span>
          </button>

          {/* Notification Dropdown Pane */}
          {showNotifications && (
            <div className="absolute right-24 top-10 w-80 bg-[#0e1526] border border-white/15 rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 text-xs text-slate-200">
              <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-2">
                <span className="font-bold text-indigo-400">
                  🔔 {lang === "zh" ? "通知消息" : "System Messages"}
                </span>
                <button
                  className="text-[10px] opacity-60 hover:opacity-100"
                  onClick={() => setShowNotifications(false)}
                >
                  × Close
                </button>
              </div>
              <ul className="space-y-3">
                <li className="pb-2 border-b border-white/10">
                  <span className="text-emerald-400 font-bold block">
                    ✓ {lang === "zh" ? "数额核验通过" : "Audit Validated"}
                  </span>
                  <p className="opacity-70 mt-0.5">
                    {lang === "zh"
                      ? "昨销售总额 $232,100 已广播至主网节点完成共识。"
                      : "Yesterday total of $232,100 secured with 6 consensus confirmations."}
                  </p>
                </li>
                <li>
                  <span className="text-indigo-400 font-bold block">
                    ℹ {lang === "zh" ? "系统维护就绪" : "Engine Maintained"}
                  </span>
                  <p className="opacity-70 mt-0.5">
                    {lang === "zh"
                      ? "Smart Retail 链上引擎已升级至 v2.4.1 版本。"
                      : "Smart Retail chain engine optimized onto version v2.4.1."}
                  </p>
                </li>
              </ul>
            </div>
          )}

          {/* Wallet Dropdown info */}
          {showWalletInfo && (
            <div className="absolute right-4 top-10 w-72 bg-[#0e1526] border border-white/15 rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 text-xs text-slate-200">
              <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-2">
                <span className="font-bold text-emerald-400">
                  💳 {lang === "zh" ? "链上账户余额" : "Active Wallet"}
                </span>
                <button
                  className="text-[10px] opacity-60 hover:opacity-100"
                  onClick={() => setShowWalletInfo(false)}
                >
                  ×
                </button>
              </div>
              <p className="font-mono text-[10px] break-all text-slate-400 select-all p-1.5 bg-black/40 rounded mb-2 border border-white/10">
                0x4f2d59acb88e1e89zpk2pevNm5vpAr3r...
              </p>
              <div className="space-y-1 bg-white/5 p-2 rounded text-[10px]">
                <div className="flex justify-between">
                  <span className="opacity-70">
                    {lang === "zh" ? "网络生态" : "Consensus Network"}:
                  </span>
                  <span className="font-mono text-emerald-300">
                    Smart Retail Chain
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">
                    {lang === "zh" ? "Gas费代付" : "Sponsor status"}:
                  </span>
                  <span className="text-indigo-300 font-bold">
                    {lang === "zh"
                      ? "企业专属免手续费"
                      : "Corporate Free/Sponsored"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Manager Profile */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full border border-blue-400/30 p-0.5 overflow-hidden ring-2 ring-blue-500/10 hover:border-blue-400/60 transition-colors cursor-pointer"
            onClick={() =>
              onPopupAlert(
                lang === "zh" ? "用户资料" : "User Profile",
                lang === "zh"
                  ? "用户：Kevin Xuan (超级管理员)"
                  : "User: Kevin Xuan (Super Admin)",
              )
            }
          >
            <img
              alt="Manager Avatar"
              className="w-full h-full object-cover rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFHmYeJadyMccFnVgz0kV86fKd2X44e9xyvadctEgImtjs_UKy2oF45_4Ckv8ZVWYkAw4Bv3qiT_1FQ7l3pyaCmD0MbFon6EHO7IneDaEi7wZBGsft15Ca6dL4VtYUG-BVXL-qn4ujvSm0HttF5ocegwMkq45LseHm3Mecw_qyLxIa3JDWNxLHzCYAqdAeTHu0xPDy5gt8J4o_gGn7QX6rbwUCj0EoHcamJOLBusWPrrjOQyQpGD_fqYKyWaNjXfIZraWhHN9e3fbO"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
