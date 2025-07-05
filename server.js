import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

app.use(cors());

const CENSUS_API_KEY = '438427c959adec7907bd7dcda11d828f83d8ba60';

app.get('/api/median-income', async (req, res) => {
  const url = `https://api.census.gov/data/2020/acs/acs5?get=NAME,B19013_001E&for=place:82700&in=state:18&key=${CENSUS_API_KEY}`;

  try {
    const response = await fetch(url);

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("❌ Census API error or HTML response:\n", errorText);
      return res.status(500).json({ error: 'Census API returned invalid response.' });
    }

    const data = await response.json();
    console.log("📥 Raw Census Data:", data);

    const [headers, ...rows] = data;
    const row = rows[0];

    if (!row || row.length < 2) {
      console.error("❌ Malformed Census response row:", row);
      return res.status(500).json({ error: "Invalid response from Census API." });
    }

    const [name, income] = row;
    res.json({ name, income });

  } catch (error) {
    console.error("❌ Failed to fetch Census data:", error);
    res.status(500).json({ error: 'Failed to fetch census data' });
  }
});





app.get('/api/census-summary', async (req, res) => {
  const variables = [
    'B01003_001E',  // total population
    'B01002_001E',  // median age
    'B25003_001E',  // total housing units
    'B25003_002E',  // owner-occupied units
    'B15003_001E',  // total population 25+
    'B15003_022E', 'B15003_023E', 'B15003_024E', 'B15003_025E' // bachelor's or higher
  ].join(',');

  const url = `https://api.census.gov/data/2020/acs/acs5?get=NAME,${variables}&for=place:82700&in=state:18&key=${CENSUS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
console.log("📊 /api/census-summary raw data:", data); // ✅ This is correct

    const [headers, ...rows] = data;
    const row = rows[0];

    const [
      name,
      pop,
      medianAge,
      totalUnits,
      ownerUnits,
      age25Plus,
      bach1, bach2, bach3, bach4
    ] = row.slice(0, 10);

    const bachelorTotal = Number(bach1) + Number(bach2) + Number(bach3) + Number(bach4);
    const educationRate = ((bachelorTotal / Number(age25Plus)) * 100).toFixed(1);
    const homeOwnershipRate = ((Number(ownerUnits) / Number(totalUnits)) * 100).toFixed(1);

    res.json({
      name,
      population: Number(pop).toLocaleString(),
      medianAge,
      educationRate,
      homeOwnershipRate
    });
  } catch (err) {
    console.error("❌ Error fetching census summary:", err);
    res.status(500).json({ error: 'Failed to fetch census summary' });
  }
});


app.get('/api/demographics', async (req, res) => {
  const variables = [
    'B23025_001E', 'B23025_004E', // Employment
    'B25010_001E',                // Avg household size
    'B01003_001E',                // Total population
    'B01001_020E','B01001_021E','B01001_022E','B01001_023E','B01001_024E','B01001_025E', // Male 65+
    'B01001_044E','B01001_045E','B01001_046E','B01001_047E','B01001_048E','B01001_049E', // Female 65+
    'B08303_001E',                // Mean travel time
    'B01001_003E','B01001_027E'   // Male/Female under 5
  ].join(',');

  const url = `https://api.census.gov/data/2020/acs/acs5?get=NAME,${variables}&for=place:82700&in=state:18&key=${CENSUS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("📊 /api/demographics raw data:", data);

    const [headers, ...rows] = data;
const row = rows[0].slice(1).map(Number);

  const [
  pop16Plus, employed,
  avgHouseholdSize,
  totalPop,
  m65a, m65b, m65c, m65d, m65e, m65f,
  f65a, f65b, f65c, f65d, f65e, f65f,
  maleUnder5, femaleUnder5
] = row;


   const total65plus = m65a + m65b + m65c + m65d + m65e + m65f +
                    f65a + f65b + f65c + f65d + f65e + f65f;

const totalUnder5 = maleUnder5 + femaleUnder5;

const pctEmployed = ((employed / pop16Plus) * 100).toFixed(1);
const pct65plus = ((total65plus / totalPop) * 100).toFixed(1);
const pctUnder5 = ((totalUnder5 / totalPop) * 100).toFixed(1);


    res.json({
  pctEmployed,
avgHouseholdSize: Number(avgHouseholdSize).toFixed(2),
  pct65plus,
  pctUnder5
});

  } catch (err) {
    console.error("❌ Error fetching demographics:", err);
    res.status(500).json({ error: 'Failed to fetch demographic data' });
  }
});






app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



app.get('/api/all-census-metrics', async (req, res) => {
  const variables = [
    // Population & Age
    'B01003_001E', // Total population
    'B01002_001E', // Median age

    // Household Characteristics
    'B25010_001E', // Avg household size

    // Housing
    'B25003_001E', 'B25003_002E', 'B25003_003E', // Housing: total, owner-occupied, renter-occupied
    'B25002_001E', 'B25002_003E',                // Total units, vacant units
    'B25077_001E',                               // Median home value
    'B25064_001E',                               // Median gross rent

    // Education (25+)
    'B15003_001E',                               // Total pop 25+
    'B15003_017E','B15003_021E',                 // HS grad+, Associate’s
    'B15003_022E','B15003_023E','B15003_024E','B15003_025E', // Bachelor’s+

    // Employment & Economy
    'B23025_001E', 'B23025_002E', 'B23025_004E', 'B23025_005E', // Labor force, employed, unemployed
    'B20004_001E', // Median earnings (full-time)
    'B19013_001E', // Median household income

    // Race & Ethnicity
    'B02001_001E','B02001_002E','B02001_003E','B02001_005E','B02001_008E', // Race
    'B03003_001E','B03003_003E', // Hispanic/Latino

    // Veterans & Disability
    'B21001_002E', // Veterans
    'B18101_001E', 'B18101_033E', // Disability total, disabled total

    // Commute & Mobility
    'B08303_001E', // Avg commute time
    'B08301_001E', 'B08301_003E', 'B08301_010E', 'B08301_021E', // Transportation: total, car alone, public, work from home
  ].join(',');

  const url = `https://api.census.gov/data/2020/acs/acs5?get=NAME,${variables}&for=place:82700&in=state:18&key=${CENSUS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const [headers, ...rows] = data;
    const row = rows[0];

    const get = (key) => Number(row[headers.indexOf(key)]);

    const educationTotal = get('B15003_001E');
    const bachelorPlus = ['B15003_022E','B15003_023E','B15003_024E','B15003_025E']
      .map(get).reduce((sum, val) => sum + val, 0);

    const raceTotal = get('B02001_001E');
    const hispanicTotal = get('B03003_003E');
    const commuteTotal = get('B08301_001E');

    res.json({
      name: row[0],
      population: get('B01003_001E'),
      medianAge: get('B01002_001E'),
      avgHouseholdSize: get('B25010_001E'),

      housing: {
        totalOccupied: get('B25003_001E'),
        ownerOccupied: get('B25003_002E'),
        renterOccupied: get('B25003_003E'),
        vacant: get('B25002_003E'),
        totalUnits: get('B25002_001E'),
        homeOwnershipRate: ((get('B25003_002E') / get('B25003_001E')) * 100).toFixed(1),
        medianHomeValue: get('B25077_001E'),
        medianRent: get('B25064_001E')
      },

      education: {
        percentHSorHigher: ((get('B15003_017E') / educationTotal) * 100).toFixed(1),
        percentAssociates: ((get('B15003_021E') / educationTotal) * 100).toFixed(1),
        percentBachelorsOrHigher: ((bachelorPlus / educationTotal) * 100).toFixed(1)
      },

      income: {
        medianHouseholdIncome: get('B19013_001E'),
        medianEarnings: get('B20004_001E')
      },

      employment: {
        laborForce: get('B23025_001E'),
        employed: get('B23025_004E'),
        unemployed: get('B23025_005E'),
        participationRate: ((get('B23025_002E') / get('B23025_001E')) * 100).toFixed(1),
        unemploymentRate: ((get('B23025_005E') / get('B23025_001E')) * 100).toFixed(1)
      },

      race: {
        white: ((get('B02001_002E') / raceTotal) * 100).toFixed(1),
        black: ((get('B02001_003E') / raceTotal) * 100).toFixed(1),
        asian: ((get('B02001_005E') / raceTotal) * 100).toFixed(1),
        twoOrMore: ((get('B02001_008E') / raceTotal) * 100).toFixed(1),
        hispanic: ((hispanicTotal / get('B03003_001E')) * 100).toFixed(1)
      },

      other: {
        veterans: get('B21001_002E'),
        disabled: get('B18101_033E'),
        disabledPercent: ((get('B18101_033E') / get('B18101_001E')) * 100).toFixed(1)
      },

      commute: {
avgCommuteTimeMinutes: get('B08303_001E').toFixed(1),
        carAlonePercent: ((get('B08301_003E') / commuteTotal) * 100).toFixed(1),
        publicTransitPercent: ((get('B08301_010E') / commuteTotal) * 100).toFixed(1),
        workFromHomePercent: ((get('B08301_021E') / commuteTotal) * 100).toFixed(1)
      }
    });

  } catch (err) {
    console.error("❌ Error fetching all metrics:", err);
    res.status(500).json({ error: 'Failed to fetch all census metrics' });
  }
});
