// Firebase client configuration is public; database security rules are essential.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, signInAnonymously, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getDatabase, ref, push, set, update, onValue, connectDatabaseEmulator } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js';
import { USE_FIREBASE_EMULATORS } from './shared-config.js';

const app = initializeApp(USE_FIREBASE_EMULATORS ? {
  apiKey: 'demo-key', projectId: 'demo-ghost-archive', databaseURL: 'http://127.0.0.1:9000?ns=demo-ghost-archive'
} : {
  apiKey: 'AIzaSyAPDebbA0AJ6GwOjK887ZT8NavVJPzjLYc',
  authDomain: 'ghost-archive-c950f.firebaseapp.com',
  projectId: 'ghost-archive-c950f',
  appId: '1:929450735340:web:c5dbc23372dc5d17f697c9',
  databaseURL: 'https://ghost-archive-c950f-default-rtdb.firebaseio.com'
});

export async function connect(onChange, onError) {
  const auth = getAuth(app);
  const db = getDatabase(app);
  if (USE_FIREBASE_EMULATORS) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectDatabaseEmulator(db, '127.0.0.1', 9000);
  }
  const credential = await signInAnonymously(auth);
  const uid = credential.user.uid;
  let shared = {}, owned = {}, readyRecords = false, readyOwners = false;
  const publish = () => {
    if (!readyRecords || !readyOwners) return;
    onChange(Object.entries(shared).map(([id, record]) => ({ ...record, id, mine: !!owned[id], remote: true })));
  };
  onValue(ref(db, 'ghostArchive/records'), snapshot => { shared = snapshot.val() || {}; readyRecords = true; publish(); }, onError);
  onValue(ref(db, `ghostArchive/owners/${uid}`), snapshot => { owned = snapshot.val() || {}; readyOwners = true; publish(); }, onError);
  return {
    async save(record, existingId) {
      const id = existingId || push(ref(db, 'ghostArchive/records')).key;
      // Claim is immutable, and deliberately contains no readable public identity.
      if (!existingId) await set(ref(db, `ghostArchive/claims/${id}`), uid);
      const { title, text, category, vector, synthetic } = record;
      await update(ref(db), {
        [`ghostArchive/records/${id}`]: { title, text, category, vector, synthetic },
        [`ghostArchive/owners/${uid}/${id}`]: true
      });
    },
    async remove(id) {
      await update(ref(db), {
        [`ghostArchive/records/${id}`]: null,
        [`ghostArchive/owners/${uid}/${id}`]: null
      });
    }
  };
}
