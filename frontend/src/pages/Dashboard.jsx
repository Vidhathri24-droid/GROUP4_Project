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

import "./Dashboard.css";

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
    try {
      setLoading(true);

      const [statsData, yearly, types] = await Promise.all([
        getDashboardStats(),
        getPublicationsPerYear(),
        getPublicationTypes(),
      ]);

      setStats(statsData);
      setYearlyData(yearly);
      setPublicationTypes(types);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
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
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* =========================
            PAGE HEADER
        ========================== */}
        <section className="dashboard-header">
          <div>
            <div className="dashboard-eyebrow">
              SCNA · RESEARCH NETWORK
            </div>

            <h1 className="dashboard-title">
              Dashboard
            </h1>

            <p className="dashboard-subtitle">
              Overview of your scientific research network,
              publications and collaborations.
            </p>
          </div>

          <div className="dashboard-header-badge">
            <span className="dashboard-status-dot"></span>
            Network Overview
          </div>
        </section>

        {/* =========================
            QUICK ACTIONS
        ========================== */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-label">
                ACTIONS
              </span>

              <h2>Quick Actions</h2>

              <p>
                Create and manage research network resources.
              </p>
            </div>
          </div>

          <div className="dashboard-panel dashboard-actions-panel">
            <QuickActions />
          </div>
        </section>

        {/* =========================
            STATISTICS
        ========================== */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-label">
                NETWORK OVERVIEW
              </span>

              <h2>Research Statistics</h2>

              <p>
                A snapshot of activity across the collaboration
                network.
              </p>
            </div>
          </div>

          <div className="dashboard-stats-wrapper">
            {loading ? (
              <div className="dashboard-loading">
                <div className="dashboard-spinner"></div>
                <span>Loading statistics...</span>
              </div>
            ) : (
              <DashboardStats
                stats={stats}
                collaborationStats={collaborationStats}
              />
            )}
          </div>
        </section>

        {/* =========================
            ANALYTICS
        ========================== */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-label">
                ANALYTICS
              </span>

              <h2>Research Insights</h2>

              <p>
                Explore publication trends and research output.
              </p>
            </div>
          </div>

          <div className="dashboard-panel dashboard-charts-panel">
            <DashboardCharts
              yearlyData={yearlyData}
              publicationTypes={publicationTypes}
            />
          </div>
        </section>

        {/* =========================
            COLLABORATIONS
        ========================== */}
        <section className="dashboard-section dashboard-last-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-label">
                COLLABORATION
              </span>

              <h2>Research Collaborations</h2>

              <p>
                Track collaboration activity and requests.
              </p>
            </div>
          </div>

          <div className="dashboard-panel">
            <DashboardCollaborations />
          </div>
        </section>

      </div>
    </main>
  );
}