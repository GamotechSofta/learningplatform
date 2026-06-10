import "../config/loadEnv.js";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_BUCKET_NAME?.trim();
const region = process.env.AWS_REGION?.trim();

const origins = [
  ...new Set([
    ...(process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    "https://www.vidyank.com",
    "https://vidyank.com",
    "http://localhost:5173",
  ]),
];

const corsRules = [
  {
    AllowedHeaders: ["*"],
    AllowedMethods: ["PUT", "GET", "HEAD"],
    AllowedOrigins: origins,
    ExposeHeaders: ["ETag"],
    MaxAgeSeconds: 3000,
  },
];

const manualInstructions = () => {
  console.log("\n--- Configure manually in AWS Console ---");
  console.log("S3 → learningplatforn → Permissions → Cross-origin resource sharing (CORS)");
  console.log("Paste this JSON:\n");
  console.log(JSON.stringify(corsRules, null, 2));
  console.log("\nYour IAM user also needs s3:PutBucketCORS to run this script automatically.");
};

if (!bucket || !region) {
  console.error("Set AWS_BUCKET_NAME and AWS_REGION in .env");
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

try {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: { CORSRules: corsRules },
    })
  );
  console.log(`S3 CORS configured for bucket "${bucket}"`);
  console.log("Allowed origins:", origins);
} catch (err) {
  console.error("Could not set S3 CORS automatically:", err.message);
  manualInstructions();
  process.exit(1);
}
