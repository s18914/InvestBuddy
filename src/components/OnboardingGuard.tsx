import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface OnboardingGuardProps {
  children: ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking onboarding status:", error);
          setOnboardingCompleted(false);
        } else {
          setOnboardingCompleted(profile?.onboarding_completed || false);
        }
      } catch (error) {
        console.error("Unexpected error checking onboarding:", error);
        setOnboardingCompleted(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [user]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
