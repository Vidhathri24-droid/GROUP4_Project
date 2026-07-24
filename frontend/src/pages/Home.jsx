import { useEffect, useState } from "react";

import Hero from "../components/Hero";
import StatsSection from "../components/StatsSection";

import { getHomeAnalytics } from "../services/homeService";

export default function Home() {

    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getHomeAnalytics();
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Hero />

            <StatsSection stats={stats} />
        </>
    );
}
