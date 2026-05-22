# GESA UMaT — Mobile App

Geomatic Engineering Students Association · University of Mines & Technology, Tarkwa

---

## Quick Start

### 1. Install Node.js
Download from https://nodejs.org (v18 or higher recommended)

### 2. Install dependencies
```bash
cd gesa-app
npm install
```

### 3. Set up Firebase
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `gesa-umat`
3. Go to **Project Settings → Your apps** → click the **web icon** `</>`
4. Register the app, copy the config object
5. Open `firebase.js` and paste in your real values

### 4. Enable Firestore & Storage
- **Firestore Database** → Create database (test mode to start)
- **Storage** → Get started

### 5. Run the app
```bash
npx expo start
```
Download **Expo Go** on your phone, scan the QR code — app opens instantly.

---

## Project Structure

```
gesa-app/
├── App.js                         Root entry point
├── firebase.js                    Paste Firebase keys here
├── app.json                       Expo config
├── package.json
└── src/
    ├── constants/
    │   ├── theme.js               Colors, spacing, radius
    │   └── seedData.js            Sample data reference
    ├── hooks/
    │   └── useFirestore.js        All Firestore data hooks
    ├── components/
    │   └── SharedComponents.js    Loader, Avatar, PillRow, etc.
    ├── navigation/
    │   └── AppNavigator.js        Bottom tabs + stack
    └── screens/
        ├── HomeScreen.js          Word of day, events, quick links
        ├── AnnouncementsScreen.js Notices
        ├── LeadersScreen.js       Executives + Lecturers
        ├── MaterialsScreen.js     Level → Semester → Course → PDF
        ├── PastQScreen.js         Level → Sem → Year → PDF
        └── EventsScreen.js        Events list
```

---

## Firestore Collections (seed these first)

**wordOfTheDay**
```json
{ "word": "Triangulation", "type": "noun · Geomatics", "definition": "...", "example": "...", "date": "2025-05-13" }
```

**events**
```json
{ "title": "GESA General Meeting", "description": "...", "date": "2025-05-14T10:00:00Z", "location": "LT1", "tag": "General", "featured": false }
```

**executives** (include `order` field: 1, 2, 3...)
```json
{ "name": "Kwame Asante", "position": "President", "order": 1, "photoUrl": "" }
```

**lecturers**
```json
{ "name": "Dr. Kwame Asante", "title": "Head of Department", "major": "Remote Sensing", "phone": "+233 24 000 0001", "email": "k.asante@umat.edu.gh", "isPinned": true }
```

**announcements**
```json
{ "title": "Exams timetable released", "body": "Check the notice board.", "tag": "Academic", "color": "purple", "createdAt": "<timestamp>" }
```

**learningMaterials**
```json
{ "level": 100, "semester": 1, "courseCode": "GE 101", "courseName": "Intro to Geomatics", "fileUrl": "https://firebasestorage.../file.pdf", "uploadedAt": "<timestamp>" }
```

**pastQuestions**
```json
{ "level": 100, "semester": 1, "courseCode": "GE 101", "courseName": "Intro to Geomatics", "year": 2024, "fileUrl": "https://firebasestorage.../paper.pdf", "uploadedAt": "<timestamp>" }
```

---

## Uploading PDFs
1. Firebase console → Storage → Upload file → select PDF
2. Click the file → copy the **Download URL**
3. Paste into `fileUrl` in the Firestore document

---

## Build APK for Android
```bash
npx eas build -p android --profile preview
```
(Free EAS account at https://expo.dev)

---

## v2 Roadmap
- Push notifications
- Admin upload panel
- Search
- Student cohort directory
