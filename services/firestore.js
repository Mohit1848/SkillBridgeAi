const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey
  };
}

function getDb() {
  const firebaseConfig = getFirebaseConfig();

  if (!firebaseConfig) {
    return null;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(firebaseConfig)
    });
  }

  return getFirestore();
}

async function saveAnalysisResult(result) {
  const db = getDb();

  if (!db) {
    return {
      stored: false,
      id: null
    };
  }

  const document = {
    atsScore: result.ats_score,
    extractedSkills: result.extracted_skills,
    suggestions: result.suggestions,
    createdAt: FieldValue.serverTimestamp()
  };

  const reference = await db.collection("resume_analyses").add(document);

  return {
    stored: true,
    id: reference.id
  };
}

module.exports = {
  saveAnalysisResult
};
