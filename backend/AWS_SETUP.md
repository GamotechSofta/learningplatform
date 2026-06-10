# AWS Setup — Direct Browser-to-S3 Video Uploads

Videos upload **directly from the browser to S3** using multipart presigned URLs.
The backend never receives the file body — it only creates the upload session,
signs each part, and completes the upload. Playback is served via CloudFront.

```
Browser ──init──▶ API ──▶ S3 (CreateMultipartUpload)
Browser ──presign per part──▶ API ──▶ S3 (signed UploadPart URL)
Browser ──PUT chunk──────────────────▶ S3   (direct, 25 MB parts)
Browser ──complete──▶ API ──▶ S3 (CompleteMultipartUpload)
Browser ──POST /api/videos──▶ API ──▶ MongoDB (stores videoKey only)
Viewer  ──────────────────────────────▶ CloudFront (cdn.vidyank.com)
```

The DB stores **keys only** (`videoKey`, `thumbnailKey`). The API returns
`videoUrl` / `thumbnail` computed as `${CDN_URL}/${key}`.

---

## 1. Environment variables (API server)

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=learningplatforn
CDN_URL=https://cdn.vidyank.com
CLIENT_URL=https://www.vidyank.com,https://vidyank.com
```

Admin (Vercel): `VITE_API_URL=https://api.vidyank.com`

---

## 2. S3 Bucket CORS (REQUIRED)

Direct browser uploads need CORS on the bucket. The browser also needs the
`ETag` response header exposed (each part's ETag is required to complete the
multipart upload).

AWS Console → S3 → **learningplatforn** → Permissions → Cross-origin resource
sharing (CORS) → paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://www.vidyank.com",
      "https://vidyank.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

> Without `ExposeHeaders: ["ETag"]` the upload reaches 100% but completion fails.

---

## 3. IAM policy for the API user

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VideoBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListBucket",
        "s3:ListMultipartUploadParts",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::learningplatforn",
        "arn:aws:s3:::learningplatforn/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "*"
    }
  ]
}
```

---

## 4. Notes

- Part size is **25 MB** (`VIDEO_PART_SIZE` in `utils/s3.js`); S3 requires every
  part except the last to be ≥ 5 MB. Max video size is **5 GB**.
- Incomplete uploads are aborted automatically on cancel/fatal error. Consider an
  S3 lifecycle rule to abort multipart uploads older than 1 day to avoid storage
  charges for orphaned parts.
- Nginx in front of the API only needs a small `client_max_body_size` (e.g. `2M`)
  because **no video bytes pass through the API** anymore.
