# Vidyank Mobile App

Flutter student app for the Vidyank learning platform. It displays categories, courses, lessons, and videos uploaded from the admin panel.

## Features

- Browse published categories and courses
- View course curriculum (lessons + videos)
- Play videos via CloudFront URLs from the backend API
- Search categories and courses
- Student login and registration

## Prerequisites

- Flutter SDK 3.9+
- Backend API running (`backend/` on port 3000)

## Run locally

```bash
cd mobile-app
flutter pub get
flutter run
```

### API URL

| Platform | Default API URL |
|----------|-----------------|
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator / desktop | `http://localhost:3000` |
| Physical device | Use your machine IP, e.g. `http://192.168.1.10:3000` |

Override for production or device testing:

```bash
flutter run --dart-define=API_BASE_URL=https://api.vidyank.com
```

## Project structure

```
lib/
├── config/          # API base URL, app name
├── core/            # API client, theme
├── models/          # Category, Course, Lesson, Video, User
├── services/        # API service layer
├── providers/       # Auth state
├── screens/         # UI screens
├── widgets/         # Reusable components
└── routing/         # go_router navigation
```

## Notes

- Only **published** categories, courses, lessons, and videos are shown.
- Video playback uses `videoUrl` returned by the backend (CloudFront CDN).
- Mobile auth uses `Authorization: Bearer <token>` (backend supports this in addition to admin cookie auth).
