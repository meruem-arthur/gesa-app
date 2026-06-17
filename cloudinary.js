// ─────────────────────────────────────────────────────────────────────────────
// cloudinary.js — GESA UMaT
// Cloud name:    df9ns044o
// Upload preset: gesa-app  (unsigned)
// ─────────────────────────────────────────────────────────────────────────────

const CLOUD_NAME    = 'df9ns044o';
const UPLOAD_PRESET = 'gesa-app';

// ─── Derive MIME type from file extension ─────────────────────────────────────
function getMimeType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':  return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':  return 'application/msword';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'ppt':  return 'application/vnd.ms-powerpoint';
    default:     return 'image/jpeg';
  }
}

// ─── uploadFile — PDFs, Word docs, PowerPoint slides ─────────────────────────
export async function uploadFile(fileUri, folder = 'gesa') {
  const isDocument = /\.(pdf|docx|pptx|doc|ppt)$/i.test(fileUri);
  const fileName   = typeof fileUri === 'string' ? fileUri.split('/').pop() : fileUri.name;
  const publicId   = fileName.replace(/\.[^/.]+$/, ''); // strip extension for public_id
  const mimeType   = isDocument ? getMimeType(fileName) : 'image/jpeg';
  const resType    = isDocument ? 'raw' : 'image';

  const formData = new FormData();
  formData.append('file',          { uri: fileUri, type: mimeType, name: fileName });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder',        folder);
  formData.append('public_id',     publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resType}/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

// ─── uploadPhoto — executive & lecturer profile photos ────────────────────────
export async function uploadPhoto(fileUri, folder = 'gesa/photos') {
  const fileName = fileUri.split('/').pop();

  const formData = new FormData();
  formData.append('file',          { uri: fileUri, type: 'image/jpeg', name: fileName });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder',        folder);
  // NOTE: transformation is NOT allowed with unsigned presets — omitted intentionally

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Photo upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}
