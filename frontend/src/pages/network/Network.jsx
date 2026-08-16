import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";

import {
  getCollaborationNetwork,
  downloadCollaborationCSV,
} from "../../services/collaborationService";

function Network() {
  const navigate = useNavigate();

  const [scope, setScope] = useState("all");

  const [graphData, setGraphData] = useState({
    nodes: [],
    links: [],
  });

  const [statistics, setStatistics] = useState({
    researchers: 0,
    collaborations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // LOAD COLLABORATION NETWORK
  // --------------------------------------------------

  const loadNetwork = async () => {
    try {
      setLoading(true);

      const data = await getCollaborationNetwork(scope);

      const nodes = Array.isArray(data?.nodes)
        ? data.nodes
        : [];

      const links = Array.isArray(data?.links)
        ? data.links
        : [];

      setGraphData({
        nodes,
        links,
      });

      setStatistics({
        researchers:
          data?.statistics?.researchers ?? nodes.length,

        collaborations:
          data?.statistics?.collaborations ?? links.length,
      });
    } catch (error) {
      console.error(
        "Failed to load collaboration network:",
        error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to load collaboration network."
      );

      setGraphData({
        nodes: [],
        links: [],
      });

      setStatistics({
        researchers: 0,
        collaborations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetwork();
  }, [scope]);

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredGraph = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    // No search -> show complete network
    if (!searchText) {
      return {
        nodes: graphData.nodes,
        links: graphData.links,
      };
    }

    // Search researcher by name, first name, last name or email
    const filteredNodes = graphData.nodes.filter((node) => {
      const name = String(node?.name ?? "");
      const firstName = String(node?.first_name ?? "");
      const lastName = String(node?.last_name ?? "");
      const email = String(node?.email ?? "");

      const searchableText = [
        name,
        firstName,
        lastName,
        email,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });

    // Convert IDs to strings so UUID/string mismatches
    // do not break the filtering.
    const filteredNodeIds = new Set(
      filteredNodes.map((node) => String(node.id))
    );

    const filteredLinks = graphData.links.filter((link) => {
      const sourceId =
        typeof link?.source === "object"
          ? link.source?.id
          : link?.source;

      const targetId =
        typeof link?.target === "object"
          ? link.target?.id
          : link?.target;

      return (
        filteredNodeIds.has(String(sourceId)) &&
        filteredNodeIds.has(String(targetId))
      );
    });

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    };
  }, [graphData, search]);

  // --------------------------------------------------
  // CSV DOWNLOAD
  // --------------------------------------------------

  const handleCSVDownload = async () => {
    try {
      await downloadCollaborationCSV(scope);
    } catch (error) {
      console.error(
        "Failed to download collaboration CSV:",
        error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to export collaboration data."
      );
    }
  };

  // --------------------------------------------------
  // CLEAR SEARCH
  // --------------------------------------------------

  const handleClearSearch = () => {
    setSearch("");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="mb-1">
            Research Collaboration Network
          </h2>

          <p className="text-muted mb-0">
            Explore connections between researchers
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

      </div>


      {/* STATISTICS */}

      <div className="row mb-4">

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">

              <h3 className="text-primary">
                {statistics.researchers}
              </h3>

              <p className="mb-0">
                Researchers
              </p>

            </div>
          </div>
        </div>


        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">

              <h3 className="text-success">
                {statistics.collaborations}
              </h3>

              <p className="mb-0">
                Active Collaborations
              </p>

            </div>
          </div>
        </div>

      </div>


      {/* CONTROLS */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <div className="row align-items-end">

            {/* NETWORK SCOPE */}

            <div className="col-md-4 mb-3">

              <label
                htmlFor="networkScope"
                className="form-label"
              >
                Network
              </label>

              <select
                id="networkScope"
                className="form-select"
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setSearch("");
                }}
              >
                <option value="all">
                  All Researchers
                </option>

                <option value="mine">
                  My Collaboration Network
                </option>
              </select>

            </div>


            {/* SEARCH */}

            <div className="col-md-5 mb-3">

              <label
                htmlFor="researcherSearch"
                className="form-label"
              >
                Search Researcher
              </label>

              <div className="input-group">

                <input
                  id="researcherSearch"
                  type="text"
                  className="form-control"
                  placeholder="Search by researcher name..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClearSearch}
                  >
                    Clear
                  </button>
                )}

              </div>

            </div>


            {/* EXPORT */}

            <div className="col-md-3 mb-3">

              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleCSVDownload}
              >
                ↓ Export CSV
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* SEARCH RESULT INFORMATION */}

      {!loading && search.trim() && (
        <div className="alert alert-info">
          Showing{" "}
          <strong>
            {filteredGraph.nodes.length}
          </strong>{" "}
          researcher(s) matching{" "}
          <strong>"{search}"</strong>.
        </div>
      )}


      {/* NETWORK GRAPH */}

      <div className="card shadow-sm">

        <div className="card-header">
          <h5 className="mb-0">
            Collaboration Graph
          </h5>
        </div>


        <div
          className="card-body p-0"
          style={{
            height: "650px",
            position: "relative",
            overflow: "hidden",
          }}
        >

          {/* LOADING */}

          {loading ? (

            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100%" }}
            >
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>

          ) : filteredGraph.nodes.length === 0 ? (

            /* NO DATA */

            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100%" }}
            >

              <div className="text-center">

                <h5>
                  No collaboration data found
                </h5>

                <p className="text-muted mb-0">
                  {search.trim()
                    ? `No researchers found matching "${search}".`
                    : "There are no researchers or collaborations available."}
                </p>

              </div>

            </div>

          ) : (

            /* FORCE GRAPH */

            <ForceGraph2D
              graphData={filteredGraph}

              width={Math.max(
                300,
                Math.min(
                  window.innerWidth - 50,
                  1200
                )
              )}

              height={650}

              nodeId="id"

              nodeLabel={(node) =>
                node.name ||
                `${node.first_name || ""} ${
                  node.last_name || ""
                }`.trim() ||
                "Researcher"
              }

              nodeAutoColorBy="id"

              nodeRelSize={7}

              linkWidth={2}

              linkColor={() => "#999999"}

              linkDirectionalParticles={2}

              linkDirectionalParticleSpeed={0.005}

              cooldownTicks={100}

              d3VelocityDecay={0.3}

              onNodeClick={(node) => {
                console.log(
                  "Selected researcher:",
                  node
                );
              }}

              nodeCanvasObject={(
                node,
                ctx,
                globalScale
              ) => {

                const label =
                  node.name ||
                  `${node.first_name || ""} ${
                    node.last_name || ""
                  }`.trim() ||
                  "Researcher";

                const fontSize = Math.max(
                  8,
                  12 / globalScale
                );

                const radius = 7;

                // Node
                ctx.beginPath();

                ctx.arc(
                  node.x,
                  node.y,
                  radius,
                  0,
                  2 * Math.PI
                );

                ctx.fillStyle = "#0d6efd";
                ctx.fill();

                // Label
                ctx.font =
                  `${fontSize}px Sans-Serif`;

                ctx.textAlign = "center";
                ctx.textBaseline = "top";

                ctx.fillStyle = "#212529";

                ctx.fillText(
                  label,
                  node.x,
                  node.y + radius + 3
                );
              }}

              nodePointerAreaPaint={(
                node,
                color,
                ctx
              ) => {

                ctx.fillStyle = color;

                ctx.beginPath();

                ctx.arc(
                  node.x,
                  node.y,
                  10,
                  0,
                  2 * Math.PI
                );

                ctx.fill();
              }}
            />

          )}

        </div>

      </div>


      {/* LEGEND */}

      <div className="card shadow-sm mt-4">

        <div className="card-body">

          <h6>
            How to use the network
          </h6>

          <ul className="mb-0">

            <li>
              Drag nodes to explore the network.
            </li>

            <li>
              Scroll to zoom in or out.
            </li>

            <li>
              Each node represents a researcher.
            </li>

            <li>
              Each connection represents an active
              collaboration.
            </li>

            <li>
              Use the search box to filter researchers.
            </li>

            <li>
              Use "My Collaboration Network" to
              see only your connections.
            </li>

          </ul>

        </div>

      </div>

    </div>
  );
}

export default Network;