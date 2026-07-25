import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

const DEPARTMENT_COLORS = {
  'Computer Science': '#3b82f6',
  'Physics': '#ef4444',
  'Mathematics': '#10b981',
  'Biotech': '#f59e0b',
  'Default': '#8b5cf6'
};

const NetworkGraph = ({ researchers, selectedDept, onNodeSelect }) => {
  const containerRef = useRef(null);
  const networkInstance = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Default Fallback Data agar props se list na mili ho
    const dataList = (researchers && researchers.length > 0) ? researchers : [
      { id: "1", name: "Dr. A. Sharma", department: "Computer Science", citations_count: 45, publications: [{ id: "p1" }, { id: "p2" }] },
      { id: "2", name: "Prof. R. Verma", department: "Physics", citations_count: 32, publications: [{ id: "p1" }, { id: "p3" }] },
      { id: "3", name: "Dr. S. Kulkarni", department: "Computer Science", citations_count: 89, publications: [{ id: "p2" }] },
      { id: "4", name: "Dr. M. Gupta", department: "Mathematics", citations_count: 12, publications: [{ id: "p4" }] },
      { id: "5", name: "Prof. K. Mehta", department: "Physics", citations_count: 67, publications: [{ id: "p3" }] }
    ];

    // Filter by Dept
    const filtered = (selectedDept === 'all' || !selectedDept)
      ? dataList
      : dataList.filter(r => r.department === selectedDept);

    // Nodes Format
    const nodes = filtered.map(r => ({
      id: String(r.id),
      label: r.name,
      shape: 'dot',
      size: 25,
      color: {
        background: DEPARTMENT_COLORS[r.department] || DEPARTMENT_COLORS['Default'],
        border: '#ffffff',
        highlight: { background: '#f59e0b', border: '#ffffff' }
      },
      font: { color: '#ffffff', size: 14, face: 'Arial' }
    }));

    // Dynamic Edges
    const edges = [];
    filtered.forEach((r1, i) => {
      filtered.forEach((r2, j) => {
        if (i < j) {
          const p1 = (r1.publications || []).map(p => typeof p === 'object' ? p.id : p);
          const p2 = (r2.publications || []).map(p => typeof p === 'object' ? p.id : p);
          const shared = p1.filter(id => p2.includes(id));

          if (shared.length > 0) {
            edges.push({
              from: String(r1.id),
              to: String(r2.id),
              width: shared.length * 3,
              color: { color: '#94a3b8' },
              label: `${shared.length} Collab`
            });
          }
        }
      });
    });

    const data = { nodes, edges };
    const options = {
      autoResize: true,
      height: '100%',
      width: '100%',
      physics: {
  enabled: true,
  barnesHut: { 
    gravitationalConstant: -4000, 
    springLength: 150 
  }
},
      interaction: { hover: true, zoomView: true }
    };

    // Delayed Draw (Container dimension settle hone ke baad render)
    const timer = setTimeout(() => {
      if (containerRef.current) {
        if (networkInstance.current) networkInstance.current.destroy();

        networkInstance.current = new Network(containerRef.current, data, options);

        // Canvas Zoom & Center Fit
        networkInstance.current.once('stabilized', () => {
          networkInstance.current.fit();
        });

        // Click Event
        networkInstance.current.on('click', (params) => {
          if (params.nodes.length > 0 && onNodeSelect) {
            const selected = filtered.find(r => String(r.id) === String(params.nodes[0]));
            if (selected) onNodeSelect(selected);
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (networkInstance.current) networkInstance.current.destroy();
    };
  }, [researchers, selectedDept]);

  return (
    <div style={{ width: '100%', height: '520px', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '520px', 
          backgroundColor: '#0b1329', 
          borderRadius: '10px',
          border: '1px solid #1e293b'
        }} 
      />
      {/* Visual Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '8px 14px',
        borderRadius: '6px',
        display: 'flex',
        gap: '12px',
        fontSize: '12px',
        color: '#fff',
        zIndex: 10
      }}>
        {Object.entries(DEPARTMENT_COLORS).filter(([k]) => k !== 'Default').map(([dept, color]) => (
          <span key={dept} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
            {dept}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NetworkGraph;