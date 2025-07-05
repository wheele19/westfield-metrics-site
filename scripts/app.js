console.log("🚀 Westfield Metrics Dashboard ready.");import { fetchWeatherAndAirQuality } from './weather.js';
import { fetchAllCensusMetrics } from './census.js';

console.log("🚀 Westfield Metrics Dashboard ready.");

// Utility to insert a group of metrics under a section
export function renderMetricGroup(sectionId, title, metrics) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const groupContainer = document.createElement("div");
  groupContainer.className = "metric-group";

  const groupTitle = document.createElement("h3");
  groupTitle.className = "metric-subtitle";
  groupTitle.textContent = title;
  groupContainer.appendChild(groupTitle);

  const groupCards = document.createElement("div");
  groupCards.className = "metric-card-group";

  metrics.forEach(metric => {
    const card = document.createElement("div");
    card.className = "metric-card";
    card.innerHTML = `
      <p class="metric-label">${metric.label}</p>
      <p class="metric-value">${metric.value}</p>
    `;
    groupCards.appendChild(card);
  });

  groupContainer.appendChild(groupCards);
  section.appendChild(groupContainer);
}


// 🎯 MAIN INIT
async function init() {
  // Weather
  await fetchWeatherAndAirQuality();

  // Census Data
  const data = await fetchAllCensusMetrics();
  console.log("📊 Parsed Census Data:", data);

  // Organize metrics into categories
 renderMetricGroup("demographics-metrics", "👤 Population & Age", [
  { label: "Population", value: data.population.toLocaleString() },
  { label: "Median Age", value: data.medianAge },
  { label: "Avg Household Size", value: data.avgHouseholdSize }
]);

renderMetricGroup("economy-metrics", "🏡 Housing", [
  { label: "Total Units", value: data.housing.totalUnits.toLocaleString() },
  { label: "Occupied Units", value: data.housing.totalOccupied.toLocaleString() },
  { label: "Owner-Occupied", value: data.housing.ownerOccupied.toLocaleString() },
  { label: "Renter-Occupied", value: data.housing.renterOccupied.toLocaleString() },
  { label: "Vacant Units", value: data.housing.vacant.toLocaleString() },
  { label: "Homeownership Rate", value: `${data.housing.homeOwnershipRate}%` },
  { label: "Median Home Value", value: `$${data.housing.medianHomeValue.toLocaleString()}` },
  { label: "Median Rent", value: `$${data.housing.medianRent.toLocaleString()}` },
]);

renderMetricGroup("education-metrics", "🎓 Education", [
  { label: "% High School or Higher", value: `${data.education.percentHSorHigher}%` },
  { label: "% Associate’s Degree", value: `${data.education.percentAssociates}%` },
  { label: "% Bachelor’s or Higher", value: `${data.education.percentBachelorsOrHigher}%` }
]);

renderMetricGroup("economy-metrics", "💵 Income & Employment", [
  { label: "Median Household Income", value: `$${data.income.medianHouseholdIncome.toLocaleString()}` },
  { label: "Median Earnings", value: `$${data.income.medianEarnings.toLocaleString()}` },
  { label: "Labor Force", value: data.employment.laborForce.toLocaleString() },
  { label: "Employed", value: data.employment.employed.toLocaleString() },
  { label: "Unemployed", value: data.employment.unemployed.toLocaleString() },
  { label: "Participation Rate", value: `${data.employment.participationRate}%` },
  { label: "Unemployment Rate", value: `${data.employment.unemploymentRate}%` },
]);

renderMetricGroup("demographics-metrics", "🌐 Demographics", [
  { label: "% White", value: `${data.race.white}%` },
  { label: "% Black", value: `${data.race.black}%` },
  { label: "% Asian", value: `${data.race.asian}%` },
  { label: "% Two+ Races", value: `${data.race.twoOrMore}%` },
  { label: "% Hispanic", value: `${data.race.hispanic}%` },
]);

renderMetricGroup("environment-metrics", "🚗 Commute", [
  { label: "Avg Commute Time (min)", value: data.commute.avgCommuteTimeMinutes },
  { label: "% Drive Alone", value: `${data.commute.carAlonePercent}%` },
  { label: "% Use Public Transit", value: `${data.commute.publicTransitPercent}%` },
  { label: "% Work From Home", value: `${data.commute.workFromHomePercent}%` }
]);

renderMetricGroup("demographics-metrics", "🧑‍🎖️ US Other", [
  { label: "Veterans", value: data.other.veterans.toLocaleString() },
  { label: "People with Disability", value: data.other.disabled.toLocaleString() },
  { label: "% with Disability", value: `${data.other.disabledPercent}%` }
]);

}

init();


fetchAllCensusMetrics();
