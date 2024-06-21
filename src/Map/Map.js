import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature, mesh } from 'topojson-client';
import { zoom, zoomIdentity } from 'd3-zoom';
import usaTopoJSON from '../usaGeoJSON.json';
import { fetchParksData } from '../apiService';
import './Map.css';

function Map({ onParkSelect }) {
  const svgRef = useRef(null);
  const mapRef = useRef(null);
  const zoomBehavior = useRef(null);
  const [parksData, setParksData] = useState([]);
  const [selectedPark, setSelectedPark] = useState(null);

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
        .on('zoom', (event) => {
          mapRef.current.attr('transform', event.transform);
          updateCircles(event.transform.k);
        });
    }

    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();

    const newSvg = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height);

    const map = newSvg.append('g')
      .attr('class', 'map-container');
    mapRef.current = map;

    map.append('path')
      .datum(feature(usaTopoJSON, usaTopoJSON.objects.nation))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.8)
      .attr('fill', 'rgba(100, 600, 117, .41)')
      .attr('d', path);

    map.append('path')
      .datum(mesh(usaTopoJSON, usaTopoJSON.objects.counties, (a, b) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)))
      .attr('stroke', '#787878')
      .attr('stroke-width', .08)
      .attr('fill', 'none')
      .attr('d', path);

    map.append('path')
      .datum(mesh(usaTopoJSON, usaTopoJSON.objects.states, (a, b) => a !== b))
      .attr('stroke', 'black')
      .attr('stroke-width', .3)
      .attr('fill', 'none')
      .attr('d', path);

    if (parksData.length > 0) {
      map.selectAll('circle')
        .data(parksData)
        .enter()
        .append('circle')
        .attr('data-id', d => d.id) // Add data-id attribute for unique identification
        .attr('cx', d => {
          const coords = projection([parseFloat(d.longitude), parseFloat(d.latitude)]);
          return coords ? coords[0] : -9999; // Handle missing projection cases
        })
        .attr('cy', d => {
          const coords = projection([parseFloat(d.longitude), parseFloat(d.latitude)]);
          return coords ? coords[1] : -9999; // Handle missing projection cases
        })
        .attr('r', 8)
        .attr('fill', 'red')
        .attr('stroke', 'black')
        .attr('stroke-width', 0)
        .on('click', (event, d) => {
          zoomToPark(d); // Zoom to the selected park
          setSelectedPark(d); // Update selected park state
          onParkSelect(d); // Send selected park back to App.js
        })
        .on('mouseover', (event, d) => {
          d3.select(event.target)
            .transition()
            .duration(100)
            .attr('fill', 'orange');
        })
        .on('mouseout', (event, d) => {
          const isSelected = selectedPark && d.id === selectedPark.id;
          const fillColor = isSelected ? 'orange' : 'red';
          d3.select(event.target)
            .transition()
            .duration(100)
            .attr('fill', fillColor);
        });
    }

    newSvg.call(zoomBehavior.current); // Attach zoom behavior to the SVG

    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [parksData, onParkSelect]);

  useEffect(() => {
    if (selectedPark) {
      d3.selectAll('circle').classed('park-selected', false);
      d3.select(`[data-id='${selectedPark.id}']`).classed('park-selected', true);
    }
  }, [selectedPark]);

  const updateCircles = (zoomLevel) => {
    mapRef.current.selectAll('circle')
      .attr('r', d => {
        if (selectedPark && d.id === selectedPark.id) {
          return 10 / zoomLevel; // Increase size for selected park
        } else {
          return 12 / zoomLevel; // Normal size for other parks
        }
      });
  };

  const zoomToPark = (park) => {
    const width = 975;
    const height = 610;
    const scale = 29; // Adjust this scale as needed
    const projection = d3.geoAlbersUsa()
      .scale(1100)
      .translate([width / 2, height / 2]);

    const [x, y] = projection([parseFloat(park.longitude), parseFloat(park.latitude)]);

    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-x, -y)
      ).on('end', () => { // Ensure circles are updated after the zoom transition
        updateCircles(scale);
      });
  };

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
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default Map;
