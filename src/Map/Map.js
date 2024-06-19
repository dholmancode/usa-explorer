import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature, mesh } from 'topojson-client';
import { zoom, zoomIdentity } from 'd3-zoom';
import usaTopoJSON from '../usaGeoJSON.json';
import { fetchParksData } from '../apiService';
import './Map.css';

function Map() {
  const svgRef = useRef(null);
  const mapRef = useRef(null);
  const zoomBehavior = useRef(null);
  const [parksData, setParksData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const parks = await fetchParksData();
      setParksData(parks);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const width = 975;
    const height = 610;

    const projection = d3.geoAlbersUsa()
      .scale(1100)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath()
      .projection(projection);

    if (!zoomBehavior.current) {
      zoomBehavior.current = zoom()
        .scaleExtent([1, 2000])
        .on('zoom', zoomed);
    }

    function zoomed(event) {
      mapRef.current.attr('transform', event.transform);
      updateCircles(event.transform.k);
    }

    const updateCircles = (zoomLevel) => {
      mapRef.current.selectAll('circle')
        .attr('r', 9 / zoomLevel); // Adjust circle size based on zoom level
    };

    if (usaTopoJSON.objects && usaTopoJSON.objects.counties && usaTopoJSON.objects.states && usaTopoJSON.objects.nation) {
      try {
        const svg = d3.select(svgRef.current);

        svg.selectAll('*').remove();

        const newSvg = svg.append('svg')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .style('z-index', 1);

        const map = newSvg.append('g')
          .attr('class', 'map-container');
        mapRef.current = map;

        map.append('path')
          .datum(feature(usaTopoJSON, usaTopoJSON.objects.nation))
          .attr('stroke', 'black')
          .attr('stroke-width', 0.08)
          .attr('fill', 'rgba(100, 600, 117, .31)')
          .attr('d', path);

        map.append('path')
          .datum(mesh(usaTopoJSON, usaTopoJSON.objects.counties, (a, b) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)))
          .attr('stroke', '#78787810')
          .attr('stroke-width', 0.08)
          .attr('fill', 'none')
          .attr('d', path);

        map.append('path')
          .datum(mesh(usaTopoJSON, usaTopoJSON.objects.states, (a, b) => a !== b))
          .attr('stroke', '#787878')
          .attr('stroke-width', 0.08)
          .attr('fill', 'none')
          .attr('d', path);

        if (parksData.length > 0) {
          map.selectAll('circle')
            .data(parksData)
            .enter()
            .append('circle')
            .attr('cx', d => {
              const coords = projection([d.longitude, d.latitude]);
              return coords ? coords[0] : -9999; // Handle missing projection cases
            })
            .attr('cy', d => {
              const coords = projection([d.longitude, d.latitude]);
              return coords ? coords[1] : -9999; // Handle missing projection cases
            })
            .attr('r', 5)
            .attr('fill', 'red')
            .attr('stroke', 'black')
            .attr('stroke-width', 0)
            .on('mouseover', (event, d) => {
              d3.select(event.target)
                .transition()
                .duration(100)
                .attr('fill', 'orange');
            })
            .on('mouseout', (event, d) => {
              d3.select(event.target)
                .transition()
                .duration(100)
            });
        }

        newSvg.call(zoomBehavior.current);

      } catch (error) {
        console.error('Error rendering map:', error);
      }
    } else {
      console.error('Invalid TopoJSON structure or missing required objects');
    }

    return () => {
      d3.select(svgRef.current).selectAll('svg').remove();
    };
  }, [parksData]);

  const handleZoomIn = () => {
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehavior.current.scaleBy, 1.2);
  };

  const handleZoomOut = () => {
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehavior.current.scaleBy, 1 / 1.2);
  };

  const handleReset = () => {
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehavior.current.transform, zoomIdentity);
  };

  return (
    <div className='map'>
      <div className='map-controls'>
        <div className='zoom-controls'>
          <button onClick={handleZoomIn}>+</button>
          <button onClick={handleZoomOut}>-</button>
        </div>
        <div className='reset-button'>
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>
      <div ref={svgRef}></div>
    </div>
  );
}

export default Map;
