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

  const loadHome = async () => {
    try {
      setLoading(true);

      /*
       * Load normal Home data and collaboration data together.
       */
      const [homeData, collaborationData] =
        await Promise.all([
          getHomeData(),
          getCollaborationStats(),
        ]);

      console.log("Home data:", homeData);
      console.log(
        "Collaboration data:",
        collaborationData
      );

      /*
       * ----------------------------------------------------
       * NORMAL HOME DATA
       * ----------------------------------------------------
       */

      const homeStatistics = homeData?.statistics || {};

      setResearchers(
        homeData?.trending_researchers || []
      );

      setPublications(
        homeData?.latest_publications || []
      );

      setInstitutions(
        homeData?.top_institutions || []
      );

      setConferences(
        homeData?.upcoming_conferences || []
      );

      /*
       * ----------------------------------------------------
       * COLLABORATION DATA
       * ----------------------------------------------------
       *
       * The backend may expose accepted collaborations using
       * different field names.
       *
       * IMPORTANT:
       * We check "accepted" BEFORE "collaborations".
       *
       * This prevents a response such as:
       *
       * {
       *   collaborations: 0,
       *   accepted: 9
       * }
       *
       * from incorrectly displaying 0.
       */

      const acceptedCollaborations =
        collaborationData?.accepted ??
        collaborationData?.accepted_collaborations ??
        collaborationData?.collaborations ??
        collaborationData?.total_collaborations ??
        0;

      const pendingCollaborations =
        collaborationData?.pending_collaborations ??
        collaborationData?.pending ??
        collaborationData?.pending_requests ??
        0;

      const normalizedCollaborationStats = {
        collaborations:
          Number(acceptedCollaborations) || 0,

        pending_collaborations:
          Number(pendingCollaborations) || 0,
      };

      console.log(
        "Normalized collaboration statistics:",
        normalizedCollaborationStats
      );

      setCollaborationStats(
        normalizedCollaborationStats
      );

      /*
       * ----------------------------------------------------
       * MERGE COLLABORATION DATA INTO HOME STATISTICS
       * ----------------------------------------------------
       *
       * This makes the collaboration values available to
       * StatisticsSection even if that component only accepts
       * a "statistics" prop.
       */

      setStatistics({
        ...homeStatistics,

        collaborations:
          normalizedCollaborationStats.collaborations,

        pending_collaborations:
          normalizedCollaborationStats.pending_collaborations,
      });

    } catch (error) {
      console.error(
        "Failed to load home page data:",
        error
      );

      /*
       * Keep the Home page usable even if the collaboration
       * endpoint fails.
       */

      setStatistics((previous) => ({
        ...(previous || {}),
        collaborations: 0,
        pending_collaborations: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  /*
   * --------------------------------------------------------
   * LOADING STATE
   * --------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <h3 className="mt-3">
          Loading...
        </h3>
      </div>
    );
  }

  /*
   * --------------------------------------------------------
   * PAGE
   * --------------------------------------------------------
   */

  return (
    <>
      <HeroSection
        statistics={statistics}
      />

      <StatisticsSection
        statistics={statistics}
        collaborationStats={collaborationStats}
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