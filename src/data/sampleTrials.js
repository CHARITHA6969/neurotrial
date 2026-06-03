export const SAMPLE_TRIALS = [
  {
    id: "NCT-2021-001",
    title: "EMERALD-AD: Phase III Lecanemab in Early Alzheimer's",
    content: `Trial ID: NCT-2021-001. Condition: Early Alzheimer's Disease (MCI to mild AD).
Intervention: Lecanemab 10mg/kg IV biweekly. Sample size: 1795 participants (age 50-90, MMSE 22-30).
Primary endpoint: CDR-SB at 18 months. Secondary endpoints: ADAS-Cog14, ADCS MCI-ADL, amyloid PET.
Outcome: CDR-SB slowed by 27% vs placebo (p<0.001). Amyloid cleared in 78% of treated patients.
Adverse effects: ARIA-E in 12.6%, ARIA-H in 17.3%, 3 deaths potentially related.
Status: Completed. Result: Positive primary endpoint met.
Biomarkers used: CSF Abeta42/40 ratio, p-tau181, amyloid PET.
Population: Early-stage only; APOE4 carriers showed higher ARIA rates.`,
  },
  {
    id: "NCT-2019-044",
    title: "ENGAGE: Phase III Aducanumab High-Dose Arm",
    content: `Trial ID: NCT-2019-044. Condition: Early Alzheimer's Disease.
Intervention: Aducanumab 10mg/kg IV monthly. Sample size: 1638 participants.
Primary endpoint: CDR-SB at 78 weeks. Secondary: MMSE, ADAS-Cog13, amyloid PET.
Outcome: FAILED. No statistically significant slowing of CDR-SB decline (p=0.83 after interim futility analysis).
Adverse effects: ARIA-E 35%, ARIA-H 20%. Trial halted March 2019.
Status: Terminated (futility). Result: Primary endpoint not met.
Biomarkers: Amyloid PET required for enrollment. High amyloid burden confirmed in >95%.
Notes: Protocol amendment changed dosing mid-trial; inconsistent titration may have confounded results.`,
  },
  {
    id: "NCT-2020-112",
    title: "CLARITY-PD: Phase II Prasinezumab in Parkinson's",
    content: `Trial ID: NCT-2020-112. Condition: Early Parkinson's Disease (Hoehn & Yahr 1-2).
Intervention: Prasinezumab (anti-alpha-synuclein antibody) 1500mg IV monthly. Sample size: 316 participants.
Primary endpoint: MDS-UPDRS Part III motor score at 52 weeks.
Outcome: Primary endpoint FAILED (p=0.37). Exploratory fast-progressors subgroup showed trend (p=0.097).
Adverse effects: Infusion reactions 7%, mild. No serious safety signals.
Status: Completed Phase II. Moving to Phase II extension in fast-progressors.
Biomarkers: Alpha-synuclein seed amplification assay (SAA), DaTscan.
Population issue: Heterogeneous progression rates diluted signal; biomarker stratification insufficient.`,
  },
  {
    id: "NCT-2022-078",
    title: "ALTO: Phase III Atabecestat in Preclinical AD",
    content: `Trial ID: NCT-2022-078. Condition: Preclinical Alzheimer's (amyloid+ cognitively normal).
Intervention: Atabecestat (BACE1 inhibitor) 25mg oral daily. Sample size: 557 participants.
Primary endpoint: Composite cognitive score at 36 months.
Outcome: FAILED. Cognitive scores WORSENED in treatment arm vs placebo (p=0.04 favoring placebo).
Adverse effects: Liver enzyme elevations 4x ULN in 4.5% requiring discontinuation.
Status: Terminated (harm signal). Result: Negative - drug caused harm.
Mechanism concern: BACE1 inhibition blocked multiple substrates beyond amyloid; neuregulin pathway disruption suspected.
Biomarkers: Amyloid PET, CSF Abeta42. All participants amyloid positive at baseline.`,
  },
  {
    id: "NCT-2023-031",
    title: "HOPE-MDD: Phase III Psilocybin-Assisted Therapy in TRD",
    content: `Trial ID: NCT-2023-031. Condition: Treatment-Resistant Major Depressive Disorder.
Intervention: Psilocybin 25mg single dose + psychological support. Sample size: 233 participants.
Primary endpoint: MADRS score change at 3 weeks. Secondary: QIDS, HAM-D, functional outcomes at 12 weeks.
Outcome: MADRS reduced -12.8 vs -7.4 placebo (p=0.002). Response rate 37% vs 18%.
Adverse effects: Transient anxiety during session 28%, headache 15%, no serious psychiatric adverse events.
Status: Completed. Result: Positive primary endpoint.
Biomarkers: None used for stratification. EEG markers of neuroplasticity explored post-hoc.
Population: Failed >= 2 prior antidepressants; high chronicity (avg illness 9 years).`,
  },
];