const CENSUS_API_KEY = '438427c959adec7907bd7dcda11d828f83d8ba60'; // replace with your key

export async function fetchMedianIncome() {
  try {
    const res = await fetch('http://localhost:3000/api/median-income');
    const { name, income } = await res.json();

    const card = document.createElement("div");
    card.className = "metric-card";
    card.innerHTML = `
      <h3 class="metric-label">💵 Median Income</h3>
      <p class="metric-value">$${parseInt(income).toLocaleString()}</p>
    `;

    document.querySelector("#economy-metrics").appendChild(card);
  } catch (error) {
    console.error("❌ Failed to fetch median income:", error);
  }
}



export async function fetchCensusSummary() {
  try {
    const res = await fetch('http://localhost:3000/api/census-summary');
    const data = await res.json();

    const metrics = [
      { label: '👩 Total Population', value: data.population, section: '#demographics-metrics' },
      { label: '👶 Median Age', value: data.medianAge, section: '#demographics-metrics' },
      { label: '🎓 Bachelor’s Degree or Higher', value: `${data.educationRate}%`, section: '#education-metrics' },
      { label: '🏠 Homeownership Rate', value: `${data.homeOwnershipRate}%`, section: '#economy-metrics' }
    ];

    for (const metric of metrics) {
      const card = document.createElement("div");
      card.className = "metric-card";
      card.innerHTML = `
  <h3 class="metric-label">${metric.label}</h3>
  <p class="metric-value">${metric.value}</p>
`;
      document.querySelector(metric.section).appendChild(card);
    }

  } catch (error) {
    console.error("❌ Failed to fetch census summary:", error);
  }
}



export async function fetchDemographics() {
  try {
    const res = await fetch('http://localhost:3000/api/demographics');
    const data = await res.json();
    console.log("📊 /api/demographics raw data:", data);

    const metrics = [
      { label: "💼 Employment Rate", value: `${data.pctEmployed}%`, section: '#economy-metrics' },
      { label: "👪 Avg Household Size", value: data.avgHouseholdSize, section: '#economy-metrics' },
      { label: "🧓 % Age 65+", value: `${data.pct65plus}%`, section: '#demographics-metrics' },
      { label: "🧑‍🍼 % Under Age 5", value: `${data.pctUnder5}%`, section: '#demographics-metrics' },
    ];

    for (const metric of metrics) {
      const card = document.createElement("div");
      card.className = "metric-card";
      card.innerHTML = `
  <h3 class="metric-label">${metric.label}</h3>
  <p class="metric-value">${metric.value}</p>
`;

      document.querySelector(metric.section).appendChild(card);
    }
  } catch (error) {
    console.error("❌ Failed to fetch demographic data:", error);
  }
}

export async function fetchAllCensusMetrics() {
  try {
    const res = await fetch('http://localhost:3000/api/all-census-metrics');
    const data = await res.json();

    const metricsSection = document.querySelector(".metrics");
    metricsSection.innerHTML = ""; // Clear previous content

    const sections = [
      {
        title: "🏙️ Population & Age",
        items: {
          "Population": data.population.toLocaleString(),
          "Median Age": data.medianAge,
          "Avg Household Size": data.avgHouseholdSize
        }
      },
      {
        title: "🏠 Housing",
        items: {
          "Total Units": data.housing.totalUnits.toLocaleString(),
          "Occupied Units": data.housing.totalOccupied.toLocaleString(),
          "Owner-Occupied": data.housing.ownerOccupied.toLocaleString(),
          "Renter-Occupied": data.housing.renterOccupied.toLocaleString(),
          "Vacant Units": data.housing.vacant.toLocaleString(),
          "Homeownership Rate": `${data.housing.homeOwnershipRate}%`,
          "Median Home Value": `$${data.housing.medianHomeValue.toLocaleString()}`,
          "Median Rent": `$${data.housing.medianRent.toLocaleString()}`
        }
      },
      {
        title: "🎓 Education",
        items: {
          "% High School or Higher": `${data.education.percentHSorHigher}%`,
          "% Associate's Degree": `${data.education.percentAssociates}%`,
          "% Bachelor's or Higher": `${data.education.percentBachelorsOrHigher}%`
        }
      },
      {
        title: "💵 Income & Employment",
        items: {
          "Median Household Income": `$${data.income.medianHouseholdIncome.toLocaleString()}`,
          "Median Earnings": `$${data.income.medianEarnings.toLocaleString()}`,
          "Labor Force": data.employment.laborForce.toLocaleString(),
          "Employed": data.employment.employed.toLocaleString(),
          "Unemployed": data.employment.unemployed.toLocaleString(),
          "Participation Rate": `${data.employment.participationRate}%`,
          "Unemployment Rate": `${data.employment.unemploymentRate}%`
        }
      },
      {
        title: "🌎 Demographics",
        items: {
          "% White": `${data.race.white}%`,
          "% Black": `${data.race.black}%`,
          "% Asian": `${data.race.asian}%`,
          "% Two+ Races": `${data.race.twoOrMore}%`,
          "% Hispanic": `${data.race.hispanic}%`
        }
      },
      {
        title: "🚗 Commute",
        items: {
          "Avg Commute Time (min)": data.commute.avgCommuteTimeMinutes,
          "% Drive Alone": `${data.commute.carAlonePercent}%`,
          "% Use Public Transit": `${data.commute.publicTransitPercent}%`,
          "% Work From Home": `${data.commute.workFromHomePercent}%`
        }
      },
      {
        title: "🇺🇸 Other",
        items: {
          "Veterans": data.other.veterans.toLocaleString(),
          "People with Disability": data.other.disabled.toLocaleString(),
          "% with Disability": `${data.other.disabledPercent}%`
        }
      }
    ];

    sections.forEach(section => {
  const container = document.createElement("div");
  container.className = "metric-section";

  // Create a title for the group (like "🏡 Housing")
  const title = document.createElement("h2");
  title.textContent = section.title;
  container.appendChild(title);

  // Wrap the cards in a group div
  const group = document.createElement("div");
  group.className = "metric-card-group";

  // Add individual cards
  Object.entries(section.items).forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "metric-card";
    card.innerHTML = `
      <p class="metric-label">${label}</p>
      <p class="metric-value">${value}</p>
    `;
    group.appendChild(card);
  });

  // Append group to container
  container.appendChild(group);
  metricsSection.appendChild(container);
});

  } catch (err) {
    console.error("❌ Error displaying full census metrics:", err);
  }
}
