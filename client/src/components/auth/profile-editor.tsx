import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

// Avatar options
const AVATAR_OPTIONS = [
  { value: "avatar1", src: "/avatars/avatar1.png", alt: "Avatar 1" },
  { value: "avatar2", src: "/avatars/avatar2.png", alt: "Avatar 2" },
  { value: "avatar3", src: "/avatars/avatar3.png", alt: "Avatar 3" },
  { value: "avatar4", src: "/avatars/avatar4.png", alt: "Avatar 4" },
  { value: "avatar5", src: "/avatars/avatar5.png", alt: "Avatar 5" },
  { value: "avatar6", src: "/avatars/avatar6.png", alt: "Avatar 6" },
];

// Form validation schema
const formSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters").max(20, "Display name must be less than 20 characters").optional(),
  profilePicture: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileEditorProps {
  userId: number;
  onClose: () => void;
  onUpdate: (userData: any) => void;
}

export function ProfileEditor({ userId, onClose, onUpdate }: ProfileEditorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      profilePicture: AVATAR_OPTIONS[0].value,
    },
  });

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First try to get from localStorage
        const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUserData(parsedUser);
          
          // Set form values
          form.setValue("displayName", parsedUser.displayName || "");
          form.setValue("profilePicture", parsedUser.profilePicture || AVATAR_OPTIONS[0].value);
          return;
        }
        
        // If not in localStorage, fetch from API
        const response = await apiRequest("GET", `/api/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const data = await response.json();
        setUserData(data);
        
        // Set form values
        form.setValue("displayName", data.displayName || "");
        form.setValue("profilePicture", data.profilePicture || AVATAR_OPTIONS[0].value);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading profile",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    };
    
    fetchUserData();
  }, [userId, form, toast]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Call API to update profile
      const response = await apiRequest("PATCH", `/api/users/${userId}`, {
        displayName: values.displayName,
        profilePicture: values.profilePicture,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      const updatedUser = await response.json();
      
      // Update localStorage
      if (userData) {
        const newUserData = {
          ...userData,
          displayName: values.displayName,
          profilePicture: values.profilePicture,
        };
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(newUserData));
        onUpdate(newUserData);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state if data is not yet loaded
  if (!userData) {
    return (
      <div className="p-4 text-center">
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>
          Customize your display name and avatar.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter a display name" 
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
            name="profilePicture"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Avatar</FormLabel>
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
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}