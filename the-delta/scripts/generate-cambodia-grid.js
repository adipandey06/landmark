const fs = require('fs');
const path = require('path');

const MIN_LON = 102.2;
const MAX_LON = 107.6;
const MIN_LAT = 10.4;
const MAX_LAT = 14.7;
const STEP = 0.045; // ~5km

const features = [];

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SOIL_TYPES = ["Alluvial", "Acrisols", "Ferralsols", "Lithosols", "Podzuvisols"];
// Acrisols and Ferralsols are common in Cambodia, Alluvial near Tonle Sap and Mekong.

for (let lat = MIN_LAT; lat <= MAX_LAT; lat += STEP) {
  for (let lon = MIN_LON; lon <= MAX_LON; lon += STEP) {
    // Rough clip for the Gulf of Thailand (bottom left)
    if (lat < 11.5 && lon < 103.5) continue;
    // Rough clip for Vietnam (bottom right)
    if (lat < 12.0 && lon > 106.5) continue;
    // Rough clip for Laos (top right)
    if (lat > 14.0 && lon > 107.0) continue;
    // Rough clip for Thailand (top left)
    if (lat > 14.0 && lon < 103.0) continue;

    // Add some noise to the grid points
    const pointLon = Math.round((lon + randomInRange(-0.01, 0.01)) * 1000) / 1000;
    const pointLat = Math.round((lat + randomInRange(-0.01, 0.01)) * 1000) / 1000;

    // In Cambodia, Tonle Sap is around (104.0, 12.5) to (104.5, 13.0). We can label this 'water' or non-agri.
    const isTonleSap = pointLon > 103.6 && pointLon < 104.6 && pointLat > 12.1 && pointLat < 13.2;
    
    let isAgricultural = false;
    let soilType = pickRandom(["Acrisols", "Ferralsols", "Lithosols"]);

    if (!isTonleSap) {
       // Higher chance of agriculture near Tonle Sap and Mekong (Central flatlands)
       if (pointLon > 104.0 && pointLon < 106.0 && pointLat > 11.0 && pointLat < 13.5) {
         isAgricultural = Math.random() > 0.2; // 80% chance
         soilType = "Alluvial";
       } else {
         isAgricultural = Math.random() > 0.6; // 40% chance elsewhere
       }
    }

    const feature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [pointLon, pointLat]
      },
      properties: {
        isAgricultural: isTonleSap ? false : isAgricultural,
        isWater: isTonleSap,
        soilType: isTonleSap ? "Water" : soilType,
        ph: isTonleSap ? null : Math.round(randomInRange(5.5, 7.5) * 10) / 10,
        temperature: Math.round(randomInRange(25.0, 35.0) * 10) / 10,
        humidity: isTonleSap ? Math.round(randomInRange(80.0, 95.0) * 10) / 10 : Math.round(randomInRange(60.0, 90.0) * 10) / 10,
        ndvi: isTonleSap ? 0 : Math.round(randomInRange(isAgricultural ? 0.5 : 0.2, isAgricultural ? 0.9 : 0.7) * 100) / 100, // Satellite
        soilMoisture: isTonleSap ? 100 : Math.round(randomInRange(10, 60) * 10) / 10, // Satellite/Sensor
        precipitationForecast: Math.round(randomInRange(0, 50) * 10) / 10,
        riskLevel: isTonleSap ? "Low" : pickRandom(["Low", "Medium", "High", "Critical"])
      }
    };
    
    features.push(feature);
  }
}

const geojson = {
  type: "FeatureCollection",
  features
};

const outPath = path.join(__dirname, '..', 'public', 'cambodia_grid.json');
fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2));

console.log(`Generated ${features.length} points for Cambodia grid at ${outPath}`);
