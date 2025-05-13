import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

// Avatar options
const AVATAR_OPTIONS = [
  { value: "avatar1", src: "/avatars/avatar1.svg", alt: "Avatar 1" },
  { value: "avatar2", src: "/avatars/avatar2.svg", alt: "Avatar 2" },
  { value: "avatar3", src: "/avatars/avatar3.svg", alt: "Avatar 3" },
  { value: "avatar4", src: "/avatars/avatar4.svg", alt: "Avatar 4" },
  { value: "avatar5", src: "/avatars/avatar5.svg", alt: "Avatar 5" },
  { value: "avatar6", src: "/avatars/avatar6.svg", alt: "Avatar 6" },
];

// Form validation schema
const formSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  displayName: z.string().max(20, "Display name must be less than 20 characters").optional(),
  profilePicture: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      profilePicture: AVATAR_OPTIONS[0].value,
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = values;
      
      // Call API to register
      const response = await apiRequest("POST", "/api/auth/register", registerData);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }
      
      const user = await response.json();
      
      // Save user data to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Create initial game stats
      try {
        const initialStats = {
          userId: user.id,
          played: 0,
          wins: 0,
          currentStreak: 0,
          maxStreak: 0,
          score: 0,
          eloRating: 1000,
          distribution: "0,0,0,0,0,0",
        };
        
        const statsResponse = await apiRequest("POST", "/api/game-stats", initialStats);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          localStorage.setItem(LOCAL_STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
        }
      } catch (error) {
        console.error("Error creating game stats:", error);
        // Non-critical error, continue with registration
      }
      
      toast({
        title: "Registration successful",
        description: "Welcome to Wordle Ranked!",
      });
      
      // Redirect to game page
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please check your information and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h2 className="text-xl font-semibold">Create an Account</h2>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Choose a username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="How you want to appear to others" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Create a password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm your password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select an Avatar</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {AVATAR_OPTIONS.map((avatar) => (
                        <FormItem key={avatar.value} className="space-y-0">
                          <FormControl>
                            <div className="flex flex-col items-center space-y-2">
                              <Label
                                htmlFor={avatar.value}
                                className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 ${
                                  field.value === avatar.value
                                    ? "border-primary"
                                    : "border-transparent"
                                }`}
                              >
                                <img
                                  src={avatar.src}
                                  alt={avatar.alt}
                                  className="w-full h-full object-cover"
                                />
                              </Label>
                              <RadioGroupItem
                                value={avatar.value}
                                id={avatar.value}
                                className="sr-only"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-normal text-sm"
            onClick={() => navigate("/login")}
          >
            Log in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}