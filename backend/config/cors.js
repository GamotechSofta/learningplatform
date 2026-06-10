import cors from "cors";

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://www.vidyank.com",
  "https://vidyank.com",
];

const getAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...fromEnv, ...DEFAULT_ORIGINS])];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);

export default corsOptions;
