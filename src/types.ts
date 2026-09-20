export type TabType = 'pengganti' | 'pendidikan' | 'pensiun' | 'liburan';

export interface UpState {
  biayaBulan: number;
  hutang: number;
  kewajiban: number;
  lainnya: number;
  // Pendekatan Anak
  anakUsia: number;
  anakTargetMapan: number;
  anakInflasi: number;
  anakRoi: number;
  // Pendekatan Pasangan
  pasanganUsia: number;
  pasanganTargetHidup: number;
  pasanganInflasi: number;
  pasanganRoi: number;
}

export interface EduState {
  usiaSaat: number;
  usiaTarget: number;
  infPend: number;
  infHidup: number;
  biayaKuliah: number;
  biayaHidup: number;
  tetapVal: number;
  tetapRoi: number;
  berjangkaVal: number;
  berjangkaRoi: number;
  targetRoi: number;
}

export interface PensiunState {
  usiaSaat: number;
  usiaPensiun: number;
  usiaAkhir: number;
  inflasi: number;
  roiPensiun: number;
  roiAkumulasi: number;
  biayaBulan: number;
  penurunan: number;
}

export interface GoalItem {
  id: string;
  name: string;
  horizon: number;
  cost: number;
  inflasi: number;
  roi: number;
}
