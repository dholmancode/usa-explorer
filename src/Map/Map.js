import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature, mesh } from 'topojson-client';
import { zoom, zoomIdentity } from 'd3-zoom';
import usaTopoJSON from '../usaGeoJSON.json';
import { fetchParksData } from '../apiService';
import Loader from './Loader.js';
import './Map.css';
import usSatelliteImage from '../assets/US-Sat.svg';

// Coordinates for the center of each state (approximate)
const stateCenters = {
  'Alabama': [-86.9023, 32.3182],
  'Alaska': [-154.4931, 63.5888],
  'Arizona': [-111.0937, 34.0489],
  'Arkansas': [-92.1999, 34.7999],
  'California': [-119.4179, 36.7783],
  'Colorado': [-105.7821, 39.5501],
  'Connecticut': [-72.7554, 41.6032],
  'Delaware': [-75.5277, 38.9108],
  'Florida': [-81.5158, 27.6648],
  'Georgia': [-82.9071, 32.1656],
  'Hawaii': [-155.5828, 19.8968],
  'Idaho': [-114.742, 44.0682],
  'Illinois': [-89.3985, 40.6331],
  'Indiana': [-86.1349, 40.2672],
  'Iowa': [-93.0977, 41.878],
  'Kansas': [-98.4842, 39.0119],
  'Kentucky': [-84.270, 37.8393],
  'Louisiana': [-91.9623, 30.9843],
  'Maine': [-69.4455, 45.2538],
  'Maryland': [-76.6413, 39.0458],
  'Massachusetts': [-71.3824, 42.4072],
  'Michigan': [-85.6024, 44.3148],
  'Minnesota': [-94.6859, 46.7296],
  'Mississippi': [-89.3985, 32.3547],
  'Missouri': [-91.8318, 37.9643],
  'Montana': [-110.3626, 46.8797],
  'Nebraska': [-99.9018, 41.4925],
  'Nevada': [-116.4194, 38.8026],
  'New Hampshire': [-71.5724, 43.1939],
  'New Jersey': [-74.4057, 40.0583],
  'New Mexico': [-105.8701, 34.5199],
  'New York': [-74.0060, 40.7128],
  'North Carolina': [-79.0193, 35.7596],
  'North Dakota': [-101.0020, 47.5515],
  'Ohio': [-82.9071, 40.4173],
  'Oklahoma': [-97.5164, 35.4676],
  'Oregon': [-120.5542, 43.8041],
  'Pennsylvania': [-77.1945, 41.2033],
  'Rhode Island': [-71.4774, 41.5801],
  'South Carolina': [-81.1637, 33.8361],
  'South Dakota': [-99.9018, 43.9695],
  'Tennessee': [-86.5804, 35.5175],
  'Texas': [-99.9018, 31.9686],
  'Utah': [-111.0937, 39.3200],
  'Vermont': [-72.5778, 44.5588],
  'Virginia': [-78.6569, 37.4316],
  'Washington': [-120.7401, 47.7511],
  'West Virginia': [-80.4549, 38.5976],
  'Wisconsin': [-89.6165, 43.7844],
  'Wyoming': [-107.2903, 43.0759]
};

function Map({ selectedState, selectedPark, onParkSelect, filters }) {
  const svgRef = useRef(null);
  const mapRef = useRef(null);
  const zoomBehavior = useRef(null);
  const [parksData, setParksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const parks = await fetchParksData();
      setParksData(parks);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return; // Do not proceed if still loading

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

    map.append('image')
      .attr('xlink:href', usSatelliteImage)
      .attr('width', width * 0.5)
      .attr('height', height * 0.5)
      .attr('x', width * .037)
      .attr('y', height * 0.053)
      .attr('transform', 'scale(1.69)');

    map.append('path')
      .datum(feature(usaTopoJSON, usaTopoJSON.objects.nation))
      .attr('stroke', '')
      .attr('stroke-width', 0)
      .attr('fill', '')
      .attr('d', path);

    map.append('path')
      .datum(mesh(usaTopoJSON, usaTopoJSON.objects.counties, (a, b) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)))
      .attr('stroke', 'white')
      .attr('stroke-width', .01)
      .attr('fill', '')
      .attr('d', path);

    map.append('path')
      .datum(mesh(usaTopoJSON, usaTopoJSON.objects.states, (a, b) => a !== b))
      .attr('class', 'state-boundary')
      .attr('stroke', 'white')
      .attr('stroke-width', .2)
      .attr('fill', 'none')
      .attr('d', path);

    map.selectAll('.state')
      .data(feature(usaTopoJSON, usaTopoJSON.objects.states).features)
      .enter().append('path')
      .attr('class', 'state')
      .attr('d', path)
      .attr('fill', d => d.properties.name === selectedState ? 'rgba(255, 196, 0, 0.447)' : ''); // Apply your custom color to the selected state

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip');

      if (parksData.length > 0) {
        const matchesFilter = (designation) => {

          if (filters.historic && (
            designation.includes('Historic') || 
            designation.includes('Battlefield')
          )) return true;
      
          if (filters.park && (
            designation.includes('National Park') ||
            designation.includes('National Preserve')
          )) return true;
      
          if (filters.monument && (
            designation.includes('Monument') ||
            designation.includes('Recreation Area') ||
            designation.includes('Scenic Trail') ||
            designation.includes('Parkway')
          )) return true;
      
          if (filters.water && (
            designation.includes('River') ||
            designation.includes('Lakeshore') ||
            designation.includes('Seashore')
          )) return true;

          if (filters.other && !(
            designation.includes('Historic') || 
            designation.includes('Battlefield') ||
            designation.includes('National Park') ||
            designation.includes('National Preserve') ||
            designation.includes('Monument') ||
            designation.includes('Recreation Area') ||
            designation.includes('Scenic Trail') ||
            designation.includes('Parkway') ||
            designation.includes('River') ||
            designation.includes('Lakeshore') ||
            designation.includes('Seashore')
        )) return true;
      
          return false;
        };      
      
        const getFillColor = (designation) => {
          if (designation.includes('Historic') || designation.includes('Historical Park') || designation.includes('Battlefield')) return '#B55233';
          if (designation.includes('National Park') || designation.includes('National Preserve')) return '#2D5F2E';
          if (designation.includes('Lakeshore') || designation.includes('Seashore') || designation.includes('River')) return '#1B7688';
          if (designation.includes('Monument') || designation.includes('Recreation Area') || designation.includes('Scenic Trail') || designation.includes('Parkway')) return '#6A3E77';
          return '#D9A441'; // Default color for other types
        };
      
        map.selectAll('circle')
          .data(parksData.filter(d => matchesFilter(d.designation || '')))
          .enter()
          .append('circle')
          .attr('data-id', d => d.id)
          .attr('cx', d => {
            const coords = projection([parseFloat(d.longitude), parseFloat(d.latitude)]);
            return coords ? coords[0] : -9999;
          })
          .attr('cy', d => {
            const coords = projection([parseFloat(d.longitude), parseFloat(d.latitude)]);
            return coords ? coords[1] : -9999;
          })
          .attr('r', 10)
          .attr('fill', d => getFillColor(d.designation || ''))
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .on('click', (event, d) => {
            zoomToPark(d);
            onParkSelect(d);
          })
          .on('mouseover', (event, d) => {
            d3.select(event.target)
              .transition()
              .duration(100)
              .attr('fill', 'orange');
      
            if (tooltip) {
              tooltip
                .style('opacity', 1)
                .html(d.fullName)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
            }
          })
          .on('mousemove', (event) => {
            if (tooltip) {
              tooltip
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
            }
          })
          .on('mouseout', (event, d) => {
            const isSelected = selectedPark && d.id === selectedPark.id;
            const fillColor = isSelected ? 'orange' : getFillColor(d.designation || '');
      
            d3.select(event.target)
              .transition()
              .duration(100)
              .attr('fill', fillColor);
      
            if (tooltip) {
              tooltip.style('opacity', 0);
            }
          })
          .classed('park-selected', d => selectedPark && d.id === selectedPark.id);
      }
      
      newSvg.call(zoomBehavior.current);
      


    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
      tooltip.remove();
    };
  }, [parksData, onParkSelect, selectedPark, selectedState, loading, filters]); // Add filters to dependency array

  useEffect(() => {
    if (selectedPark) {
      zoomToPark(selectedPark);
    }
  }, [selectedPark]);

  const updateCircles = (zoomLevel) => {
    mapRef.current.selectAll('circle')
      .attr('r', d => (selectedPark && d.id === selectedPark.id ? 10 : 10) / zoomLevel);
  };

  const zoomToPark = (park) => {
    const width = 975;
    const height = 610;
    const scale = 30;
    const projection = d3.geoAlbersUsa()
      .scale(1100)
      .translate([width / 2, height / 2]);

    const [x, y] = projection([parseFloat(park.longitude), parseFloat(park.latitude)]);

    d3.select(svgRef.current)
      .transition()
      .duration(3750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-x, -y)
      ).on('end', () => {
        updateCircles(scale);
      });
  };

  const zoomToState = (state) => {
    const center = stateCenters[state];
    if (!center) return;

    const width = 975;
    const height = 610;
    const scale = 3;
    const projection = d3.geoAlbersUsa()
      .scale(1100)
      .translate([width / 2, height / 2]);

    const [x, y] = projection(center);

    d3.select(svgRef.current)
      .transition()
      .duration(3000)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-x, -y)
      ).on('end', () => {
        updateCircles(scale);
      });

    mapRef.current.selectAll('.state')
      .attr('fill', d => d.properties.name === state ? 'rgba(255, 196, 0, 0.447)' : ''); // Apply your custom color to the selected state
  };

  useEffect(() => {
    if (selectedState) {
      zoomToState(selectedState);
    }
  }, [selectedState]);

  const handleZoomIn = () => {
    d3.select(svgRef.current)
      .transition()
      .duration(950)
      .call(zoomBehavior.current.scaleBy, 2.2);
  };

  const handleZoomOut = () => {
    d3.select(svgRef.current)
      .transition()
      .duration(950)
      .call(zoomBehavior.current.scaleBy, 1 / 2.2);
  };

  const handleReset = () => {
    d3.select(svgRef.current)
      .transition()
      .duration(2750)
      .call(zoomBehavior.current.transform, zoomIdentity);
  };

  return (
    <div className='map'>
      {loading ? <Loader className='loader-container' /> : (
        <>
          <div className='map-controls'>
            <div className='zoom-controls'>
              <button onClick={handleZoomIn}>+</button>
              <button onClick={handleZoomOut}>-</button>
            </div>
            <div className='reset-button'>
              <button onClick={handleReset}>Reset</button>
            </div>
          </div>

          {/* Map Display */}
          <svg ref={svgRef}></svg>
        </>
      )}
    </div>
  );
}

export default Map;