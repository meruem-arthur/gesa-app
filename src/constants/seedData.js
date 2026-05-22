// ─────────────────────────────────────────────────────────────
// SEED DATA — paste each object into Firebase console
// or run a seed script with the Admin SDK
// ─────────────────────────────────────────────────────────────

export const SEED_WORD_OF_DAY = {
  word: 'Triangulation',
  type: 'noun · Geomatics',
  definition:
    'A method of surveying in which an area is divided into a network of triangles to determine positions and distances with high accuracy.',
  example:
    '"The team used triangulation to map the coastal boundary with precision."',
  date: '2025-05-13',
};

export const SEED_EVENTS = [
  {
    title: 'GESA General Meeting',
    description: 'Monthly general assembly for all GESA members. Agenda includes semester review and upcoming activities.',
    date: '2025-05-14T10:00:00Z',
    location: 'LT1, Essikado Campus',
    tag: 'General',
  },
  {
    title: 'GE Study Group Session',
    description: 'Collaborative study session for mid-semester revision. All levels welcome.',
    date: '2025-05-18T14:00:00Z',
    location: 'Seminar Room B',
    tag: 'Academic',
  },
  {
    title: 'GESA Annual Induction & Awards Night',
    description: 'Annual induction of new members and awards ceremony for outstanding students.',
    date: '2025-05-22T18:00:00Z',
    location: 'Great Hall, UMaT Essikado',
    tag: 'Formal',
    featured: true,
  },
  {
    title: 'Departmental BBQ & Mixer',
    description: 'End-of-semester social event for all Geomatics students and staff.',
    date: '2025-06-05T16:00:00Z',
    location: 'Engineering Forecourt',
    tag: 'Social',
  },
];

export const SEED_EXECUTIVES = [
  { name: 'Kwame Asante',    position: 'President',           order: 1, photoUrl: '' },
  { name: 'Ama Boateng',     position: 'Vice President',      order: 2, photoUrl: '' },
  { name: 'Elinam Offei',    position: 'Financial Secretary', order: 3, photoUrl: '' },
  { name: 'Fiifi Korsah',    position: 'General Secretary',   order: 4, photoUrl: '' },
  { name: 'Serwaa Amponsah', position: 'Organiser',           order: 5, photoUrl: '' },
  { name: 'Nana Mensah',     position: 'PRO',                 order: 6, photoUrl: '' },
];

export const SEED_LECTURERS = [
  { name: 'Dr. Kwame Asante',   title: 'Head of Department', major: 'Remote Sensing & GIS',  phone: '+233 24 000 0001', email: 'k.asante@umat.edu.gh',   isPinned: true,  photoUrl: '' },
  { name: 'Prof. Patricia Amo', title: 'Dean of Engineering', major: 'Geodesy',              phone: '+233 24 000 0002', email: 'p.amo@umat.edu.gh',      isPinned: true,  photoUrl: '' },
  { name: 'Dr. James Boateng',  title: 'Senior Lecturer',    major: 'Cartography',           phone: '+233 24 000 0003', email: 'j.boateng@umat.edu.gh',  isPinned: false, photoUrl: '' },
  { name: 'Dr. Abena Frimpong', title: 'Lecturer',           major: 'Land Surveying',        phone: '+233 24 000 0004', email: 'a.frimpong@umat.edu.gh', isPinned: false, photoUrl: '' },
];

export const SEED_ANNOUNCEMENTS = [
  { title: 'Exams timetable released',    body: 'The end-of-semester examination timetable has been released. Check the department notice board or download from the portal.', tag: 'Academic',  color: 'purple', createdAt: new Date() },
  { title: 'Dues payment reminder',       body: 'All members are reminded to settle outstanding association dues before the end of the week.',                                  tag: 'Finance',   color: 'gold',   createdAt: new Date() },
  { title: 'Field trip — Volta River',    body: 'Level 300 students are reminded of the upcoming field mapping exercise at the Volta River basin. Departure 6:00 AM Friday.', tag: 'Trip',      color: 'amber',  createdAt: new Date() },
  { title: 'New study materials uploaded',body: 'GE 305 Remote Sensing lecture notes for Week 10 have been uploaded to the Materials section.',                                tag: 'Resources', color: 'blue',   createdAt: new Date() },
];

// Learning materials & past questions are added via the Firebase console
// or your admin upload panel (v2 feature).
// Firestore path: learningMaterials/{docId}
// Fields: level, semester, courseCode, courseName, fileUrl, uploadedAt
