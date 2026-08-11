import { useEffect, useState } from "react";

import DashboardStats from "../components/dashboard/DashboardStats";
import QuickActions from "../components/dashboard/QuickActions";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DashboardCollaborations from "../components/dashboard/DashboardCollaborations";
import {
  getDashboardStats,
  getPublicationsPerYear,
  getPublicationTypes,
} from "../services/dashboardService";
import { getCollaborationStats } from "../services/collaborationService";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  const [yearlyData, setYearlyData] = useState([]);

  const [publicationTypes, setPublicationTypes] =
    useState([]);
  const [collaborationStats, setCollaborationStats] = useState({
    collaborations: 0,
    pending_collaborations: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        statsData,
        yearly,
        types,
      ] = await Promise.all([
        getDashboardStats(),
        getPublicationsPerYear(),
        getPublicationTypes(),
      ]);

      setStats(statsData);
      setYearlyData(yearly);
      setPublicationTypes(types);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadCollaborationStats = async () => {
      try {
        const data = await getCollaborationStats();

        setCollaborationStats({
          collaborations: data.collaborations ?? 0,
          pending_collaborations:
            data.pending_collaborations ?? 0,
        });
      } catch (error) {
        console.error(
          "Failed to load collaboration statistics:",
          error
        );
      }
    };

    loadCollaborationStats();
  }, []);

  return (
    <div className="container py-5">

      <h1 className="mb-2">
        Dashboard
      </h1>

      <p className="text-muted mb-4">
        Welcome to the Scientific Collaboration Network Analyzer.
      </p>

      <QuickActions />

      <DashboardStats stats={stats} 
        collaborationStats={collaborationStats}
      />

      <DashboardCharts
        yearlyData={yearlyData}
        publicationTypes={publicationTypes}
      />

      <DashboardCollaborations />
    </div>
  );
}
