"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface UserProfile {
  username: string;
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
  login: (email: string, username?: string) => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const AUTH_STORAGE_KEY = "kz-user-session";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username) {
          setUser(parsed);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const login = (email: string, username?: string) => {
    const derivedName =
      username || email.split("@")[0] || `User_${Math.floor(Math.random() * 1000)}`;
    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newUser: UserProfile = {
      username: derivedName,
      email,
      joinedDate: formattedDate,
      isPublic: true,
      level: 1,
      xp: 0,
      bio: "Mechanical keyboard enthusiast & speed typist.",
    };

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
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
        login,
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
