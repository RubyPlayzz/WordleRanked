import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

interface LoginResponse {
  id: number;
  username: string;
  displayName: string;
  profilePicture: string;
  stats: {
    id: number;
    userId: number;
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    score: number;
    distribution: string;
    rank: string;
    eloRating: number;
    position: number;
  };
}

export function LoginForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', '/api/users/login', formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const userData: LoginResponse = await response.json();
      
      // Save user data to local storage
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify({
        id: userData.id,
        username: userData.username,
        displayName: userData.displayName,
        profilePicture: userData.profilePicture,
      }));
      
      // Save stats separately
      localStorage.setItem(LOCAL_STORAGE_KEYS.GAME_STATS, JSON.stringify(userData.stats));

      toast({
        title: "Login successful!",
        description: `Welcome back, ${userData.displayName || userData.username}!`,
      });

      // Redirect to game page
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Log in to continue your Wordle Ranked journey
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 font-medium"
              onClick={() => setLocation("/register")}
            >
              Register
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}