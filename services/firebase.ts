
import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  set, 
  update, 
  remove,
  child
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBkJ2cREq0L10oWQ5nlksl29CbMzPaEBIs",
  authDomain: "bhim-dairy.firebaseapp.com",
  databaseURL: "https://bhim-dairy-default-rtdb.firebaseio.com",
  projectId: "bhim-dairy",
  storageBucket: "bhim-dairy.firebasestorage.app",
  messagingSenderId: "164452978911",
  appId: "1:164452978911:web:b7daca509a559c63e4596a",
  measurementId: "G-1CNCT3LH9W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

/**
 * Real-time synchronization helper for RTD.
 */
export const syncCollection = (path: string, callback: (data: any[]) => void, onError?: (error: any) => void) => {
  const dbRef = ref(db, path);
  
  return onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // RTD returns an object of objects, convert to array with IDs
      const list = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(list);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error(`[RTD Sync Failed] ${path}:`, error);
    if (onError) onError({
      message: error.message,
      isNetworkError: true
    });
  });
};

/**
 * Adds a record to a path.
 */
export const addToCloud = async (path: string, data: any) => {
  try {
    const dbRef = ref(db, path);
    const newRef = push(dbRef);
    const cleanData = JSON.parse(JSON.stringify(data));
    await set(newRef, {
      ...cleanData,
      createdAt: new Date().toISOString()
    });
    return { id: newRef.key };
  } catch (error) {
    console.error("Error adding to RTD:", error);
    throw error;
  }
};

/**
 * Updates a specific record in a path.
 */
export const updateInCloud = async (path: string, id: string, data: any) => {
  try {
    const dbRef = ref(db, `${path}/${id}`);
    const cleanData = JSON.parse(JSON.stringify(data));
    await update(dbRef, cleanData);
  } catch (error) {
    console.error("Error updating RTD:", error);
    throw error;
  }
};

/**
 * Deletes a record from a path.
 */
export const deleteFromCloud = async (path: string, id: string) => {
  try {
    const dbRef = ref(db, `${path}/${id}`);
    await remove(dbRef);
  } catch (error) {
    console.error("Error deleting from RTD:", error);
    throw error;
  }
};

/**
 * Specifically saves app settings.
 */
export const saveSettingsToCloud = async (settings: any) => {
  try {
    const dbRef = ref(db, "app_settings/global");
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    await set(dbRef, cleanSettings);
  } catch (error) {
    console.error("Error saving settings to RTD:", error);
    throw error;
  }
};
