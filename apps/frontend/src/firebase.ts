import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const looksLikePlaceholder = (value: string | undefined): boolean => {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();

  return (
    normalized.includes("your-") ||
    normalized.includes("example") ||
    normalized === "1:1234567890:web:abcdef123456"
  );
};

export const firebaseEnabled = Object.values(config).every((value) => value && !looksLikePlaceholder(value));
export const firebaseConfigError = firebaseEnabled
  ? ""
  : "Firebase is not configured yet. Replace the placeholder values in apps/frontend/.env with real Firebase web app credentials.";
export const developerEmail = import.meta.env.VITE_DEVELOPER_EMAIL?.trim().toLowerCase() ?? "";

export const firebaseApp = firebaseEnabled ? initializeApp(config) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleProvider = firebaseApp ? new GoogleAuthProvider() : null;

if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: "select_account"
  });
}
