
import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  setDoc,
  initializeFirestore,
  persistentLocalCache
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkJ2cREq0L10oWQ5nlksl29CbMzPaEBIs",
  authDomain: "bhim-dairy.firebaseapp.com",
  projectId: "bhim-dairy",
  storageBucket: "bhim-dairy.firebasestorage.app",
  messagingSenderId: "164452978911",
  appId: "1:164452978911:web:b7daca509a559c63e4596a",
  measurementId: "G-1CNCT3LH9W"
};

const app = initializeApp(firebaseConfig);

// Using explicit initialization to ensure cross-browser stability and local caching
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true
});

export { db };

/**
 * Real-time synchronization helper.
 * Data is cleaned to ensure no circular references or complex Firestore objects enter the state.
 */
export const syncCollection = (collName: string, callback: (data: any[]) => void, onError?: (error: any) => void) => {
  const collRef = collection(db, collName);
  const q = query(collRef);
  
  return onSnapshot(q, (snapshot) => {
    // We map only the plain data to avoid leaking DocumentReference objects into state
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure we only have plain serializable data
      return JSON.parse(JSON.stringify({ 
        id: doc.id, 
        ...data 
      }));
    });
    callback(items);
  }, (error: any) => {
    // CRITICAL: We do NOT spread the original error object to avoid Circular Structure errors.
    // Instead, we extract only the string/primitive values we need.
    const isPermissionError = error.code === 'permission-denied';
    const isNetworkError = error.code === 'unavailable';
    
    console.error(`[Firebase Sync Error] ${collName}:`, error.message);
    
    if (onError) onError({ 
      message: error.message || "Unknown error", 
      code: error.code || "unknown",
      isPermissionError, 
      isNetworkError,
      collection: collName 
    });
  });
};

export const addToCloud = async (collName: string, data: any) => {
  try {
    return await addDoc(collection(db, collName), {
      ...data,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateInCloud = async (collName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collName, id);
    return await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const deleteFromCloud = async (collName: string, id: string) => {
  try {
    const docRef = doc(db, collName, id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};

export const saveSettingsToCloud = async (settings: any) => {
  try {
    await setDoc(doc(db, "app_settings", "global"), settings);
  } catch (error) {
    console.error("Error saving settings: ", error);
    throw error;
  }
};
