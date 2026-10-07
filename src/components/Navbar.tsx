import React from 'react';
import { TabType } from '../types/geometry';
import { Camera, Download } from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onExportPng: () => void;
  onDownloadSingleHtml: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onExportPng,
  onDownloadSingleHtml,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-emerald-950/80 bg-[#141d18] sticky top-0 z-50 shadow-md">
      {/* Zone 1: Brand title wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold font-caveat text-amber-300 tracking-wide select-none drop-shadow-sm flex items-center gap-2">
          <span>📐</span> Phòng Thí Nghiệm Hình Học
        </span>
        <span className="text-xs text-emerald-400/80 hidden sm:inline font-mono">
          · Toán Cấp 2 &amp; Cấp 3
        </span>
      </div>

      {/* Zone 2: Navigation segmented tabs */}
      <nav className="flex items-center gap-1.5 p-1 bg-[#1a261f] rounded-lg border border-emerald-900/60 shadow-inner">
        <button
          onClick={() => onSelectTab('2d')}
          className={`px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
            currentTab === '2d'
              ? 'bg-emerald-800/90 text-amber-300 shadow-sm border border-emerald-600/50'
              : 'text-slate-300 hover:text-white hover:bg-emerald-900/30'
          }`}
        >
          1. Hình Học Phẳng (2D)
        </button>
        <button
          onClick={() => onSelectTab('3d')}
          className={`px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
            currentTab === '3d'
              ? 'bg-emerald-800/90 text-sky-300 shadow-sm border border-emerald-600/50'
              : 'text-slate-300 hover:text-white hover:bg-emerald-900/30'
          }`}
        >
          2. Hình Học Không Gian (3D)
        </button>
        <button
          onClick={() => onSelectTab('freedraw')}
          className={`px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
            currentTab === 'freedraw'
              ? 'bg-emerald-800/90 text-rose-300 shadow-sm border border-emerald-600/50'
              : 'text-slate-300 hover:text-white hover:bg-emerald-900/30'
          }`}
        >
          3. Bảng Vẽ Tự Do (Dựng Hình)
        </button>
      </nav>

      {/* Zone 3: Primary action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExportPng}
          title="Xuất ảnh bảng vẽ hiện tại thành file PNG"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#1f2e24] border border-emerald-800/80 rounded-md hover:bg-emerald-900/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <Camera className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">Xuất ảnh PNG</span>
        </button>
        <button
          onClick={onDownloadSingleHtml}
          title="Tải toàn bộ ứng dụng dưới dạng 1 tệp HTML duy nhất để dùng ngoại tuyến"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-amber-400 rounded-md hover:bg-amber-300 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Tải file HTML đơn</span>
        </button>
      </div>
    </header>
  );
};
