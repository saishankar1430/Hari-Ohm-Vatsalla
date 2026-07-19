import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: "patient" | "admin";
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerPatient: (email: string, password: string, name: string, phone: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore with a 2-second timeout
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const fetchPromise = getDoc(userDocRef);
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 2000),
          );

          const userDoc = await Promise.race([fetchPromise, timeoutPromise]);

          if (userDoc && userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // If profile doesn't exist but logged in (fallback, e.g. third-party login or manual auth)
            const isDoctorEmail = firebaseUser.email === "shubhuusinha777@gmail.com";
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Patient",
              phone: "",
              role: isDoctorEmail ? "admin" : "patient",
              createdAt: new Date().toISOString(),
            };

            // Try to seed profile, but don't hang if offline
            try {
              const setDocPromise = setDoc(userDocRef, newProfile);
              const setDocTimeout = new Promise<void>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 1500),
              );
              await Promise.race([setDocPromise, setDocTimeout]);
            } catch (writeErr) {
              console.warn("Could not write profile metadata (client offline):", writeErr);
            }
            setProfile(newProfile);
          }
        } catch (error) {
          console.warn(
            "Error or timeout fetching user profile from Firestore, using offline fallback:",
            error,
          );
          const isDoctorEmail = firebaseUser.email === "shubhuusinha777@gmail.com";
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Patient",
            phone: "",
            role: isDoctorEmail ? "admin" : "patient",
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const registerPatient = async (email: string, password: string, name: string, phone: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const isDoctorEmail = email === "shubhuusinha777@gmail.com";
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email,
        name,
        phone,
        role: isDoctorEmail ? "admin" : "patient",
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      setProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) throw new Error("No authenticated user");
    const updatedProfile = { ...profile, ...data };

    try {
      const setDocPromise = setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000),
      );
      await Promise.race([setDocPromise, timeoutPromise]);
    } catch (err) {
      console.warn("Could not save profile to Firestore, updated locally:", err);
    }

    setProfile(updatedProfile);
  };

  const isAdmin = profile?.role === "admin" || user?.email === "shubhuusinha777@gmail.com";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        login,
        logout,
        registerPatient,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
