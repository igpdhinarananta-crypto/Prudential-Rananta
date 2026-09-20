import React from 'react';
import { UpState, EduState, PensiunState, GoalItem } from '../types';
import { excelFV, excelPMT, excelPV, formatIDR } from '../utils/tvm';
import { ShieldCheck, GraduationCap, Palmtree, Plane, Calculator } from 'lucide-react';

interface ExecutiveSummaryProps {
  upState: UpState;
  eduState: EduState;
  pensiunState: PensiunState;
  goals: GoalItem[];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  upState,
  eduState,
  pensiunState,
  goals,
}) => {
  // 1. UP
  const biayaTahun = upState.biayaBulan * 12;
  const totalLiabilitas = upState.hutang + upState.kewajiban + upState.lainnya;
  const anakNper = Math.max(0, upState.anakTargetMapan - upState.anakUsia);
  const anakNetRate = (upState.anakRoi - upState.anakInflasi) / 100;
  const upAnak = excelPV(anakNetRate, anakNper, biayaTahun, 0, 1) * -1 + totalLiabilitas;

  // 2. Edu PMT
  const eduNper = Math.max(0, eduState.usiaTarget - eduState.usiaSaat);
  const fvKuliah = excelFV(eduState.infPend / 100, eduNper, 0, -eduState.biayaKuliah, 1);
  const fvHidup = excelFV(eduState.infHidup / 100, eduNper, 0, -eduState.biayaHidup, 1);
  const totalEduFV = fvKuliah + fvHidup;

  const tetapFV = excelFV(eduState.tetapRoi / 100, eduNper, 0, -eduState.tetapVal, 1);
  const berjangkaFV = excelFV((eduState.berjangkaRoi / 100) / 12, eduNper * 12, -eduState.berjangkaVal, 0, 1);
  const eduShortfall = Math.max(0, totalEduFV - (tetapFV + berjangkaFV));
  const eduPmtBulan = excelPMT((eduState.targetRoi / 100) / 12, eduNper * 12, 0, -eduShortfall, 1);

  // 3. Pensiun PMT
  const nperAkumulasi = Math.max(0, pensiunState.usiaPensiun - pensiunState.usiaSaat);
  const nperPensiun = Math.max(0, pensiunState.usiaAkhir - pensiunState.usiaPensiun);
  const estPensiunTahunIni = pensiunState.biayaBulan * (1 - pensiunState.penurunan / 100) * 12;
  const expAtPensiunTahun = excelFV(pensiunState.inflasi / 100, nperAkumulasi, 0, -estPensiunTahunIni, 1);
  const netRoiPensiun = (pensiunState.roiPensiun - pensiunState.inflasi) / 100;
  const totalDanaPensiun = excelPV(netRoiPensiun, nperPensiun, -expAtPensiunTahun, 0, 1);
  const pensiunPmtBulan = excelPMT((pensiunState.roiAkumulasi / 100) / 12, nperAkumulasi * 12, 0, -totalDanaPensiun, 1);

  // 4. Goals PMT
  const goalsPmtBulan = goals.reduce((sum, g) => {
    const fv = excelFV((g.inflasi || 0) / 100, g.horizon || 0, 0, -(g.cost || 0), 1);
    const pmt = excelPMT(((g.roi || 0) / 100) / 12, (g.horizon || 0) * 12, 0, -fv, 1);
    return sum + pmt;
  }, 0);

  const totalKomitmenBulanan = eduPmtBulan + pensiunPmtBulan + goalsPmtBulan;

  return (
    <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            Ringkasan Komitmen Finansial Keluarga
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikhtisar kebutuhan proteksi dan total investasi rutin bulanan untuk mencapai seluruh target.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-3 rounded-2xl shadow-md">
          <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wide">
            Total Alokasi Investasi Baru
          </div>
          <div className="text-2xl font-black">{formatIDR(totalKomitmenBulanan)} <span className="text-sm font-normal text-blue-200">/ bulan</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* UP */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Proteksi Jiwa (UP)</span>
          </div>
          <div className="text-xl font-black text-slate-800">{formatIDR(upAnak)}</div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Kebutuhan uang pertanggungan keluarga
          </span>
        </div>

        {/* Edu */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase mb-2">
            <GraduationCap className="w-4 h-4 text-rose-600" />
            <span>Pendidikan Kuliah</span>
          </div>
          <div className="text-xl font-black text-rose-600">{formatIDR(eduPmtBulan)} / bln</div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Target tabungan rutin kuliah anak
          </span>
        </div>

        {/* Pensiun */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase mb-2">
            <Palmtree className="w-4 h-4 text-emerald-600" />
            <span>Pensiun Bebas Khawatir</span>
          </div>
          <div className="text-xl font-black text-emerald-600">{formatIDR(pensiunPmtBulan)} / bln</div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Masa persiapan pensiun mandiri
          </span>
        </div>

        {/* Goals */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase mb-2">
            <Plane className="w-4 h-4 text-indigo-600" />
            <span>Liburan & Haji</span>
          </div>
          <div className="text-xl font-black text-indigo-600">{formatIDR(goalsPmtBulan)} / bln</div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Total {goals.length} target impian masa depan
          </span>
        </div>
      </div>
    </div>
  );
};
