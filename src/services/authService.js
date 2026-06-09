import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../firebase/firebaseConfig';

function mapFirebaseUser(user) {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Usuario',
    emailOrPhone: user.email,
  };
}

export async function registerWithEmail({ email, password, displayName }) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (displayName) {
    await updateProfile(userCredential.user, {
      displayName,
    });
  }

  return {
    ...mapFirebaseUser(userCredential.user),
    displayName: displayName || userCredential.user.displayName || 'Usuario',
  };
}

export async function loginWithEmail({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return mapFirebaseUser(userCredential.user);
}

export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(mapFirebaseUser(firebaseUser));
  });
}

export async function logoutFirebaseUser() {
  await signOut(auth);
}