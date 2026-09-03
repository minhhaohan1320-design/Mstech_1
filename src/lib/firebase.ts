import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA8xgz1Ay6JNu27uLP2lHOGzMq4S8-46NQ",
  authDomain: "mstech-48e0d.firebaseapp.com",
  databaseURL: "https://mstech-48e0d-default-rtdb.firebaseio.com",
  projectId: "mstech-48e0d",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
