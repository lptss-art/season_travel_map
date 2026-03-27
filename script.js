const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const monthSlider = document.getElementById('month-slider');
const monthLabel = document.getElementById('month-label');
const tooltipContainer = document.getElementById('tooltip');
const ttCountry = document.getElementById('tt-country');
const ttMonth = document.getElementById('tt-month');
const ttScore = document.getElementById('tt-score');
const ttNote = document.getElementById('tt-note');

let travelData = {};
let currentMonthIndex = 1;
let worldGeoJson = null;

// Initialize Globe
const myGlobe = Globe()
  (document.getElementById('globe-container'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .lineHoverPrecision(0)
  .polygonsData([])
  .polygonAltitude(0.01)
  .polygonCapColor(d => getCountryColor(d))
  .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
  .polygonStrokeColor(() => '#111')
  .polygonLabel(() => '') // We use custom tooltip handling
  .onPolygonHover(hoverObj => {
    myGlobe.polygonAltitude(d => d === hoverObj ? 0.05 : 0.01)
           .polygonCapColor(d => getCountryColor(d, d === hoverObj));

    if (hoverObj) {
      showTooltip(hoverObj);
    } else {
      hideTooltip();
    }
  });

// Setup mouse move listener for tooltip positioning
document.addEventListener('mousemove', (e) => {
  if (!tooltipContainer.classList.contains('hidden')) {
    // Add offset so tooltip doesn't overlap with mouse pointer
    tooltipContainer.style.left = (e.pageX + 15) + 'px';
    tooltipContainer.style.top = (e.pageY + 15) + 'px';
  }
});

// Load standard world GeoJSON and our custom data
Promise.all([
  fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson').then(res => res.json()),
  fetch('data.json').then(res => res.json())
]).then(([geoJson, data]) => {
  worldGeoJson = geoJson;
  travelData = data;

  // Exclude Antarctica for better visualization
  worldGeoJson.features = worldGeoJson.features.filter(f => f.properties.ISO_A3 !== 'ATA');

  myGlobe.polygonsData(worldGeoJson.features);
}).catch(err => console.error("Error loading data:", err));

// Interpolate color from Red (0) to Green (100)
function getColorByScore(score) {
  if (score === null || score === undefined) return 'rgba(100, 100, 100, 0.3)'; // Unknown/Grey

  // Color transition: Red -> Yellow -> Green
  let r, g, b = 0;
  if (score < 50) {
    // Red to Yellow (Score 0-50)
    // Red stays 255, Green increases from 0 to 255
    r = 255;
    g = Math.round(255 * (score / 50));
  } else {
    // Yellow to Green (Score 50-100)
    // Green stays 255, Red decreases from 255 to 0
    r = Math.round(255 * (1 - ((score - 50) / 50)));
    g = 255;
  }

  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

// Get color based on country data for the current month
function getCountryColor(feat, isHovered = false) {
  const isoA3 = feat.properties.ISO_A3;
  const countryData = travelData[isoA3];

  if (countryData && countryData.months && countryData.months[currentMonthIndex]) {
    const score = countryData.months[currentMonthIndex].score;
    const color = getColorByScore(score);
    // If hovered, make it fully opaque
    if (isHovered) {
      return color.replace('0.8)', '1)');
    }
    return color;
  }

  return isHovered ? 'rgba(150, 150, 150, 0.8)' : 'rgba(100, 100, 100, 0.3)';
}

function showTooltip(feat) {
  const isoA3 = feat.properties.ISO_A3;
  const countryName = feat.properties.NAME_FR || feat.properties.NAME;
  const countryData = travelData[isoA3];

  ttCountry.innerText = (countryData && countryData.name) ? countryData.name : countryName;
  ttMonth.innerText = monthNames[currentMonthIndex - 1];

  if (countryData && countryData.months && countryData.months[currentMonthIndex]) {
    const monthData = countryData.months[currentMonthIndex];
    ttScore.innerText = monthData.score;
    ttScore.style.color = getColorByScore(monthData.score);
    ttNote.innerText = monthData.note || "Aucune note disponible.";
  } else {
    ttScore.innerText = "-";
    ttScore.style.color = "white";
    ttNote.innerText = "Pas de données pour ce pays.";
  }

  tooltipContainer.classList.remove('hidden');
}

function hideTooltip() {
  tooltipContainer.classList.add('hidden');
}

// Handle slider changes
monthSlider.addEventListener('input', (e) => {
  currentMonthIndex = parseInt(e.target.value, 10);
  monthLabel.innerText = "Mois: " + monthNames[currentMonthIndex - 1];

  // Refresh globe colors
  // Since myGlobe.polygonCapColor uses getCountryColor which reads currentMonthIndex,
  // we just need to re-assign the colors. A simple way to trigger reactivity in globe.gl
  // is to re-assign the polygonCapColor function or re-pass the data.
  myGlobe.polygonCapColor(d => getCountryColor(d));

  // Refresh tooltip if visible
  if (!tooltipContainer.classList.contains('hidden')) {
    // We don't have direct access to the currently hovered feature easily,
    // but the color update will happen. The user moving the mouse will refresh the tooltip.
    // Or we can just hide it to force a re-hover.
    hideTooltip();
  }
});

// Optional: Enable auto-rotate
myGlobe.controls().autoRotate = true;
myGlobe.controls().autoRotateSpeed = 0.5;

// Stop auto-rotate when user interacts
const globeCanvas = document.getElementById('globe-container');
globeCanvas.addEventListener('mousedown', () => {
  myGlobe.controls().autoRotate = false;
});
globeCanvas.addEventListener('wheel', () => {
  myGlobe.controls().autoRotate = false;
});
