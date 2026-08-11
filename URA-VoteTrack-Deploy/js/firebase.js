/**
 * Firebase Realtime Database integration for VoteTrack.
 *
 * SETUP INSTRUCTIONS (see README.md for full details):
 * 1. Go to https://console.firebase.google.com and create a project
 * 2. Add a Web App to get your Firebase config
 * 3. Realtime Database → Create Database → choose a location → Start in test mode
 * 4. Authentication → Sign-in method → enable "Anonymous"
 * 5. Open js/config.js (or the Firebase Settings page in the app) and enter:
 *      projectId      - your Firebase project ID
 *      apiKey         - your web app API key
 *      databaseURL    - e.g. https://<project-id>-default-rtdb.firebaseio.com
 *
 * DATA STRUCTURE:
 *   payments/
 *     <id>/   -> { id, vote_code, vote_name, payment_date, payment_reference,
 *                 payee, description, amount, entered_by, created_at }
 *
 * SECURITY RULES (set in Realtime Database → Rules):
 *   {
 *     "rules": {
 *       "payments": {
 *         ".read": "auth != null",
 *         ".write": "auth != null"
 *       }
 *     }
 *   }
 */

const FirebaseAPI = {
  app: null,
  db: null,
  inited: false,
  authReady: false,

  init(cfg) {
    if (!cfg || !cfg.databaseURL || !cfg.projectId || !cfg.apiKey) {
      this.inited = false;
      return;
    }
    try {
      if (this.app) {
        try { this.app.delete(); } catch (e) { /* ignore */ }
        this.app = null;
        this.db = null;
      }
      this.app = firebase.initializeApp({
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain || cfg.projectId + '.firebaseapp.com',
        databaseURL: cfg.databaseURL,
        projectId: cfg.projectId
      }, 'uravotes');
      this.db = firebase.database(this.app);
      this.inited = true;
      this.authReady = false;
      this.ensureAuth();
    } catch (err) {
      console.error('Firebase init error:', err);
      this.inited = false;
    }
  },

  isConfigured() {
    return this.inited;
  },

  async ensureAuth() {
    if (!this.inited) return;
    try {
      if (!firebase.auth(this.app).currentUser) {
        await firebase.auth(this.app).signInAnonymously();
      }
      this.authReady = true;
    } catch (err) {
      console.warn('Firebase anonymous auth failed:', err);
      this.authReady = false;
    }
  },

  paymentsRef() {
    return this.db.ref('payments');
  },

  /**
   * Subscribe to live payment updates. Returns an unsubscribe function.
   */
  subscribe(callback) {
    if (!this.inited) return () => {};
    const ref = this.paymentsRef();
    const handler = snap => {
      const obj = snap.val() || {};
      const list = Object.values(obj)
        .filter(p => p && p.id)
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      callback(list);
    };
    ref.on('value', handler);
    return () => ref.off('value', handler);
  },

  /**
   * One-shot read (used for testing the connection).
   */
  async getPayments() {
    if (!this.inited) return [];
    try {
      const snap = await this.paymentsRef().once('value');
      const obj = snap.val() || {};
      return Object.values(obj).filter(p => p && p.id);
    } catch (err) {
      console.error('Firebase read error:', err);
      return [];
    }
  },

  async addPayment(payment) {
    if (!this.inited) return false;
    try {
      await this.db.ref('payments/' + payment.id).set(payment);
      return true;
    } catch (err) {
      console.error('Firebase write error:', err);
      return false;
    }
  },

  async deletePayment(id) {
    if (!this.inited) return false;
    try {
      await this.db.ref('payments/' + id).remove();
      return true;
    } catch (err) {
      console.error('Firebase delete error:', err);
      return false;
    }
  },

  async testConnection() {
    if (!this.inited) return { ok: false, message: 'Firebase is not configured' };
    try {
      await this.ensureAuth();
      const snap = await this.paymentsRef().limitToFirst(1).once('value');
      return { ok: true, message: `Connected to "${this.app.options.projectId}" (${snap.numChildren()} payment node(s))` };
    } catch (err) {
      return { ok: false, message: err.message || 'Connection failed' };
    }
  }
};
