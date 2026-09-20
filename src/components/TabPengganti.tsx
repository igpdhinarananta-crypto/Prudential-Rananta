import React from 'react';
import { Baby, Heart, Wallet, Settings2, Printer, AlertCircle } from 'lucide-react';
import { UpState } from '../types';
import { excelPV, formatIDR } from '../utils/tvm';
import { CurrencyInput } from './CurrencyInput';

interface TabPenggantiProps {
  state: UpState;
  onChange: (updater: (prev: UpState) => UpState) => void;
  onPrint: () => void;
}

export const TabPengganti: React.FC<TabPenggantiProps> = ({ state, onChange, onPrint }) => {
  const biayaTahun = state.biayaBulan * 12;
  const totalLiabilitas = state.hutang + state.kewajiban + state.lainnya;

  // Approach 1: Usia Anak
  const anakNper = Math.max(0, state.anakTargetMapan - state.anakUsia);
  const anakNetRate = (state.anakRoi - state.anakInflasi) / 100;
  const anakSubtotal = excelPV(anakNetRate, anakNper, biayaTahun, 0, 1) * -1;
  const anakTotal = anakSubtotal + totalLiabilitas;

  // Approach 2: Usia Pasangan
  const pasNper = Math.max(0, state.pasanganTargetHidup - state.pasanganUsia);
  const pasNetRate = (state.pasanganRoi - state.pasanganInflasi) / 100;
  const pasSubtotal = excelPV(pasNetRate, pasNper, biayaTahun, 0, 1) * -1;
  const pasTotal = pasSubtotal + totalLiabilitas;

  return (
    <section id="content-pengganti" className="animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Proteksi Penghasilan (Uang Pertanggungan)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hitung ideal Uang Pertanggungan (UP) Asuransi Jiwa agar keluarga tetap sejahtera jika pencari nafkah tutup usia.
          </p>
        </div>
        <button
          id="print-pengganti-btn"
          type="button"
          onClick={onPrint}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Presentable Results Row (Hero Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Rekomendasi UP Anak */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl text-white bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          <div className="flex items-center gap-2 mb-2 opacity-85">
            <Baby className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Rekomendasi UP (Berdasar Usia Anak)
            </span>
          </div>
          <div
            id="res_up_anak_total"
            className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md mb-2"
          >
            {formatIDR(anakTotal)}
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            Menjamin nafkah keluarga hingga anak termuda mandiri / lulus kuliah.
          </p>
          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="opacity-90">Masa Proteksi:</span>
              <span
                id="res_up_anak_nper"
                className="font-extrabold text-blue-800 bg-white/95 px-2.5 py-0.5 rounded-md text-xs shadow-sm"
              >
                {anakNper} Tahun
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-90">Net Rate (ROI - Inflasi):</span>
              <span
                id="res_up_anak_net"
                className="font-extrabold text-blue-800 bg-white/95 px-2.5 py-0.5 rounded-md text-xs shadow-sm"
              >
                {(anakNetRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Rekomendasi UP Pasangan */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl text-white bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900">
          <div className="flex items-center gap-2 mb-2 opacity-85">
            <Heart className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Rekomendasi UP (Berdasar Pasangan)
            </span>
          </div>
          <div
            id="res_up_pasangan_total"
            className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md mb-2"
          >
            {formatIDR(pasTotal)}
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            Menjamin kelangsungan hidup pasangan seumur hidup (hingga usia harapan hidup).
          </p>
          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="opacity-90">Masa Proteksi:</span>
              <span
                id="res_up_pasangan_nper"
                className="font-extrabold text-emerald-800 bg-white/95 px-2.5 py-0.5 rounded-md text-xs shadow-sm"
              >
                {pasNper} Tahun
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-90">Net Rate (ROI - Inflasi):</span>
              <span
                id="res_up_pasangan_net"
                className="font-extrabold text-emerald-800 bg-white/95 px-2.5 py-0.5 rounded-md text-xs shadow-sm"
              >
                {(pasNetRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profil Keuangan Saat Ini */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span>Profil Keuangan & Pengeluaran Saat Ini</span>
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            Kebutuhan Pengeluaran Tahunan:{' '}
            <strong className="text-slate-700">{formatIDR(biayaTahun)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Biaya Hidup Bulanan
            </label>
            <CurrencyInput
              id="up_biaya_bulan"
              value={state.biayaBulan}
              onChange={(val) => onChange((prev) => ({ ...prev, biayaBulan: val }))}
              className="text-blue-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Sisa Hutang (KPR, dll)
            </label>
            <CurrencyInput
              id="up_hutang"
              value={state.hutang}
              onChange={(val) => onChange((prev) => ({ ...prev, hutang: val }))}
              className="text-rose-600 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Kewajiban Lainnya
            </label>
            <CurrencyInput
              id="up_kewajiban"
              value={state.kewajiban}
              onChange={(val) => onChange((prev) => ({ ...prev, kewajiban: val }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Biaya Final / Waris Lainnya
            </label>
            <CurrencyInput
              id="up_lainnya"
              value={state.lainnya}
              onChange={(val) => onChange((prev) => ({ ...prev, lainnya: val }))}
            />
          </div>
        </div>

        {totalLiabilitas > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Total hutang dan kewajiban sebesar <strong>{formatIDR(totalLiabilitas)}</strong> otomatis ditambahkan ke kebutuhan UP agar ahli waris terbebas dari beban utang.
            </span>
          </div>
        )}
      </div>

      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendekatan Usia Anak */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Settings2 className="w-5 h-5 text-blue-500" />
            <span>Parameter Pendekatan Usia Anak</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Usia Anak Termuda
              </label>
              <div className="relative">
                <input
                  id="up_anak_usia"
                  type="number"
                  min={0}
                  max={24}
                  value={state.anakUsia}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, anakUsia: parseFloat(e.target.value) || 0 }))
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
                Target Mandiri (Usia)
              </label>
              <div className="relative">
                <input
                  id="up_anak_target"
                  type="number"
                  value={state.anakTargetMapan}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      anakTargetMapan: parseFloat(e.target.value) || 25,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
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
                Asumsi Inflasi (%)
              </label>
              <div className="relative">
                <input
                  id="up_anak_inflasi"
                  type="number"
                  step="0.1"
                  value={state.anakInflasi}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      anakInflasi: parseFloat(e.target.value) || 0,
                    }))
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
                ROI Ahli Waris (%)
              </label>
              <div className="relative">
                <input
                  id="up_anak_roi"
                  type="number"
                  step="0.1"
                  value={state.anakRoi}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      anakRoi: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-emerald-600 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pendekatan Pasangan */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Settings2 className="w-5 h-5 text-emerald-500" />
            <span>Parameter Pendekatan Pasangan</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Usia Pasangan Saat Ini
              </label>
              <div className="relative">
                <input
                  id="up_pasangan_usia"
                  type="number"
                  min={18}
                  max={74}
                  value={state.pasanganUsia}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      pasanganUsia: parseFloat(e.target.value) || 0,
                    }))
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
                Harapan Hidup (Usia)
              </label>
              <div className="relative">
                <input
                  id="up_pasangan_target"
                  type="number"
                  value={state.pasanganTargetHidup}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      pasanganTargetHidup: parseFloat(e.target.value) || 75,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
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
                Asumsi Inflasi (%)
              </label>
              <div className="relative">
                <input
                  id="up_pasangan_inflasi"
                  type="number"
                  step="0.1"
                  value={state.pasanganInflasi}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      pasanganInflasi: parseFloat(e.target.value) || 0,
                    }))
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
                ROI Ahli Waris (%)
              </label>
              <div className="relative">
                <input
                  id="up_pasangan_roi"
                  type="number"
                  step="0.1"
                  value={state.pasanganRoi}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      pasanganRoi: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-emerald-600 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
