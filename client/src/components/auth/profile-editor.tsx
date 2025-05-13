import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_AVATARS } from "@/shared/constants";

interface ProfileEditorProps {
  userId: number;
  onClose: () => void;
  onUpdate: (userData: any) => void;
}

export function ProfileEditor({ userId, onClose, onUpdate }: ProfileEditorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatars, setAvatars] = useState<string[]>(DEFAULT_AVATARS);
  const [userData, setUserData] = useState({
    username: "",
    displayName: "",
    profilePicture: "",
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', `/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error("Failed to load user data");
        }
        
        const data = await response.json();
        setUserData({
          username: data.username,
          displayName: data.displayName || data.username,
          profilePicture: data.profilePicture || avatars[0],
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load available avatars (fallback to defaults if API fails)
    const loadAvatars = async () => {
      try {
        const response = await apiRequest('GET', '/api/avatars');
        if (response.ok) {
          const data = await response.json();
          if (data.avatars && Array.isArray(data.avatars)) {
            setAvatars(data.avatars);
          }
        }
      } catch (error) {
        console.error("Error loading avatars:", error);
      }
    };
    
    loadUserData();
    loadAvatars();
  }, [userId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData.username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await apiRequest('PATCH', `/api/users/${userId}`, {
        username: userData.username,
        displayName: userData.displayName,
        profilePicture: userData.profilePicture,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USER) || "{}");
      const updatedStoredUser = {
        ...storedUser,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        profilePicture: updatedUser.profilePicture,
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updatedStoredUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
      
      // Call the onUpdate callback with the updated user data
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        <CardDescription>
          Update your Wordle Ranked profile
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Your unique username"
              value={userData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="How you'll appear to others"
              value={userData.displayName}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Choose Avatar</Label>
            <RadioGroup
              value={userData.profilePicture}
              onValueChange={(value) => setUserData(prev => ({ ...prev, profilePicture: value }))}
              className="grid grid-cols-3 gap-4"
            >
              {avatars.map((avatar, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem
                    value={avatar}
                    id={`avatar-${index}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`avatar-${index}`}
                    className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all ${
                      userData.profilePicture === avatar
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}