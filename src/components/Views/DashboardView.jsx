import React, { useContext } from 'react';
import AssetClassOverview from '@/components/Dashboard/AssetClassOverview.jsx';
import AppContext from '@/context/AppContext.jsx';

const DashboardView = () => {
  const { fundData, config } = useContext(AppContext);

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Dashboard Overview
      </h2>

      <AssetClassOverview funds={fundData} config={config} />
    </div>
  );
};

export default DashboardView;
