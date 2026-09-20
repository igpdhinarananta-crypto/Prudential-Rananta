import React, { useState } from 'react';
import {
  BarChart3,
  UserCircle,
  ShieldCheck,
  GraduationCap,
  Palmtree,
  Plane,
  FileDown,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { TabType, UpState, EduState, PensiunState, GoalItem } from '../types';
import { exportToPDF } from '../utils/pdfExport';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  clientName: string;
  setClientName: (name: string) => void;
  upState: UpState;
  eduState: EduState;
  pensiunState: PensiunState;
  goalsData: GoalItem[];
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  clientName,
  setClientName,
  upState,
  eduState,
  pensiunState,
  goalsData,
  onResetData,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = (tabName: 'Pengganti Penghasilan' | 'Dana Pendidikan' | 'Dana Pensiun' | 'Liburan dan Haji' | 'Laporan Lengkap') => {
    try {
      exportToPDF({
        tabName,
        clientName,
        upState,
        eduState,
        pensiunState,
        goalsData,
      });
      setExportSuccess(`PDF ${tabName} berhasil diunduh!`);
      setShowExportMenu(false);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal membuat file PDF. Silakan coba lagi.');
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'pengganti':
        return 'Pengganti Penghasilan';
      case 'pendidikan':
        return 'Dana Pendidikan';
      case 'pensiun':
        return 'Dana Pensiun';
      case 'liburan':
        return 'Liburan dan Haji';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl tracking-tight text-slate-800">
                  Financial<span className="text-blue-600">Planner</span>
                </h1>
                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                  TVM Engine
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Kalkulator Keuangan Keluarga Mapan
              </p>
            </div>
          </div>

          {/* Client Info & Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-64 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
              <UserCircle className="w-5 h-5 text-blue-500 mr-2 shrink-0" />
              <input
                id="client-name-input"
                type="text"
                placeholder="Nama Klien / Nasabah"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-transparent text-sm font-semibold w-full outline-none text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Quick Reset */}
            <button
              id="btn-reset-data"
              type="button"
              onClick={onResetData}
              title="Reset ke nilai default simulasi"
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Export PDF dropdown */}
            <div className="relative">
              <button
                id="btn-export-pdf"
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>Cetak PDF</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Pilih Format Cetak
                  </div>
                  <button
                    id="export-active-tab-btn"
                    onClick={() => handleExport(getTabLabel(activeTab))}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                  >
                    <span>Tab Ini ({getTabLabel(activeTab)})</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">1 Hal</span>
                  </button>
                  <button
                    id="export-full-report-btn"
                    onClick={() => handleExport('Laporan Lengkap')}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 flex items-center justify-between"
                  >
                    <span>Laporan Lengkap (Semua Tab)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Ringkas</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success toast if PDF generated */}
        {exportSuccess && (
          <div className="mt-3 py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* Tab Navigation Menu (Pill Style) */}
        <div className="flex overflow-x-auto space-x-2.5 mt-5 pb-1 no-scrollbar">
          <button
            id="tab-btn-pengganti"
            onClick={() => setActiveTab('pengganti')}
            className={`px-4 sm:px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'pengganti'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border-blue-500'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Uang Pertanggungan</span>
          </button>

          <button
            id="tab-btn-pendidikan"
            onClick={() => setActiveTab('pendidikan')}
            className={`px-4 sm:px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'pendidikan'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border-blue-500'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Dana Pendidikan</span>
          </button>

          <button
            id="tab-btn-pensiun"
            onClick={() => setActiveTab('pensiun')}
            className={`px-4 sm:px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'pensiun'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border-blue-500'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border-slate-200'
            }`}
          >
            <Palmtree className="w-4 h-4" />
            <span>Dana Pensiun</span>
          </button>

          <button
            id="tab-btn-liburan"
            onClick={() => setActiveTab('liburan')}
            className={`px-4 sm:px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'liburan'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border-blue-500'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border-slate-200'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Liburan & Haji</span>
          </button>
        </div>
      </div>
    </header>
  );
};
