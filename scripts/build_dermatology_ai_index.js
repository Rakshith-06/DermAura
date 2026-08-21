import fs from 'fs';
import path from 'path';
import readline from 'readline';

const CSV_PATH = path.resolve(process.cwd(), 'synthetic_dermatology_cohort_50k.csv');
const OUTPUT_PATH = path.resolve(process.cwd(), 'data/dermatology_ai_index.json');

async function processDataset() {
  console.log(`🚀 Processing 50,000 patient records from: ${CSV_PATH}`);
  const startTime = Date.now();

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let totalRecords = 0;
  let headers = [];

  const demographics = {
    gender: { Female: 0, Male: 0 },
    ageBrackets: { '15-24': 0, '25-39': 0, '40-59': 0, '60-80': 0 },
    cityTiers: { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0, 'Semi-Urban': 0 },
    regions: { North: 0, South: 0, West: 0, East: 0, Central: 0 },
  };

  let totalComorbid = 0;
  let totalScalpAffected = 0;
  let totalFacialAffected = 0;

  const conditionCounts = {};
  const scalpConditionCounts = {};
  const facialConditionCounts = {};
  const conditionCoOccurrence = {};

  const symptomToConditionMap = {};
  const conditionToSymptomsMap = {};

  const environmental = {
    waterHardness: { 'Hard (>300 ppm)': 0, 'Moderate (150-300 ppm)': 0, 'Soft (<150 ppm)': 0 },
    pollution: { 'High (PM2.5 > 100)': 0, 'Moderate (PM2.5 50-100)': 0, 'Low (PM2.5 < 50)': 0 },
  };

  const metabolicAndNutritional = {
    hormonalFactors: {},
    nutritionalDeficiencies: {},
  };

  const clinicalCourse = {
    otcSteroidMisuseTotal: 0,
    otcSteroidMisuseByCondition: {},
    stressLevels: { High: 0, Moderate: 0, Low: 0 },
    priorConsultations: {},
    durationMonthsSum: {},
    durationMonthsCount: {},
  };

  const riskFactorImpact = {
    hardWater: {},
    highPollution: {},
    highStress: {},
    otcSteroidMisuse: {},
    nutritionalDeficiencies: {},
    hormonalFactors: {},
  };

  const severityDistribution = {};

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (totalRecords === 0) {
      headers = line.split(',').map((h) => h.trim());
      totalRecords++;
      continue;
    }

    const row = line.split(',').map((cell) => cell.trim());
    if (row.length < headers.length) continue;

    totalRecords++;

    const [
      patient_id,
      ageStr,
      gender,
      city_tier,
      state_region,
      has_scalp_issue,
      scalp_condition_primary,
      scalp_condition_secondary,
      scalp_severity_grade,
      scalp_symptoms,
      has_facial_issue,
      facial_condition_primary,
      facial_condition_secondary,
      facial_severity_grade,
      facial_symptoms,
      water_hardness_exposure,
      pollution_exposure_level,
      hormonal_metabolic_factor,
      nutritional_deficiency,
      otc_steroid_misuse_history,
      daily_stress_level,
      comorbid_overlap,
      duration_months_str,
      prior_consultation_type,
    ] = row;

    const age = parseInt(ageStr, 10) || 25;
    const durationMonths = parseInt(duration_months_str, 10) || 12;

    // Demographics
    if (demographics.gender[gender] !== undefined) demographics.gender[gender]++;
    if (age >= 15 && age <= 24) demographics.ageBrackets['15-24']++;
    else if (age >= 25 && age <= 39) demographics.ageBrackets['25-39']++;
    else if (age >= 40 && age <= 59) demographics.ageBrackets['40-59']++;
    else if (age >= 60) demographics.ageBrackets['60-80']++;

    if (demographics.cityTiers[city_tier] !== undefined) demographics.cityTiers[city_tier]++;
    if (demographics.regions[state_region] !== undefined) demographics.regions[state_region]++;

    // Cohort Flags
    if (has_scalp_issue === '1') totalScalpAffected++;
    if (has_facial_issue === '1') totalFacialAffected++;
    if (comorbid_overlap === '1') totalComorbid++;

    // Conditions
    const primaryConditions = [];
    if (scalp_condition_primary && scalp_condition_primary !== 'None') {
      primaryConditions.push(scalp_condition_primary);
      scalpConditionCounts[scalp_condition_primary] = (scalpConditionCounts[scalp_condition_primary] || 0) + 1;
    }
    if (facial_condition_primary && facial_condition_primary !== 'None') {
      primaryConditions.push(facial_condition_primary);
      facialConditionCounts[facial_condition_primary] = (facialConditionCounts[facial_condition_primary] || 0) + 1;
    }

    primaryConditions.forEach((cond) => {
      conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
      clinicalCourse.durationMonthsSum[cond] = (clinicalCourse.durationMonthsSum[cond] || 0) + durationMonths;
      clinicalCourse.durationMonthsCount[cond] = (clinicalCourse.durationMonthsCount[cond] || 0) + 1;
    });

    // Co-occurrence pair tracking
    if (scalp_condition_primary && scalp_condition_primary !== 'None' && facial_condition_primary && facial_condition_primary !== 'None') {
      const pairKey = `${scalp_condition_primary} + ${facial_condition_primary}`;
      conditionCoOccurrence[pairKey] = (conditionCoOccurrence[pairKey] || 0) + 1;
    }

    // Symptoms
    const allSymptoms = [
      ...(scalp_symptoms ? scalp_symptoms.split('|') : []),
      ...(facial_symptoms ? facial_symptoms.split('|') : []),
    ].filter((s) => s && s !== 'None');

    allSymptoms.forEach((sym) => {
      if (!symptomToConditionMap[sym]) symptomToConditionMap[sym] = {};
      primaryConditions.forEach((cond) => {
        symptomToConditionMap[sym][cond] = (symptomToConditionMap[sym][cond] || 0) + 1;
        if (!conditionToSymptomsMap[cond]) conditionToSymptomsMap[cond] = {};
        conditionToSymptomsMap[cond][sym] = (conditionToSymptomsMap[cond][sym] || 0) + 1;
      });
    });

    // Environmental Drivers
    if (environmental.waterHardness[water_hardness_exposure] !== undefined) {
      environmental.waterHardness[water_hardness_exposure]++;
    }
    if (environmental.pollution[pollution_exposure_level] !== undefined) {
      environmental.pollution[pollution_exposure_level]++;
    }

    // Metabolic & Nutritional
    if (hormonal_metabolic_factor && hormonal_metabolic_factor !== 'None') {
      metabolicAndNutritional.hormonalFactors[hormonal_metabolic_factor] =
        (metabolicAndNutritional.hormonalFactors[hormonal_metabolic_factor] || 0) + 1;
    }
    if (nutritional_deficiency && nutritional_deficiency !== 'None') {
      nutritional_deficiency.split('|').forEach((nut) => {
        metabolicAndNutritional.nutritionalDeficiencies[nut] =
          (metabolicAndNutritional.nutritionalDeficiencies[nut] || 0) + 1;
      });
    }

    // Clinical Course & Risks
    if (otc_steroid_misuse_history === '1') {
      clinicalCourse.otcSteroidMisuseTotal++;
      primaryConditions.forEach((cond) => {
        clinicalCourse.otcSteroidMisuseByCondition[cond] =
          (clinicalCourse.otcSteroidMisuseByCondition[cond] || 0) + 1;
      });
    }
    if (clinicalCourse.stressLevels[daily_stress_level] !== undefined) {
      clinicalCourse.stressLevels[daily_stress_level]++;
    }
    if (prior_consultation_type) {
      clinicalCourse.priorConsultations[prior_consultation_type] =
        (clinicalCourse.priorConsultations[prior_consultation_type] || 0) + 1;
    }

    // Risk Factor Multipliers
    primaryConditions.forEach((cond) => {
      if (water_hardness_exposure.includes('Hard')) {
        riskFactorImpact.hardWater[cond] = (riskFactorImpact.hardWater[cond] || 0) + 1;
      }
      if (pollution_exposure_level.includes('High')) {
        riskFactorImpact.highPollution[cond] = (riskFactorImpact.highPollution[cond] || 0) + 1;
      }
      if (daily_stress_level === 'High') {
        riskFactorImpact.highStress[cond] = (riskFactorImpact.highStress[cond] || 0) + 1;
      }
      if (otc_steroid_misuse_history === '1') {
        riskFactorImpact.otcSteroidMisuse[cond] = (riskFactorImpact.otcSteroidMisuse[cond] || 0) + 1;
      }
      if (nutritional_deficiency && nutritional_deficiency !== 'None') {
        nutritional_deficiency.split('|').forEach((nut) => {
          if (!riskFactorImpact.nutritionalDeficiencies[nut]) {
            riskFactorImpact.nutritionalDeficiencies[nut] = {};
          }
          riskFactorImpact.nutritionalDeficiencies[nut][cond] =
            (riskFactorImpact.nutritionalDeficiencies[nut][cond] || 0) + 1;
        });
      }
      if (hormonal_metabolic_factor && hormonal_metabolic_factor !== 'None') {
        if (!riskFactorImpact.hormonalFactors[hormonal_metabolic_factor]) {
          riskFactorImpact.hormonalFactors[hormonal_metabolic_factor] = {};
        }
        riskFactorImpact.hormonalFactors[hormonal_metabolic_factor][cond] =
          (riskFactorImpact.hormonalFactors[hormonal_metabolic_factor][cond] || 0) + 1;
      }

      const sev = scalp_severity_grade !== 'None' ? scalp_severity_grade : facial_severity_grade;
      if (sev && sev !== 'None') {
        if (!severityDistribution[cond]) severityDistribution[cond] = {};
        severityDistribution[cond][sev] = (severityDistribution[cond][sev] || 0) + 1;
      }
    });
  }

  // Calculate averages
  const avgDurationMonths = {};
  Object.keys(clinicalCourse.durationMonthsSum).forEach((cond) => {
    avgDurationMonths[cond] = Math.round(
      clinicalCourse.durationMonthsSum[cond] / clinicalCourse.durationMonthsCount[cond]
    );
  });

  const totalPatients = totalRecords - 1;

  const indexData = {
    meta: {
      totalCohortSize: totalPatients,
      generatedAt: new Date().toISOString(),
      sourceDataset: 'synthetic_dermatology_cohort_50k.csv',
    },
    demographics,
    cohortOverview: {
      totalPatients,
      totalScalpAffected,
      totalScalpPercent: Math.round((totalScalpAffected / totalPatients) * 1000) / 10,
      totalFacialAffected,
      totalFacialPercent: Math.round((totalFacialAffected / totalPatients) * 1000) / 10,
      totalComorbid,
      comorbidPercent: Math.round((totalComorbid / totalPatients) * 1000) / 10,
    },
    conditionCounts,
    scalpConditionCounts,
    facialConditionCounts,
    topCoOccurrences: Object.entries(conditionCoOccurrence)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pair, count]) => ({ pair, count, percentOfComorbid: Math.round((count / totalComorbid) * 100) })),
    symptomToConditionMap,
    conditionToSymptomsMap,
    environmental,
    metabolicAndNutritional,
    clinicalCourse: {
      otcSteroidMisuseTotal: clinicalCourse.otcSteroidMisuseTotal,
      otcSteroidMisusePercent: Math.round((clinicalCourse.otcSteroidMisuseTotal / totalPatients) * 1000) / 10,
      otcSteroidMisuseByCondition: clinicalCourse.otcSteroidMisuseByCondition,
      stressLevels: clinicalCourse.stressLevels,
      priorConsultations: clinicalCourse.priorConsultations,
      avgDurationMonths,
    },
    riskFactorImpact,
    severityDistribution,
  };

  const dataDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(indexData, null, 2));
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Deep multi-dimensional knowledge index created at ${OUTPUT_PATH} in ${timeTaken}s!`);
}

processDataset().catch(console.error);
