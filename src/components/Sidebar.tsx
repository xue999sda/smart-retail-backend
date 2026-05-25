import { LayoutDashboard, Receipt, Settings, HelpCircle, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'sales';
  setView: (view: 'dashboard' | 'sales') => void;
  lang: Language;
  t: (key: string) => string;
  onPopupAlert: (title: string, message: string) => void;
  onOpenSettings: () => void;
  storeName: string;
}

export default function Sidebar({ currentView, setView, lang, t, onPopupAlert, onOpenSettings, storeName }: SidebarProps) {
  return (
    <aside 
      id="main-sidebar"
      className="fixed left-0 top-0 h-full w-[260px] bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col py-8 px-5 z-50 transition-all duration-300"
    >
      <div className="mb-10 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center border border-white/15">
            <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl tracking-tight text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text overflow-hidden text-ellipsis max-w-[150px] whitespace-nowrap">
              {storeName || t('systemTitle')}
            </h1>
          </div>
        </div>
        <p className="font-sans text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-2 pl-1 opacity-80">
          {t('systemSubtitle')}
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          id="nav-to-dashboard"
          onClick={() => setView('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
            currentView === 'dashboard'
              ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-indigo-500/5'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 transition-transform ${currentView === 'dashboard' ? 'scale-110 text-indigo-400' : 'opacity-80'}`} />
          <span className="text-sm font-sans tracking-wide">{t('nav_dashboard')}</span>
        </button>

        <button
          id="nav-to-sales"
          onClick={() => setView('sales')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
            currentView === 'sales'
              ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Receipt className={`w-5 h-5 transition-transform ${currentView === 'sales' ? 'scale-110 text-emerald-400' : 'opacity-80'}`} />
          <span className="text-sm font-sans tracking-wide">{t('nav_sales')}</span>
        </button>
      </nav>

      <div className="mt-auto space-y-1 border-t border-white/10 pt-6">
        <button
          id="nav-btn-settings"
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4 opacity-80 text-slate-400" />
          <span className="font-sans font-semibold">{t('nav_settings')}</span>
        </button>
        <button
          id="nav-btn-support"
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/5 transition-all duration-200"
          onClick={() => onPopupAlert(t('nav_support'), lang === 'zh' ? '如需帮助与区块链协议支持，请发送邮件至 Smart Retail。' : 'For operational/blockchain support, email Smart Retail.')}
        >
          <HelpCircle className="w-4 h-4 opacity-80 text-slate-400" />
          <span className="font-sans font-semibold">{t('nav_support')}</span>
        </button>
      </div>
    </aside>
  );
}
