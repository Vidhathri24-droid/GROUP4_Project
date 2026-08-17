import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";

import {
  getCollaborationNetwork,
  downloadCollaborationCSV,
} from "../../services/collaborationService";

function Network() {
  const navigate = useNavigate();

  // ============================================================
  // GRAPH REFERENCES
  // ============================================================

  const graphRef = useRef(null);
  const graphContainerRef = useRef(null);

  // ============================================================
  // STATE
  // ============================================================

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
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const [graphWidth, setGraphWidth] = useState(1000);

  // ============================================================
  // RESPONSIVE GRAPH WIDTH
  // ============================================================

  useEffect(() => {
    const updateWidth = () => {
      if (graphContainerRef.current) {
        setGraphWidth(
          Math.max(
            400,
            graphContainerRef.current.clientWidth
          )
        );
      }
    };

    updateWidth();

    let observer;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateWidth);

      if (graphContainerRef.current) {
        observer.observe(graphContainerRef.current);
      }
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      if (observer) {
        observer.disconnect();
      }

      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // ============================================================
  // LOAD COLLABORATION NETWORK
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadNetwork = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedNode(null);

        const data = await getCollaborationNetwork(scope);

        if (cancelled) {
          return;
        }

        const nodes = Array.isArray(data?.nodes)
          ? data.nodes
          : [];

        const links = Array.isArray(data?.links)
          ? data.links
          : Array.isArray(data?.edges)
            ? data.edges
            : [];

        setGraphData({
          nodes,
          links,
        });

        setStatistics({
          researchers:
            data?.statistics?.researchers ??
            data?.total_researchers ??
            nodes.length,

          collaborations:
            data?.statistics?.collaborations ??
            data?.total_collaborations ??
            links.length,
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load collaboration network:",
          err
        );

        setError(
          err?.response?.data?.detail ||
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadNetwork();

    return () => {
      cancelled = true;
    };
  }, [scope]);

  // ============================================================
  // CALCULATE NODE DEGREES
  // ============================================================

  const nodeDegrees = useMemo(() => {
    const degrees = new Map();

    graphData.nodes.forEach((node) => {
      degrees.set(String(node.id), 0);
    });

    graphData.links.forEach((link) => {
      const sourceId =
        typeof link.source === "object"
          ? link.source?.id
          : link.source;

      const targetId =
        typeof link.target === "object"
          ? link.target?.id
          : link.target;

      degrees.set(
        String(sourceId),
        (degrees.get(String(sourceId)) || 0) + 1
      );

      degrees.set(
        String(targetId),
        (degrees.get(String(targetId)) || 0) + 1
      );
    });

    return degrees;
  }, [graphData]);

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const filteredGraph = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return graphData;
    }

    const matchingNodes = graphData.nodes.filter((node) => {
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

      return searchableText.includes(query);
    });

    const matchingIds = new Set(
      matchingNodes.map((node) => String(node.id))
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
        matchingIds.has(String(sourceId)) &&
        matchingIds.has(String(targetId))
      );
    });

    return {
      nodes: matchingNodes,
      links: filteredLinks,
    };
  }, [graphData, search]);

  // ============================================================
  // SELECTED NODE CONNECTIONS
  // ============================================================

  const selectedConnections = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    const selectedId = String(selectedNode.id);
    const connectedIds = new Set();

    graphData.links.forEach((link) => {
      const sourceId =
        typeof link.source === "object"
          ? link.source?.id
          : link.source;

      const targetId =
        typeof link.target === "object"
          ? link.target?.id
          : link.target;

      if (String(sourceId) === selectedId) {
        connectedIds.add(String(targetId));
      }

      if (String(targetId) === selectedId) {
        connectedIds.add(String(sourceId));
      }
    });

    return graphData.nodes.filter((node) =>
      connectedIds.has(String(node.id))
    );
  }, [selectedNode, graphData]);

  // ============================================================
  // CSV EXPORT
  // ============================================================

  const handleCSVExport = async () => {
    try {
      if (typeof downloadCollaborationCSV === "function") {
        await downloadCollaborationCSV(scope);
        return;
      }

      // Fallback CSV generation if the service function
      // is not available.

      if (graphData.nodes.length === 0) {
        return;
      }

      const nodeMap = new Map(
        graphData.nodes.map((node) => [
          String(node.id),
          node,
        ])
      );

      const rows = [];

      rows.push([
        "Researcher 1",
        "Researcher 1 ID",
        "Researcher 2",
        "Researcher 2 ID",
        "Collaboration Type",
        "Status",
      ]);

      graphData.links.forEach((link) => {
        const sourceId =
          typeof link.source === "object"
            ? link.source?.id
            : link.source;

        const targetId =
          typeof link.target === "object"
            ? link.target?.id
            : link.target;

        const source = nodeMap.get(String(sourceId));
        const target = nodeMap.get(String(targetId));

        if (!source || !target) {
          return;
        }

        rows.push([
          source.name || "",
          source.id || "",
          target.name || "",
          target.id || "",
          link.collaboration_type || "",
          link.status || "Accepted",
        ]);
      });

      if (graphData.links.length === 0) {
        graphData.nodes.forEach((node) => {
          rows.push([
            node.name || "",
            node.id || "",
            "",
            "",
            "",
            "No accepted collaboration",
          ]);
        });
      }

      const csv = rows
        .map((row) =>
          row
            .map((value) => {
              const text = String(value ?? "");
              return `"${text.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `scna_collaboration_network_${scope}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Failed to download collaboration CSV:",
        err
      );

      alert(
        err?.response?.data?.detail ||
          "Unable to export collaboration data."
      );
    }
  };

  // ============================================================
  // NODE CLICK
  // ============================================================

  const handleNodeClick = (node) => {
    setSelectedNode(node);

    if (graphRef.current && node.x != null && node.y != null) {
      graphRef.current.centerAt(
        node.x,
        node.y,
        700
      );

      graphRef.current.zoom(2.2, 700);
    }
  };

  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  const handleClearSearch = () => {
    setSearch("");
  };

  // ============================================================
  // GRAPH CONTROLS
  // ============================================================

  const zoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();

      graphRef.current.zoom(
        currentZoom * 1.4,
        400
      );
    }
  };

  const zoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();

      graphRef.current.zoom(
        currentZoom / 1.4,
        400
      );
    }
  };

  const centerGraph = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(
        700,
        60
      );
    }
  };

  const resetGraph = () => {
    setSearch("");
    setSelectedNode(null);
    setHoveredNode(null);

    if (graphRef.current) {
      graphRef.current.zoomToFit(
        700,
        60
      );
    }
  };

  // ============================================================
  // GET NODE COLOR
  // ============================================================

  const getNodeColor = (node) => {
    const degree =
      nodeDegrees.get(String(node.id)) || 0;

    if (
      selectedNode &&
      String(selectedNode.id) === String(node.id)
    ) {
      return "#dc3545";
    }

    if (
      hoveredNode &&
      String(hoveredNode.id) === String(node.id)
    ) {
      return "#198754";
    }

    if (degree >= 3) {
      return "#6f42c1";
    }

    if (degree >= 1) {
      return "#0d6efd";
    }

    return "#adb5bd";
  };

  // ============================================================
  // CHECK NODE CONNECTION
  // ============================================================

  const isConnectedToSelected = (node) => {
    if (!selectedNode) {
      return false;
    }

    const selectedId = String(selectedNode.id);
    const nodeId = String(node.id);

    return graphData.links.some((link) => {
      const sourceId =
        typeof link.source === "object"
          ? link.source?.id
          : link.source;

      const targetId =
        typeof link.target === "object"
          ? link.target?.id
          : link.target;

      return (
        (String(sourceId) === selectedId &&
          String(targetId) === nodeId) ||
        (String(targetId) === selectedId &&
          String(sourceId) === nodeId)
      );
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="container-fluid px-4 py-4">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

        <div>
          <div className="d-flex align-items-center gap-2">

            <h2 className="mb-0">
              Collaboration Network
            </h2>

            <span className="badge bg-primary">
              SCNA
            </span>

          </div>

          <p className="text-muted mb-0 mt-1">
            Explore research connections and collaboration patterns.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                RESEARCHERS
              </div>

              <div className="d-flex align-items-end gap-2">

                <div className="display-6 fw-bold text-primary">
                  {statistics.researchers}
                </div>

                <span className="text-muted mb-2">
                  in network
                </span>

              </div>

            </div>

          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                CONNECTIONS
              </div>

              <div className="d-flex align-items-end gap-2">

                <div className="display-6 fw-bold text-success">
                  {statistics.collaborations}
                </div>

                <span className="text-muted mb-2">
                  accepted
                </span>

              </div>

            </div>

          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                VIEW
              </div>

              <div className="fw-bold fs-4">
                {scope === "all"
                  ? "Global Network"
                  : "My Network"}
              </div>

              <div className="text-muted small">
                {filteredGraph.nodes.length} researchers visible
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            {/* NETWORK SCOPE */}

            <div className="col-lg-4">

              <label
                htmlFor="networkScope"
                className="form-label fw-semibold"
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
                  setSelectedNode(null);
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

            <div className="col-lg-5">

              <label
                htmlFor="researcherSearch"
                className="form-label fw-semibold"
              >
                Search Researcher
              </label>

              <div className="input-group">

                <input
                  id="researcherSearch"
                  type="search"
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

            <div className="col-lg-3">

              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleCSVExport}
                disabled={
                  loading ||
                  graphData.nodes.length === 0
                }
              >
                ↓ Export CSV
              </button>

            </div>

          </div>

          <div className="d-flex justify-content-between mt-3 small text-muted">

            <span>
              Showing{" "}
              <strong>
                {filteredGraph.nodes.length}
              </strong>{" "}
              of{" "}
              {graphData.nodes.length}{" "}
              researchers
            </span>

            {search && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={handleClearSearch}
              >
                Clear search
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="alert alert-danger">
          <strong>
            Network error:
          </strong>{" "}
          {error}
        </div>
      )}

      {/* ======================================================
          GRAPH + DETAILS
      ====================================================== */}

      <div className="row g-4">

        {/* ====================================================
            GRAPH
        ==================================================== */}

        <div className="col-xl-9">

          <div className="card border-0 shadow-sm">

            <div className="card-header bg-white d-flex justify-content-between align-items-center">

              <div>

                <h5 className="mb-0">
                  Collaboration Graph
                </h5>

                <small className="text-muted">
                  Drag nodes • scroll to zoom • click a researcher
                </small>

              </div>

              <span className="badge bg-success">
                {filteredGraph.links.length} connections
              </span>

            </div>

            <div
              ref={graphContainerRef}
              style={{
                height: "650px",
                position: "relative",
                overflow: "hidden",
                background:
                  "radial-gradient(circle at center, #ffffff 0%, #f8f9fa 100%)",
              }}
            >

              {loading ? (

                <div className="d-flex flex-column justify-content-center align-items-center h-100">

                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  />

                  <div className="text-muted">
                    Building collaboration network...
                  </div>

                </div>

              ) : filteredGraph.nodes.length === 0 ? (

                <div className="d-flex justify-content-center align-items-center h-100">

                  <div className="text-center">

                    <div className="display-5 mb-3">
                      🔍
                    </div>

                    <h5>
                      No researchers found
                    </h5>

                    <p className="text-muted">
                      {search.trim()
                        ? `No researchers found matching "${search}".`
                        : "There are no researchers or collaborations available."}
                    </p>

                    <button
                      className="btn btn-outline-primary"
                      onClick={handleClearSearch}
                    >
                      Show All Researchers
                    </button>

                  </div>

                </div>

              ) : (

                <>

                  <ForceGraph2D
                    ref={graphRef}
                    graphData={filteredGraph}
                    width={graphWidth}
                    height={650}
                    backgroundColor="rgba(0,0,0,0)"

                    nodeLabel={(node) => {
                      const degree =
                        nodeDegrees.get(
                          String(node.id)
                        ) || 0;

                      return `${node.name || "Researcher"}\n${degree} collaboration${degree === 1 ? "" : "s"}`;
                    }}

                    nodeRelSize={6}

                    nodeVal={(node) => {
                      const degree =
                        nodeDegrees.get(
                          String(node.id)
                        ) || 0;

                      return 4 + degree * 3;
                    }}

                    linkWidth={(link) => {

                      if (selectedNode) {

                        const sourceId =
                          typeof link.source === "object"
                            ? link.source?.id
                            : link.source;

                        const targetId =
                          typeof link.target === "object"
                            ? link.target?.id
                            : link.target;

                        const selectedId =
                          String(selectedNode.id);

                        if (
                          String(sourceId) === selectedId ||
                          String(targetId) === selectedId
                        ) {
                          return 4;
                        }
                      }

                      return 2;
                    }}

                    linkColor={(link) => {

                      if (selectedNode) {

                        const sourceId =
                          typeof link.source === "object"
                            ? link.source?.id
                            : link.source;

                        const targetId =
                          typeof link.target === "object"
                            ? link.target?.id
                            : link.target;

                        const selectedId =
                          String(selectedNode.id);

                        if (
                          String(sourceId) === selectedId ||
                          String(targetId) === selectedId
                        ) {
                          return "#dc3545";
                        }
                      }

                      return "rgba(13, 110, 253, 0.35)";
                    }}

                    linkDirectionalArrowLength={5}
                    linkDirectionalArrowRelPos={1}

                    linkLabel={(link) =>
                      link.collaboration_type
                        ? `Type: ${link.collaboration_type}`
                        : "Accepted collaboration"
                    }

                    linkDirectionalParticles={2}
                    linkDirectionalParticleWidth={2}
                    linkDirectionalParticleSpeed={0.004}

                    cooldownTicks={100}
                    d3VelocityDecay={0.25}

                    onNodeClick={handleNodeClick}

                    onNodeHover={(node) =>
                      setHoveredNode(node || null)
                    }

                    nodeCanvasObject={(
                      node,
                      ctx,
                      globalScale
                    ) => {

                      const degree =
                        nodeDegrees.get(
                          String(node.id)
                        ) || 0;

                      const isSelected =
                        selectedNode &&
                        String(selectedNode.id) ===
                          String(node.id);

                      const isHovered =
                        hoveredNode &&
                        String(hoveredNode.id) ===
                          String(node.id);

                      const isConnected =
                        selectedNode &&
                        isConnectedToSelected(node);

                      const isSearchMatch =
                        search &&
                        String(node.name || "")
                          .toLowerCase()
                          .includes(
                            search.toLowerCase()
                          );

                      let radius =
                        6 +
                        Math.min(
                          degree * 1.8,
                          10
                        );

                      if (isSelected) {
                        radius += 4;
                      }

                      // ------------------------------------------------
                      // GLOW
                      // ------------------------------------------------

                      if (
                        isSelected ||
                        isHovered ||
                        isSearchMatch ||
                        isConnected
                      ) {

                        ctx.beginPath();

                        ctx.arc(
                          node.x,
                          node.y,
                          radius + 7,
                          0,
                          Math.PI * 2
                        );

                        ctx.fillStyle =
                          isSelected
                            ? "rgba(220,53,69,0.18)"
                            : isConnected
                              ? "rgba(25,135,84,0.14)"
                              : "rgba(13,110,253,0.15)";

                        ctx.fill();
                      }

                      // ------------------------------------------------
                      // NODE
                      // ------------------------------------------------

                      ctx.beginPath();

                      ctx.arc(
                        node.x,
                        node.y,
                        radius,
                        0,
                        Math.PI * 2
                      );

                      ctx.fillStyle =
                        getNodeColor(node);

                      ctx.fill();

                      // ------------------------------------------------
                      // WHITE BORDER
                      // ------------------------------------------------

                      ctx.lineWidth = 2;

                      ctx.strokeStyle =
                        "#ffffff";

                      ctx.stroke();

                      // ------------------------------------------------
                      // LABEL
                      // ------------------------------------------------

                      const showLabel =
                        globalScale > 0.75 ||
                        isSelected ||
                        isHovered ||
                        isSearchMatch;

                      if (showLabel) {

                        const label =
                          node.name ||
                          "Researcher";

                        const fontSize =
                          Math.max(
                            9,
                            12 / globalScale
                          );

                        ctx.font =
                          `600 ${fontSize}px Arial`;

                        ctx.textAlign =
                          "center";

                        ctx.textBaseline =
                          "top";

                        ctx.fillStyle =
                          "#212529";

                        ctx.fillText(
                          label,
                          node.x,
                          node.y +
                            radius +
                            5
                        );
                      }
                    }}
                  />

                  {/* ==================================================
                      GRAPH CONTROLS
                  ================================================== */}

                  <div
                    className="position-absolute top-0 end-0 m-3"
                    style={{
                      zIndex: 10,
                    }}
                  >

                    <div className="btn-group shadow-sm">

                      <button
                        type="button"
                        className="btn btn-light"
                        title="Zoom in"
                        onClick={zoomIn}
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className="btn btn-light"
                        title="Zoom out"
                        onClick={zoomOut}
                      >
                        −
                      </button>

                      <button
                        type="button"
                        className="btn btn-light"
                        title="Fit network"
                        onClick={centerGraph}
                      >
                        ⛶
                      </button>

                      <button
                        type="button"
                        className="btn btn-light"
                        title="Reset graph"
                        onClick={resetGraph}
                      >
                        ↻
                      </button>

                    </div>

                  </div>

                  {/* ==================================================
                      LEGEND
                  ================================================== */}

                  <div
                    className="position-absolute bottom-0 start-0 m-3 bg-white rounded shadow-sm p-3"
                    style={{
                      zIndex: 10,
                      fontSize: "12px",
                    }}
                  >

                    <div className="fw-semibold mb-2">
                      Network Legend
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-1">

                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#6f42c1",
                          display: "inline-block",
                        }}
                      />

                      Highly connected

                    </div>

                    <div className="d-flex align-items-center gap-2 mb-1">

                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#0d6efd",
                          display: "inline-block",
                        }}
                      />

                      Connected

                    </div>

                    <div className="d-flex align-items-center gap-2">

                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#adb5bd",
                          display: "inline-block",
                        }}
                      />

                      No accepted collaboration

                    </div>

                  </div>

                  {/* ==================================================
                      NO CONNECTION MESSAGE
                  ================================================== */}

                  {filteredGraph.links.length === 0 && (

                    <div
                      className="position-absolute top-50 start-50 translate-middle bg-white shadow-sm rounded p-3 text-center"
                      style={{
                        zIndex: 5,
                        maxWidth: "320px",
                        opacity: 0.95,
                      }}
                    >

                      <div className="fw-semibold">
                        No accepted collaborations yet
                      </div>

                      <div className="small text-muted mt-1">
                        Researchers are visible, but there are
                        currently no accepted collaboration connections.
                      </div>

                    </div>

                  )}

                </>

              )}

            </div>

          </div>

        </div>

        {/* ====================================================
            RESEARCHER DETAILS
        ==================================================== */}

        <div className="col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-header bg-white">

              <h6 className="mb-0">
                Researcher Details
              </h6>

            </div>

            <div className="card-body">

              {!selectedNode ? (

                <div className="text-center text-muted py-5">

                  <div className="fs-1 mb-3">
                    👤
                  </div>

                  <p className="mb-1 fw-semibold">
                    Select a researcher
                  </p>

                  <p className="small">
                    Click a node in the graph to view
                    their network information.
                  </p>

                </div>

              ) : (

                <>

                  <div className="text-center mb-4">

                    <div
                      className="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center"
                      style={{
                        width: "70px",
                        height: "70px",
                        fontSize: "26px",
                      }}
                    >
                      {(
                        selectedNode.name ||
                        "R"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <h5 className="mt-3 mb-1">
                      {selectedNode.name ||
                        "Researcher"}
                    </h5>

                    <small className="text-muted">
                      Researcher
                    </small>

                  </div>

                  <div className="border rounded p-3 mb-3">

                    <div className="small text-muted">
                      CONNECTIONS
                    </div>

                    <div className="fs-3 fw-bold text-primary">
                      {nodeDegrees.get(
                        String(selectedNode.id)
                      ) || 0}
                    </div>

                  </div>

                  <div className="border rounded p-3">

                    <div className="small text-muted mb-2">
                      CONNECTED RESEARCHERS
                    </div>

                    {selectedConnections.length ===
                    0 ? (

                      <div className="small text-muted">
                        No accepted collaborations.
                      </div>

                    ) : (

                      <div
                        style={{
                          maxHeight: "300px",
                          overflowY: "auto",
                        }}
                      >

                        {selectedConnections.map(
                          (researcher) => (

                            <button
                              key={researcher.id}
                              type="button"
                              className="btn btn-light btn-sm w-100 text-start mb-2"
                              onClick={() =>
                                setSelectedNode(
                                  researcher
                                )
                              }
                            >

                              <span className="fw-semibold">
                                {researcher.name ||
                                  "Researcher"}
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    )}

                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mt-3"
                    onClick={() =>
                      navigate(
                        `/researchers/${selectedNode.id}`
                      )
                    }
                  >
                    View Researcher Profile
                  </button>

                </>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          SEARCH RESULT INFORMATION
      ====================================================== */}

      {!loading && search.trim() && (
        <div className="alert alert-info mt-4">

          Showing{" "}
          <strong>
            {filteredGraph.nodes.length}
          </strong>{" "}
          researcher(s) matching{" "}
          <strong>
            "{search}"
          </strong>.

        </div>
      )}

      {/* ======================================================
          HOW TO USE
      ====================================================== */}

      <div className="card border-0 shadow-sm mt-4">

        <div className="card-body">

          <h6 className="fw-bold">
            How to use the network
          </h6>

          <div className="row g-3">

            <div className="col-md-4">

              <div className="small">

                <strong>1. Explore</strong>

                <br />

                Drag nodes around the graph and scroll
                to zoom.

              </div>

            </div>

            <div className="col-md-4">

              <div className="small">

                <strong>2. Select</strong>

                <br />

                Click a researcher to highlight
                their connections.

              </div>

            </div>

            <div className="col-md-4">

              <div className="small">

                <strong>3. Export</strong>

                <br />

                Download the current collaboration
                network as CSV.

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Network;