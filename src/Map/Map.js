import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature, mesh } from 'topojson-client';
import { zoom, zoomIdentity } from 'd3-zoom'; // Import zoom and zoomIdentity from d3-zoom
import usaTopoJSON from '../usaGeoJSON.json';
import './Map.css';

function Map() {
  const [zoomLevel, setZoomLevel] = useState(1); // State for zoom level
  const svgRef = useRef(null);
  const mapRef = useRef(null);
  const zoomBehavior = useRef(null); // Ref for zoom behavior

  useEffect(() => {
    const width = 975; // Width of the SVG view box
    const height = 610; // Height of the SVG view box

    // Create a projection using d3.geoAlbersUsa
    const projection = d3.geoAlbersUsa()
      .scale(1100 * zoomLevel) // Adjust scale based on zoom level
      .translate([width / 2, height / 2]);

    // Create a path generator
    const path = d3.geoPath()
      .projection(projection);

    // Initialize zoom behavior if not already initialized
    if (!zoomBehavior.current) {
      zoomBehavior.current = zoom()
        .scaleExtent([1, 8]) // Set min and max zoom levels
        .on('zoom', zoomed);
    }

    // Function to handle zoom events
    function zoomed(event) {
      mapRef.current.selectAll('path')
        .attr('transform', event.transform);
    }

    // Check if the TopoJSON data is loaded and has the correct structure
    if (usaTopoJSON.objects && usaTopoJSON.objects.counties && usaTopoJSON.objects.states && usaTopoJSON.objects.nation) {
      try {
        const svg = d3.select(svgRef.current);

        // Remove existing SVG content to avoid duplication on zoomLevel change
        svg.selectAll('*').remove();

        // Append a new SVG element
        const newSvg = svg.append('svg')
          .attr('viewBox', `0 0 ${width} ${height}`);

        const map = newSvg.append('g')
          .attr('class', 'map-container');
        mapRef.current = map;

        // Render the nation boundary
        map.append('path')
          .datum(feature(usaTopoJSON, usaTopoJSON.objects.nation))
          .attr('stroke', 'black')
          .attr('stroke-width', 3)
          .attr('fill', 'rgba(100, 600, 117, .31)')
          .attr('d', path);

        // Render the county borders
        map.append('path')
          .datum(mesh(usaTopoJSON, usaTopoJSON.objects.counties, (a, b) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)))
          .attr('stroke', '#78787810')
          .attr('stroke-width', 1)
          .attr('fill', 'none')
          .attr('d', path);

        // Render the state borders
        map.append('path')
          .datum(mesh(usaTopoJSON, usaTopoJSON.objects.states, (a, b) => a !== b))
          .attr('stroke', '#787878')
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('d', path);

        // Apply zoom behavior to SVG
        newSvg.call(zoomBehavior.current);

      } catch (error) {
        console.error('Error rendering map:', error);
      }
    } else {
      console.error('Invalid TopoJSON structure or missing required objects');
    }

    // Cleanup function to remove SVG on unmount or zoomLevel change
    return () => {
      d3.select(svgRef.current).selectAll('svg').remove();
    };

  }, [zoomLevel]);

  // Event handlers for zoom and reset
  const handleZoomIn = () => {
    setZoomLevel(zoomLevel * 1.2); // Increase zoom level by multiplying by 1.2
  };

  const handleZoomOut = () => {
    setZoomLevel(zoomLevel / 1.2); // Decrease zoom level by dividing by 1.2
  };

  const handleReset = () => {
    setZoomLevel(1); // Reset zoom level to 1 (original scale)
    if (zoomBehavior.current) {
      d3.select(svgRef.current).call(zoomBehavior.current.transform, zoomIdentity); // Reset zoom transform
    }
  };

  return (
    <div className='map'>
      <div className='map-controls'>
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div ref={svgRef}></div>
    </div>
  );
}

export default Map;