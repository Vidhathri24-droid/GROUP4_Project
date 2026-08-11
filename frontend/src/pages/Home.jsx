import { useEffect, useState } from "react";

import HeroSection from "../components/home/HeroSection";
import StatisticsSection from "../components/home/StatisticsSection";
import TrendingResearchers from "../components/home/TrendingResearchers";
import LatestPublications from "../components/home/LatestPublications";
import TopInstitutions from "../components/home/TopInstitutions";
import UpcomingConferences from "../components/home/UpcomingConferences";
import Footer from "../components/home/Footer";

import { getHomeData } from "../services/homeService";
import { getCollaborationStats } from "../services/collaborationService";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [statistics, setStatistics] = useState(null);
  const [researchers, setResearchers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [collaborationStats, setCollaborationStats] = useState({
    collaborations: 0,
    pending_collaborations: 0,
  });
  useEffect(() => {
    loadHome();
  }, []);

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

  const loadHome = async () => {
    try {
      const data = await getHomeData();

      setStatistics(data.statistics);
      setResearchers(data.top_researchers || []);
      setPublications(data.latest_publications || []);
      setInstitutions(data.top_institutions || []);
      setConferences(data.upcoming_conferences || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <>
      <HeroSection statistics={statistics}/>

      <StatisticsSection
        statistics={statistics}
      />

      <TrendingResearchers
        researchers={researchers}
      />

      <LatestPublications
        publications={publications}
      />

      <TopInstitutions
        institutions={institutions}
      />

      <UpcomingConferences
        conferences={conferences}
      />

      <Footer />
    </>
  );
}
