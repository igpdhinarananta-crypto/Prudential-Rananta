import React from 'react';
import { CalendarClock, Coffee, Printer, Shield, Compass } from 'lucide-react';
import { PensiunState } from '../types';
import { excelFV, excelPV, excelPMT, formatIDR } from '../utils/tvm';
import { CurrencyInput } from './CurrencyInput';

interface TabPensiunProps {
  state: PensiunState;
  onChange: (updater: (prev: PensiunState) => PensiunState) => void;
  onPrint: () => void;
}

export const TabPensiun: React.FC<TabPensiunProps> = ({ state, onChange, onPrint }) => {
  const nperAkumulasi = Math.max(0, state.usiaPensiun - state.usiaSaat);
  const nperPensiun = Math.max(0, state.usiaAkhir - state.usiaPensiun);

  const inflasi = state.inflasi / 100;
  const roiPensiun = state.roiPensiun / 100;
  const roiAkumulasi = state.roiAkumulasi / 100;

  const estPensiunBulanIni = state.biayaBulan * (1 - state.penurunan / 100);
  const estPensiunTahunIni = estPensiunBulanIni * 12;

  const expAtPensiunTahun = excelFV(inflasi, nperAkumulasi, 0, -estPensiunTahunIni, 1);
  const netRoiPensiun = roiPensiun - inflasi;
  const totalDanaPensiun = excelPV(netRoiPensiun, nperPensiun, -expAtPensiunTahun, 0, 1);

  const pmtBulan = excelPMT(roiAkumulasi / 12, nperAkumulasi * 12, 0, -totalDanaPensiun, 1);
  const pmtTahun = excelPMT(roiAkumulasi, nperAkumulasi, 0, -totalDanaPensiun, 1);

  return (
    <section id="content-pensiun" className="animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Dana Pensiun & Kebebasan Finansial
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Persiapan kebebasan finansial di masa tua agar gaya hidup tetap sejahtera tanpa membebani anak (memutus rantai sandwich generation).
          </p>
        </div>
        <button
          id="print-pensiun-btn"
          type="button"
          onClick={onPrint}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Presentable Results Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Total Kebutuhan Dana Pensiun */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl text-white bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-300" />
            <span>Total Kebutuhan Dana Pensiun (PV Saat Masuk Usia {state.usiaPensiun})</span>
          </div>
          <div
            id="res_pen_total_dana"
            className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md my-2"
          >
            {formatIDR(totalDanaPensiun)}
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="opacity-90">Proyeksi pengeluaran tahun ke-1 masa pensiun:</span>
            <span
              id="res_pen_exp_55"
              className="font-extrabold text-blue-900 bg-white/95 px-2.5 py-0.5 rounded-md text-xs shadow-sm"
            >
              {formatIDR(expAtPensiunTahun)} / tahun
            </span>
          </div>
        </div>

        {/* Solusi Menyisihkan */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl text-white bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>Rekomendasi Investasi Rutin di Masa Produktif</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="text-xs opacity-80 mb-1 font-medium">Investasi / Bulan</div>
              <div
                id="res_pen_pmt_bulan"
                className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md"
              >
                {formatIDR(pmtBulan)}
              </div>
            </div>
            <div className="border-l border-white/20 pl-4">
              <div className="text-xs opacity-80 mb-1 font-medium">Investasi / Tahun</div>
              <div
                id="res_pen_pmt_tahun"
                className="text-xl sm:text-2xl font-bold tracking-tight text-white/95"
              >
                {formatIDR(pmtTahun)}
              </div>
            </div>
          </div>
          <p className="text-xs opacity-80 mt-4 leading-relaxed">
            Menabung rutin selama <strong>{nperAkumulasi} tahun</strong> ke instrumen investasi dengan potensi return <strong>{state.roiAkumulasi}%/tahun</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline & Return Parameters */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-7">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <CalendarClock className="w-5 h-5 text-blue-500" />
            <span>Timeline Usia & Asumsi Return</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Usia Saat Ini
              </label>
              <div className="relative">
                <input
                  id="pen_usia_saat"
                  type="number"
                  min={18}
                  max={state.usiaPensiun - 1}
                  value={state.usiaSaat}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, usiaSaat: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  Thn
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Target Usia Pensiun
              </label>
              <div className="relative">
                <input
                  id="pen_usia_pensiun"
                  type="number"
                  min={state.usiaSaat + 1}
                  value={state.usiaPensiun}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      usiaPensiun: parseFloat(e.target.value) || 55,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  Thn
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Harapan Hidup
              </label>
              <div className="relative">
                <input
                  id="pen_usia_akhir"
                  type="number"
                  min={state.usiaPensiun + 1}
                  value={state.usiaAkhir}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      usiaAkhir: parseFloat(e.target.value) || 80,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  Thn
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Inflasi Tahunan (%)
              </label>
              <div className="relative">
                <input
                  id="pen_inflasi"
                  type="number"
                  step="0.1"
                  value={state.inflasi}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, inflasi: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-orange-600 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                ROI (Masa Pensiun) (%)
              </label>
              <div className="relative">
                <input
                  id="pen_roi_pensiun"
                  type="number"
                  step="0.1"
                  value={state.roiPensiun}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, roiPensiun: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  %
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Aset konservatif/deposito</span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">
                ROI Masa Produktif (%)
              </label>
              <div className="relative">
                <input
                  id="pen_roi_akumulasi"
                  type="number"
                  step="0.1"
                  value={state.roiAkumulasi}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      roiAkumulasi: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-emerald-700 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute right-3.5 top-2 text-xs text-emerald-600 font-semibold">
                  %
                </span>
              </div>
              <span className="text-[10px] text-emerald-800 mt-1 block">Reksadana/Saham/Obligasi</span>
            </div>
          </div>
        </div>

        {/* Lifestyle & Spending in Retirement */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Coffee className="w-5 h-5 text-amber-600" />
              <span>Gaya Hidup & Pengeluaran</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Pengeluaran Rutin Saat Ini (Rp/Bulan)
                </label>
                <CurrencyInput
                  id="pen_biaya_bulan"
                  value={state.biayaBulan}
                  onChange={(val) => onChange((prev) => ({ ...prev, biayaBulan: val }))}
                  className="text-lg font-bold text-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide flex justify-between">
                  <span>Penurunan Biaya di Masa Pensiun</span>
                  <span className="text-slate-400 font-normal">Umumnya 20% - 30%</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="pen_penurunan"
                    type="number"
                    min={0}
                    max={80}
                    value={state.penurunan}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, penurunan: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-24 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center"
                  />
                  <span className="text-base font-bold text-slate-400">%</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={state.penurunan}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, penurunan: parseFloat(e.target.value) || 0 }))
                    }
                    className="flex-1 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Estimasi biaya bulanan di masa pensiun (nilai riil saat ini):</span>
              <strong className="text-slate-800">{formatIDR(estPensiunBulanIni)}/bln</strong>
            </div>
            <div className="flex justify-between">
              <span>Masa menikmati pensiun:</span>
              <strong className="text-slate-800">{nperPensiun} Tahun</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
