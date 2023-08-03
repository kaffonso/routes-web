import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./App.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import linha1 from "./geojson/transcor_linha_20.json";
mapboxgl.accessToken =
  "pk.eyJ1Ijoia2FmZm9uc28iLCJhIjoiY2xrc2F2cHo4MDFxNDNnbnU0YjI1Z3dwdyJ9.ZKKQve34qjRqdy-Up3mFtg";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-24.9764);
  const [lat, setLat] = useState(16.8485);
  const [zoom, setZoom] = useState(11.5);
  const noData = { data: null, visible: false };
  const initialState = {
    linha1: noData,
    linha2: noData,
    linha3: noData,
    linha4: noData,
    linha5: noData,
    linha6: noData,
    linha7: noData,
    linha8: noData,
    linha9: noData,
    linha10: noData,
    linha11: noData,
    linha12: noData,
    linha20: noData,
  };
  const [linhas, setLinhas] = useState(initialState);
  const [myList, setMyList] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const colors = [
    "purple",
    "orange",
    "green",
    "blue",
    "pink",
    "purple",
    "grey",
    "cyan",
    "yellow",
    "crimson",
    "aqua",
    "olive",
    "teal",
  ];

  //lat long and zoom
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, []);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    let markerCount = 0; // Keep track of the number of markers

    const handleClick = (e) => {
      if (markerCount >= 2) {
        // Already reached the limit, do not add more markers
        return;
      }

      const { lng, lat } = e.lngLat;
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);

      if (markerCount === 0) {
        setOrigin([lng, lat]);
      } else {
        setDestination([lng, lat]);
      }

      markerCount++; // Increment the marker count
    };

    map.current.on("click", handleClick);

    return () => {
      map.current.off("click", handleClick); // Clean up the event listener
    };
  }, []);

  // //directions
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.addControl(directions, "top-left");

    directions.on("route", (e) => {
      if (e.route && e.route.length > 0) {
        console.log(e.route[0]);
      }
    });
  }, [linhas]);

  //render map
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/kaffonso/clksbgue0005g01qvd8px6w2j",
      center: [lng, lat],
      zoom: zoom,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    const addSource = (id, data) => {
      if (!map.current) {
        console.error("Map instance is not available.");
        return;
      }

      if (map.current.getSource(id)) {
        return;
      }

      map.current.addSource(id, {
        type: "geojson",
        data: data,
      });
    };

    const addLayers = (source, line_color) => {
      map.current.addLayer({
        id: `bus-point-${source}`,
        type: "circle",
        source: source,
        paint: {
          "circle-radius": 3,
          "circle-stroke-width": 1,
          "circle-stroke-color": "grey",
          "circle-color": "white",
        },
      });

      map.current.addLayer({
        id: `bus-line-${source}`,
        type: "line",
        source: source,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-width": 5,
          "line-opacity": 0.75,
          "line-color": line_color,
        },
      });
    };

    const handleVisibleLines = () => {
      const lineConfigurations = [
        { lineKey: "linha1", color: colors[0] },
        { lineKey: "linha2", color: colors[1] },
        { lineKey: "linha3", color: colors[2] },
        { lineKey: "linha4", color: colors[3] },
        { lineKey: "linha5", color: colors[4] },
        { lineKey: "linha6", color: colors[5] },
        { lineKey: "linha7", color: colors[6] },
        { lineKey: "linha8", color: colors[7] },
        { lineKey: "linha9", color: colors[8] },
        { lineKey: "linha10", color: colors[9] },
        { lineKey: "linha11", color: colors[10] },
        { lineKey: "linha12", color: colors[11] },
        { lineKey: "linha20", color: colors[12] },
      ];

      lineConfigurations.forEach((config) => {
        if (
          linhas[config.lineKey].visible &&
          !myList.includes(config.lineKey)
        ) {
          addSource(config.lineKey, linhas[config.lineKey].data);
          addLayers(config.lineKey, config.color);
          setMyList((prevList) => [...prevList, config.lineKey]);
        }
      });
    };

    handleVisibleLines();

    if (route && !myList.includes("route")) {
      addSource("route", route);
      addLayers("route", "black");
      setMyList((prevList) => [...prevList, "route"]);
    }
  }, [linhas, route]);

  const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: "metric",
    profile: "mapbox/driving",
    // interactive: false,
    controls: {
      inputs: false,
      instructions: false,
    },
    // Prioritize the layer drawn from your GeoJSON to draw directions
    below: "linha1",
  });

  const showAll = () => {
    const updatedLinhas = { ...linhas };

    Object.keys(updatedLinhas).forEach((key) => {
      if (!updatedLinhas[key].data) {
        axios
          .get(
            `https://zx6nzwm0oc.execute-api.eu-west-1.amazonaws.com/production/routes/sv-transcor-${removeSubstring(
              key
            )}`
          )
          .then((response) => {
            updatedLinhas[key] = {
              data: response.data.geo_json,
              visible: true,
            };
            setLinhas(updatedLinhas);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        updatedLinhas[key].visible = true;
      }
    });

    setLinhas(updatedLinhas);
  };

  const show = (id) => {
    const dataLinha = linhas[id].data;

    const updatedLinha = {
      data: dataLinha,
      visible: true,
    };

    if (linhas[id].visible) {
      remove(id);
    } else if (linhas[id].data) {
      setLinhas({ ...linhas, [id]: updatedLinha });
    } else {
      axios
        .get(
          `https://zx6nzwm0oc.execute-api.eu-west-1.amazonaws.com/production/routes/sv-transcor-${removeSubstring(
            id
          )}`
        )
        .then((response) => {
          const updatedLinha = {
            data: response.data.geo_json,
            visible: true,
          };

          setLinhas({ ...linhas, [id]: updatedLinha });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const calculateRoute = () => {
    console.log("origin", origin);
    console.log("destination", destination);

    // axios.get(`url/${origin};${destination}`).then((response) => {
    //   setRoute(response.data.geo_json)
    // })

    setRoute(linha1);
  };

  const remove = (id) => {
    const dataLinha = linhas[id].data;

    const updatedLinha = {
      data: dataLinha,
      visible: false,
    };

    if (!map.current) return;
    let busLayers;

    // // Get all existing map layers
    const existingLayers = map.current.getStyle().layers;

    // Remove each layer
    if (existingLayers) {
      existingLayers.forEach((layer) => {
        busLayers = existingLayers.filter((layer) => layer.id.includes(id));
      });

      if (busLayers) {
        busLayers.forEach((layer) => {
          map.current.removeLayer(layer.id);
        });
      }
    }

    setLinhas({ ...linhas, [id]: updatedLinha });
    setMyList([]);
  };

  const removeSubstring = (originalString) => {
    const value = "linha";
    // Use a regular expression with the 'g' flag to remove all occurrences of the substring
    return originalString.replace(new RegExp(value, "g"), "");
  };

  const removeRoute = () => {
    if (!map.current) return;

    if (myList.includes("route")) {
      const updatedMyList = myList.filter((item) => item !== "route");

      // Remove the route layer and source from the map
      map.current.removeLayer("bus-point-route");
      map.current.removeLayer("bus-line-route");
      map.current.removeSource("route");

      setMyList(updatedMyList);
      setRoute(null);
    }
  };

  const removeAll = () => {
    if (!map.current) return;

    const updatedLinhas = { ...linhas };

    // Get all existing map layers
    const existingLayers = map.current.getStyle().layers;

    // Remove each layer
    if (existingLayers) {
      existingLayers.forEach((layer) => {
        Object.keys(updatedLinhas).forEach((key) => {
          if (layer.id.includes(key)) {
            map.current.removeLayer(layer.id);
            // map.current.removeSource(key);
          }
        });
      });
    }

    Object.keys(updatedLinhas).forEach((key) => {
      updatedLinhas[key].visible = false;
    });

    removeRoute();
    setLinhas(updatedLinhas);
    setMyList([]);
  };

  const options = () => {
    return Object.keys(linhas).map((key, index) => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 2,
          marginTop: 2,
        }}
      >
        <div key={index} onClick={() => show(key)}>
          {"Linha" + " " + removeSubstring(key)}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: colors[index],
            width: 20,
            aspectRatio: 1,
            borderRadius: 100,
          }}
        />
      </div>
    ));
  };

  return (
    <div>
      <div className="sidebar">
        <div className="geoposition">
          <div>
            Longitude: {lng}| Latitude: {lat}
          </div>
        </div>
        <div className="geoposition">
          <div>
          Zoom: {zoom}          </div>
        </div>
        <div className="options">{options()}</div>
        <div className="options">
          <div onClick={showAll}>Show All</div>
          <div onClick={removeAll}>Remove All</div>
        </div>
        <div className="options">
          <div onClick={calculateRoute}>Calculate Route</div>
        </div>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
