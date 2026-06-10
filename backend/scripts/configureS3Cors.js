import "../config/loadEnv.js";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_BUCKET_NAME?.trim();
const region = process.env.AWS_REGION?.trim();

if (!bucket || !region) {
  console.error("Set AWS_BUCKET_NAME and AWS_REGION in .env");
  process.exit(1);
}

const origins = [
  ...new Set([
    ...(process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    "https://www.vidyank.com",
    "https://vidyank.com",
  ]),
];

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

await s3.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["PUT", "GET", "HEAD"],
          AllowedOrigins: origins,
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  })
);

console.log(`S3 CORS configured for bucket "${bucket}" with origins:`, origins);
