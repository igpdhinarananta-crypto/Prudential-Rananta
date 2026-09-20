import { useState, useEffect } from 'react';
import { TabType, UpState, EduState, PensiunState, GoalItem } from './types';
import { Header } from './components/Header';
import { TabPengganti } from './components/TabPengganti';
import { TabPendidikan } from './components/TabPendidikan';
import { TabPensiun } from './components/TabPensiun';
import { TabLiburan } from './components/TabLiburan';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { exportToPDF } from './utils/pdfExport';

const DEFAULT_UP: UpState = {
  biayaBulan: 20000000,
  hutang: 0,
  kewajiban: 0,
  lainnya: 0,
  anakUsia: 3,
  anakTargetMapan: 25,
  anakInflasi: 4.0,
  anakRoi: 5.0,
  pasanganUsia: 37,
  pasanganTargetHidup: 75,
  pasanganInflasi: 4.0,
  pasanganRoi: 3.0,
};

const DEFAULT_EDU: EduState = {
  usiaSaat: 3,
  usiaTarget: 18,
  infPend: 10.0,
  infHidup: 5.0,
  biayaKuliah: 600000000,
  biayaHidup: 0,
  tetapVal: 0,
  tetapRoi: 5.0,
  berjangkaVal: 750000,
  berjangkaRoi: 9.0,
  targetRoi: 11.0,
};

const DEFAULT_PENSIUN: PensiunState = {
  usiaSaat: 36,
  usiaPensiun: 55,
  usiaAkhir: 80,
  inflasi: 4.0,
  roiPensiun: 3.0,
  roiAkumulasi: 7.0,
  biayaBulan: 15000000,
  penurunan: 20,
};

const DEFAULT_GOALS: GoalItem[] = [
  { id: '1', name: 'Haji Plus Keluarga', horizon: 12, cost: 100000000, inflasi: 5.0, roi: 7.0 },
  { id: '2', name: 'Liburan Eropa', horizon: 5, cost: 100000000, inflasi: 5.0, roi: 7.0 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('pengganti');
  const [clientName, setClientName] = useState<string>('Bapak / Ibu Nasabah');

  const [upState, setUpState] = useState<UpState>(() => {
    try {
      const saved = localStorage.getItem('fp_up_state');
      return saved ? JSON.parse(saved) : DEFAULT_UP;
    } catch {
      return DEFAULT_UP;
    }
  });

  const [eduState, setEduState] = useState<EduState>(() => {
    try {
      const saved = localStorage.getItem('fp_edu_state');
      return saved ? JSON.parse(saved) : DEFAULT_EDU;
    } catch {
      return DEFAULT_EDU;
    }
  });

  const [pensiunState, setPensiunState] = useState<PensiunState>(() => {
    try {
      const saved = localStorage.getItem('fp_pensiun_state');
      return saved ? JSON.parse(saved) : DEFAULT_PENSIUN;
    } catch {
      return DEFAULT_PENSIUN;
    }
  });

  const [goalsData, setGoalsData] = useState<GoalItem[]>(() => {
    try {
      const saved = localStorage.getItem('fp_goals_state');
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem('fp_up_state', JSON.stringify(upState));
      localStorage.setItem('fp_edu_state', JSON.stringify(eduState));
      localStorage.setItem('fp_pensiun_state', JSON.stringify(pensiunState));
      localStorage.setItem('fp_goals_state', JSON.stringify(goalsData));
    } catch (e) {
      console.warn('Unable to persist to localStorage', e);
    }
  }, [upState, eduState, pensiunState, goalsData]);

  const handleResetData = () => {
    if (confirm('Kembalikan semua nilai simulasi ke nilai default?')) {
      setUpState(DEFAULT_UP);
      setEduState(DEFAULT_EDU);
      setPensiunState(DEFAULT_PENSIUN);
      setGoalsData(DEFAULT_GOALS);
      setClientName('Bapak / Ibu Nasabah');
      try {
        localStorage.clear();
      } catch {}
    }
  };

  const handlePrintTab = (tabName: 'Pengganti Penghasilan' | 'Dana Pendidikan' | 'Dana Pensiun' | 'Liburan dan Haji') => {
    exportToPDF({
      tabName,
      clientName,
      upState,
      eduState,
      pensiunState,
      goalsData,
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col font-sans pb-16">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientName={clientName}
        setClientName={setClientName}
        upState={upState}
        eduState={eduState}
        pensiunState={pensiunState}
        goalsData={goalsData}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 mt-8 flex-1">
        {activeTab === 'pengganti' && (
          <TabPengganti
            state={upState}
            onChange={setUpState}
            onPrint={() => handlePrintTab('Pengganti Penghasilan')}
          />
        )}

        {activeTab === 'pendidikan' && (
          <TabPendidikan
            state={eduState}
            onChange={setEduState}
            onPrint={() => handlePrintTab('Dana Pendidikan')}
          />
        )}

        {activeTab === 'pensiun' && (
          <TabPensiun
            state={pensiunState}
            onChange={setPensiunState}
            onPrint={() => handlePrintTab('Dana Pensiun')}
          />
        )}

        {activeTab === 'liburan' && (
          <TabLiburan
            goals={goalsData}
            onChange={setGoalsData}
            onPrint={() => handlePrintTab('Liburan dan Haji')}
          />
        )}

        {/* Global Executive Financial Summary */}
        <ExecutiveSummary
          upState={upState}
          eduState={eduState}
          pensiunState={pensiunState}
          goals={goalsData}
        />
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 text-center text-xs text-slate-400">
        <p>
          FinancialPlanner TVM Engine • Formula Time Value of Money Annuity Due (Type 1) • Hak Cipta Perencanaan Keuangan Keluarga Mapan
        </p>
      </footer>
    </div>
  );
}
