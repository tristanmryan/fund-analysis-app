import React, { createContext, useState, useMemo } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [fundData, setFundData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

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
      availableClasses,
      availableTags,
      selectedClass,
      selectedTags,
      setSelectedClass,
      toggleTag,
      resetFilters,
    }),
    [fundData, availableClasses, availableTags, selectedClass, selectedTags]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
