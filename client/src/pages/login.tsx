import { useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { useLocation } from "wouter";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

export default function LoginPage() {
  const [, setLocation] = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (userData) {
      // If already logged in, redirect to game page
      setLocation("/");
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md mb-6">
        <h1 className="text-4xl font-bold text-center mb-2">Wordle Ranked</h1>
        <p className="text-center text-muted-foreground">Log in to track your progress and compete in rankings</p>
      </div>
      
      <LoginForm />
    </div>
  );
}