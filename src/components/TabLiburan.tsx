import React from 'react';
import { PlusCircle, Printer, Trash2, Info, Sparkles, Target, Landmark } from 'lucide-react';
import { GoalItem } from '../types';
import { excelFV, excelPMT, formatIDR, formatThousands, parseRawNumber } from '../utils/tvm';

interface TabLiburanProps {
  goals: GoalItem[];
  onChange: (goals: GoalItem[]) => void;
  onPrint: () => void;
}

export const TabLiburan: React.FC<TabLiburanProps> = ({ goals, onChange, onPrint }) => {
  const handleUpdate = (id: string, field: keyof GoalItem, value: any) => {
    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      return { ...g, [field]: value };
    });
    onChange(updated);
  };

  const handleAddGoal = () => {
    const newGoal: GoalItem = {
      id: Date.now().toString(),
      name: 'Tujuan Keuangan Baru',
      horizon: 5,
      cost: 50000000,
      inflasi: 5.0,
      roi: 7.0,
    };
    onChange([...goals, newGoal]);
  };

  const handleRemoveGoal = (id: string) => {
    if (goals.length <= 1) {
      alert('Minimal harus ada 1 tujuan dalam tabel.');
      return;
    }
    onChange(goals.filter((g) => g.id !== id));
  };

  // Calculations for total summary
  const totals = goals.reduce(
    (acc, g) => {
      const fvCost = excelFV((g.inflasi || 0) / 100, g.horizon || 0, 0, -(g.cost || 0), 1);
      const pmt = excelPMT(((g.roi || 0) / 100) / 12, (g.horizon || 0) * 12, 0, -fvCost, 1);
      return {
        totalCostNow: acc.totalCostNow + (g.cost || 0),
        totalFV: acc.totalFV + fvCost,
        totalPMT: acc.totalPMT + pmt,
      };
    },
    { totalCostNow: 0, totalFV: 0, totalPMT: 0 }
  );

  return (
    <section id="content-liburan" className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Dana Tujuan Khusus (Liburan, Haji, dll)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Simulasi perencanaan liburan keluarga, ibadah umroh/haji, dana renovasi, atau pembelian aset besar.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-tambah-tujuan"
            type="button"
            onClick={handleAddGoal}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Tujuan</span>
          </button>
          <button
            id="print-liburan-btn"
            type="button"
            onClick={onPrint}
            className="flex-1 sm:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Jumlah Tujuan Aktif</div>
            <div className="text-2xl font-black text-slate-800">{goals.length} Impian Keluarga</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Total Target FV Masa Depan</div>
            <div className="text-2xl font-black text-blue-700">{formatIDR(totals.totalFV)}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-white shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase">Total Alokasi Nabung Rutin</div>
            <div className="text-2xl font-black text-emerald-600">{formatIDR(totals.totalPMT)} / bln</div>
          </div>
        </div>
      </div>

      {/* Editable Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6 min-w-[200px]">Tujuan Keuangan</th>
                <th className="p-4 w-[120px] text-center">Tercapai (Thn)</th>
                <th className="p-4 min-w-[170px] text-right">Biaya Saat Ini (Rp)</th>
                <th className="p-4 w-[100px] text-center">Inflasi %</th>
                <th className="p-4 w-[100px] text-center">ROI %</th>
                <th className="p-4 min-w-[190px] text-right bg-blue-50/50">Target Masa Depan (FV)</th>
                <th className="p-4 min-w-[190px] text-right bg-emerald-50/50">Nabung / Bulan (PMT)</th>
                <th className="p-4 pr-6 w-[70px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {goals.map((g) => {
                const infDecimal = (g.inflasi || 0) / 100;
                const roiDecimal = (g.roi || 0) / 100;

                const fvCost = excelFV(infDecimal, g.horizon || 0, 0, -(g.cost || 0), 1);
                const pmtBulan = excelPMT(
                  roiDecimal / 12,
                  (g.horizon || 0) * 12,
                  0,
                  -fvCost,
                  1
                );

                return (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-3 pl-6">
                      <input
                        type="text"
                        value={g.name}
                        onChange={(e) => handleUpdate(g.id, 'name', e.target.value)}
                        placeholder="Contoh: Haji Plus"
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm font-bold text-slate-800 outline-none transition-all"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={g.horizon}
                        onChange={(e) =>
                          handleUpdate(g.id, 'horizon', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm font-semibold text-center outline-none transition-all"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="text"
                        value={formatThousands(g.cost)}
                        onChange={(e) =>
                          handleUpdate(g.id, 'cost', parseRawNumber(e.target.value))
                        }
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm font-bold text-right outline-none transition-all text-slate-800"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.1"
                        value={g.inflasi}
                        onChange={(e) =>
                          handleUpdate(g.id, 'inflasi', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm font-semibold text-center text-orange-600 outline-none transition-all"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.1"
                        value={g.roi}
                        onChange={(e) =>
                          handleUpdate(g.id, 'roi', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm font-semibold text-center text-blue-600 outline-none transition-all"
                      />
                    </td>
                    <td className="p-3 text-right font-black text-blue-700 bg-blue-50/30">
                      {formatIDR(fvCost)}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-600 bg-emerald-50/30">
                      {formatIDR(pmtBulan)}
                    </td>
                    <td className="p-3 pr-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(g.id)}
                        title="Hapus Tujuan"
                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-40 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info notification */}
      <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3 border border-blue-100">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
          <strong>Keterangan Tabel Interaktif:</strong> Anda dapat langsung mengklik dan mengedit nama tujuan, target waktu (tahun), estimasi biaya sekarang, asumsi inflasi, dan return investasi (ROI). Target Biaya Masa Depan (FV) dan Tabungan Bulanan (PMT) akan otomatis dihitung secara real-time.
        </p>
      </div>
    </section>
  );
};
