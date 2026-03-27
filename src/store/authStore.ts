import { create } from 'zustand';
import { User } from '../types/user';
import { mockUsers } from '../data/mockData';
import { isFirebaseConfigured, auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  /** Firebase Auth の初期化中は true */
  authLoading: boolean;
  /**
   * ログイン処理
   * Firebase が設定済みなら Firebase Auth、未設定ならモック認証にフォールバック
   */
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /**
   * Firebase Auth の onAuthStateChanged を購読してセッションを復元する
   * App 起動時に一度だけ呼び出すこと
   * @returns unsubscribe 関数
   */
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  authLoading: true,

  login: async (email: string, password: string): Promise<boolean> => {
    if (!isFirebaseConfigured) {
      // ── モック認証（Firebase 未設定時のフォールバック） ──
      const user = mockUsers.find((u) => u.email === email) ?? mockUsers[0];
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', credential.user.uid);
      const userSnap = await getDoc(userRef);

      let appUser: User;
      if (userSnap.exists()) {
        appUser = { id: credential.user.uid, ...userSnap.data() } as User;
      } else {
        // Firestore にユーザー情報がない場合は初期作成
        appUser = {
          id: credential.user.uid,
          displayName: credential.user.displayName ?? email.split('@')[0],
          email: credential.user.email ?? email,
          role: 'user',
          department: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as User;
        await setDoc(userRef, appUser);
      }

      set({ currentUser: appUser, isAuthenticated: true });
      return true;
    } catch (err) {
      console.error('[Auth] ログイン失敗:', err);
      return false;
    }
  },

  logout: async (): Promise<void> => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    set({ currentUser: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    if (!isFirebaseConfigured) {
      set({ authLoading: false });
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userSnap.exists()) {
          set({
            currentUser: { id: firebaseUser.uid, ...userSnap.data() } as User,
            isAuthenticated: true,
            authLoading: false,
          });
        } else {
          set({ authLoading: false });
        }
      } else {
        set({ currentUser: null, isAuthenticated: false, authLoading: false });
      }
    });

    return unsubscribe;
  },
}));
