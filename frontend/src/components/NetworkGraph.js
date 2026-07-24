import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import API from '../services/api';

function NetworkGraph({ searchTerm, selectedDept, onSelectNode }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const res = await API.get('/researchers/'); 
        const researchers = res.data;

        if (!isMounted) return;

        // 1. Vis.js Nodes map karna
        const nodes = researchers.map((r) => ({
          id: r.id,
          label: r.name || r.full_name || `Researcher ${r.id}`,
          group: r.department || 'General',
          citations: r.citations_count || 0,
          publications: r.publications || [],
        }));

        // 2. Dynamic Edges (Lines) generate karna - based on shared publications
        const edges = [];
        for (let i = 0; i < researchers.length; i++) {
          for (let j = i + 1; j < researchers.length; j++) {
            const r1 = researchers[i];
            const r2 = researchers[j];
            
            const pubs1 = (r1.publications || []).map(p => typeof p === 'object' ? p.id : p);
            const pubs2 = (r2.publications || []).map(p => typeof p === 'object' ? p.id : p);

            // Check common publications
            const common = pubs1.filter(id => pubs2.includes(id));
            if (common.length > 0) {
              edges.push({
                from: r1.id,
                to: r2.id,
                label: `${common.length} Collab`,
                width: common.length * 2,
              });
            }
          }
        }

        // Filter according to search & dept
        let filteredNodes = nodes;
        if (searchTerm) {
          filteredNodes = filteredNodes.filter((n) =>
            n.label.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (selectedDept && selectedDept !== 'all') {
          filteredNodes = filteredNodes.filter((n) => n.group === selectedDept);
        }

        // Direct IDs filtering for Edges
        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredEdges = edges.filter(
          e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)
        );

        // Pehle Loading state OFF karenge, taaki Container DOM me stable ho jaye
        setLoading(false);

        // DOM Render hone ke thode der baad Network Initialize karenge (Timeout Fix)
        setTimeout(() => {
          if (containerRef.current) {
            // Destroy existing instance if any
            if (networkRef.current) networkRef.current.destroy();

            const data = { nodes: filteredNodes, edges: filteredEdges };
            const options = {
              nodes: { shape: 'dot', size: 24, font: { size: 14 } },
              physics: { barnesHut: { gravitationalConstant: -4000, springLength: 150 } },
              interaction: { hover: true },
            };

            networkRef.current = new Network(containerRef.current, data, options);

            networkRef.current.on('click', (params) => {
              if (params.nodes.length > 0) {
                const selected = filteredNodes.find((n) => n.id === params.nodes[0]);
                if (selected && onSelectNode) onSelectNode(selected);
              }
            });
          }
        }, 50);

      } catch (err) {
        console.error('Error fetching graph data from API:', err);
        setLoading(false);
      }
    };

    fetchGraphData();

    return () => {
      isMounted = false;
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [searchTerm, selectedDept]);

  if (loading) return <div style={{ padding: '20px' }}>Loading Live Network Data...</div>;

  return (
    <div 
      ref={containerRef} 
      style={{ height: '480px', width: '100%', border: '1px solid #f0f0f0', borderRadius: '8px' }} 
    />
  );
}

export default NetworkGraph;