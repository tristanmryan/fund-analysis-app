// App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { RefreshCw, Settings, Plus, Trash2, LayoutGrid, AlertCircle, TrendingUp, Award, Clock, Database, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getStoredConfig, saveStoredConfig } from './data/storage';
import {
  recommendedFunds as defaultRecommendedFunds,
  assetClassBenchmarks as defaultBenchmarks
} from './data/config';
import {
  calculateScores,
  generateClassSummary,
  identifyReviewCandidates,
  getScoreColor,
  getScoreLabel
} from './services/scoring';
import { applyTagRules } from './services/tagEngine';
import dataStore from './services/dataStore';
import { loadAssetClassMap, lookupAssetClass } from './services/dataLoader';
import parseFundFile from './services/parseFundFile';
import FundScores from './components/Views/FundScores.jsx';
import DashboardView from './components/Views/DashboardView.jsx';
import BenchmarkRow from './components/BenchmarkRow.jsx';
import AppContext from './context/AppContext.jsx';

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
      {score} - {label}
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
  const [benchmarkData, setBenchmarkData] = useState({});
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
    loadAssetClassMap().catch(err => console.error('Error loading asset class map', err));
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
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const parsedFunds = await parseFundFile(jsonData, {
          recommendedFunds,
          assetClassBenchmarks,
        });

        const clean = s => s?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

        const withClassAndFlags = parsedFunds.map(f => {
          const parsedSymbol = clean(f.Symbol);
          const recommendedMatch = recommendedFunds.find(r => clean(r.symbol) === parsedSymbol);

          let isBenchmark = false;
          let benchmarkForClass = null;
          Object.entries(assetClassBenchmarks).forEach(([assetClass, benchmark]) => {
            if (clean(benchmark.ticker) === parsedSymbol) {
              isBenchmark = true;
              benchmarkForClass = assetClass;
            }
          });

          const assetClass = recommendedMatch
            ? recommendedMatch.assetClass
            : benchmarkForClass
              ? benchmarkForClass
              : lookupAssetClass(parsedSymbol);

          return {
            ...f,
            cleanSymbol: parsedSymbol,
            isRecommended: !!recommendedMatch,
            isBenchmark,
            benchmarkForClass,
          };
        });

        const scoredFunds = calculateScores(withClassAndFlags);

        const taggedFunds = applyTagRules(scoredFunds, {
          benchmarks: assetClassBenchmarks,
        });

        const summaries = {};
        const fundsByClass = {};
        taggedFunds.forEach(fund => {
          const assetClass = fund['Asset Class'];
          if (!fundsByClass[assetClass]) {
            fundsByClass[assetClass] = [];
          }
          fundsByClass[assetClass].push(fund);
        });
        Object.entries(fundsByClass).forEach(([assetClass, funds]) => {
          summaries[assetClass] = generateClassSummary(funds);
        });

        const benchmarks = {};
        Object.entries(assetClassBenchmarks).forEach(([assetClass, { ticker, name }]) => {
          const match = taggedFunds.find(f => f.cleanSymbol === clean(ticker));
          if (match) {
            benchmarks[assetClass] = { ...match, name };
          }
        });

        const today = new Date().toISOString().slice(0, 10);

        taggedFunds.forEach(fund => {
          const symbol = fund.cleanSymbol || fund.Symbol || fund.symbol;
          const prev = [];
          historySnapshots.forEach(snap => {
            const match = snap.funds.find(f => (f.cleanSymbol || f.Symbol || f.symbol) === symbol);
            if (match) {
              if (Array.isArray(match.history)) {
                match.history.forEach(pt => {
                  if (!prev.some(p => p.date === pt.date)) prev.push(pt);
                });
              } else if (match.scores?.final != null) {
                if (!prev.some(p => p.date === snap.date)) {
                  prev.push({ date: snap.date, score: match.scores.final });
                }
              }
            }
          });
          const filteredPrev = prev.filter(p => p.date !== today);
          fund.history = [...filteredPrev, { date: today, score: fund.scores.final }];
        });

        const newSnap = {
          date: today,
          funds: taggedFunds,
          metadata: { fileName: file.name }
        };

        setHistorySnapshots(prev => {
          const filtered = prev.filter(s => s.date !== today);
          return [...filtered, newSnap].slice(-24);
        });

        try {
          await dataStore.saveSnapshot(newSnap);
          loadSnapshots();
        } catch (err) {
          console.error('Failed to save snapshot', err);
        }
        setCurrentSnapshotDate(today);
        setFundData(taggedFunds);
        setScoredFundData(taggedFunds);
        setBenchmarkData(benchmarks);
        setClassSummaries(summaries);
        console.log('Successfully loaded and scored', taggedFunds.length, 'funds');
      } catch (err) {
        console.error('Error parsing performance file:', err);
        alert('Error parsing file: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
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
    setBenchmarkData(benchmarks);
  };

  const compareSnapshots = async () => {
    if (!selectedSnapshot || !compareSnapshot) return;
    
    try {
      const comparison = await dataStore.compareSnapshots(selectedSnapshot.id, compareSnapshot.id);
      setSnapshotComparison(comparison);
    } catch (error) {
      console.error('Error comparing snapshots:', error);
      alert('Error comparing snapshots');
    }
  };

  const updateFund = (i, field, value) => {
    const updated = [...recommendedFunds];
    updated[i][field] = value;
    setRecommendedFunds(updated);
  };

  const addFund = () => {
    setRecommendedFunds([...recommendedFunds, { symbol: '', name: '', assetClass: '' }]);
  };

  const removeFund = (i) => {
    const updated = [...recommendedFunds];
    updated.splice(i, 1);
    setRecommendedFunds(updated);
  };

  const updateBenchmark = (className, field, value) => {
    const updated = { ...assetClassBenchmarks };
    updated[className] = { ...updated[className], [field]: value };
    setAssetClassBenchmarks(updated);
    setConfig(updated);
  };


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
                        {classSummaries[selectedClassView].benchmarkScore || 'N/A'}
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
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Symbol</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Score</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>1Y</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>3Y</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>5Y</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Sharpe</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Std Dev</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkData[selectedClassView] && (
                    <BenchmarkRow data={benchmarkData[selectedClassView]} />
                  )}
                  {scoredFundData
                    .filter(f => f['Asset Class'] === selectedClassView && !f.isBenchmark)
                    .sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0))
                    .map((fund, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: fund.isRecommended ? '#eff6ff' : 'white'
                        }}
                      >
                        <td style={{ padding: '0.75rem' }}>
                          {fund.Symbol}
                          {fund.isRecommended && (
                            <span style={{ 
                              marginLeft: '0.5rem',
                              backgroundColor: '#34d399', 
                              color: '#064e3b',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              Rec
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{fund['Fund Name']}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {fund.scores ? (
                            <ScoreBadge score={fund.scores.final} />
                          ) : '-'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {fund['1 Year']?.toFixed(2) ?? 'N/A'}%
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {fund['3 Year']?.toFixed(2) ?? 'N/A'}%
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {fund['5 Year']?.toFixed(2) ?? 'N/A'}%
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {fund['Sharpe Ratio']?.toFixed(2) ?? 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {fund['Standard Deviation']?.toFixed(2) ?? 'N/A'}%
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {fund['Net Expense Ratio']?.toFixed(2) ?? 'N/A'}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Fund Analysis & Review Candidates
          </h2>
          
          {reviewCandidates.length > 0 ? (
            <>
              <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                backgroundColor: '#fef3c7', 
                borderRadius: '0.5rem',
                border: '1px solid #fbbf24'
              }}>
                <p style={{ fontWeight: '500' }}>
                  <AlertCircle size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />
                  {reviewCandidates.length} funds flagged for review
                </p>
              </div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {reviewCandidates.map((fund, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '1rem', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      backgroundColor: fund.isRecommended ? '#fef2f2' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                          {fund['Fund Name']}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {fund.Symbol} | {fund['Asset Class']}
                          {fund.isRecommended && (
                            <span style={{ 
                              marginLeft: '0.5rem',
                              color: '#dc2626',
                              fontWeight: 'bold'
                            }}>
                              (Recommended Fund)
                            </span>
                          )}
                        </p>
                      </div>
                      <ScoreBadge score={fund.scores?.final || 0} size="large" />
                    </div>
                    
                    <div style={{ marginTop: '0.75rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>Review Reasons:</strong>
                      <ul style={{ marginTop: '0.25rem', marginLeft: '1.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
                        {fund.reviewReasons.map((reason, j) => (
                          <li key={j}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div style={{ 
                      marginTop: '0.75rem', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <span style={{ color: '#6b7280' }}>1Y Return:</span>{' '}
                        <strong>{fund['1 Year']?.toFixed(2) ?? 'N/A'}%</strong>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Sharpe:</span>{' '}
                        <strong>{fund['Sharpe Ratio']?.toFixed(2) ?? 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Expense:</span>{' '}
                        <strong>{fund['Net Expense Ratio']?.toFixed(2) ?? 'N/A'}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : scoredFundData.length > 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '0.5rem',
              color: '#16a34a' 
            }}>
              <Award size={48} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                All funds are performing within acceptable parameters!
              </p>
              <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                No funds currently flagged for review.
              </p>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.5rem',
              color: '#6b7280' 
            }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Upload fund performance data to see analysis</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Historical Snapshots
          </h2>
          
          {snapshots.length > 0 ? (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  onClick={loadSnapshots}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {/* Comparison Section */}
              {selectedSnapshot && (
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Compare Snapshots</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Base:</label>
                      <div style={{ fontWeight: '500' }}>
                        {new Date(selectedSnapshot.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Compare to:</label>
                      <select
                        value={compareSnapshot?.id || ''}
                        onChange={(e) => {
                          const snapshot = snapshots.find(s => s.id === e.target.value);
                          setCompareSnapshot(snapshot);
                        }}
                        style={{
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      >
                        <option value="">Select snapshot</option>
                        {snapshots
                          .filter(s => s.id !== selectedSnapshot.id)
                          .map(s => (
                            <option key={s.id} value={s.id}>
                              {new Date(s.date).toLocaleDateString()}
                            </option>
                          ))}
                      </select>
                    </div>
                    {compareSnapshot && (
                      <button
                        onClick={compareSnapshots}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}
                      >
                        Compare
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Comparison Results */}
              {snapshotComparison && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Score Changes: {new Date(snapshotComparison.snapshot1.date).toLocaleDateString()} → {new Date(snapshotComparison.snapshot2.date).toLocaleDateString()}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Symbol</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Fund Name</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center' }}>Old Score</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center' }}>New Score</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center' }}>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {snapshotComparison.changes.map((change, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.5rem' }}>{change.symbol}</td>
                            <td style={{ padding: '0.5rem' }}>{change.fundName}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              {change.type === 'new' ? '-' : change.oldScore}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              {change.type === 'removed' ? '-' : change.newScore}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              {change.type === 'new' ? (
                                <span style={{ color: '#059669' }}>NEW</span>
                              ) : change.type === 'removed' ? (
                                <span style={{ color: '#dc2626' }}>REMOVED</span>
                              ) : (
                                <span style={{ 
                                  color: change.change > 0 ? '#059669' : '#dc2626',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.25rem'
                                }}>
                                  {change.change > 0 ? '↑' : '↓'}
                                  {Math.abs(change.change)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Snapshots List */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      backgroundColor: selectedSnapshot?.id === snapshot.id ? '#eff6ff' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => loadSnapshot(snapshot)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                          <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                          {new Date(snapshot.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {snapshot.metadata.totalFunds} funds • 
                          {snapshot.metadata.recommendedFunds} recommended • 
                          Uploaded {new Date(snapshot.metadata.uploadDate).toLocaleDateString()}
                        </p>
                        {snapshot.metadata.fileName && (
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                            File: {snapshot.metadata.fileName}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {selectedSnapshot?.id === snapshot.id && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            Active
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this snapshot?')) {
                              dataStore.deleteSnapshot(snapshot.id).then(() => {
                                loadSnapshots();
                              });
                            }
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              color: '#6b7280'
            }}>
              <Database size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No historical snapshots found</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Upload fund data and it will be saved automatically
              </p>
            </div>
          )}
        </div>
      )}

      {/* Admin Tab - unchanged from original */}
      {activeTab === 'admin' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Admin Panel</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Recommended Fund List
            </h3>
            <button 
              onClick={addFund} 
              style={{ 
                marginBottom: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={14} /> Add Fund
            </button>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Symbol</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Asset Class</th>
                  <th style={{ padding: '0.5rem', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {recommendedFunds.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        value={f.symbol} 
                        onChange={e => updateFund(i, 'symbol', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        value={f.name} 
                        onChange={e => updateFund(i, 'name', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        value={f.assetClass} 
                        onChange={e => updateFund(i, 'assetClass', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <button 
                        onClick={() => removeFund(i)}
                        style={{
                          padding: '0.25rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Asset Class Benchmarks
            </h3>
            <button 
              onClick={() => {
                const newClass = prompt('Enter new Asset Class name');
                if (!newClass || assetClassBenchmarks[newClass]) return;
                setAssetClassBenchmarks({
                  ...assetClassBenchmarks,
                  [newClass]: { ticker: '', name: '' }
                });
                setConfig({
                  ...assetClassBenchmarks,
                  [newClass]: { ticker: '', name: '' }
                });
              }}
              style={{ 
                marginBottom: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={14} /> Add Asset Class
            </button>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Asset Class</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>ETF Ticker</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Benchmark Name</th>
                  <th style={{ padding: '0.5rem', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(assetClassBenchmarks).map(([className, info], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.5rem', fontWeight: '500' }}>{className}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        value={info.ticker} 
                        onChange={e => updateBenchmark(className, 'ticker', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        value={info.name} 
                        onChange={e => updateBenchmark(className, 'name', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <button 
                        onClick={() => {
                          const copy = { ...assetClassBenchmarks };
                          delete copy[className];
                          setAssetClassBenchmarks(copy);
                          setConfig(copy);
                        }}
                        style={{
                          padding: '0.25rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;