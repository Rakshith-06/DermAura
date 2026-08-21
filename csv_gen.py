import numpy as np
import pandas as pd
from faker import Faker

# Initialize Faker and seed for reproducibility
fake = Faker('en_IN')
np.random.seed(42)
Faker.seed(42)

N = 50000

# -------------------------------------------------------------
# 1. Identifiers & Demographics
# -------------------------------------------------------------
patient_ids = [f"IND_PAT_{i+1:05d}" for i in range(N)]

# Gender distribution: Female 53%, Male 47%
gender = np.random.choice(['Female', 'Male'], size=N, p=[0.53, 0.47])

# Age distribution: 15-24 (36.4%), 25-39 (42.8%), 40-59 (16.2%), 60-80 (4.6%)
age_brackets = np.random.choice(
    ['15-24', '25-39', '40-59', '60-80'],
    size=N,
    p=[0.364, 0.428, 0.162, 0.046]
)
ages = np.empty(N, dtype=int)
ages[age_brackets == '15-24'] = np.random.randint(15, 25, size=np.sum(age_brackets == '15-24'))
ages[age_brackets == '25-39'] = np.random.randint(25, 40, size=np.sum(age_brackets == '25-39'))
ages[age_brackets == '40-59'] = np.random.randint(40, 60, size=np.sum(age_brackets == '40-59'))
ages[age_brackets == '60-80'] = np.random.randint(60, 81, size=np.sum(age_brackets == '60-80'))

# Geography: Tier 1 (44.0%), Tier 2/3 & Semi-Urban (56.0%)
city_tiers = np.random.choice(
    ['Tier 1', 'Tier 2', 'Tier 3', 'Semi-Urban'],
    size=N,
    p=[0.440, 0.280, 0.180, 0.100]
)

regions = np.random.choice(
    ['North', 'South', 'West', 'East', 'Central'],
    size=N,
    p=[0.30, 0.25, 0.22, 0.13, 0.10]
)

# -------------------------------------------------------------
# 2. Comorbid Alignment & Condition Flags
# -------------------------------------------------------------
# 43.6% comorbid overlap (21,800 patients with both)
# 76.8% total with scalp issue (38,400)
# 73.7% total with facial issue (36,850)
cohort_profile = np.random.choice(
    ['both', 'scalp_only', 'facial_only', 'neither'],
    size=N,
    p=[0.436, 0.332, 0.301, 0.000] if (0.436 + 0.332 + 0.301) == 1.0 else [0.436, 0.332, 0.201, 0.031]
)

has_scalp = np.isin(cohort_profile, ['both', 'scalp_only']).astype(int)
has_facial = np.isin(cohort_profile, ['both', 'facial_only']).astype(int)
comorbid_overlap = ((has_scalp == 1) & (has_facial == 1)).astype(int)

# -------------------------------------------------------------
# 3. Scalp Conditions & Severity
# -------------------------------------------------------------
scalp_conditions_weights = {
    'Dandruff/Seborrheic Dermatitis': 0.482,
    'Androgenetic Alopecia': 0.336,
    'Telogen Effluvium': 0.225,
    'Scalp Folliculitis': 0.112,
    'Scalp Psoriasis/Tinea Capitis': 0.063
}
# Normalize weights for primary diagnosis selection among affected patients
scalp_keys = list(scalp_conditions_weights.keys())
scalp_probs = np.array(list(scalp_conditions_weights.values()))
scalp_probs /= scalp_probs.sum()

scalp_primary = np.array(['None'] * N, dtype=object)
scalp_primary[has_scalp == 1] = np.random.choice(scalp_keys, size=np.sum(has_scalp == 1), p=scalp_probs)

# Secondary scalp conditions (~20% co-occurrence among affected)
scalp_secondary = np.array(['None'] * N, dtype=object)
has_sec_scalp = (has_scalp == 1) & (np.random.rand(N) < 0.20)
for idx in np.where(has_sec_scalp)[0]:
    prim = scalp_primary[idx]
    alt_keys = [k for k in scalp_keys if k != prim]
    scalp_secondary[idx] = np.random.choice(alt_keys)

scalp_severity = np.array(['None'] * N, dtype=object)
scalp_severity[has_scalp == 1] = np.random.choice(
    ['Mild', 'Moderate', 'Severe'],
    size=np.sum(has_scalp == 1),
    p=[0.45, 0.38, 0.17]
)

scalp_symptom_map = {
    'Dandruff/Seborrheic Dermatitis': 'Flaking|Erythema|Pruritus',
    'Androgenetic Alopecia': 'Hairline Recession|Crown Thinning',
    'Telogen Effluvium': 'Diffuse Thinning|Excessive Shedding',
    'Scalp Folliculitis': 'Pustules|Perifollicular Erythema|Tenderness',
    'Scalp Psoriasis/Tinea Capitis': 'Silvery Plaques|Scalp Scaling|Itching',
    'None': 'None'
}
scalp_symptoms = [scalp_symptom_map[cond] for cond in scalp_primary]

# -------------------------------------------------------------
# 4. Facial Conditions & Severity
# -------------------------------------------------------------
facial_conditions_weights = {
    'Acne Vulgaris': 0.458,
    'Hyperpigmentation/Melasma': 0.306,
    'Contact Dermatitis': 0.148,
    'Steroid-Induced Rosacea': 0.084,
    'Tinea Faciei': 0.079
}
facial_keys = list(facial_conditions_weights.keys())
facial_probs = np.array(list(facial_conditions_weights.values()))
facial_probs /= facial_probs.sum()

facial_primary = np.array(['None'] * N, dtype=object)
facial_primary[has_facial == 1] = np.random.choice(facial_keys, size=np.sum(has_facial == 1), p=facial_probs)

# Secondary facial conditions (~15% co-occurrence among affected)
facial_secondary = np.array(['None'] * N, dtype=object)
has_sec_facial = (has_facial == 1) & (np.random.rand(N) < 0.15)
for idx in np.where(has_sec_facial)[0]:
    prim = facial_primary[idx]
    alt_keys = [k for k in facial_keys if k != prim]
    facial_secondary[idx] = np.random.choice(alt_keys)

facial_severity = np.array(['None'] * N, dtype=object)
facial_severity[has_facial == 1] = np.random.choice(
    ['Grade I (Mild)', 'Grade II (Moderate)', 'Grade III (Moderate-Severe)', 'Grade IV (Severe)'],
    size=np.sum(has_facial == 1),
    p=[0.38, 0.34, 0.20, 0.08]
)

facial_symptom_map = {
    'Acne Vulgaris': 'Comedones|Papules|Inflammatory Cysts',
    'Hyperpigmentation/Melasma': 'Melasma Patches|Post-Inflammatory Hyperpigmentation',
    'Contact Dermatitis': 'Burning Sensation|Skin Peeling|Redness',
    'Steroid-Induced Rosacea': 'Telangiectasia|Facial Erythema|Skin Thinning',
    'Tinea Faciei': 'Annular Scaly Plaques|Pruritus',
    'None': 'None'
}
facial_symptoms = [facial_symptom_map[cond] for cond in facial_primary]

# -------------------------------------------------------------
# 5. Root Causes & Environmental Drivers
# -------------------------------------------------------------
# Water Hardness: 62.4% hard groundwater exposure
water_hardness = np.random.choice(
    ['Hard (>300 ppm)', 'Moderate (150-300 ppm)', 'Soft (<150 ppm)'],
    size=N,
    p=[0.624, 0.256, 0.120]
)

# Air Pollution Level
pollution_exposure = np.random.choice(
    ['High (PM2.5 > 100)', 'Moderate (PM2.5 50-100)', 'Low (PM2.5 < 50)'],
    size=N,
    p=[0.58, 0.30, 0.12]
)

# Hormonal / Metabolic Factors (48.1% affected)
hormonal_choices = ['High DHT', 'Insulin Resistance', 'PCOS', 'Thyroid Disruption', 'None']
hormonal_factors = np.empty(N, dtype=object)
for i in range(N):
    if np.random.rand() < 0.481:
        if gender[i] == 'Female':
            hormonal_factors[i] = np.random.choice(['PCOS', 'Insulin Resistance', 'Thyroid Disruption', 'High DHT'])
        else:
            hormonal_factors[i] = np.random.choice(['High DHT', 'Insulin Resistance', 'Thyroid Disruption'])
    else:
        hormonal_factors[i] = 'None'

# Nutritional Gaps (41.5% affected)
nutritional_pool = ['Vitamin D3', 'Ferritin/Iron', 'Vitamin B12', 'Zinc']
nutritional_deficiencies = []
for _ in range(N):
    if np.random.rand() < 0.415:
        chosen = np.random.choice(nutritional_pool, size=np.random.choice([1, 2], p=[0.75, 0.25]), replace=False)
        nutritional_deficiencies.append('|'.join(chosen))
    else:
        nutritional_deficiencies.append('None')

# OTC Steroid Misuse History (31.8%)
otc_steroid_misuse = np.random.choice([1, 0], size=N, p=[0.318, 0.682])

# Daily Stress Level
stress_levels = np.random.choice(['High', 'Moderate', 'Low'], size=N, p=[0.42, 0.43, 0.15])

# -------------------------------------------------------------
# 6. Consultation & Clinical Course
# -------------------------------------------------------------
duration_months = np.random.exponential(scale=14, size=N).astype(int) + 1  # 1 to 60+ months

prior_consultation = np.random.choice(
    ['None (Self-medicated)', 'General Physician', 'Certified Dermatologist', 'AYUSH Practitioner'],
    size=N,
    p=[0.41, 0.27, 0.20, 0.12]
)

# -------------------------------------------------------------
# 7. DataFrame Construction & Export
# -------------------------------------------------------------
df = pd.DataFrame({
    'patient_id': patient_ids,
    'age': ages,
    'gender': gender,
    'city_tier': city_tiers,
    'state_region': regions,
    'has_scalp_issue': has_scalp,
    'scalp_condition_primary': scalp_primary,
    'scalp_condition_secondary': scalp_secondary,
    'scalp_severity_grade': scalp_severity,
    'scalp_symptoms': scalp_symptoms,
    'has_facial_issue': has_facial,
    'facial_condition_primary': facial_primary,
    'facial_condition_secondary': facial_secondary,
    'facial_severity_grade': facial_severity,
    'facial_symptoms': facial_symptoms,
    'water_hardness_exposure': water_hardness,
    'pollution_exposure_level': pollution_exposure,
    'hormonal_metabolic_factor': hormonal_factors,
    'nutritional_deficiency': nutritional_deficiencies,
    'otc_steroid_misuse_history': otc_steroid_misuse,
    'daily_stress_level': stress_levels,
    'comorbid_overlap': comorbid_overlap,
    'duration_months': duration_months,
    'prior_consultation_type': prior_consultation
})

# Save to CSV
df.to_csv('synthetic_dermatology_cohort_50k.csv', index=False)
print(f"Dataset generated successfully. Shape: {df.shape}")
print(df.head(5))