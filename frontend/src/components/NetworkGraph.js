import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

function NetworkGraph({ graphData }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!graphData || !containerRef.current) return;

    // Default dummy data agar props se graphData pass nahi hua
    const data = graphData || {
      nodes: [
        { id: 1, label: 'Dr. A. Sharma', group: 'CS' },
        { id: 2, label: 'Prof. B. Verma', group: 'Physics' },
        { id: 3, label: 'Dr. C. Mehta', group: 'CS' },
        { id: 4, label: 'Dr. D. Patel', group: 'Maths' },
      ],
      edges: [
        { from: 1, to: 2, label: '3 Papers' },
        { from: 1, to: 3, label: '5 Papers' },
        { from: 2, to: 4, label: '1 Paper' },
      ]
    };

    const options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: { size: 14 }
      },
      edges: {
        width: 2,
        color: { inherit: 'from' },
        smooth: { type: 'continuous' }
      },
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -8000,
          springLength: 200
        }
      },
      interaction: {
        hover: true,
        navigationButtons: true
      }
    };

    const network = new Network(containerRef.current, data, options);

    return () => {
      network.destroy();
    };
  }, [graphData]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h3>🌐 Collaboration Network Graph</h3>
      <div 
        ref={containerRef} 
        style={{ 
          height: '500px', 
          width: '80%', 
          margin: '0 auto', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          backgroundColor: '#fafafa' 
        }} 
      />
    </div>
  );
}

export default NetworkGraph;