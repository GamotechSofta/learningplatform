import dotenv from "dotenv";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

dotenv.config();

const prefix =
  process.argv[2] ||
  "videos/Skill Courses/Video Editing & Content Creation Masterclass/CapCut Video Editing – FULL COURSE in 6 Hours/";

const cdn = (process.env.CDN_URL || process.env.CLOUDFRONT_URL || "").replace(
  /\/+$/,
  ""
);

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

let token;
const files = [];
do {
  const res = await client.send(
    new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: token,
    })
  );
  for (const obj of res.Contents || []) {
    if (!obj.Key.endsWith("/")) files.push(obj);
  }
  token = res.IsTruncated ? res.NextContinuationToken : undefined;
} while (token);

files.sort((a, b) =>
  a.Key.localeCompare(b.Key, undefined, { numeric: true })
);

const toCloudFrontUrl = (key) => {
  const encoded = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${cdn}/${encoded}`;
};

console.log(`CDN base: ${cdn}`);
console.log(`Prefix: ${prefix}`);
console.log(`Found ${files.length} video(s)\n`);

files.forEach((f, i) => {
  const name = f.Key.split("/").pop();
  console.log(`${i + 1}. ${name}`);
  console.log(`   ${toCloudFrontUrl(f.Key)}`);
  console.log(`   (${(f.Size / 1024 / 1024).toFixed(2)} MB)\n`);
});
