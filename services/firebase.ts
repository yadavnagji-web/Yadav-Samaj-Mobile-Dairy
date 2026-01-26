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
});

export { db };

/**
 * Real-time synchronization helper.
 * We use deep cloning to ensure NO Firebase internal objects (like DocumentReference) 
 * enter the React state, which prevents the "Circular Structure" error.
 */
export const syncCollection = (collName: string, callback: (data: any[]) => void, onError?: (error: any) => void) => {
  const collRef = collection(db, collName);
  const q = query(collRef);
  
  return onSnapshot(q, (snapshot) => {
    // We strictly map and then stringify/parse to clean the data
    const items = snapshot.docs.map(doc => {
      const rawData = doc.data();
      return { 
        id: doc.id, 
        ...rawData 
      };
    });
    
    // Deep clone to remove non-serializable properties before sending to React state
    try {
      const cleanData = JSON.parse(JSON.stringify(items));
      callback(cleanData);
    } catch (e) {
      console.error("Data sanitization error:", e);
    }
  }, (error: any) => {
    console.error(`[Firebase Error] ${collName}:`, error.code, error.message);
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
    // Ensure settings are clean of non-serializable data before saving
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    await setDoc(doc(db, "app_settings", "global"), cleanSettings);
  } catch (error) {
    console.error("Error saving settings: ", error);
    throw error;
  }
};