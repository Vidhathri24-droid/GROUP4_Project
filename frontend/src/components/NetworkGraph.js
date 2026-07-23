import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

function NetworkGraph({ searchTerm, selectedDept, onSelectNode }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dummy Data
    const rawNodes = [
      { id: 1, label: 'Dr. A. Sharma', group: 'CS' },
      { id: 2, label: 'Prof. B. Verma', group: 'Physics' },
      { id: 3, label: 'Dr. C. Mehta', group: 'CS' },
      { id: 4, label: 'Dr. D. Patel', group: 'Maths' },
      { id: 5, label: 'Dr. E. Rao', group: 'Biotech' },
    ];

    const rawEdges = [
      { from: 1, to: 2, label: '3 Papers' },
      { from: 1, to: 3, label: '5 Papers' },
      { from: 2, to: 4, label: '1 Paper' },
      { from: 3, to: 5, label: '2 Papers' },
    ];

    // Filter Logic
    let filteredNodes = rawNodes;
    if (searchTerm) {
      filteredNodes = filteredNodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDept && selectedDept !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.group === selectedDept);
    }

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = rawEdges.filter(
      edge => filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to)
    );

    const data = { nodes: filteredNodes, edges: filteredEdges };

    const options = {
      nodes: {
        shape: 'dot',
        size: 22,
        font: { size: 14, color: '#1e293b' },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        color: { color: '#94a3b8', highlight: '#2563eb' },
        smooth: { type: 'continuous' }
      },
      physics: {
        stabilization: false,
        barnesHut: { gravitationalConstant: -8000, springLength: 180 }
      },
      interaction: { hover: true, navigationButtons: true }
    };

    // Network instance create karein
    networkRef.current = new Network(containerRef.current, data, options);

    // Node Click Event Handling Fix
    networkRef.current.on("click", (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const clickedId = params.nodes[0];
        const clickedNode = rawNodes.find(n => n.id === clickedId);
        if (clickedNode && onSelectNode) {
          onSelectNode(clickedNode);
        }
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [searchTerm, selectedDept, onSelectNode]);

  return (
    <div 
      ref={containerRef} 
      style={{ height: '100%', width: '100%' }} 
    />
  );
}

export default NetworkGraph;