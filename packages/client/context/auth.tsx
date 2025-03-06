import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { auth } from "@/firebaseConfig";

type User = typeof auth.currentUser;
type AuthContextProps = {
  currentUser: User | null | undefined;
};

const AuthContext = createContext<AuthContextProps>({ currentUser: undefined });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined,
  );

  console.log({ currentUser });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      // ログイン状態が変化すると呼ばれる
      if (!user) {
        // redirect to signin
        router.push("/signin");
        return;
      }
      setCurrentUser(user);
    });
  }, []);
  return (
    <AuthContext.Provider value={{ currentUser: currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
