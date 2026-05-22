// ─────────────────────────────────────────────────────────────────────────────
// GESA UMaT — Firebase Seed Script
// Run this ONCE to populate all Firestore collections with sample data.
//
// HOW TO RUN:
//   1. npm install firebase-admin          (in this folder)
//   2. Get your service account key (see below)
//   3. Save it as serviceAccountKey.json   (in this folder)
//   4. node seed.js
//
// HOW TO GET YOUR SERVICE ACCOUNT KEY:
//   1. https://console.firebase.google.com → your project
//   2. Project Settings (gear icon) → Service accounts tab
//   3. Click "Generate new private key" → save as serviceAccountKey.json
// ─────────────────────────────────────────────────────────────────────────────

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function seedCollection(name, docs) {
  console.log(`\n📦  Seeding "${name}" (${docs.length} docs)...`);
  const batch = db.batch();
  docs.forEach((doc) => batch.set(db.collection(name).doc(), doc));
  await batch.commit();
  console.log(`    ✅ Done`);
}

// ── WORD OF THE DAY ──────────────────────────────────────────────────────────
const wordOfTheDay = [
  {
    word: 'Triangulation',
    type: 'noun · Geomatics',
    definition: 'A method of surveying in which an area is divided into a network of triangles to determine positions and distances with high accuracy.',
    example: '"The team used triangulation to map the coastal boundary with precision."',
    date: '2025-05-13',
  },
  {
    word: 'Geodesy',
    type: 'noun · Earth Sciences',
    definition: 'The science of accurately measuring and understanding the geometric shape, orientation in space, and gravitational field of the Earth.',
    example: '"Geodesy underpins every modern GPS navigation system."',
    date: '2025-05-14',
  },
  {
    word: 'Photogrammetry',
    type: 'noun · Remote Sensing',
    definition: 'The science of making reliable measurements and maps from photographs, especially aerial photographs.',
    example: '"Photogrammetry was used to produce a 3D model of the mine site."',
    date: '2025-05-15',
  },
  {
    word: 'Datum',
    type: 'noun · Surveying',
    definition: 'A reference surface or coordinate system used as the basis for measurements of position, altitude, or depth.',
    example: '"All elevations on the map are referenced to the national vertical datum."',
    date: '2025-05-16',
  },
  {
    word: 'Azimuth',
    type: 'noun · Surveying',
    definition: 'The horizontal angle measured clockwise from north to a given direction, used to express the bearing of a survey line.',
    example: '"The surveyor recorded an azimuth of 135° to the reference point."',
    date: '2025-05-17',
  },
];

// ── EVENTS ────────────────────────────────────────────────────────────────────
const events = [
  { title: 'GESA General Meeting',              description: 'Monthly general assembly. Agenda: semester review and upcoming activities.',                             date: admin.firestore.Timestamp.fromDate(new Date('2025-05-14T10:00:00Z')), location: 'LT1, Essikado Campus',               tag: 'General',  featured: false },
  { title: 'GE Study Group Session',            description: 'Collaborative mid-semester revision. All levels welcome. Bring your notes.',                             date: admin.firestore.Timestamp.fromDate(new Date('2025-05-18T14:00:00Z')), location: 'Seminar Room B, Essikado',           tag: 'Academic', featured: false },
  { title: 'GESA Annual Induction & Awards Night',description: 'Induction of new members and awards ceremony for outstanding students.',                               date: admin.firestore.Timestamp.fromDate(new Date('2025-05-22T18:00:00Z')), location: 'Great Hall, UMaT Essikado',          tag: 'Formal',   featured: true  },
  { title: 'GIS & Remote Sensing Workshop',     description: 'Hands-on QGIS and remote sensing data analysis for all levels. Laptops required.',                      date: admin.firestore.Timestamp.fromDate(new Date('2025-05-28T09:00:00Z')), location: 'Computer Lab 3, Essikado',           tag: 'Academic', featured: false },
  { title: 'Volta River Field Survey',          description: 'Level 300 practical fieldwork at the Volta River basin. Total station and GPS field measurements.',      date: admin.firestore.Timestamp.fromDate(new Date('2025-06-02T06:00:00Z')), location: 'Volta River Basin, Akosombo',        tag: 'Trip',     featured: false },
  { title: 'Departmental BBQ & Mixer',          description: 'End-of-semester social for all Geomatics students and staff.',                                          date: admin.firestore.Timestamp.fromDate(new Date('2025-06-05T16:00:00Z')), location: 'Engineering Forecourt, UMaT',        tag: 'Social',   featured: false },
];

// ── EXECUTIVES ────────────────────────────────────────────────────────────────
const executives = [
  { name: 'Kwame Asante',     position: 'President',             order: 1, photoUrl: '', bio: '' },
  { name: 'Ama Boateng',      position: 'Vice President',        order: 2, photoUrl: '', bio: '' },
  { name: 'Elinam Offei',     position: 'Financial Secretary',   order: 3, photoUrl: '', bio: '' },
  { name: 'Fiifi Korsah',     position: 'General Secretary',     order: 4, photoUrl: '', bio: '' },
  { name: 'Serwaa Amponsah',  position: 'Organiser',             order: 5, photoUrl: '', bio: '' },
  { name: 'Nana Mensah',      position: 'PRO',                   order: 6, photoUrl: '', bio: '' },
  { name: 'Abena Tawiah',     position: "Women's Commissioner",  order: 7, photoUrl: '', bio: '' },
  { name: 'Kofi Darko',       position: 'Sports Director',       order: 8, photoUrl: '', bio: '' },
];

// ── LECTURERS ─────────────────────────────────────────────────────────────────
const lecturers = [
  { name: 'Dr. Kwame Asante',   title: 'Head of Department', major: 'Remote Sensing & GIS',       phone: '+233 24 000 0001', email: 'k.asante@umat.edu.gh',   isPinned: true,  photoUrl: '' },
  { name: 'Prof. Patricia Amo', title: 'Dean of Engineering', major: 'Geodesy',                   phone: '+233 24 000 0002', email: 'p.amo@umat.edu.gh',      isPinned: true,  photoUrl: '' },
  { name: 'Dr. James Boateng',  title: 'Senior Lecturer',    major: 'Cartography & Map Production',phone: '+233 24 000 0003', email: 'j.boateng@umat.edu.gh',  isPinned: false, photoUrl: '' },
  { name: 'Dr. Abena Frimpong', title: 'Lecturer',           major: 'Land Surveying',             phone: '+233 24 000 0004', email: 'a.frimpong@umat.edu.gh', isPinned: false, photoUrl: '' },
  { name: 'Mr. Samuel Tetteh',  title: 'Lecturer',           major: 'Engineering Surveying',      phone: '+233 24 000 0005', email: 's.tetteh@umat.edu.gh',   isPinned: false, photoUrl: '' },
  { name: 'Dr. Yaw Darko',      title: 'Lecturer',           major: 'Photogrammetry',             phone: '+233 24 000 0006', email: 'y.darko@umat.edu.gh',    isPinned: false, photoUrl: '' },
];

// ── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
const announcements = [
  { title: 'Exams timetable released',    body: 'The end-of-semester examination timetable has been released. Check the department notice board or the student portal.',            tag: 'Academic', color: 'purple', author: 'GESA Academics', createdAt: admin.firestore.Timestamp.fromDate(new Date('2025-05-13T08:00:00Z')) },
  { title: 'Dues payment reminder',       body: 'All members are reminded to settle outstanding dues before end of week. Contact the Financial Secretary for payment details.',     tag: 'Finance',  color: 'gold',   author: 'Fin. Secretary',  createdAt: admin.firestore.Timestamp.fromDate(new Date('2025-05-12T14:00:00Z')) },
  { title: 'Field trip — Volta River',    body: 'Level 300 students: field mapping exercise at the Volta River basin. Departure 6:00 AM Friday from the Engineering Gate.',       tag: 'Trip',     color: 'amber',  author: 'Organiser',       createdAt: admin.firestore.Timestamp.fromDate(new Date('2025-05-11T10:00:00Z')) },
  { title: 'New study materials uploaded',body: 'GE 305 Remote Sensing lecture notes for Week 10 have been uploaded to the Materials section of the GESA app.',                  tag: 'Resources',color: 'blue',   author: 'GESA Academics',  createdAt: admin.firestore.Timestamp.fromDate(new Date('2025-05-10T09:00:00Z')) },
  { title: 'GESA Week planning meeting',  body: 'All executives and interested members are invited to the GESA Week planning meeting. Venue: Seminar Room B, 4:00 PM Thursday.', tag: 'Event',    color: 'purple', author: 'President',        createdAt: admin.firestore.Timestamp.fromDate(new Date('2025-05-09T16:00:00Z')) },
];

// ── LEARNING MATERIALS ───────────────────────────────────────────────────────
// Replace dummy PDF URLs with real Cloudinary URLs after upload.
// Cloudinary URLs look like:
//   https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v.../gesa/materials/level100/sem1/GE101.pdf
// Upload using cloudinary.js → uploadFile(fileUri, 'gesa/materials/level100/sem1')
const PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const now = admin.firestore.Timestamp.now();

const learningMaterials = [
  { level: 100, semester: 1, courseCode: 'GE 101', courseName: 'Introduction to Geomatics',  fileUrl: PDF, uploadedAt: now },
  { level: 100, semester: 1, courseCode: 'GE 103', courseName: 'Engineering Mathematics I',  fileUrl: PDF, uploadedAt: now },
  { level: 100, semester: 1, courseCode: 'GE 105', courseName: 'Physical Geography',         fileUrl: PDF, uploadedAt: now },
  { level: 100, semester: 1, courseCode: 'GE 107', courseName: 'Technical Drawing',          fileUrl: PDF, uploadedAt: now },
  { level: 100, semester: 2, courseCode: 'GE 102', courseName: 'Surveying I',                fileUrl: PDF, uploadedAt: now },
  { level: 100, semester: 2, courseCode: 'GE 104', courseName: 'Engineering Mathematics II', fileUrl: PDF, uploadedAt: now },
  { level: 100, semester: 2, courseCode: 'GE 106', courseName: 'Computer Applications',      fileUrl: PDF, uploadedAt: now },
  { level: 200, semester: 1, courseCode: 'GE 201', courseName: 'Surveying II',               fileUrl: PDF, uploadedAt: now },
  { level: 200, semester: 1, courseCode: 'GE 203', courseName: 'Remote Sensing I',           fileUrl: PDF, uploadedAt: now },
  { level: 200, semester: 1, courseCode: 'GE 205', courseName: 'GIS Fundamentals',           fileUrl: PDF, uploadedAt: now },
  { level: 200, semester: 2, courseCode: 'GE 202', courseName: 'Photogrammetry I',           fileUrl: PDF, uploadedAt: now },
  { level: 200, semester: 2, courseCode: 'GE 204', courseName: 'Cartography',                fileUrl: PDF, uploadedAt: now },
  { level: 300, semester: 1, courseCode: 'GE 301', courseName: 'Remote Sensing II',          fileUrl: PDF, uploadedAt: now },
  { level: 300, semester: 1, courseCode: 'GE 303', courseName: 'Geodesy',                    fileUrl: PDF, uploadedAt: now },
  { level: 300, semester: 1, courseCode: 'GE 305', courseName: 'Land Administration',        fileUrl: PDF, uploadedAt: now },
  { level: 300, semester: 2, courseCode: 'GE 302', courseName: 'Advanced GIS',               fileUrl: PDF, uploadedAt: now },
  { level: 300, semester: 2, courseCode: 'GE 304', courseName: 'Hydrographic Surveying',     fileUrl: PDF, uploadedAt: now },
  { level: 400, semester: 1, courseCode: 'GE 401', courseName: 'Research Methods',           fileUrl: PDF, uploadedAt: now },
  { level: 400, semester: 1, courseCode: 'GE 403', courseName: 'Engineering Project Mgmt',   fileUrl: PDF, uploadedAt: now },
  { level: 400, semester: 2, courseCode: 'GE 402', courseName: 'Capstone Project I',         fileUrl: PDF, uploadedAt: now },
  { level: 400, semester: 2, courseCode: 'GE 404', courseName: 'Professional Practice',      fileUrl: PDF, uploadedAt: now },
];
// NOTE: Max level is 400. No Level 500.

// ── PAST QUESTIONS ───────────────────────────────────────────────────────────
function pq(level, semester, code, name, years) {
  return years.map(year => ({ level, semester, courseCode: code, courseName: name, year, fileUrl: PDF, uploadedAt: now }));
}

const pastQuestions = [
  ...pq(100, 1, 'GE 101', 'Introduction to Geomatics',  [2021,2022,2023,2024]),
  ...pq(100, 1, 'GE 103', 'Engineering Mathematics I',  [2022,2023,2024]),
  ...pq(100, 2, 'GE 102', 'Surveying I',                [2021,2022,2023,2024]),
  ...pq(200, 1, 'GE 201', 'Surveying II',               [2021,2022,2023,2024]),
  ...pq(200, 1, 'GE 203', 'Remote Sensing I',           [2022,2023,2024]),
  ...pq(200, 2, 'GE 202', 'Photogrammetry I',           [2022,2023,2024]),
  ...pq(300, 1, 'GE 301', 'Remote Sensing II',          [2021,2022,2023,2024]),
  ...pq(300, 1, 'GE 303', 'Geodesy',                    [2022,2023,2024]),
  ...pq(300, 2, 'GE 302', 'Advanced GIS',               [2022,2023,2024]),
  ...pq(400, 1, 'GE 401', 'Research Methods',           [2022,2023,2024]),
  ...pq(400, 2, 'GE 402', 'Capstone Project I',         [2023,2024]),
];
// NOTE: Max level is 400. No Level 500.

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  GESA UMaT — Firestore Seed Script');
  console.log('──────────────────────────────────────');

  await seedCollection('wordOfTheDay',      wordOfTheDay);
  await seedCollection('events',            events);
  await seedCollection('executives',        executives);
  await seedCollection('lecturers',         lecturers);
  await seedCollection('announcements',     announcements);
  await seedCollection('learningMaterials', learningMaterials);
  await seedCollection('pastQuestions',     pastQuestions);

  const total = wordOfTheDay.length + events.length + executives.length +
    lecturers.length + announcements.length + learningMaterials.length + pastQuestions.length;

  console.log('\n──────────────────────────────────────');
  console.log(`✅  Seeded ${total} documents across 7 collections.`);
  console.log('\nNext steps:');
  console.log('  1. Set up Cloudinary (free at cloudinary.com)');
  console.log('  2. Paste CLOUD_NAME and UPLOAD_PRESET into cloudinary.js');
  console.log('  3. Upload real PDFs using the uploadFile() helper');
  console.log('  4. Replace dummy fileUrl values in Firestore with real Cloudinary URLs');
  console.log('  5. Run: npx expo start\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
