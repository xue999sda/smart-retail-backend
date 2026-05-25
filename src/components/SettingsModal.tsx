import React from 'react';
import { X, Store, Target, BellRing, Link, ShieldAlert, Check } from 'lucide-react';
import { Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  t: (key: string) => string;
  storeName: string;
  setStoreName: (name: string) => void;
  monthlyTarget: number;
  setMonthlyTarget: (target: number) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
  autoSyncLedger: boolean;
  setAutoSyncLedger: (sync: boolean) => void;
  securityLevel: string;
  setSecurityLevel: (level: string) => void;
  shiftMode: string;
  setShiftMode: (mode: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  lang,
  t,
  storeName,
  setStoreName,
  monthlyTarget,
  setMonthlyTarget,
  lowStockThreshold,
  setLowStockThreshold,
  autoSyncLedger,
  setAutoSyncLedger,
  securityLevel,
  setSecurityLevel,
  shiftMode,
  setShiftMode
}: SettingsModalProps) {
  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to local storage for persistence
    localStorage.setItem('sr_store_name', storeName);
    localStorage.setItem('sr_monthly_target', monthlyTarget.toString());
    localStorage.setItem('sr_low_stock_threshold', lowStockThreshold.toString());
    localStorage.setItem('sr_auto_sync', autoSyncLedger.toString());
    localStorage.setItem('sr_security_level', securityLevel);
    localStorage.setItem('sr_shift_mode', shiftMode);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-fadeIn font-sans">
      <div className="bg-[#0b1222] border border-white/20 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header styling */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0e1628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-white">
                {lang === 'zh' ? '智慧门店管理配置' : 'Smart Store Control Panel'}
              </h3>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-sans">
                {lang === 'zh' ? '主店长与业主特权面板' : 'Owner & Store Manager Console'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Panel Scrollable */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Section 1: Brand & Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>{lang === 'zh' ? '门店与品牌身份' : 'Store & Brand Identity'}</span>
            </h4>
            <div className="grid grid-cols-1 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  {lang === 'zh' ? '定制门店品牌名称' : 'Custom Store Brand Name'}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Smart Retail HQ"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg text-xs font-semibold py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  {lang === 'zh' ? '* 此品牌名称将实时同步至左侧导航栏和数据报表的展示标题中。' : '* This brand name dynamically overrides the core title tags in the sidebar and dashboard.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Operational Targets & Kpi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{lang === 'zh' ? '运营目标与阈值设置' : 'Operational KPIs & Warnings'}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  {lang === 'zh' ? '月度销售挑战目标 ($)' : 'Monthly Sales Target ($)'}
                </label>
                <input 
                  type="number" 
                  required
                  min="1000"
                  step="5000"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg text-xs font-semibold py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-400"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value) || 0)}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {lang === 'zh' ? '用作进度仪表盘的对比参考值' : 'Sets the baseline for progress comparison'}
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  {lang === 'zh' ? '低库存警报限额 (件)' : 'Low Stock Alert Limit (PCS)'}
                </label>
                <input 
                  type="number" 
                  required
                  min="5"
                  step="1"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg text-xs font-semibold py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-400"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value) || 0)}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {lang === 'zh' ? '在产品数量低于此值时发出预警' : 'Triggers visual warnings when quantity drops'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Web3 Blockchain Node Configurations */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Link className="w-4 h-4" />
              <span>{lang === 'zh' ? 'Web3 与区块链防篡改对账设置' : 'On-chain Protocol Ledger'}</span>
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs text-slate-200 font-bold">
                    {lang === 'zh' ? '向区块链自动广播备份销售数据' : 'Auto-broadcast Ledger Logs'}
                  </span>
                  <span className="block text-[10px] text-slate-400 max-w-md mt-0.5">
                    {lang === 'zh' ? '当每次录入时，无需二次点击即可自动同步向区块链公有节点广播备份数据' : 'Fully automates Web3 transaction consensus on each verified sales update.'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoSyncLedger}
                    onChange={(e) => setAutoSyncLedger(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="pt-2 border-t border-white/5">
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  {lang === 'zh' ? '班次对账盘点模式' : 'Shift Settlement & Reconciliation'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShiftMode('automatic')}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${shiftMode === 'automatic' ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-white/10 bg-transparent text-slate-400 hover:bg-white/5'}`}
                  >
                    {lang === 'zh' ? '每日零点自动结账' : 'Auto settlement (0:00)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShiftMode('manual')}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${shiftMode === 'manual' ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-white/10 bg-transparent text-slate-400 hover:bg-white/5'}`}
                  >
                    {lang === 'zh' ? '手动班次审核结转' : 'Manual End-of-Shift'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Owner Security Approval Level */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{lang === 'zh' ? '操作安全级别与财务鉴权' : 'Manager Access Control'}</span>
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-2">
                  {lang === 'zh' ? '高价值变动财务审批制' : 'Financial Approval Protocol Level'}
                </label>
                <div className="space-y-2.5">
                  {[
                    { key: 'high', titleZh: '强业主确认屏障 (高灵敏)', titleEn: 'High - Store Owner Authentication Required', descZh: '对任何家电的大分类改动和删除需要提供店长PIN或哈希签字', descEn: 'Any entry removal or custom updates require explicit manager PIN signature verification.' },
                    { key: 'medium', titleZh: '中度双人校对 (中灵敏)', titleEn: 'Medium - Two-factor Clerical Verification', descZh: '新增低灵敏品类时直接提交，仅超高额度交易抛出校验拦截', descEn: 'Direct additions allowed, high valuation actions trigger on-screen alerts.' },
                    { key: 'low', titleZh: '免密直连 (便利店快捷模式)', titleEn: 'Low - Direct Ledger Sync (Fast Lane)', descZh: '任何店员录入数据不作审批即刻写入本地并向主面板汇总', descEn: 'Zero authorization constraints. Instantly sync all submissions.' }
                  ].map(lvl => (
                    <div 
                      key={lvl.key}
                      onClick={() => setSecurityLevel(lvl.key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${securityLevel === lvl.key ? 'border-emerald-500 bg-emerald-500/5 text-emerald-100' : 'border-white/5 bg-transparent hover:bg-white/5 text-slate-400'}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${securityLevel === lvl.key ? 'border-emerald-500' : 'border-white/20'}`}>
                        {securityLevel === lvl.key && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <span className={`block text-xs font-bold ${securityLevel === lvl.key ? 'text-emerald-300' : 'text-slate-200'}`}>
                          {lang === 'zh' ? lvl.titleZh : lvl.titleEn}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">
                          {lang === 'zh' ? lvl.descZh : lvl.descEn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dialog Action control buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'zh' ? '应用并保存配置' : 'Apply Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
