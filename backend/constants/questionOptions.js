export const QUESTION_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
];

export const CHAPTERS_BY_SUBJECT = {
  Mathematics: [
    "Sets & Relations",
    "Algebra",
    "Trigonometry",
    "Coordinate Geometry",
    "Calculus",
    "Vectors",
    "3D Geometry",
    "Probability & Statistics",
    "Matrices & Determinants",
  ],
  Physics: [
    "Mechanics",
    "Thermodynamics",
    "Waves & Oscillations",
    "Electrostatics",
    "Current Electricity",
    "Magnetism",
    "Optics",
    "Modern Physics",
  ],
  Chemistry: [
    "Physical Chemistry",
    "Inorganic Chemistry",
    "Organic Chemistry",
    "Chemical Bonding",
    "Equilibrium",
    "Electrochemistry",
  ],
  Biology: [
    "Diversity in Living World",
    "Cell Structure",
    "Plant Physiology",
    "Human Physiology",
    "Genetics",
    "Ecology",
  ],
};

export const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

export const normalizeSubjectOption = (value) => {
  const cleaned = String(value || "Mathematics").trim();
  const match = QUESTION_SUBJECTS.find(
    (s) => s.toLowerCase() === cleaned.toLowerCase()
  );
  return match || QUESTION_SUBJECTS[0];
};

export const normalizeChapterOption = (subject, value) => {
  const chapters = CHAPTERS_BY_SUBJECT[normalizeSubjectOption(subject)] || [];
  const cleaned = String(value || "").trim();
  if (!cleaned) return chapters[0] || "";
  const match = chapters.find((c) => c.toLowerCase() === cleaned.toLowerCase());
  return match || cleaned;
};
