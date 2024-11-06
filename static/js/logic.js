// Create base maps
const terrain = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors'
  });
  
  // Create the map
  const map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    layers: [terrain]
  });
  
  // Base map
  const baseMaps = {
    "Terrain Map": terrain
  };
  
  // Grouping
  const earthquakes = new L.LayerGroup();
  const tectonicPlates = new L.LayerGroup();
  
  // Overlay for Earthquakes and Tectonic Plates
  const overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };
  
  // Getting earthquake data and plotting
  const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
  d3.json(earthquakeUrl).then(data => {
    L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 0.5,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                         <p>Magnitude: ${feature.properties.mag}</p>
                         <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
      }
    }).addTo(earthquakes);
    earthquakes.addTo(map);
  });
  
  // Getting tectonic plates data and plotting
  const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  d3.json(tectonicPlatesUrl).then(data => {
    L.geoJson(data, {
      style: {
        color: "red",
        weight: 2
      }
    }).addTo(tectonicPlates);
    tectonicPlates.addTo(map);
  });
  
  // Legend
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    const div = L.DomUtil.create("div", "info legend"),
          depths = [-10, 10, 30, 50, 70, 90];
    
    div.innerHTML = "<h4>Depth (km)</h4>";
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background:${getColor(depths[i] + 1)}"></i> ` +
        depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
    }
    return div;
  };
  legend.addTo(map);
  
  // Layer control
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
  
  // Marker customization
  function getColor(depth) {
    return depth > 90 ? "#08306b" :   
    depth > 70 ? "#2171b5" :   
    depth > 50 ? "#6baed6" :   
    depth > 30 ? "#9ecae1" :   
    depth > 10 ? "#c6dbef" :  
                 "#deebf7";    
}
  
  function getRadius(magnitude) {
    return magnitude * 3;
  }