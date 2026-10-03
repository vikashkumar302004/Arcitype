"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface UserProfile {
  uid?: string;
  username: string;
  profileId: string;
  email: string;
  joinedDate: string; // e.g. "01 Oct 2026"
  avatarUrl?: string;
  bio?: string;
  isPublic: boolean;
  level: number;
  xp: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const AUTH_STORAGE_KEY = "kz-user-session";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Hydrate local cache first for fast initial paint
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username) {
          if (!parsed.profileId) {
            parsed.profileId = `@${parsed.username.toLowerCase().replace(/\s+/g, "")}#${(parsed.uid || "3020").slice(0, 4).toUpperCase()}`;
          }
          setUser(parsed);
        }
      } catch {
        /* ignore */
      }
    }

    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const formattedDate = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const existingStored = localStorage.getItem(AUTH_STORAGE_KEY);
        let existingObj: Partial<UserProfile> = {};
        if (existingStored) {
          try {
            existingObj = JSON.parse(existingStored);
          } catch {
            /* ignore */
          }
        }

        const fallbackTag = `@${(fbUser.displayName || fbUser.email?.split("@")[0] || "typist").toLowerCase().replace(/\s+/g, "")}#${fbUser.uid.slice(0, 4).toUpperCase()}`;

        const updatedProfile: UserProfile = {
          uid: fbUser.uid,
          username: existingObj.username || fbUser.displayName || fbUser.email?.split("@")[0] || "SpeedTypist",
          profileId: existingObj.profileId || fallbackTag,
          email: fbUser.email || existingObj.email || "user@gmail.com",
          avatarUrl: fbUser.photoURL || existingObj.avatarUrl || undefined,
          joinedDate: existingObj.joinedDate || formattedDate,
          isPublic: existingObj.isPublic ?? true,
          level: existingObj.level || 1,
          xp: existingObj.xp || 0,
          bio: existingObj.bio || "Mechanical keyboard speed typist on Arcitype.",
        };

        setUser(updatedProfile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedProfile));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn("Firebase Google Sign-In fallback / popup closed:", err);
      // Developer / offline fallback if Firebase domain is not configured yet
      const mockEmail = "vikash@gmail.com";
      const mockName = "Vikash Kumar";
      const formattedDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const fallbackUser: UserProfile = {
        uid: "demo_uid_123",
        username: mockName,
        profileId: "@vikashkumar#DEMO",
        email: mockEmail,
        joinedDate: formattedDate,
        isPublic: true,
        level: 1,
        xp: 0,
        bio: "Mechanical keyboard speed typist on Arcitype.",
      };
      setUser(fallbackUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      /* ignore */
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: mounted ? user : null,
        isLoggedIn: mounted && user !== null,
        loading,
        signInWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
