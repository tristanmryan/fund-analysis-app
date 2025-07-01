import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { saveStoredConfig } from '@/data/storage';
import { isValidTicker } from '@/data/validators';

const FormErrorMessage = ({ children }) => (
  <p className="mt-1 text-sm text-red-600" role="alert">
    {children}
  </p>
);

const Toast = ({ type = 'info', children }) => {
  const classes =
    type === 'success'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  return (
    <div data-testid="toast" className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow ${classes}`}>
      {children}
    </div>
  );
};

const ErrorModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 w-[300px] text-center">
      <p className="mb-4">{message}</p>
      <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded-md">
        Close
      </button>
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
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      {toast && <Toast type="success">{toast}</Toast>}
      {error && <ErrorModal message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit(onAddFund)} className="mb-6 flex flex-wrap gap-2">
        <div className="flex flex-col">
          <label htmlFor="ticker">Ticker</label>
          <input id="ticker" aria-label="Ticker" {...register('ticker', { required: 'Ticker required', validate: v => isValidTicker(v) || 'Invalid ticker' })} className="p-1 border border-gray-300 rounded" />
          {errors.ticker && <FormErrorMessage>{errors.ticker.message}</FormErrorMessage>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="name">Name</label>
          <input id="name" aria-label="Name" {...register('name')} className="p-1 border border-gray-300 rounded" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="assetClass">Asset Class</label>
          <input id="assetClass" aria-label="Asset Class" {...register('assetClass', { required: 'Asset Class required' })} className="p-1 border border-gray-300 rounded" />
          {errors.assetClass && <FormErrorMessage>{errors.assetClass.message}</FormErrorMessage>}
        </div>
        <button type="submit" className="self-end px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer flex items-center gap-1">
          <Plus size={14} /> Add Fund
        </button>
      </form>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">Recommended Fund List</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="p-2 text-left">Symbol</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Asset Class</th>
              <th className="p-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {recommendedFunds.map((f,i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="p-2">
                  <input value={f.symbol} onChange={e => updateFund(i,'symbol', e.target.value)} className="w-full p-1 border border-gray-300 rounded" />
                </td>
                <td className="p-2">
                  <input value={f.name} onChange={e => updateFund(i,'name', e.target.value)} className="w-full p-1 border border-gray-300 rounded" />
                </td>
                <td className="p-2">
                  <input value={f.assetClass} onChange={e => updateFund(i,'assetClass', e.target.value)} className="w-full p-1 border border-gray-300 rounded" />
                </td>
                <td className="p-2">
                  <button onClick={() => removeFund(i)} className="p-1 bg-red-500 text-white rounded">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-2">Asset Class Benchmarks</h3>
        <button onClick={addAssetClass} className="mb-2 px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2">
          <Plus size={14} /> Add Asset Class
        </button>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="p-2 text-left">Asset Class</th>
              <th className="p-2 text-left">ETF Ticker</th>
              <th className="p-2 text-left">Benchmark Name</th>
              <th className="p-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(assetClassBenchmarks).map(([cls, info],i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="p-2 font-medium">{cls}</td>
                <td className="p-2">
                  <input value={info.ticker} onChange={e => updateBenchmark(cls,'ticker', e.target.value)} className="w-full p-1 border border-gray-300 rounded" />
                </td>
                <td className="p-2">
                  <input value={info.name} onChange={e => updateBenchmark(cls,'name', e.target.value)} className="w-full p-1 border border-gray-300 rounded" />
                </td>
                <td className="p-2">
                  <button onClick={() => { const copy={...assetClassBenchmarks}; delete copy[cls]; setAssetClassBenchmarks(copy); setConfig(copy); commitConfig(recommendedFunds, copy); }} className="p-1 bg-red-500 text-white rounded">
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
