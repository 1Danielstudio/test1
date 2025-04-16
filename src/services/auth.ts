// Authentication service using Supabase
import { createClient } from "@supabase/supabase-js";
import { User, UserMetadata } from "../types/supabase";

// Initialize Supabase client (using mock values for now)
const supabaseUrl = "https://your-supabase-project.supabase.co";
const supabaseKey = "your-supabase-anon-key";

// Create a single supabase client for the entire app
const supabase = createClient(supabaseUrl, supabaseKey);

// Sign up a new user
export const signUp = async (
  email: string,
  password: string,
  metadata?: UserMetadata,
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // In a real implementation, this would call Supabase Auth API
    // For now, we'll simulate the API call with mock data

    // Example API call structure:
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    //   options: {
    //     data: metadata
    //   }
    // });

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock user data
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
      metadata: metadata || {},
      referralCode: generateReferralCode(),
      referredBy: metadata?.referredBy || null,
    };

    return { user: mockUser, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { user: null, error: error as Error };
  }
};

// Sign in an existing user
export const signIn = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // In a real implementation, this would call Supabase Auth API
    // For now, we'll simulate the API call with mock data

    // Example API call structure:
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock user data
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
      metadata: {},
      referralCode: generateReferralCode(),
      referredBy: null,
    };

    return { user: mockUser, error: null };
  } catch (error) {
    console.error("Error signing in:", error);
    return { user: null, error: error as Error };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    // In a real implementation, this would call Supabase Auth API
    // For now, we'll simulate the API call

    // Example API call structure:
    // const { error } = await supabase.auth.signOut();

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: error as Error };
  }
};

// Get the current user
export const getCurrentUser = async (): Promise<{
  user: User | null;
  error: Error | null;
}> => {
  try {
    // In a real implementation, this would call Supabase Auth API
    // For now, we'll simulate the API call with mock data

    // Example API call structure:
    // const { data, error } = await supabase.auth.getUser();

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user is stored in localStorage (for demo purposes)
    const storedUser = localStorage.getItem("designcraft-user");
    if (storedUser) {
      return { user: JSON.parse(storedUser), error: null };
    }

    // Return null if no user is found
    return { user: null, error: null };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error: error as Error };
  }
};

// Update user metadata
export const updateUserMetadata = async (
  metadata: UserMetadata,
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // In a real implementation, this would call Supabase Auth API
    // For now, we'll simulate the API call with mock data

    // Example API call structure:
    // const { data, error } = await supabase.auth.updateUser({
    //   data: metadata
    // });

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get current user from localStorage (for demo purposes)
    const storedUser = localStorage.getItem("designcraft-user");
    if (!storedUser) {
      return { user: null, error: new Error("No user found") };
    }

    // Update user metadata
    const user: User = JSON.parse(storedUser);
    const updatedUser: User = {
      ...user,
      metadata: { ...user.metadata, ...metadata },
    };

    // Save updated user to localStorage (for demo purposes)
    localStorage.setItem("designcraft-user", JSON.stringify(updatedUser));

    return { user: updatedUser, error: null };
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return { user: null, error: error as Error };
  }
};

// Generate a unique referral code
const generateReferralCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Reset password
export const resetPassword = async (
  email: string,
): Promise<{ error: Error | null }> => {
  try {
    // In a real implementation, this would call Supabase Auth API
    // For now, we'll simulate the API call

    // Example API call structure:
    // const { error } = await supabase.auth.resetPasswordForEmail(email);

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { error: null };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: error as Error };
  }
};
