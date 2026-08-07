import type { BiomarkerContent } from "@/lib/types";
import { affine, linear } from "@/lib/units";

/**
 * Content library — v1 starter set.
 *
 * IMPORTANT: every entry here has reviewStatus: "ai_drafted_sourced". That is
 * not the same as what the spec calls for ("written and reviewed in
 * advance" by a human). These entries were researched against the cited
 * sources and written to the same content rules (plain language, no
 * diagnosis, no advice, no reassurance, no "normal"/"abnormal" verdicts) —
 * but they have NOT been reviewed by a clinician. Do not flip reviewStatus
 * to "clinician_reviewed" without that actually happening.
 *
 * The adversarial suite in biomarkerContent.test.ts scans every text field
 * here for six categories of forbidden output. Anything added to this file
 * must pass it.
 */

const MEDLINE_CBC = {
  label: "MedlinePlus: Blood count tests",
  url: "https://medlineplus.gov/bloodcounttests.html",
};
const MEDLINE_CMP = {
  label: "MedlinePlus: Comprehensive metabolic panel",
  url: "https://medlineplus.gov/lab-tests/comprehensive-metabolic-panel-cmp/",
};
const MEDLINE_LIPID = {
  label: "MedlinePlus: Cholesterol levels",
  url: "https://medlineplus.gov/lab-tests/cholesterol-levels/",
};

export const BIOMARKER_CONTENT: BiomarkerContent[] = [
  // ---------- Thyroid panel ----------
  {
    biomarkerKey: "tsh",
    displayName: "TSH (Thyroid Stimulating Hormone)",
    aliases: ["TSH", "Thyroid Stimulating Hormone", "Thyrotropin", "TSH, 3rd Generation"],
    conventionalUnit: "µIU/mL",
    siUnit: "mIU/L",
    unitConversion: linear(1),
    whatItMeasures:
      "TSH is made by your pituitary gland, a small gland at the base of your brain. It tells your thyroid how much thyroid hormone to make, so measuring it is a way of checking on your thyroid through the signal your brain is sending it.",
    whyOrdered:
      "Usually the first test ordered to check how the thyroid is working, either as part of a general checkup or when someone has symptoms like fatigue, weight change, or feeling too hot or cold. Also used to monitor thyroid hormone medication.",
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
    sources: [{ label: "MedlinePlus: TSH test", url: "https://medlineplus.gov/ency/article/003684.htm" }],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "free_t4",
    displayName: "Free T4 (Free Thyroxine)",
    aliases: ["Free T4", "FT4", "Free Thyroxine", "T4, Free", "Thyroxine, Free"],
    conventionalUnit: "ng/dL",
    siUnit: "pmol/L",
    unitConversion: linear(12.87),
    whatItMeasures:
      "Thyroxine (T4) is one of the main hormones your thyroid makes. Most of it travels through your blood attached to proteins; \"free\" T4 is the small portion that's unattached and available for your body to use.",
    whyOrdered:
      "Ordered along with or after TSH to get a fuller picture of thyroid hormone levels, especially when TSH falls outside the range your lab uses, or to monitor thyroid hormone medication.",
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
    sources: [{ label: "MedlinePlus: Free T4 test", url: "https://medlineplus.gov/ency/article/003517.htm" }],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "free_t3",
    displayName: "Free T3 (Free Triiodothyronine)",
    aliases: ["Free T3", "FT3", "Free Triiodothyronine", "T3, Free", "Triiodothyronine, Free"],
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
      { label: "MedlinePlus: Triiodothyronine (T3) tests", url: "https://medlineplus.gov/lab-tests/triiodothyronine-t3-tests/" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "tpo_antibodies",
    displayName: "TPO Antibodies (Thyroid Peroxidase Antibodies)",
    aliases: ["TPO Antibodies", "Anti-TPO", "Thyroid Peroxidase Antibodies", "TPOAb", "Thyroperoxidase Ab"],
    conventionalUnit: "IU/mL",
    siUnit: "IU/mL",
    unitConversion: linear(1),
    whatItMeasures:
      "TPO is an enzyme your thyroid uses to make thyroid hormone. This test looks for antibodies your immune system has made against that enzyme — a sign the immune system is targeting thyroid tissue.",
    whyOrdered:
      "Usually ordered when there's a question about whether the immune system may be affecting the thyroid, often alongside other thyroid results, or when there's a family or personal history of this kind of immune activity.",
    whatMovesIt: [
      "this test isn't affected by time of day or fasting the way some others are",
      "levels can be present for years without changing other thyroid test results",
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

  // ---------- Complete Blood Count ----------
  {
    biomarkerKey: "wbc",
    displayName: "White Blood Cell Count (WBC)",
    aliases: ["WBC", "White Blood Cell Count", "Leukocytes", "White Blood Cells", "WBC Count"],
    conventionalUnit: "x10^3/µL",
    siUnit: "x10^9/L",
    unitConversion: linear(1),
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
    sources: [MEDLINE_CBC],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "rbc",
    displayName: "Red Blood Cell Count (RBC)",
    aliases: ["RBC", "Red Blood Cell Count", "Erythrocytes", "Red Blood Cells", "RBC Count"],
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
    sources: [MEDLINE_CBC],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "hemoglobin",
    displayName: "Hemoglobin",
    aliases: ["Hemoglobin", "Hgb", "Hb", "HGB"],
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
    sources: [MEDLINE_CBC],
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
      "Hematocrit is the percentage of your blood's volume made up of red blood cells, as opposed to plasma and other components.",
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
    sources: [MEDLINE_CBC],
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
      "Was this ordered as routine screening or because of a specific concern like bruising or bleeding?",
      "How does this compare with any previous results?",
    ],
    sources: [MEDLINE_CBC],
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
    sources: [MEDLINE_CBC],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "mch",
    displayName: "MCH (Mean Corpuscular Hemoglobin)",
    aliases: ["MCH", "Mean Corpuscular Hemoglobin"],
    conventionalUnit: "pg",
    siUnit: "pg",
    unitConversion: linear(1),
    whatItMeasures:
      "MCH is the average amount of hemoglobin inside each red blood cell, calculated from other CBC values.",
    whyOrdered: "Part of a standard CBC, read together with MCV and MCHC rather than on its own.",
    whatMovesIt: ["iron levels", "vitamin B12 and folate levels", "some inherited blood cell traits"],
    questionsForDoctor: [
      "Does this add anything beyond what MCV already tells us in my case?",
      "Should any of these be rechecked over time?",
    ],
    sources: [MEDLINE_CBC],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "mchc",
    displayName: "MCHC (Mean Corpuscular Hemoglobin Concentration)",
    aliases: ["MCHC", "Mean Corpuscular Hemoglobin Concentration"],
    conventionalUnit: "g/dL",
    siUnit: "g/L",
    unitConversion: linear(10),
    whatItMeasures:
      "MCHC describes how concentrated the hemoglobin is inside your red blood cells, on average.",
    whyOrdered: "Part of a standard CBC, interpreted alongside MCV and MCH.",
    whatMovesIt: ["iron levels", "some inherited blood cell traits", "how the sample was handled in the lab"],
    questionsForDoctor: ["How do my MCV, MCH, and MCHC fit together?"],
    sources: [MEDLINE_CBC],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "rdw",
    displayName: "RDW (Red Cell Distribution Width)",
    aliases: ["RDW", "Red Cell Distribution Width", "RDW-CV"],
    conventionalUnit: "%",
    siUnit: "%",
    unitConversion: linear(1),
    whatItMeasures:
      "RDW describes how much your red blood cells vary in size from each other. A higher number means more variation.",
    whyOrdered: "Part of a standard CBC, often read alongside MCV to add context about red blood cell size.",
    whatMovesIt: ["iron levels", "vitamin B12 and folate levels", "recent blood transfusion", "recent blood loss"],
    questionsForDoctor: ["How does this fit with my MCV result?"],
    sources: [MEDLINE_CBC],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },

  // ---------- Comprehensive Metabolic Panel ----------
  {
    biomarkerKey: "sodium",
    displayName: "Sodium",
    aliases: ["Sodium", "Na", "Na+"],
    conventionalUnit: "mEq/L",
    siUnit: "mmol/L",
    unitConversion: linear(1),
    whatItMeasures:
      "Sodium is an electrolyte that helps control the amount of fluid in your body and supports nerve and muscle function.",
    whyOrdered: "Part of a standard metabolic panel, used to check fluid and electrolyte balance.",
    whatMovesIt: [
      "how much fluid you've had recently",
      "vomiting, diarrhea, or heavy sweating",
      "certain medications, including diuretics",
      "kidney and hormone conditions",
    ],
    questionsForDoctor: [
      "Could anything about my hydration or medications have affected this?",
      "Does this need rechecking?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "potassium",
    displayName: "Potassium",
    aliases: ["Potassium", "K", "K+"],
    conventionalUnit: "mEq/L",
    siUnit: "mmol/L",
    unitConversion: linear(1),
    whatItMeasures:
      "Potassium is an electrolyte that's important for how your muscles and heart work, and for nerve signals.",
    whyOrdered: "Part of a standard metabolic panel, and often monitored for people on certain medications.",
    whatMovesIt: [
      "certain medications, including diuretics and some blood pressure medications",
      "kidney function",
      "how the blood sample was drawn and handled (a difficult draw can falsely raise it)",
      "vomiting or diarrhea",
    ],
    questionsForDoctor: [
      "Could the way the sample was drawn have affected this number?",
      "Do any of my medications influence this?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "chloride",
    displayName: "Chloride",
    aliases: ["Chloride", "Cl", "Cl-"],
    conventionalUnit: "mEq/L",
    siUnit: "mmol/L",
    unitConversion: linear(1),
    whatItMeasures: "Chloride is an electrolyte that works with sodium to help balance fluids and acidity in your body.",
    whyOrdered: "Part of a standard metabolic panel, read together with the other electrolytes.",
    whatMovesIt: ["hydration", "vomiting or diarrhea", "certain medications", "kidney function"],
    questionsForDoctor: ["How does this fit with my sodium and CO2 results?"],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "co2",
    displayName: "CO2 (Bicarbonate)",
    aliases: ["CO2", "Carbon Dioxide", "Bicarbonate", "HCO3", "Total CO2"],
    conventionalUnit: "mEq/L",
    siUnit: "mmol/L",
    unitConversion: linear(1),
    whatItMeasures:
      "This measures bicarbonate in your blood, which reflects the balance between acid and base in your body.",
    whyOrdered: "Part of a standard metabolic panel, read alongside the other electrolytes.",
    whatMovesIt: ["breathing patterns", "kidney function", "vomiting or diarrhea", "certain medications"],
    questionsForDoctor: ["How does this fit with my other electrolyte results?"],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "bun",
    displayName: "BUN (Blood Urea Nitrogen)",
    aliases: ["BUN", "Blood Urea Nitrogen", "Urea Nitrogen"],
    conventionalUnit: "mg/dL",
    siUnit: "mmol/L",
    unitConversion: linear(0.357),
    whatItMeasures:
      "BUN measures a waste product your liver makes when it breaks down protein, which your kidneys then filter out. It's used as one signal of how the kidneys are filtering.",
    whyOrdered: "Part of a standard metabolic panel, read alongside creatinine to look at kidney filtering.",
    whatMovesIt: [
      "how much protein is in the diet",
      "hydration status",
      "certain medications",
      "liver and kidney function",
    ],
    questionsForDoctor: [
      "How does this compare with my creatinine result?",
      "Could my hydration at the time of the draw have affected it?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "creatinine",
    displayName: "Creatinine",
    aliases: ["Creatinine", "Creat", "Serum Creatinine"],
    conventionalUnit: "mg/dL",
    siUnit: "µmol/L",
    unitConversion: linear(88.4),
    whatItMeasures:
      "Creatinine is a waste product from normal muscle activity that your kidneys filter out. Because muscles produce it at a fairly steady rate, it's a useful signal of how well the kidneys are filtering.",
    whyOrdered: "Part of a standard metabolic panel, and the basis for the eGFR calculation.",
    whatMovesIt: [
      "muscle mass (more muscle generally means a higher baseline)",
      "hydration status",
      "recent intense exercise",
      "certain medications and supplements, including creatine",
      "how much meat is in the diet",
    ],
    questionsForDoctor: [
      "How does this compare with my past creatinine results?",
      "Does my muscle mass or activity level affect how this should be read?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "egfr",
    displayName: "eGFR (Estimated Glomerular Filtration Rate)",
    aliases: ["eGFR", "GFR", "Estimated GFR", "eGFR (CKD-EPI)", "Glomerular Filtration Rate"],
    conventionalUnit: "mL/min/1.73m²",
    siUnit: "mL/min/1.73m²",
    unitConversion: linear(1),
    whatItMeasures:
      "eGFR is an estimate of how much blood your kidneys filter each minute. It's calculated from your creatinine result along with your age and sex — it isn't measured directly.",
    whyOrdered: "Reported automatically alongside creatinine on most metabolic panels, to summarize kidney filtering.",
    whatMovesIt: [
      "anything that changes creatinine, since eGFR is calculated from it",
      "the specific equation your lab uses (labs don't all use the same one)",
      "muscle mass, since the equations assume a typical amount",
    ],
    questionsForDoctor: [
      "Which equation does this lab use, and has that changed between my results?",
      "How does this compare with my previous eGFR values?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "glucose_fasting",
    displayName: "Glucose",
    aliases: ["Glucose", "Fasting Glucose", "Blood Glucose", "Glucose, Fasting", "Glu"],
    conventionalUnit: "mg/dL",
    siUnit: "mmol/L",
    unitConversion: linear(0.0555),
    whatItMeasures:
      "This measures the amount of sugar in your blood at the moment the sample was taken. It's a snapshot, not an average.",
    whyOrdered: "Part of a standard metabolic panel and common in routine screening.",
    whatMovesIt: [
      "whether and how long you fasted before the draw",
      "what you ate the day before",
      "stress and acute illness",
      "certain medications, including steroids",
      "time of day",
    ],
    questionsForDoctor: [
      "Was I fasting when this was drawn, and does that change how it should be read?",
      "Would an HbA1c add useful context, since it reflects a longer window?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "calcium",
    displayName: "Calcium",
    aliases: ["Calcium", "Ca", "Total Calcium", "Calcium, Total"],
    conventionalUnit: "mg/dL",
    siUnit: "mmol/L",
    unitConversion: linear(0.2495),
    whatItMeasures:
      "Calcium matters for bones, muscles, nerves, and clotting. This measures the total amount in your blood, most of which travels attached to protein.",
    whyOrdered: "Part of a standard metabolic panel.",
    whatMovesIt: [
      "albumin level, since much of the calcium in blood is bound to it",
      "vitamin D levels",
      "parathyroid hormone",
      "certain medications and supplements",
    ],
    questionsForDoctor: [
      "How does this relate to my albumin result?",
      "Would a corrected or ionized calcium be more informative in my case?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "total_protein",
    displayName: "Total Protein",
    aliases: ["Total Protein", "Protein, Total", "TP"],
    conventionalUnit: "g/dL",
    siUnit: "g/L",
    unitConversion: linear(10),
    whatItMeasures:
      "This measures all the protein circulating in your blood, mainly albumin plus a group called globulins.",
    whyOrdered: "Part of a standard metabolic panel, read together with albumin.",
    whatMovesIt: ["hydration status", "liver function", "immune system activity", "nutrition"],
    questionsForDoctor: ["How does this compare with my albumin result?"],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "albumin",
    displayName: "Albumin",
    aliases: ["Albumin", "Alb", "Serum Albumin"],
    conventionalUnit: "g/dL",
    siUnit: "g/L",
    unitConversion: linear(10),
    whatItMeasures:
      "Albumin is the most common protein in your blood. It's made by your liver and helps keep fluid inside blood vessels and carry substances around the body.",
    whyOrdered: "Part of a standard metabolic panel; also used to interpret calcium results.",
    whatMovesIt: [
      "hydration status",
      "liver and kidney function",
      "nutrition",
      "inflammation or acute illness",
      "lying down versus standing at the time of the draw",
    ],
    questionsForDoctor: [
      "How does this affect how my calcium result should be read?",
      "How does this compare with my past results?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "bilirubin_total",
    displayName: "Total Bilirubin",
    aliases: ["Total Bilirubin", "Bilirubin, Total", "T Bili", "Bilirubin"],
    conventionalUnit: "mg/dL",
    siUnit: "µmol/L",
    unitConversion: linear(17.1),
    whatItMeasures:
      "Bilirubin is a yellow substance made when old red blood cells break down. Your liver processes it, so it's used as one signal of how the liver is handling that job.",
    whyOrdered: "Part of a standard metabolic panel, alongside the liver enzymes.",
    whatMovesIt: [
      "fasting, which can raise it",
      "recent strenuous exercise",
      "certain medications",
      "an inherited variation that raises bilirubin without affecting liver function",
    ],
    questionsForDoctor: [
      "Was I fasting when this was drawn, and could that matter?",
      "How does this fit with my AST, ALT, and ALP results?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "alp",
    displayName: "ALP (Alkaline Phosphatase)",
    aliases: ["ALP", "Alkaline Phosphatase", "Alk Phos"],
    conventionalUnit: "U/L",
    siUnit: "U/L",
    unitConversion: linear(1),
    whatItMeasures:
      "ALP is an enzyme found mainly in the liver and bones. This measures how much is circulating in your blood.",
    whyOrdered: "Part of a standard metabolic panel, read with the other liver-related values.",
    whatMovesIt: [
      "age (levels are naturally higher during growth)",
      "pregnancy",
      "recent meals for some people",
      "bone activity, including healing",
      "certain medications",
    ],
    questionsForDoctor: ["How does this fit with my AST, ALT, and bilirubin results?"],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "ast",
    displayName: "AST (Aspartate Aminotransferase)",
    aliases: ["AST", "Aspartate Aminotransferase", "SGOT", "AST (SGOT)"],
    conventionalUnit: "U/L",
    siUnit: "U/L",
    unitConversion: linear(1),
    whatItMeasures:
      "AST is an enzyme found in the liver, but also in muscle and other tissues. When those cells are stressed or damaged, more of it appears in the blood.",
    whyOrdered: "Part of a standard metabolic panel, usually read together with ALT.",
    whatMovesIt: [
      "recent strenuous exercise, which can raise it from muscle rather than liver",
      "alcohol use",
      "certain medications and supplements",
      "muscle injury",
    ],
    questionsForDoctor: [
      "Did I do anything strenuous shortly before this draw?",
      "How does this compare with my ALT — does the ratio between them matter here?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "alt",
    displayName: "ALT (Alanine Aminotransferase)",
    aliases: ["ALT", "Alanine Aminotransferase", "SGPT", "ALT (SGPT)"],
    conventionalUnit: "U/L",
    siUnit: "U/L",
    unitConversion: linear(1),
    whatItMeasures:
      "ALT is an enzyme found mostly in the liver, so it's a more liver-specific signal than AST. More appears in the blood when liver cells are stressed.",
    whyOrdered: "Part of a standard metabolic panel, usually read together with AST.",
    whatMovesIt: [
      "alcohol use",
      "certain medications and supplements",
      "body weight and metabolic factors",
      "recent strenuous exercise, to a lesser degree than AST",
    ],
    questionsForDoctor: [
      "How does this compare with my past ALT results?",
      "Are any of my medications or supplements worth reviewing in this context?",
    ],
    sources: [MEDLINE_CMP],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },

  // ---------- Lipid panel ----------
  {
    biomarkerKey: "total_cholesterol",
    displayName: "Total Cholesterol",
    aliases: ["Total Cholesterol", "Cholesterol, Total", "Cholesterol"],
    conventionalUnit: "mg/dL",
    siUnit: "mmol/L",
    unitConversion: linear(0.0259),
    whatItMeasures:
      "This adds up all the cholesterol carried in your blood, including both the LDL and HDL portions.",
    whyOrdered: "Part of a standard lipid panel, commonly included in routine screening.",
    whatMovesIt: [
      "diet, especially saturated fat",
      "physical activity",
      "body weight",
      "genetics, which can matter a great deal",
      "thyroid function",
      "certain medications",
    ],
    questionsForDoctor: [
      "Is the total or the individual parts more useful in my case?",
      "How does this compare with my past lipid panels?",
    ],
    sources: [MEDLINE_LIPID],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "ldl",
    displayName: "LDL Cholesterol",
    aliases: ["LDL", "LDL Cholesterol", "LDL-C", "LDL Calculated", "Cholesterol, LDL"],
    conventionalUnit: "mg/dL",
    siUnit: "mmol/L",
    unitConversion: linear(0.0259),
    whatItMeasures:
      "LDL carries cholesterol from the liver to the rest of the body. On many lab reports it's calculated from the other lipid values rather than measured directly.",
    whyOrdered: "Part of a standard lipid panel; often the number most discussed in follow-up.",
    whatMovesIt: [
      "diet, especially saturated fat",
      "physical activity",
      "body weight",
      "genetics",
      "thyroid function",
      "whether the sample was calculated or directly measured",
    ],
    questionsForDoctor: [
      "Was my LDL calculated or directly measured on this report?",
      "How does this compare with my past results?",
    ],
    sources: [MEDLINE_LIPID],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "hdl",
    displayName: "HDL Cholesterol",
    aliases: ["HDL", "HDL Cholesterol", "HDL-C", "Cholesterol, HDL"],
    conventionalUnit: "mg/dL",
    siUnit: "mmol/L",
    unitConversion: linear(0.0259),
    whatItMeasures:
      "HDL carries cholesterol away from the rest of the body back to the liver. It's often described as the portion that clears cholesterol rather than deposits it.",
    whyOrdered: "Part of a standard lipid panel.",
    whatMovesIt: ["physical activity", "alcohol use", "smoking", "genetics", "body weight"],
    questionsForDoctor: [
      "How should I read this alongside my LDL and triglycerides?",
      "Has this changed since my last panel?",
    ],
    sources: [MEDLINE_LIPID],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "triglycerides",
    displayName: "Triglycerides",
    aliases: ["Triglycerides", "TG", "Trigs"],
    conventionalUnit: "mg/dL",
    siUnit: "mmol/L",
    unitConversion: linear(0.0113),
    whatItMeasures:
      "Triglycerides are the most common type of fat in your body, carried in the blood and used or stored for energy.",
    whyOrdered: "Part of a standard lipid panel.",
    whatMovesIt: [
      "whether and how long you fasted before the draw — this one is especially sensitive to recent meals",
      "alcohol in the days before the draw",
      "carbohydrate and sugar intake",
      "body weight",
      "certain medications",
    ],
    questionsForDoctor: [
      "How long had I fasted before this draw, and does that change how it should be read?",
      "Would rechecking this fasting be worthwhile?",
    ],
    sources: [MEDLINE_LIPID],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },

  // ---------- Other common markers ----------
  {
    biomarkerKey: "hba1c",
    displayName: "HbA1c (Hemoglobin A1c)",
    aliases: ["HbA1c", "Hemoglobin A1c", "A1c", "Glycated Hemoglobin", "Hgb A1c", "HGBA1C"],
    conventionalUnit: "%",
    siUnit: "mmol/mol",
    unitConversion: affine(10.929, -23.5),
    whatItMeasures:
      "HbA1c reflects your average blood sugar over roughly the past two to three months, by measuring how much sugar has attached to your hemoglobin. Unlike a glucose result, it isn't a snapshot of one moment.",
    whyOrdered:
      "Used for screening and for tracking longer-term blood sugar patterns, since it isn't affected by what you ate that morning.",
    whatMovesIt: [
      "average blood sugar over the preceding months",
      "conditions that change how long red blood cells survive, which can make the estimate less reliable",
      "recent blood loss or transfusion",
      "some inherited hemoglobin variants, which can interfere with certain test methods",
      "pregnancy",
    ],
    questionsForDoctor: [
      "How does this compare with my day-to-day glucose readings, if I have any?",
      "Is there anything about my blood that could make this estimate less reliable?",
      "How does this compare with my past HbA1c results?",
    ],
    sources: [
      { label: "MedlinePlus: Hemoglobin A1C test", url: "https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "vitamin_d",
    displayName: "Vitamin D (25-hydroxy)",
    aliases: ["Vitamin D", "Vitamin D, 25-Hydroxy", "25-OH Vitamin D", "25(OH)D", "Vitamin D 25 Hydroxy"],
    conventionalUnit: "ng/mL",
    siUnit: "nmol/L",
    unitConversion: linear(2.496),
    whatItMeasures:
      "This measures the main storage form of vitamin D in your blood, which is the standard way of checking overall vitamin D status.",
    whyOrdered:
      "Ordered when there's a question about vitamin D status, often in the context of bone health, fatigue, or limited sun exposure.",
    whatMovesIt: [
      "sun exposure and the season the sample was drawn in",
      "skin tone, which affects how much vitamin D the skin makes from sunlight",
      "supplement use",
      "body weight",
      "certain medications and digestive conditions that affect absorption",
    ],
    questionsForDoctor: [
      "What time of year was this drawn, and does that affect how you read it?",
      "How does this compare with any earlier vitamin D results?",
    ],
    sources: [
      { label: "MedlinePlus: Vitamin D test", url: "https://medlineplus.gov/lab-tests/vitamin-d-test/" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "vitamin_b12",
    displayName: "Vitamin B12",
    aliases: ["Vitamin B12", "B12", "Cobalamin", "Vitamin B-12"],
    conventionalUnit: "pg/mL",
    siUnit: "pmol/L",
    unitConversion: linear(0.7378),
    whatItMeasures:
      "B12 is a vitamin your body needs to make red blood cells and to keep nerves working. This measures how much is circulating in your blood.",
    whyOrdered:
      "Often ordered alongside a CBC when red blood cell size is being looked at, or when there are symptoms involving fatigue or nerve sensations.",
    whatMovesIt: [
      "diet, since B12 comes mainly from animal foods",
      "supplement use, including recent doses",
      "absorption in the stomach and gut",
      "certain medications, including some long-term acid reducers and metformin",
      "age, since absorption tends to decrease over time",
    ],
    questionsForDoctor: [
      "Do any of my medications affect how I absorb B12?",
      "Would checking a related marker add useful context, given this result?",
    ],
    sources: [
      { label: "MedlinePlus: Vitamin B12 test", url: "https://medlineplus.gov/lab-tests/vitamin-b12-test/" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "ferritin",
    displayName: "Ferritin",
    aliases: ["Ferritin", "Serum Ferritin"],
    conventionalUnit: "ng/mL",
    siUnit: "µg/L",
    unitConversion: linear(1),
    whatItMeasures:
      "Ferritin is the protein that stores iron in your body. Measuring it gives a sense of how much iron is being held in reserve, rather than how much is circulating right now.",
    whyOrdered: "Ordered when there's a question about iron stores, often alongside a CBC or a serum iron test.",
    whatMovesIt: [
      "inflammation or recent illness, which can raise it independently of iron stores",
      "iron intake and supplement use",
      "blood loss, including menstruation",
      "liver conditions",
      "recent blood donation",
    ],
    questionsForDoctor: [
      "Could inflammation be affecting this number in my case?",
      "How does this fit with my hemoglobin and MCV results?",
    ],
    sources: [
      { label: "MedlinePlus: Ferritin test", url: "https://medlineplus.gov/lab-tests/ferritin-blood-test/" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
  {
    biomarkerKey: "iron",
    displayName: "Iron (Serum)",
    aliases: ["Iron", "Serum Iron", "Fe", "Iron, Total"],
    conventionalUnit: "µg/dL",
    siUnit: "µmol/L",
    unitConversion: linear(0.179),
    whatItMeasures:
      "This measures the amount of iron circulating in your blood at the moment of the draw — a snapshot, separate from your stored iron.",
    whyOrdered: "Usually ordered as part of an iron panel, together with ferritin and iron-binding capacity.",
    whatMovesIt: [
      "time of day, since serum iron naturally varies over 24 hours",
      "recent iron supplements or an iron-rich meal",
      "recent illness or inflammation",
      "menstruation",
    ],
    questionsForDoctor: [
      "What time of day was this drawn, and does that affect how you read it?",
      "How should I read this alongside my ferritin result?",
    ],
    sources: [
      { label: "MedlinePlus: Iron tests", url: "https://medlineplus.gov/lab-tests/iron-tests/" },
    ],
    lastReviewed: "2026-08-07",
    reviewStatus: "ai_drafted_sourced",
  },
];

export function findBiomarkerContent(biomarkerKey: string): BiomarkerContent | undefined {
  return BIOMARKER_CONTENT.find((b) => b.biomarkerKey === biomarkerKey);
}
