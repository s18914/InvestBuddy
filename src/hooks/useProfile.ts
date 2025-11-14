import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const createProfile = async () => {
      try {
        const { data: existingProfile, error: selectError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (selectError) {
          console.error("Error checking profile:", selectError);
          return;
        }

        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: user.id, email: user.email! }]);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            console.log("User ID:", user.id);
            console.log("User Email:", user.email);
          } else {
            console.log("Profile created successfully for:", user.email);
          }
        }
      } catch (error) {
        console.error("Unexpected error in createProfile:", error);
      }
    };

    createProfile();
  }, [user]);
}
