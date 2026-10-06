import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types';

const googleProvider = new GoogleAuthProvider();

export async function syncUserProfile(user: User, customBio?: string): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  let profileData: UserProfile;

  if (userDocSnap.exists()) {
    const existing = userDocSnap.data();
    profileData = {
      uid: user.uid,
      displayName: user.displayName || existing.displayName || 'Anonymous Storyteller',
      email: user.email || existing.email || '',
      photoURL: user.photoURL || existing.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      bio: customBio !== undefined ? customBio : (existing.bio || 'Passionate photographer and storyteller.'),
      createdAt: existing.createdAt || new Date().toISOString()
    };
    if (customBio !== undefined || !existing.displayName) {
      await setDoc(userDocRef, {
        displayName: profileData.displayName,
        email: profileData.email,
        photoURL: profileData.photoURL,
        bio: profileData.bio,
        createdAt: profileData.createdAt
      }, { merge: true });
    }
  } else {
    profileData = {
      uid: user.uid,
      displayName: user.displayName || 'Photo Explorer',
      email: user.email || '',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      bio: customBio || 'Exploring life through visual narratives.',
      createdAt: new Date().toISOString()
    };

    await setDoc(userDocRef, {
      displayName: profileData.displayName,
      email: profileData.email,
      photoURL: profileData.photoURL,
      bio: profileData.bio,
      createdAt: profileData.createdAt
    });
  }

  return profileData;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(result.user);
}

export async function registerWithEmail(email: string, pass: string, displayName: string): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(result.user, {
    displayName,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`
  });
  return await syncUserProfile(result.user);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function loginAsDemoUser(demoId: 'demo_creator' | 'demo_guest' = 'demo_creator'): Promise<UserProfile> {
  const email = demoId === 'demo_creator' ? 'creator@photonarrator.app' : 'guest@photonarrator.app';
  const pass = 'DemoPassword123!';
  const name = demoId === 'demo_creator' ? 'Elena Rostova' : 'Alex Mercer';

  try {
    return await loginWithEmail(email, pass);
  } catch (err: any) {
    // If account doesn't exist yet, auto-register
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      return await registerWithEmail(email, pass, name);
    }
    throw err;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
