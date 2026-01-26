
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * BHIM Mobile Dairy - Firebase Configuration
 * User Project: bhim-dairy
 */
const firebaseConfig = {
  apiKey: "AIzaSyBkJ2cREq0L10oWQ5nlksl29CbMzPaEBIs",
  authDomain: "bhim-dairy.firebaseapp.com",
  projectId: "bhim-dairy",
  storageBucket: "bhim-dairy.firebasestorage.app",
  messagingSenderId: "164452978911",
  appId: "1:164452978911:web:b7daca509a559c63e4596a",
  measurementId: "G-1CNCT3LH9W"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

/**
 * Enhanced Firestore Initialization:
 * 1. persistentLocalCache: Enables offline data access.
 * 2. experimentalForceLongPolling: Fixes 'Could not reach backend' by using HTTP instead of WebSockets.
 */
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true
});

export { db };

/**
 * Real-time synchronization helper with detailed Error Handling
 */
export const syncCollection = (collName: string, callback: (data: any[]) => void, onError?: (error: any) => void) => {
  if (!db) return () => {};
  
  const collRef = collection(db, collName);
  const q = query(collRef);
  
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error: any) => {
    // Determine the type of error for better UI feedback
    const isPermissionError = error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('permission'));
    const isNetworkError = error.code === 'unavailable' || (error.message && error.message.toLowerCase().includes('reach cloud firestore'));
    
    console.error(`[Firebase Sync Error] Collection: ${collName}`, {
      code: error.code,
      message: error.message,
      isPermissionError,
      isNetworkError
    });
    
    if (onError) onError({ 
      ...error, 
      isPermissionError, 
      isNetworkError,
      collection: collName 
    });
  });
};

/**
 * Firestore Add Record
 */
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

/**
 * Firestore Update Record
 */
export const updateInCloud = async (collName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collName, id);
    return await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

/**
 * Firestore Delete Record (Hard Delete)
 */
export const deleteFromCloud = async (collName: string, id: string) => {
  try {
    const docRef = doc(db, collName, id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};

/**
 * Save Global Settings
 */
export const saveSettingsToCloud = async (settings: any) => {
  try {
    await setDoc(doc(db, "app_settings", "global"), settings);
  } catch (error) {
    console.error("Error saving settings: ", error);
    throw error;
  }
};
