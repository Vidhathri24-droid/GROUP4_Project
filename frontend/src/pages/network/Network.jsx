import { useEffect, useState } from "react";
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

  const loadNetwork = async () => {
    try {
      setLoading(true);

      const data = await getCollaborationNetwork(scope);

      setGraphData({
        nodes: data.nodes || [],
        links: data.links || [],
      });

      setStatistics(
        data.statistics || {
          researchers: 0,
          collaborations: 0,
        }
      );

    } catch (error) {
      console.error(
        "Failed to load collaboration network:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Unable to load collaboration network."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadNetwork();
  }, [scope]);


  const filteredNodes = graphData.nodes.filter(
    (node) =>
      node.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );


  const filteredNodeIds = new Set(
    filteredNodes.map((node) => node.id)
  );


  const filteredLinks = graphData.links.filter(
    (link) =>
      filteredNodeIds.has(
        typeof link.source === "object"
          ? link.source.id
          : link.source
      ) &&
      filteredNodeIds.has(
        typeof link.target === "object"
          ? link.target.id
          : link.target
      )
  );


  const filteredGraph = {
    nodes: filteredNodes,
    links: filteredLinks,
  };


  const handleCSVDownload = async () => {
    try {
      await downloadCollaborationCSV(scope);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Unable to export collaboration data."
      );
    }
  };


  return (
    <div className="container py-4">

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
          className="btn btn-outline-primary"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

      </div>


      {/* STATISTICS */}

      <div className="row mb-4">

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
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
          <div className="card shadow-sm">
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

            <div className="col-md-4 mb-3">

              <label className="form-label">
                Network
              </label>

              <select
                className="form-select"
                value={scope}
                onChange={(e) =>
                  setScope(e.target.value)
                }
              >

                <option value="all">
                  All Researchers
                </option>

                <option value="mine">
                  My Collaboration Network
                </option>

              </select>

            </div>


            <div className="col-md-5 mb-3">

              <label className="form-label">
                Search Researcher
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search researcher..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <div className="col-md-3 mb-3">

              <button
                className="btn btn-success w-100"
                onClick={handleCSVDownload}
              >
                ↓ Export CSV
              </button>

            </div>

          </div>

        </div>

      </div>


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
          }}
        >

          {loading ? (

            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100%" }}
            >

              <div
                className="spinner-border text-primary"
                role="status"
              />

            </div>

          ) : filteredGraph.nodes.length === 0 ? (

            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100%" }}
            >

              <div className="text-center">

                <h5>
                  No collaboration data found
                </h5>

                <p className="text-muted">
                  There are no researchers or
                  collaborations matching your search.
                </p>

              </div>

            </div>

          ) : (

            <ForceGraph2D
              graphData={filteredGraph}
              width={window.innerWidth > 1200 ? 1100 : 800}
              height={650}

              nodeLabel={(node) =>
                node.name
              }

              nodeAutoColorBy="id"

              nodeRelSize={7}

              linkDirectionalParticles={2}

              linkDirectionalParticleSpeed={0.005}

              linkWidth={2}

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
                  node.name || "Researcher";

                const fontSize =
                  12 / globalScale;

                ctx.font =
                  `${fontSize}px Sans-Serif`;

                ctx.textAlign = "center";

                ctx.textBaseline =
                  "middle";

                ctx.beginPath();

                ctx.arc(
                  node.x,
                  node.y,
                  7,
                  0,
                  2 * Math.PI
                );

                ctx.fillStyle =
                  "#0d6efd";

                ctx.fill();

                ctx.fillStyle =
                  "#212529";

                ctx.fillText(
                  label,
                  node.x,
                  node.y + 14
                );

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