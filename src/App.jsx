// App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { Settings, LayoutGrid, AlertCircle, Award, Clock, Database } from 'lucide-react';
import { getStoredConfig, saveStoredConfig } from './data/storage';
import {
  recommendedFunds as defaultRecommendedFunds,
  assetClassBenchmarks as defaultBenchmarks
} from './data/config';
import {
  identifyReviewCandidates,

} from './services/scoring';
import dataStore, { savePref, getPref } from './services/dataStore';
import { loadAssetClassMap } from './services/dataLoader';

import { useSnapshot } from './contexts/SnapshotContext';
import FundScores from './routes/FundScores';
import DashboardView from './components/Views/DashboardView.jsx';
import ClassView from './routes/ClassView';
import AdminPanel from './components/AdminPanel.jsx';
import AppContext from './context/AppContext.jsx';
import TagFilterBar from './components/Filters/TagFilterBar.jsx';
import AnalysisView from './routes/AnalysisView';
import HistoricalManager from './routes/HistoricalManager';
import { Button } from '@mui/material';


const App = () => {
  const {
    fundData,
    setFundData,
    setConfig,
    availableClasses,
    historySnapshots,
    setHistorySnapshots,
  } = useContext(AppContext);

  const { active } = useSnapshot();
  
  const [scoredFundData, setScoredFundData] = useState([]);
  const [activeTab, setActiveTab] = useState('funds');
  const [selectedClassView, setSelectedClassView] = useState('');
  const [classSummaries, setClassSummaries] = useState({});

  // Historical data states
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [compareSnapshot, setCompareSnapshot] = useState(null);
  const [snapshotComparison, setSnapshotComparison] = useState(null);

  const [recommendedFunds, setRecommendedFunds] = useState([]);
  const [assetClassBenchmarks, setAssetClassBenchmarks] = useState({});
  
    // when active snapshot changes, propagate rows
    useEffect(() => {
      if (active) {
        setFundData(active.rows);
        setScoredFundData(active.rows);
        setClassSummaries(active.classSummaries || {});
      } else {
        setFundData([]);
        setScoredFundData([]);
        setClassSummaries({});
      }
    }, [active, setFundData]);

  // Load history snapshots from storage on startup
  useEffect(() => {
    (async () => {
      const stored = await getPref('ls_history', []);
      if (stored.length > 0) {
        setHistorySnapshots(stored);
      }
    })();
  }, [setHistorySnapshots]);

  // Persist history snapshots whenever they change
  useEffect(() => {
    savePref('ls_history', historySnapshots);
  }, [historySnapshots]);

  // Initialize configuration
  useEffect(() => {
    const loadMap = async () => {
      try {
        await loadAssetClassMap();
      } catch (err) {
        toast.error('Failed to load asset-class map');
        console.error(err);
      }
    };
    loadMap();
  }, [setConfig]);

  // Initialize configuration
  useEffect(() => {
    const initializeConfig = async () => {
      const { savedFunds, savedBenchmarks } = await getStoredConfig();
      const initializedFunds = savedFunds || defaultRecommendedFunds;
      const initializedBenchmarks = savedBenchmarks || defaultBenchmarks;
      setRecommendedFunds(initializedFunds);
      setAssetClassBenchmarks(initializedBenchmarks);
      setConfig(initializedBenchmarks);
      await saveStoredConfig(initializedFunds, initializedBenchmarks);
    };
    
    initializeConfig();
  }, [setConfig]);

  // Save configuration when changed
  useEffect(() => {
    if (recommendedFunds.length > 0 || Object.keys(assetClassBenchmarks).length > 0) {
      saveStoredConfig(recommendedFunds, assetClassBenchmarks);
      setConfig(assetClassBenchmarks);
    }
  }, [recommendedFunds, assetClassBenchmarks, setConfig]);

  // Load snapshots when history tab is selected
  useEffect(() => {
    if (activeTab === 'history') {
      loadSnapshots();
    }
  }, [activeTab]);

  const loadSnapshots = async () => {
    try {
      const allSnapshots = await dataStore.getAllSnapshots();
      setSnapshots(allSnapshots);
    } catch (err) {
      toast.error('History failed to load');
      console.error('Error loading snapshots', err);
    }
  };


  const loadSnapshot = async (snapshot) => {
    setSelectedSnapshot(snapshot);
    setFundData(snapshot.funds);
    setScoredFundData(snapshot.funds);
    setClassSummaries(snapshot.classSummaries || {});
    
    // Extract benchmark data
    const benchmarks = {};
    Object.entries(assetClassBenchmarks).forEach(([assetClass, { ticker, name }]) => {
      const clean = (s) => s?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
      const match = snapshot.funds.find(f => f.cleanSymbol === clean(ticker));
      if (match) {
        benchmarks[assetClass] = { ...match, name };
      }
    });
  };

  const compareSnapshots = async () => {
    if (!selectedSnapshot?.id || !compareSnapshot?.id) {
      toast.error('Snapshot comparison error');
      return;
    }

    try {
      const comparison = await dataStore.compareSnapshots(selectedSnapshot.id, compareSnapshot.id);
      setSnapshotComparison(comparison);
    } catch (error) {
      toast.error('Snapshot comparison error');
      console.error(error);
    }
  };

  // CRUD helpers moved to AdminPanel component


  // Get review candidates
  const reviewCandidates = identifyReviewCandidates(scoredFundData);

  return (
    <div className="p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Lightship Fund Analysis
        </h1>
        <p className="text-gray-500">
          Monthly fund performance analysis with Z-score ranking system
        </p>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('funds')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 border-none ${activeTab === 'funds' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <Award size={16} />
          Fund Scores
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 border-none ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <Database size={16} />
          Dashboard
        </button>
        
        <button
          onClick={() => setActiveTab('class')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 border-none ${activeTab === 'class' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <LayoutGrid size={16} />
          Class View
        </button>
        
        <button
          onClick={() => setActiveTab('analysis')}
          className={`relative px-4 py-2 rounded-md flex items-center gap-2 border-none ${activeTab === 'analysis' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <AlertCircle size={16} />
          Analysis
          {reviewCandidates.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {reviewCandidates.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 border-none ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <Clock size={16} />
          History
        </button>
        
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 border-none ${activeTab === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <Settings size={16} />
          Admin
        </button>
      </div>


      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <DashboardView />
      )}

      {/* Fund Scores Tab */}
      {activeTab === 'funds' && <FundScores />}

      {/* Asset Class View Tab */}
      {activeTab === 'class' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Asset Class Comparison
          </h2>
          
          <div className="sticky top-0 z-10 bg-white">
            <select
              value={selectedClassView}
              onChange={e => setSelectedClassView(e.target.value)}
              className="p-2 mb-4 border border-gray-300 rounded-md text-base"
            >
              <option value="">-- Choose an asset class --</option>
              {availableClasses.map(ac => (
                <option key={ac} value={ac}>{ac}</option>
              ))}
            </select>
          </div>
          
          {selectedClassView && (
            <>
              {classSummaries[selectedClassView] && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-lg font-bold mb-2">
                    {selectedClassView} Summary
                  </h3>
                  <div className="grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-4">
                    <div>
                      <div className="text-gray-500 text-sm">Fund Count</div>
                      <div className="text-xl font-bold">
                        {classSummaries[selectedClassView].fundCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Average Score</div>
                      <div className="text-xl font-bold">
                        {classSummaries[selectedClassView].averageScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Benchmark Score</div>
                      <div className="text-xl font-bold">
                        {classSummaries[selectedClassView].benchmarkScore != null
                          ? classSummaries[selectedClassView].benchmarkScore
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Distribution</div>
                      <div className="flex gap-2 text-sm">
                        <span className="text-green-600">
                          {classSummaries[selectedClassView].distribution.excellent} excellent
                        </span>
                        <span className="text-yellow-500">
                          {classSummaries[selectedClassView].distribution.good} good
                        </span>
                        <span className="text-red-600">
                          {classSummaries[selectedClassView].distribution.poor} poor
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <TagFilterBar />

              <ClassView
                funds={scoredFundData.filter(f => f.assetClass === selectedClassView)}
              />
            </>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <AnalysisView
          funds={scoredFundData}
          reviewCandidates={reviewCandidates}
          onSelectClass={ac => {
            setSelectedClassView(ac);
            setActiveTab('class');
          }}
        />
      )}


      {/* History Tab */}
      {activeTab === 'history' && (
        <HistoricalManager />
      )}

      {activeTab === 'admin' && (
        <AdminPanel
          recommendedFunds={recommendedFunds}
          setRecommendedFunds={setRecommendedFunds}
          assetClassBenchmarks={assetClassBenchmarks}
          setAssetClassBenchmarks={setAssetClassBenchmarks}
          setConfig={setConfig}
        />
      )}
    </div>
  );
};

export default App;
