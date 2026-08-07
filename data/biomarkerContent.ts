import type { BiomarkerContent } from "@/lib/types";
import { affine, linear } from "@/lib/units";

/**
 * Content library for the v1 starter set: thyroid panel + CBC basics (10
 * markers, per build order step 2).
 *
 * IMPORTANT: every entry here has reviewStatus: "ai_drafted_sourced". That is
 * not the same as what the spec calls for ("written and reviewed in
 * advance" by a human). These entries were researched against the cited
 * sources and written to the same content rules (plain language, no
 * diagnosis, no advice, no reassurance, no "normal"/"abnormal" verdicts) —
 * but they have NOT been reviewed by a clinician. Do not flip reviewStatus
 * to "clinician_reviewed" without that actually happening.
 */
export const BIOMARKER_CONTENT: BiomarkerContent[] = [
  {
    biomarkerKey: "tsh",
    displayName: "TSH (Thyroid Stimulating Hormone)",
    aliases: ["TSH", "Thyroid Stimulating Hormone", "Thyrotropin"],
    conventionalUnit: "µIU/mL",
    siUnit: "mIU/L",
    unitConversion: linear(1), // numerically equivalent, different unit name
    whatItMeasures:
      "TSH is made by your pituitary gland, a small gland at the base of your brain. It tells your thyroid how much thyroid hormone to make. Measuring TSH is a way of checking on your thyroid indirectly, through the signal your brain is sending it.",
    whyOrdered:
      "This is usually the first test ordered to check how the thyroid is working, often as part of a general checkup or when someone has symptoms like fatigue, weight change, or feeling too hot or cold. It's also used to monitor thyroid hormone medication.",
    whatMovesIt: [
      "time of day the blood was drawn (TSH naturally rises and falls over 24 hours)",
      "recent illness, even unrelated to the thyroid",
      "pregnancy",
      "biotin supplements, which can interfere with the test itself",
      "certain medications, including steroids and some psychiatric medications",
    ],
    questionsForDoctor: [
      "Where does this result fall compared to my past results, if I have any?",
      "Would it be useful to also check Free T4 alongside this?",
      "Am I taking anything, including supplements, that could affect this result?",
    ],
    sources: [
      { label: "MedlinePlus: TSH test", url: "https://medlineplus.gov/ency/article/003684.htm" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "free_t4",
    displayName: "Free T4 (Free Thyroxine)",
    aliases: ["Free T4", "FT4", "Free Thyroxine", "T4, Free"],
    conventionalUnit: "ng/dL",
    siUnit: "pmol/L",
    unitConversion: linear(12.87),
    whatItMeasures:
      "Thyroxine (T4) is one of the main hormones your thyroid makes. Most of it travels through your blood attached to proteins; \"free\" T4 is the small portion that's unattached and available for your body to use.",
    whyOrdered:
      "Ordered along with or after TSH to get a fuller picture of thyroid hormone levels, especially when TSH is outside the range your lab uses, or to monitor thyroid hormone medication.",
    whatMovesIt: [
      "pregnancy and estrogen levels",
      "liver or kidney conditions",
      "acute illness",
      "biotin supplements, which can interfere with the test itself",
      "certain medications",
    ],
    questionsForDoctor: [
      "How does this result relate to my TSH result?",
      "Has this changed since my last thyroid panel, if I've had one?",
      "Is there anything about how or when this blood was drawn that could matter?",
    ],
    sources: [
      { label: "MedlinePlus: Free T4 test", url: "https://medlineplus.gov/ency/article/003517.htm" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "free_t3",
    displayName: "Free T3 (Free Triiodothyronine)",
    aliases: ["Free T3", "FT3", "Free Triiodothyronine", "T3, Free"],
    conventionalUnit: "pg/mL",
    siUnit: "pmol/L",
    unitConversion: linear(1.54),
    whatItMeasures:
      "Triiodothyronine (T3) is the more active form of thyroid hormone — your body converts T4 into T3 to use it. \"Free\" T3 is the portion circulating unattached to proteins.",
    whyOrdered:
      "Usually ordered when there's a specific question about whether the thyroid might be producing too much hormone, or to check thyroid hormone medication dosing, rather than as a routine first test.",
    whatMovesIt: [
      "acute or severe illness (levels can drop during illness independent of thyroid function)",
      "fasting or significant calorie restriction",
      "certain medications",
      "biotin supplements, which can interfere with the test itself",
    ],
    questionsForDoctor: [
      "Why was this test specifically ordered, alongside or instead of TSH and Free T4?",
      "Was I fasting or recently ill when this was drawn, and could that matter?",
    ],
    sources: [
      {
        label: "MedlinePlus: Triiodothyronine (T3) tests",
        url: "https://medlineplus.gov/lab-tests/triiodothyronine-t3-tests/",
      },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "tpo_antibodies",
    displayName: "TPO Antibodies (Thyroid Peroxidase Antibodies)",
    aliases: ["TPO Antibodies", "Anti-TPO", "Thyroid Peroxidase Antibodies", "TPOAb"],
    conventionalUnit: "IU/mL",
    siUnit: "IU/mL",
    unitConversion: linear(1),
    whatItMeasures:
      "TPO is an enzyme your thyroid uses to make thyroid hormone. This test looks for antibodies your immune system has made against that enzyme — a sign your immune system is targeting your own thyroid tissue.",
    whyOrdered:
      "Usually ordered when there's a question about whether the immune system may be affecting the thyroid, often alongside other thyroid results, or when there's a family or personal history of this kind of immune activity.",
    whatMovesIt: [
      "this test isn't affected by time of day or fasting the way some others are",
      "levels can be present for years without changing thyroid function tests",
      "pregnancy can affect levels",
    ],
    questionsForDoctor: [
      "What does having this test ordered mean about what you're looking into?",
      "If this comes back positive, what would that mean for how my thyroid is monitored going forward?",
    ],
    sources: [
      {
        label: "Mayo Clinic: Thyroid peroxidase antibody test",
        url: "https://www.mayoclinic.org/diseases-conditions/hashimotos-disease/expert-answers/thyroid-disease/faq-20058114",
      },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "wbc",
    displayName: "White Blood Cell Count (WBC)",
    aliases: ["WBC", "White Blood Cell Count", "Leukocytes", "White Blood Cells"],
    conventionalUnit: "x10^3/µL",
    siUnit: "x10^9/L",
    unitConversion: linear(1), // numerically equivalent, different unit convention
    whatItMeasures:
      "White blood cells are part of your immune system. This counts the total number circulating in your blood, without breaking them down by type (a \"differential\" is a separate, more detailed count).",
    whyOrdered:
      "Part of a standard Complete Blood Count (CBC), ordered as routine screening or when there are symptoms like fever, unusual fatigue, or signs of infection.",
    whatMovesIt: [
      "recent or current infection",
      "physical or emotional stress",
      "strenuous exercise shortly before the blood draw",
      "certain medications, including steroids",
      "smoking",
    ],
    questionsForDoctor: [
      "Was this test ordered as routine screening, or because of specific symptoms?",
      "How does this compare with any previous CBC results I've had?",
    ],
    sources: [
      { label: "MedlinePlus: Blood count tests", url: "https://medlineplus.gov/bloodcounttests.html" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "rbc",
    displayName: "Red Blood Cell Count (RBC)",
    aliases: ["RBC", "Red Blood Cell Count", "Erythrocytes", "Red Blood Cells"],
    conventionalUnit: "x10^6/µL",
    siUnit: "x10^12/L",
    unitConversion: linear(1),
    whatItMeasures:
      "Red blood cells carry oxygen from your lungs to the rest of your body. This counts how many are circulating in your blood.",
    whyOrdered:
      "Part of a standard CBC, used alongside hemoglobin and hematocrit to look at oxygen-carrying capacity, often in the context of fatigue, or general screening.",
    whatMovesIt: [
      "altitude (higher altitude is associated with higher counts)",
      "hydration status at the time of the draw",
      "pregnancy",
      "smoking",
    ],
    questionsForDoctor: [
      "How does this relate to my hemoglobin and hematocrit results?",
      "Is there anything about my hydration or recent activity that could affect this?",
    ],
    sources: [
      { label: "MedlinePlus: Blood count tests", url: "https://medlineplus.gov/bloodcounttests.html" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "hemoglobin",
    displayName: "Hemoglobin",
    aliases: ["Hemoglobin", "Hgb", "Hb"],
    conventionalUnit: "g/dL",
    siUnit: "g/L",
    unitConversion: linear(10),
    whatItMeasures:
      "Hemoglobin is the protein inside red blood cells that actually carries oxygen. This measures the total amount of it in your blood.",
    whyOrdered:
      "Part of a standard CBC. Often the single most-referenced number when there's a question about oxygen-carrying capacity in the blood.",
    whatMovesIt: [
      "altitude",
      "hydration status at the time of the draw",
      "recent blood loss, including menstruation",
      "pregnancy",
      "smoking",
    ],
    questionsForDoctor: [
      "How does this compare with my past results, if I have any?",
      "Would it help to look at hematocrit and red blood cell count together with this?",
    ],
    sources: [
      { label: "MedlinePlus: Blood count tests", url: "https://medlineplus.gov/bloodcounttests.html" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "hematocrit",
    displayName: "Hematocrit",
    aliases: ["Hematocrit", "Hct", "HCT", "Packed Cell Volume", "PCV"],
    conventionalUnit: "%",
    siUnit: "L/L",
    unitConversion: linear(0.01),
    whatItMeasures:
      "Hematocrit is the percentage of your blood's volume that's made up of red blood cells, as opposed to plasma and other components.",
    whyOrdered:
      "Part of a standard CBC, used alongside hemoglobin and red blood cell count — the three are usually read together rather than in isolation.",
    whatMovesIt: [
      "altitude",
      "hydration status at the time of the draw (dehydration can raise it, overhydration can lower it)",
      "pregnancy",
      "recent blood loss",
    ],
    questionsForDoctor: [
      "How does this compare with my hemoglobin and red blood cell count?",
      "Was my hydration at the time of the draw a factor worth considering?",
    ],
    sources: [
      { label: "MedlinePlus: Blood count tests", url: "https://medlineplus.gov/bloodcounttests.html" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "platelets",
    displayName: "Platelet Count",
    aliases: ["Platelets", "PLT", "Platelet Count", "Thrombocytes"],
    conventionalUnit: "x10^3/µL",
    siUnit: "x10^9/L",
    unitConversion: linear(1),
    whatItMeasures:
      "Platelets are small cell fragments in your blood that help it clot. This counts how many are circulating.",
    whyOrdered:
      "Part of a standard CBC, and relevant to evaluating unusual bruising or bleeding, or before a planned procedure or surgery.",
    whatMovesIt: [
      "recent illness or infection",
      "certain medications, including some pain relievers",
      "pregnancy",
      "high altitude",
    ],
    questionsForDoctor: [
      "Was this test ordered as routine screening or because of a specific concern like bruising or bleeding?",
      "How does this compare with any previous results?",
    ],
    sources: [
      { label: "MedlinePlus: Blood count tests", url: "https://medlineplus.gov/bloodcounttests.html" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "mcv",
    displayName: "MCV (Mean Corpuscular Volume)",
    aliases: ["MCV", "Mean Corpuscular Volume", "Mean Cell Volume"],
    conventionalUnit: "fL",
    siUnit: "fL",
    unitConversion: linear(1),
    whatItMeasures:
      "MCV is the average size of your red blood cells, calculated from the other CBC numbers rather than measured directly.",
    whyOrdered:
      "Part of a standard CBC. It's one of the main numbers used to understand red blood cell size, which can shift for a number of different reasons.",
    whatMovesIt: [
      "vitamin B12 and folate levels",
      "iron levels",
      "alcohol use",
      "certain medications",
      "some inherited blood cell traits",
    ],
    questionsForDoctor: [
      "How does this relate to my hemoglobin and hematocrit results?",
      "Would checking iron, B12, or folate levels add useful context here?",
    ],
    sources: [
      { label: "MedlinePlus: Blood count tests", url: "https://medlineplus.gov/bloodcounttests.html" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
];

export function findBiomarkerContent(biomarkerKey: string): BiomarkerContent | undefined {
  return BIOMARKER_CONTENT.find((b) => b.biomarkerKey === biomarkerKey);
}

/**
 * Not yet content-authored, but valid to extract, store, and chart per spec:
 * "anything outside the library still gets extracted, stored, and charted —
 * it just displays without an explanation, labeled honestly as not yet
 * covered." Included here so the UI layer has a single source of truth for
 * "this key is real but has no content yet" vs. "this key is unrecognized."
 */
export const PLANNED_BUT_NOT_YET_AUTHORED_KEYS = [
  "wbc_differential",
  "mch",
  "mchc",
  "rdw",
  "sodium",
  "potassium",
  "chloride",
  "co2",
  "bun",
  "creatinine",
  "egfr",
  "glucose_fasting",
  "calcium",
  "total_protein",
  "albumin",
  "bilirubin_total",
  "alp",
  "ast",
  "alt",
  "total_cholesterol",
  "ldl",
  "hdl",
  "triglycerides",
  "hba1c",
  "vitamin_d",
  "vitamin_b12",
  "ferritin",
  "iron",
] as const;
