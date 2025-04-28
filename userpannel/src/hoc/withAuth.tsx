"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthComponent = (props: any) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
      try {
        const token = Cookies.get("token") as string;
        if (!token) {
          router.replace("/login"); // Redirect if not authenticated
        } 
        const decoded = jwtDecode<{onboarding: string, require2FA: string }>(token);

        if (decoded.require2FA) {
          setIsAuthenticated(false)
          router.replace("/verify-code")

          return;
        }

        if (!decoded?.onboarding) {
          router.replace("/onboarding/basic-info");
          return;
        }

        setIsAuthenticated(true); // User is authenticated and onboarded
      } catch (err) {
        console.error("Invalid token:", err);
        router.replace("/login");
      }
    }, [router]);

    if (isAuthenticated === null) {
      return <p>Loading...</p>; // Prevents flickering
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };

  return AuthComponent;
};

export default withAuth;
