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

// Using explicit initialization for stability and robust local caching
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export { db };

/**
 * Real-time synchronization helper.
 * Strictly cleans data using JSON stringify/parse to prevent circular references
 * which are the common cause of "Blank Screen" errors in React apps using Firestore.
 */
export const syncCollection = (collName: string, callback: (data: any[]) => void, onError?: (error: any) => void) => {
  const collRef = collection(db, collName);
  const q = query(collRef);
  
  return onSnapshot(q, (snapshot) => {
    // 1. First map the raw data
    const rawItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 2. Hard check: Convert to JSON and back to remove non-serializable properties (like DocumentReference)
    try {
      const sanitizedData = JSON.parse(JSON.stringify(rawItems));
      callback(sanitizedData);
    } catch (e) {
      console.error(`[Sanitization Failed] ${collName}:`, e);
      callback([]); // Safe fallback to avoid UI crash
    }
  }, (error: any) => {
    console.error(`[Firebase Sync Error] ${collName}:`, error.code, error.message);
    if (onError) onError({ 
      message: error.message || "Unknown error", 
      code: error.code || "unknown",
      isPermissionError: error.code === 'permission-denied', 
      isNetworkError: error.code === 'unavailable'
    });
  });
};

export const addToCloud = async (collName: string, data: any) => {
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    return await addDoc(collection(db, collName), {
      ...cleanData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateInCloud = async (collName: string, id: string, data: any) => {
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    const docRef = doc(db, collName, id);
    return await updateDoc(docRef, cleanData);
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
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    await setDoc(doc(db, "app_settings", "global"), cleanSettings);
  } catch (error) {
    console.error("Error saving settings: ", error);
    throw error;
  }
};