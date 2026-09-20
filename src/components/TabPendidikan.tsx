import React from 'react';
import { Hourglass, Receipt, PiggyBank, Printer, TrendingUp, AlertOctagon } from 'lucide-react';
import { EduState } from '../types';
import { excelFV, excelPMT, formatIDR } from '../utils/tvm';
import { CurrencyInput } from './CurrencyInput';

interface TabPendidikanProps {
  state: EduState;
  onChange: (updater: (prev: EduState) => EduState) => void;
  onPrint: () => void;
}

export const TabPendidikan: React.FC<TabPendidikanProps> = ({ state, onChange, onPrint }) => {
  const nper = Math.max(0, state.usiaTarget - state.usiaSaat);

  const infPend = state.infPend / 100;
  const infHidup = state.infHidup / 100;

  const fvKuliah = excelFV(infPend, nper, 0, -state.biayaKuliah, 1);
  const fvHidup = excelFV(infHidup, nper, 0, -state.biayaHidup, 1);
  const totalBiayaFV = fvKuliah + fvHidup;

  const tetapFV = excelFV(state.tetapRoi / 100, nper, 0, -state.tetapVal, 1);
  const berjangkaFV = excelFV((state.berjangkaRoi / 100) / 12, nper * 12, -state.berjangkaVal, 0, 1);

  const totalAsetEksisting = tetapFV + berjangkaFV;
  const kekurangan = Math.max(0, totalBiayaFV - totalAsetEksisting);

  const targetRoi = state.targetRoi / 100;
  const pmtBulan = excelPMT(targetRoi / 12, nper * 12, 0, -kekurangan, 1);
  const pmtTahun = excelPMT(targetRoi, nper, 0, -kekurangan, 1);

  return (
    <section id="content-pendidikan" className="animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Dana Pendidikan Anak
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Simulasi persiapan biaya jenjang Perguruan Tinggi dengan Time Value of Money & inflasi pendidikan.
          </p>
        </div>
        <button
          id="print-pendidikan-btn"
          type="button"
          onClick={onPrint}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Presentable Results Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Kekurangan Dana (Shortfall) */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl text-white bg-gradient-to-br from-rose-500 via-red-600 to-rose-900 lg:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" />
            <span>Kekurangan Dana (Shortfall)</span>
          </div>
          <div
            id="res_edu_kekurangan"
            className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md my-2"
          >
            {formatIDR(kekurangan)}
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 text-xs opacity-90 leading-tight">
            <span>Total Biaya Kuliah Masa Depan:</span>
            <span id="res_edu_total_biaya" className="block text-base font-extrabold mt-0.5">
              {formatIDR(totalBiayaFV)}
            </span>
          </div>
        </div>

        {/* Solusi Menabung */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl text-white bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 lg:col-span-2 flex flex-col justify-center">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>Rekomendasi Investasi Baru untuk Menutup Kekurangan</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs opacity-80 mb-1.5 font-medium">Investasi Rutin / Bulan</div>
              <div
                id="res_edu_pmt_bulan"
                className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 bg-white/95 px-3.5 py-2 rounded-xl shadow-sm inline-block"
              >
                {formatIDR(pmtBulan)}
              </div>
            </div>
            <div className="sm:border-l sm:border-white/20 sm:pl-4">
              <div className="text-xs opacity-80 mb-1.5 font-medium">Atau Investasi Rutin / Tahun</div>
              <div
                id="res_edu_pmt_tahun"
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 bg-white/95 px-3.5 py-1.5 rounded-xl shadow-sm inline-block"
              >
                {formatIDR(pmtTahun)}
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs opacity-80">
            Dihitung dengan target hasil investasi <strong>{state.targetRoi}%/tahun</strong> selama <strong>{nper} tahun</strong> mendatang.
          </div>
        </div>
      </div>

      {/* Inputs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline & Asumsi Makro */}
        <div className="space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Hourglass className="w-5 h-5 text-blue-500" />
              <span>Timeline & Asumsi Inflasi</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Usia Anak Saat Ini
                </label>
                <div className="relative">
                  <input
                    id="edu_usia_saat"
                    type="number"
                    min={0}
                    max={20}
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
                  Target Usia Masuk Kuliah
                </label>
                <div className="relative">
                  <input
                    id="edu_usia_target"
                    type="number"
                    min={state.usiaSaat + 1}
                    value={state.usiaTarget}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, usiaTarget: parseFloat(e.target.value) || 18 }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                    Thn
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Inflasi Biaya Kuliah (%)
                </label>
                <div className="relative">
                  <input
                    id="edu_inf_pend"
                    type="number"
                    step="0.1"
                    value={state.infPend}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, infPend: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-rose-600 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Inflasi Biaya Hidup (%)
                </label>
                <div className="relative">
                  <input
                    id="edu_inf_hidup"
                    type="number"
                    step="0.1"
                    value={state.infHidup}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, infHidup: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-orange-500 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800">
              Waktu persiapan menabung:{' '}
              <strong className="text-blue-900">{nper} Tahun ({nper * 12} Bulan)</strong>. Semakin dini memulai, nilai tabungan per bulan akan jauh lebih ringan karena bunga berbunga (compounding).
            </div>
          </div>
        </div>

        {/* Biaya & Dana Eksisting */}
        <div className="space-y-5">
          {/* Estimasi Biaya Saat Ini */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Receipt className="w-5 h-5 text-indigo-500" />
              <span>Estimasi Biaya Jenjang Kuliah (Nilai Saat Ini)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Total Biaya Kuliah Sekarang (Rp)
                </label>
                <CurrencyInput
                  id="edu_biaya_kuliah"
                  value={state.biayaKuliah}
                  onChange={(val) => onChange((prev) => ({ ...prev, biayaKuliah: val }))}
                  className="text-blue-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Uang Saku / Biaya Hidup (Rp)
                </label>
                <CurrencyInput
                  id="edu_biaya_hidup"
                  value={state.biayaHidup}
                  onChange={(val) => onChange((prev) => ({ ...prev, biayaHidup: val }))}
                />
              </div>
            </div>
          </div>

          {/* Dana yang Sudah Tersedia (Eksisting) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <PiggyBank className="w-5 h-5 text-emerald-500" />
              <span>Dana & Tabungan yang Sudah Tersedia</span>
            </h3>

            {/* Lump sum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Aset Lump Sum Tersedia (Rp)
                </label>
                <CurrencyInput
                  id="edu_tetap_val"
                  value={state.tetapVal}
                  onChange={(val) => onChange((prev) => ({ ...prev, tetapVal: val }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  ROI Lump Sum (%)
                </label>
                <input
                  id="edu_tetap_roi"
                  type="number"
                  step="0.1"
                  value={state.tetapRoi}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, tetapRoi: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Rutin existing + Target ROI Baru */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Nabung Berjalan (Rp/bln)
                </label>
                <CurrencyInput
                  id="edu_berjangka_val"
                  value={state.berjangkaVal}
                  onChange={(val) => onChange((prev) => ({ ...prev, berjangkaVal: val }))}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  ROI Tabungan Berjalan (%)
                </label>
                <input
                  id="edu_berjangka_roi"
                  type="number"
                  step="0.1"
                  value={state.berjangkaRoi}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      berjangkaRoi: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="sm:col-span-1 bg-blue-50 p-3 rounded-xl border border-blue-200">
                <label className="block text-xs font-bold text-blue-900 mb-1.5 uppercase tracking-wide">
                  Target ROI Baru (%)
                </label>
                <input
                  id="edu_target_roi"
                  type="number"
                  step="0.1"
                  value={state.targetRoi}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, targetRoi: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-sm font-bold text-blue-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
