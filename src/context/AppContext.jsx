import React, { createContext, useState, useMemo } from 'react';
import { assetClassBenchmarks as defaultBenchmarks } from '../data/config';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [fundData, setFundData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [config, setConfig] = useState(defaultBenchmarks);
  const [historySnapshots, setHistorySnapshots] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setSelectedClass(null);
    setSelectedTags([]);
  };

  const availableClasses = useMemo(
    () =>
      [...new Set(fundData.map((f) => f['Asset Class'] || f.assetClass).filter(Boolean))].sort(),
    [fundData]
  );

  const availableTags = useMemo(
    () => [...new Set(fundData.flatMap((f) => f.tags || []))].sort(),
    [fundData]
  );

  const value = useMemo(
    () => ({
      fundData,
      setFundData,
      config,
      setConfig,
      historySnapshots,
      setHistorySnapshots,
      availableClasses,
      availableTags,
      selectedClass,
      selectedTags,
      setSelectedClass,
      toggleTag,
      resetFilters,
    }),
    [fundData, config, historySnapshots, availableClasses, availableTags, selectedClass, selectedTags]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
