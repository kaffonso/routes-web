import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';
import linha_1 from './geojson/transcor_linha_1.json';
import linha_2 from './geojson/transcor_linha_2.json';
import linha_3 from './geojson/transcor_linha_3.json';

mapboxgl.accessToken =
  'pk.eyJ1Ijoia2FmZm9uc28iLCJhIjoiY2xrc2F2cHo4MDFxNDNnbnU0YjI1Z3dwdyJ9.ZKKQve34qjRqdy-Up3mFtg';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-24.92);
  const [lat, setLat] = useState(16.83);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('click', (e) => {
      const { lng, lat} = e.lngLat;

      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    map.current.on('load', () => {
      const addSource = (id, data) => {
        map.current.addSource(id, {
          type: 'geojson',
          data: data,
        });
      };

      const addLayers = (source, point_color, line_color) => {
        map.current.addLayer({
          id: `bus-point-${source}`,
          type: 'circle',
          source: source,
          paint: {
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': 'grey',
            'circle-color': point_color,
          },
        });

        map.current.addLayer({
          id: `bus-line-${source}`,
          type: 'line',
          source: source,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-width': 5,
            'line-opacity': 0.75,
            'line-color': line_color,
          },
        });
      };

      addSource('linha-1', linha_1);
      addLayers('linha-1', 'blue', '#3887be');

      addSource('linha-2', linha_2);
      addLayers('linha-2', '#c00b0b', '#f44949');

      addSource('linha-3', linha_3);
      addLayers('linha-3', '#90ff90', '#005900');
    });
  });

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/kaffonso/clksbgue0005g01qvd8px6w2j',
      center: [lng, lat],
      zoom: zoom,
    });

  });

  return (
    <div>
      <div className='sidebar'>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className='map-container' />
    </div>
  );
}

export default App;
