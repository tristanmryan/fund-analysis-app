import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { saveStoredConfig } from '../data/storage';
import { isValidTicker } from '../data/validators';

const FormErrorMessage = ({ children }) => (
  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }} role="alert">
    {children}
  </p>
);

const Toast = ({ type = 'info', children }) => {
  const bg = type === 'success' ? '#d1fae5' : '#fee2e2';
  const color = type === 'success' ? '#065f46' : '#7f1d1d';
  return (
    <div
      data-testid="toast"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        background: bg,
        color,
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </div>
  );
};

const ErrorModal = ({ message, onClose }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 }}>
    <div style={{ background:'#fff', borderRadius:'0.5rem', padding:'1.5rem', width:'300px', textAlign:'center' }}>
      <p style={{ marginBottom:'1rem' }}>{message}</p>
      <button onClick={onClose} style={{ padding:'0.5rem 1rem', background:'#dc2626', color:'#fff', border:'none', borderRadius:'0.375rem', cursor:'pointer' }}>Close</button>
    </div>
  </div>
);

const AdminPanel = ({ recommendedFunds, setRecommendedFunds, assetClassBenchmarks, setAssetClassBenchmarks, setConfig }) => {
  const { register, handleSubmit, reset, formState:{ errors } } = useForm();
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const commitConfig = async (funds, benchmarks) => {
    try {
      await saveStoredConfig(funds, benchmarks);
    } catch (err) {
      setError('Failed to save configuration');
    }
  };

  const onAddFund = async data => {
    const fund = {
      symbol: data.ticker.trim().toUpperCase(),
      name: data.name.trim(),
      assetClass: data.assetClass.trim()
    };
    const updated = [...recommendedFunds, fund];
    setRecommendedFunds(updated);
    await commitConfig(updated, assetClassBenchmarks);
    setToast('Fund added.');
    setTimeout(() => setToast(''), 3000);
    reset();
  };

  const updateFund = (i, field, value) => {
    const updated = [...recommendedFunds];
    updated[i][field] = value;
    setRecommendedFunds(updated);
    commitConfig(updated, assetClassBenchmarks);
  };

  const removeFund = i => {
    const updated = [...recommendedFunds];
    updated.splice(i, 1);
    setRecommendedFunds(updated);
    commitConfig(updated, assetClassBenchmarks);
  };

  const updateBenchmark = (className, field, value) => {
    const updated = { ...assetClassBenchmarks };
    updated[className] = { ...updated[className], [field]: value };
    setAssetClassBenchmarks(updated);
    setConfig(updated);
    commitConfig(recommendedFunds, updated);
  };

  const addAssetClass = () => {
    const newClass = prompt('Enter new Asset Class name');
    if (!newClass || assetClassBenchmarks[newClass]) return;
    const updated = { ...assetClassBenchmarks, [newClass]: { ticker: '', name: '' } };
    setAssetClassBenchmarks(updated);
    setConfig(updated);
    commitConfig(recommendedFunds, updated);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Admin Panel</h2>
      {toast && <Toast type="success">{toast}</Toast>}
      {error && <ErrorModal message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit(onAddFund)} style={{ marginBottom: '1.5rem', display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <label htmlFor="ticker">Ticker</label>
          <input id="ticker" aria-label="Ticker" {...register('ticker', { required: 'Ticker required', validate: v => isValidTicker(v) || 'Invalid ticker' })} style={{ padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
          {errors.ticker && <FormErrorMessage>{errors.ticker.message}</FormErrorMessage>}
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <label htmlFor="name">Name</label>
          <input id="name" aria-label="Name" {...register('name')} style={{ padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <label htmlFor="assetClass">Asset Class</label>
          <input id="assetClass" aria-label="Asset Class" {...register('assetClass', { required: 'Asset Class required' })} style={{ padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
          {errors.assetClass && <FormErrorMessage>{errors.assetClass.message}</FormErrorMessage>}
        </div>
        <button type="submit" style={{ alignSelf:'flex-end', padding:'0.5rem 1rem', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'0.375rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.25rem' }}>
          <Plus size={14} /> Add Fund
        </button>
      </form>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom:'0.5rem' }}>Recommended Fund List</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #e5e7eb' }}>
              <th style={{ padding:'0.5rem', textAlign:'left' }}>Symbol</th>
              <th style={{ padding:'0.5rem', textAlign:'left' }}>Name</th>
              <th style={{ padding:'0.5rem', textAlign:'left' }}>Asset Class</th>
              <th style={{ padding:'0.5rem', width:'50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {recommendedFunds.map((f,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f3f4f6' }}>
                <td style={{ padding:'0.5rem' }}>
                  <input value={f.symbol} onChange={e => updateFund(i,'symbol', e.target.value)} style={{ width:'100%', padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
                </td>
                <td style={{ padding:'0.5rem' }}>
                  <input value={f.name} onChange={e => updateFund(i,'name', e.target.value)} style={{ width:'100%', padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
                </td>
                <td style={{ padding:'0.5rem' }}>
                  <input value={f.assetClass} onChange={e => updateFund(i,'assetClass', e.target.value)} style={{ width:'100%', padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
                </td>
                <td style={{ padding:'0.5rem' }}>
                  <button onClick={() => removeFund(i)} style={{ padding:'0.25rem', background:'#ef4444', color:'white', border:'none', borderRadius:'0.25rem', cursor:'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom:'0.5rem' }}>Asset Class Benchmarks</h3>
        <button onClick={addAssetClass} style={{ marginBottom:'0.5rem', padding:'0.5rem 1rem', background:'#3b82f6', color:'white', border:'none', borderRadius:'0.375rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Plus size={14} /> Add Asset Class
        </button>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #e5e7eb' }}>
              <th style={{ padding:'0.5rem', textAlign:'left' }}>Asset Class</th>
              <th style={{ padding:'0.5rem', textAlign:'left' }}>ETF Ticker</th>
              <th style={{ padding:'0.5rem', textAlign:'left' }}>Benchmark Name</th>
              <th style={{ padding:'0.5rem', width:'50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(assetClassBenchmarks).map(([cls, info],i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f3f4f6' }}>
                <td style={{ padding:'0.5rem', fontWeight:'500' }}>{cls}</td>
                <td style={{ padding:'0.5rem' }}>
                  <input value={info.ticker} onChange={e => updateBenchmark(cls,'ticker', e.target.value)} style={{ width:'100%', padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
                </td>
                <td style={{ padding:'0.5rem' }}>
                  <input value={info.name} onChange={e => updateBenchmark(cls,'name', e.target.value)} style={{ width:'100%', padding:'0.25rem', border:'1px solid #d1d5db', borderRadius:'0.25rem' }} />
                </td>
                <td style={{ padding:'0.5rem' }}>
                  <button onClick={() => { const copy={...assetClassBenchmarks}; delete copy[cls]; setAssetClassBenchmarks(copy); setConfig(copy); commitConfig(recommendedFunds, copy); }} style={{ padding:'0.25rem', background:'#ef4444', color:'white', border:'none', borderRadius:'0.25rem', cursor:'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
