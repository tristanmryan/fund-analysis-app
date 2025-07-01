import React, { useContext } from 'react';
import AssetClassOverview from '@/components/Dashboard/AssetClassOverview.jsx';
import AppContext from '@/context/AppContext.jsx';

const DashboardView = () => {
  const { fundData, config } = useContext(AppContext);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Dashboard Overview
      </h2>

      <AssetClassOverview funds={fundData} config={config} />
    </div>
  );
};

export default DashboardView;
