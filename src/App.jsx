// App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { RefreshCw, Settings, Plus, Trash2, LayoutGrid, AlertCircle, TrendingUp, Award, Clock, Database, Calendar } from 'lucide-react';
import { getStoredConfig, saveStoredConfig } from './data/storage';
import {
  recommendedFunds as defaultRecommendedFunds,
  assetClassBenchmarks as defaultBenchmarks
} from './data/config';
import {
  identifyReviewCandidates,
  getScoreColor,
  getScoreLabel
} from './services/scoring';
import dataStore from './services/dataStore';
import { loadAssetClassMap } from './services/dataLoader';
import { fmtPct, fmtNumber } from './utils/formatters';
import FundScores from './routes/FundScores';
import DashboardView from './components/Views/DashboardView.jsx';
import ClassView from './routes/ClassView';
import AdminPanel from './components/AdminPanel.jsx';
import AppContext from './context/AppContext.jsx';
import TagFilterBar from './components/Filters/TagFilterBar.jsx';
import AnalysisView from './components/Views/AnalysisView.jsx';
import HistoricalManager from './routes/HistoricalManager';
// Score badge component for visual display
const ScoreBadge = ({ score, size = 'normal' }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  
  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    normal: 'text-sm px-2 py-1',
    large: 'text-base px-3 py-1.5'
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}50`
      }}
    >
      {Number(score).toFixed(1)} - {label}
    </span>
  );
};


const App = () => {
  const {
    fundData,
    setFundData,
    setConfig,
    availableClasses,
    historySnapshots,
    setHistorySnapshots,
  } = useContext(AppContext);

  const [scoredFundData, setScoredFundData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('funds');
  const [selectedClassView, setSelectedClassView] = useState('');
  const [classSummaries, setClassSummaries] = useState({});
  const [currentSnapshotDate, setCurrentSnapshotDate] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Historical data states
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [compareSnapshot, setCompareSnapshot] = useState(null);
  const [snapshotComparison, setSnapshotComparison] = useState(null);

  const [recommendedFunds, setRecommendedFunds] = useState([]);
  const [assetClassBenchmarks, setAssetClassBenchmarks] = useState({});

  // Load history snapshots from localStorage on startup
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ls_history') || '[]');
    if (stored.length > 0) {
      setHistorySnapshots(stored);
    }
  }, [setHistorySnapshots]);

  // Persist history snapshots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ls_history', JSON.stringify(historySnapshots));
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const module = await import('./services/fundProcessingService.js');
      const funds = await module.process(file, {
        recommendedFunds,
        assetClassBenchmarks,
      });

      const snapshotId = await dataStore.saveSnapshot({
        date: new Date().toISOString().slice(0, 10),
        funds,
        fileName: file.name,
      });
      const snapshot = await dataStore.getSnapshot(snapshotId);
      if (snapshot) {
        setFundData(snapshot.funds);
        setScoredFundData(snapshot.funds);
        setCurrentSnapshotDate(snapshot.date);
      }
      await loadSnapshots();
    } catch (err) {
      toast.error('Upload failed – check file format');
      console.error('File processing error', err);
    }
    setLoading(false);
    setUploadedFileName(file.name);
  };

  const loadSnapshot = async (snapshot) => {
    setSelectedSnapshot(snapshot);
    setFundData(snapshot.funds);
    setScoredFundData(snapshot.funds);
    setClassSummaries(snapshot.classSummaries || {});
    setCurrentSnapshotDate(new Date(snapshot.date).toLocaleDateString());
    setUploadedFileName(snapshot.metadata?.fileName || 'Historical snapshot');
    
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
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Lightship Fund Analysis
        </h1>
        <p style={{ color: '#6b7280' }}>
          Monthly fund performance analysis with Z-score ranking system
        </p>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('funds')}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'funds' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'funds' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Award size={16} />
          Fund Scores
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'dashboard' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'dashboard' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Database size={16} />
          Dashboard
        </button>
        
        <button 
          onClick={() => setActiveTab('class')} 
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'class' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'class' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LayoutGrid size={16} />
          Class View
        </button>
        
        <button 
          onClick={() => setActiveTab('analysis')} 
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'analysis' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'analysis' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative'
          }}
        >
          <AlertCircle size={16} />
          Analysis
          {reviewCandidates.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-0.5rem',
              right: '-0.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '9999px',
              width: '1.25rem',
              height: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {reviewCandidates.length}
            </span>
          )}
        </button>
        
        <button 
          onClick={() => setActiveTab('history')} 
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'history' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'history' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Clock size={16} />
          History
        </button>
        
        <button 
          onClick={() => setActiveTab('admin')}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'admin' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'admin' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Settings size={16} />
          Admin
        </button>
      </div>

      {/* File Upload Section - Show on all tabs except admin and history */}
      {activeTab !== 'admin' && activeTab !== 'history' && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '0.5rem' 
        }}>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            style={{ marginRight: '1rem' }}
          />
          {loading && (
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#3b82f6' }}>
              <RefreshCw size={16} style={{ marginRight: '0.25rem', animation: 'spin 1s linear infinite' }} />
              Processing and calculating scores...
            </span>
          )}
          {scoredFundData.length > 0 && !loading && (
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ color: '#059669' }}>
                ✓ {scoredFundData.length} funds loaded and scored
              </span>
              {currentSnapshotDate && (
                <span style={{ marginLeft: '1rem', color: '#6b7280' }}>
                  | Date: {currentSnapshotDate} | File: {uploadedFileName}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <DashboardView />
      )}

      {/* Fund Scores Tab */}
      {activeTab === 'funds' && (
        fundData.length > 0 ? (
          <>
            <div>
              {scoredFundData.length > 0 ? (
                <div>
                  {/* Header with title and subtitle */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        All Funds with Scores
                      </h2>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Scores calculated using weighted&nbsp;Z-score methodology within each asset class
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No scored funds to display.</p>
              )}
            </div>
            <FundScores />
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              color: '#6b7280'
            }}
          >
            <TrendingUp size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Upload a fund performance file to see scores</p>
          </div>
        )
      )}

      {/* Asset Class View Tab */}
      {activeTab === 'class' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Asset Class Comparison
          </h2>
          
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: 'white'
            }}
          >
            <select
              value={selectedClassView}
              onChange={e => setSelectedClassView(e.target.value)}
              style={{
                padding: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
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
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem'
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {selectedClassView} Summary
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Fund Count</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {classSummaries[selectedClassView].fundCount}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Average Score</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {classSummaries[selectedClassView].averageScore}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Benchmark Score</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {classSummaries[selectedClassView].benchmarkScore != null
                          ? classSummaries[selectedClassView].benchmarkScore
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Distribution</div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <span style={{ color: '#16a34a' }}>
                          {classSummaries[selectedClassView].distribution.excellent} excellent
                        </span>
                        <span style={{ color: '#eab308' }}>
                          {classSummaries[selectedClassView].distribution.good} good
                        </span>
                        <span style={{ color: '#dc2626' }}>
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