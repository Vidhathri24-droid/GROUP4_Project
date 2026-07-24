import { useEffect, useState } from "react";

import DashboardStats from "../components/dashboard/DashboardStats";
import QuickActions from "../components/dashboard/QuickActions";

import { getDashboardData } from "../services/dashboardService";

export default function Dashboard() {

    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await getDashboardData();
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container py-5">

            <h1 className="mb-2">
                Dashboard
            </h1>

            <p className="text-muted mb-4">
                Welcome to the Scientific Collaboration Network Analyzer.
            </p>

            <QuickActions />

            <DashboardStats stats={stats} />

        </div>
    );
}
