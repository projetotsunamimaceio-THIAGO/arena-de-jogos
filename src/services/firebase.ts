/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

signInAnonymously(auth).catch((err) => {
  console.warn('Firebase anonymous auth warning:', err);
});
