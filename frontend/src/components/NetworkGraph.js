import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

function NetworkGraph({ searchTerm, selectedDept, onSelectNode }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  
  const onSelectNodeRef = useRef(onSelectNode);
  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Detailed Mock Data for Researchers
    const rawNodes = [
      { 
        id: 1, 
        label: 'Dr. A. Sharma', 
        group: 'CS',
        citations: 142,
        publications: [
          'Graph Neural Networks in Social Analysis (2024)',
          'Optimizing Distributed Systems (2023)',
          'AI-driven Network Mapping (2022)'
        ]
      },
      { 
        id: 2, 
        label: 'Prof. B. Verma', 
        group: 'Physics',
        citations: 289,
        publications: [
          'Quantum Computing Approaches (2024)',
          'Thermal Dynamics in Micro-particles (2021)'
        ]
      },
      { 
        id: 3, 
        label: 'Dr. C. Mehta', 
        group: 'CS',
        citations: 98,
        publications: [
          'Secure Edge Computing Frameworks (2023)',
          'Big Data Analytics in Healthcare (2022)'
        ]
      },
      { 
        id: 4, 
        label: 'Dr. D. Patel', 
        group: 'Maths',
        citations: 210,
        publications: [
          'Topology of Complex Networks (2023)',
          'Statistical Mechanics Models (2020)'
        ]
      },
      { 
        id: 5, 
        label: 'Dr. E. Rao', 
        group: 'Biotech',
        citations: 175,
        publications: [
          'Genomic Sequence Clustering (2024)',
          'Bio-informatics Collaboration Mapping (2022)'
        ]
      },
    ];

    const rawEdges = [
      { from: 1, to: 2, label: '3 Papers' },
      { from: 1, to: 3, label: '5 Papers' },
      { from: 2, to: 4, label: '1 Paper' },
      { from: 3, to: 5, label: '2 Papers' },
    ];

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
        size: 24,
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

    networkRef.current = new Network(containerRef.current, data, options);

    networkRef.current.on("click", (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const clickedNode = rawNodes.find(n => n.id === nodeId);
        if (onSelectNodeRef.current && clickedNode) {
          onSelectNodeRef.current(clickedNode);
        }
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [searchTerm, selectedDept]);

  return (
    <div 
      ref={containerRef} 
      style={{ height: '480px', width: '100%', backgroundColor: '#ffffff' }} 
    />
  );
}

export default NetworkGraph;