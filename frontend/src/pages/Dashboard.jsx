import { useEffect, useState } from "react";

import DashboardStats from "../components/dashboard/DashboardStats";
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
  const [publicationTypes, setPublicationTypes] = useState([]);

  const [collaborationStats, setCollaborationStats] = useState({
    collaborations: 0,
    pending_collaborations: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      /*
       * Load dashboard statistics,
       * publication charts and collaboration data.
       */
      const [
        statsData,
        yearly,
        types,
        collaborationData,
      ] = await Promise.all([
        getDashboardStats(),
        getPublicationsPerYear(),
        getPublicationTypes(),
        getCollaborationStats(),
      ]);

      console.log("Dashboard stats:", statsData);
      console.log("Collaboration stats:", collaborationData);

      setStats(statsData);
      setYearlyData(yearly || []);
      setPublicationTypes(types || []);

      /*
       * Handle the different possible names
       * returned by the backend.
       */
      const collaborations =
        collaborationData?.collaborations ??
        collaborationData?.accepted_collaborations ??
        collaborationData?.accepted ??
        collaborationData?.total_collaborations ??
        0;

      const pending =
        collaborationData?.pending_collaborations ??
        collaborationData?.pending ??
        collaborationData?.pending_requests ??
        0;

      setCollaborationStats({
        collaborations: Number(collaborations) || 0,
        pending_collaborations: Number(pending) || 0,
      });

    } catch (error) {
      console.error("Failed to load dashboard:", error);

      /*
       * Don't break the dashboard if collaboration
       * statistics fail.
       */
      setCollaborationStats({
        collaborations: 0,
        pending_collaborations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container py-5">

        {/* Header */}
        <div className="dashboard-header mb-4">
          <h1>Dashboard</h1>

          <p className="text-muted">
            Welcome to the Scientific Collaboration Network Analyzer.
          </p>
        </div>

        {/* Statistics */}
        <DashboardStats
          stats={stats}
          collaborationStats={collaborationStats}
        />

        {/* Charts */}
        <DashboardCharts
          yearlyData={yearlyData}
          publicationTypes={publicationTypes}
        />

        {/* Collaboration information */}
        <DashboardCollaborations />

      </div>
    </div>
  );
}