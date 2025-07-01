import React, { createContext, useState, useMemo } from 'react';
import { assetClassBenchmarks as defaultBenchmarks } from '@/data/config';
import { getAssetClassOptions } from '@/services/dataLoader';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  /* ---------- core data ---------- */
  const [fundData, setFundData] = useState([]);

  /* ---------- filter state ---------- */
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  // store benchmark configuration separately to avoid naming clashes
  const [benchmarksState, setBenchmarksState] = useState(defaultBenchmarks);
  const [snapshots, setSnapshots] = useState([]);

  const toggleTag = tag =>
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const resetFilters = () => {
    setSelectedClass(null);
    setSelectedTags([]);
  };

  /* ---------- derived options ---------- */
  const availableClasses = useMemo(() => getAssetClassOptions(fundData), [fundData]);

  const availableTags = useMemo(
    () => [...new Set(fundData.flatMap(f => f.tags || []))].sort(),
    [fundData]
  );

  /* ---------- context value ---------- */
  const value = useMemo(
    () => ({
      fundData,
      setFundData,
      config: benchmarksState,
      setConfig: setBenchmarksState,
      historySnapshots: snapshots,
      setHistorySnapshots: setSnapshots,
      availableClasses,
      availableTags,
      selectedClass,
      setSelectedClass,
      selectedTags,
      toggleTag,
      resetFilters
    }),
    [fundData, benchmarksState, snapshots, availableClasses, availableTags, selectedClass, selectedTags]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
