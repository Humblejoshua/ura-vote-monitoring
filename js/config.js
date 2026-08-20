/**
 * VoteTrack Configuration
 *
 * Replace these values with your Firebase project details, or enter them
 * in the app under Settings → Firebase Configuration (saved to localStorage).
 *
 * HOW TO GET THESE VALUES:
 * 1. Go to https://console.firebase.google.com and create a project
 * 2. Add a Web App (Project Settings → General → Your apps → Add app → Web)
 * 3. The Firebase config shows your apiKey, authDomain, projectId, databaseURL
 * 4. Realtime Database → Create Database (choose a location) → Start
 * 5. Authentication → Sign-in method → enable "Anonymous"
 * 6. Realtime Database → Rules → set to:
 *      { "rules": { "payments": { ".read": "auth != null", ".write": "auth != null" } } }
 */
const APP_CONFIG = {
  firebase: {
    projectId: 'YOUR_PROJECT_ID',
    apiKey: 'YOUR_API_KEY',
    databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com'
  },

  // Organization details
  orgName: 'Uganda Revenue Authority',
  orgShort: 'TAC',
  fiscalYear: '2026/2027',
  currency: 'UGX',

  // UI settings
  appTitle: 'TAC Budget Monitoring',
  showConfigBanner: true
};
