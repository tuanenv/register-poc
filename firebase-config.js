// Firebase Web App configuration for Register POC.
// This file contains client-side Firebase identifiers, not passwords or service-account keys.
// Replace YOUR_FIREBASE_API_KEY once with the value from Firebase Console > Project settings > Your apps.

export const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyBBtt3OUD40oI1MvIJB1O-LtNjpbqK92mQ",
  authDomain: "exhibition-registration-8deec.firebaseapp.com",
  projectId: "exhibition-registration-8deec",
  appId: "1:930490413482:web:67ae0d5d413e1a30bebbd3"
});

export const firebaseCollections = Object.freeze({
  guests: "guests",
  imports: "imports",
  connectionTests: "connection_tests",
  // Collection เดิม เก็บไว้สำรอง
  seats: "seats",
  // Collection ใหม่ที่ระบบจะใช้งาน
  seats: "seats_v2",
  // เก็บ Configuration ของผังที่นั่ง
  seatingConfigs: "seatingConfigs"
});

export function isFirebaseConfigReady(config = firebaseConfig) {
  return Boolean(
    config.apiKey &&
    config.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    config.authDomain &&
    config.projectId &&
    config.appId
  );
}
