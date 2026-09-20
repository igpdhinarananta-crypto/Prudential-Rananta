import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatIDR, excelFV, excelPMT, excelPV } from './tvm';
import { UpState, EduState, PensiunState, GoalItem } from '../types';

interface ExportParams {
  tabName: 'Pengganti Penghasilan' | 'Dana Pendidikan' | 'Dana Pensiun' | 'Liburan dan Haji' | 'Laporan Lengkap';
  clientName: string;
  upState: UpState;
  eduState: EduState;
  pensiunState: PensiunState;
  goalsData: GoalItem[];
}

export function exportToPDF({
  tabName,
  clientName,
  upState,
  eduState,
  pensiunState,
  goalsData,
}: ExportParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const effectiveClient = clientName.trim() || 'Bapak / Ibu Nasabah';

  // Primary banner
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `PERENCANAAN KEUANGAN: ${tabName.toUpperCase()}`,
    14,
    16
  );

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Keluarga Mapan - Time Value of Money (TVM) Financial Planning', 14, 22);

  // Client info box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 18, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Nama Klien: ${effectiveClient}`, 18, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Cetak: ${today}`, 18, 46);
  doc.text(`Status Analisis: Rekomendasi Siap Dilaksanakan`, 110, 46);

  let currentY = 56;

  // Render content based on tabName
  if (tabName === 'Pengganti Penghasilan' || tabName === 'Laporan Lengkap') {
    const biayaTahun = upState.biayaBulan * 12;
    const totalLiabilitas = upState.hutang + upState.kewajiban + upState.lainnya;

    // Anak
    const anakNper = Math.max(0, upState.anakTargetMapan - upState.anakUsia);
    const anakNetI = (upState.anakRoi - upState.anakInflasi) / 100;
    const anakSubtotal = excelPV(anakNetI, anakNper, biayaTahun, 0, 1) * -1;
    const anakTotal = anakSubtotal + totalLiabilitas;

    // Pasangan
    const pasNper = Math.max(0, upState.pasanganTargetHidup - upState.pasanganUsia);
    const pasNetI = (upState.pasanganRoi - upState.pasanganInflasi) / 100;
    const pasSubtotal = excelPV(pasNetI, pasNper, biayaTahun, 0, 1) * -1;
    const pasTotal = pasSubtotal + totalLiabilitas;

    autoTable(doc, {
      startY: currentY,
      head: [['Parameter Proteksi Penghasilan (UP)', 'Nilai / Rekomendasi']],
      body: [
        ['Biaya Hidup Bulanan', formatIDR(upState.biayaBulan)],
        ['Biaya Hidup Tahunan', formatIDR(biayaTahun)],
        ['Total Liabilitas (Hutang + Kewajiban)', formatIDR(totalLiabilitas)],
        ['-- PENDEKATAN USIA ANAK TERMUDAP --', ''],
        ['Usia Anak Saat Ini / Target Mandiri', `${upState.anakUsia} thn / ${upState.anakTargetMapan} thn (${anakNper} tahun proteksi)`],
        ['Asumsi Inflasi / ROI Ahli Waris', `${upState.anakInflasi}% / ${upState.anakRoi}% (Net: ${(anakNetI * 100).toFixed(1)}%)`],
        ['Rekomendasi Uang Pertanggungan (UP Anak)', formatIDR(anakTotal)],
        ['-- PENDEKATAN HARAPAN HIDUP PASANGAN --', ''],
        ['Usia Pasangan / Harapan Hidup', `${upState.pasanganUsia} thn / ${upState.pasanganTargetHidup} thn (${pasNper} tahun proteksi)`],
        ['Asumsi Inflasi / ROI Ahli Waris', `${upState.pasanganInflasi}% / ${upState.pasanganRoi}% (Net: ${(pasNetI * 100).toFixed(1)}%)`],
        ['Rekomendasi Uang Pertanggungan (UP Pasangan)', formatIDR(pasTotal)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 2.8 },
    });

    const lastTable = (doc as any).lastAutoTable;
    currentY = lastTable ? lastTable.finalY + 12 : currentY + 70;
  }

  if (tabName === 'Dana Pendidikan' || tabName === 'Laporan Lengkap') {
    if (tabName === 'Laporan Lengkap' && currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    const nper = Math.max(0, eduState.usiaTarget - eduState.usiaSaat);
    const infPend = eduState.infPend / 100;
    const infHidup = eduState.infHidup / 100;

    const fvKuliah = excelFV(infPend, nper, 0, -eduState.biayaKuliah, 1);
    const fvHidup = excelFV(infHidup, nper, 0, -eduState.biayaHidup, 1);
    const totalBiayaFV = fvKuliah + fvHidup;

    const tetapFV = excelFV(eduState.tetapRoi / 100, nper, 0, -eduState.tetapVal, 1);
    const berjangkaFV = excelFV((eduState.berjangkaRoi / 100) / 12, nper * 12, -eduState.berjangkaVal, 0, 1);
    const totalAsetEksisting = tetapFV + berjangkaFV;
    const kekurangan = Math.max(0, totalBiayaFV - totalAsetEksisting);

    const targetRoi = eduState.targetRoi / 100;
    const pmtBulan = excelPMT(targetRoi / 12, nper * 12, 0, -kekurangan, 1);
    const pmtTahun = excelPMT(targetRoi, nper, 0, -kekurangan, 1);

    autoTable(doc, {
      startY: currentY,
      head: [['Parameter Perencanaan Dana Pendidikan', 'Nilai / Rekomendasi']],
      body: [
        ['Usia Anak Sekarang / Masuk Kuliah', `${eduState.usiaSaat} thn / ${eduState.usiaTarget} thn (${nper} thn lagi)`],
        ['Estimasi Biaya Kuliah Saat Ini', formatIDR(eduState.biayaKuliah)],
        ['Asumsi Kenaikan Biaya (Inflasi Pendidikan)', `${eduState.infPend}% per tahun`],
        ['Proyeksi Total Biaya Kuliah Masa Depan (FV)', formatIDR(totalBiayaFV)],
        ['Proyeksi Nilai Aset Tersedia Saat Ini', formatIDR(totalAsetEksisting)],
        ['Kekurangan Dana Pendidikan (Shortfall)', formatIDR(kekurangan)],
        ['Target Imbal Hasil Investasi Baru (ROI)', `${eduState.targetRoi}% per tahun`],
        ['Rekomendasi Tabungan/Investasi per Bulan', formatIDR(pmtBulan)],
        ['Rekomendasi Tabungan/Investasi per Tahun', formatIDR(pmtTahun)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [225, 29, 72], fontSize: 9 }, // Rose 600
      styles: { fontSize: 8.5, cellPadding: 2.8 },
    });

    const lastTable = (doc as any).lastAutoTable;
    currentY = lastTable ? lastTable.finalY + 12 : currentY + 70;
  }

  if (tabName === 'Dana Pensiun' || tabName === 'Laporan Lengkap') {
    if (tabName === 'Laporan Lengkap' && currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    const nperAkumulasi = Math.max(0, pensiunState.usiaPensiun - pensiunState.usiaSaat);
    const nperPensiun = Math.max(0, pensiunState.usiaAkhir - pensiunState.usiaPensiun);

    const inflasi = pensiunState.inflasi / 100;
    const roiPensiun = pensiunState.roiPensiun / 100;
    const roiAkumulasi = pensiunState.roiAkumulasi / 100;

    const estPensiunBulanIni = pensiunState.biayaBulan * (1 - pensiunState.penurunan / 100);
    const estPensiunTahunIni = estPensiunBulanIni * 12;

    const expAtPensiunTahun = excelFV(inflasi, nperAkumulasi, 0, -estPensiunTahunIni, 1);
    const netRoiPensiun = roiPensiun - inflasi;
    const totalDanaPensiun = excelPV(netRoiPensiun, nperPensiun, -expAtPensiunTahun, 0, 1);

    const pmtBulan = excelPMT(roiAkumulasi / 12, nperAkumulasi * 12, 0, -totalDanaPensiun, 1);
    const pmtTahun = excelPMT(roiAkumulasi, nperAkumulasi, 0, -totalDanaPensiun, 1);

    autoTable(doc, {
      startY: currentY,
      head: [['Parameter Perencanaan Dana Pensiun', 'Nilai / Rekomendasi']],
      body: [
        ['Timeline Usia (Saat ini / Pensiun / Harapan Hidup)', `${pensiunState.usiaSaat} thn / ${pensiunState.usiaPensiun} thn / ${pensiunState.usiaAkhir} thn`],
        ['Masa Menabung Produktif / Masa Menikmati Pensiun', `${nperAkumulasi} tahun / ${nperPensiun} tahun`],
        ['Pengeluaran Saat Ini (per Bulan)', formatIDR(pensiunState.biayaBulan)],
        ['Penyesuaian Gaya Hidup Pensiun', `Berkurang ${pensiunState.penurunan}%`],
        ['Proyeksi Biaya Hidup di Tahun Pertama Pensiun', `${formatIDR(expAtPensiunTahun)} / tahun`],
        ['TOTAL KEBUTUHAN DANA PENSIUN (PV)', formatIDR(totalDanaPensiun)],
        ['Rekomendasi Investasi Masa Produktif (per Bulan)', formatIDR(pmtBulan)],
        ['Rekomendasi Investasi Masa Produktif (per Tahun)', formatIDR(pmtTahun)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136], fontSize: 9 }, // Teal 600
      styles: { fontSize: 8.5, cellPadding: 2.8 },
    });

    const lastTable = (doc as any).lastAutoTable;
    currentY = lastTable ? lastTable.finalY + 12 : currentY + 70;
  }

  if (tabName === 'Liburan dan Haji' || tabName === 'Laporan Lengkap') {
    if (tabName === 'Laporan Lengkap' && currentY > 190) {
      doc.addPage();
      currentY = 20;
    }

    const tableRows = goalsData.map((g) => {
      const fvCost = excelFV((g.inflasi || 0) / 100, g.horizon || 0, 0, -(g.cost || 0), 1);
      const pmt = excelPMT(((g.roi || 0) / 100) / 12, (g.horizon || 0) * 12, 0, -fvCost, 1);
      return [
        g.name,
        `${g.horizon} Thn`,
        formatIDR(g.cost),
        `${g.inflasi}%`,
        `${g.roi}%`,
        formatIDR(fvCost),
        formatIDR(pmt),
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Tujuan Khusus', 'Waktu', 'Biaya Sekarang', 'Inflasi', 'ROI', 'Target Biaya (FV)', 'Nabung / Bulan']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], fontSize: 8.5 }, // Indigo 600
      styles: { fontSize: 8, cellPadding: 2.5 },
    });
  }

  // Footer notes
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Simulasi ini dihitung menggunakan formula Time Value of Money (TVM) berdasarkan asumsi inflasi & return investasi. Dibuat oleh FinancialPlanner.',
      14,
      288
    );
    doc.text(`Halaman ${i} dari ${pageCount}`, 180, 288);
  }

  const cleanClient = effectiveClient.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanTab = tabName.replace(/\s+/g, '_');
  doc.save(`Laporan_Keuangan_${cleanTab}_${cleanClient}.pdf`);
}
