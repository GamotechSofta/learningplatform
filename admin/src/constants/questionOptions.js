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

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const getChaptersForSubject = (subject) =>
  CHAPTERS_BY_SUBJECT[subject] || [];
