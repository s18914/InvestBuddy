import { supabase } from "@/lib/supabase";

export async function resetUserData(userId: string): Promise<void> {
  try {
    // Delete all assets (this will cascade delete asset details due to ON DELETE CASCADE)
    const { error: assetsError } = await supabase
      .from("assets")
      .delete()
      .eq("user_id", userId);

    if (assetsError) {
      console.error("Error deleting assets:", assetsError);
      throw assetsError;
    }

    // Delete MiFID questionnaire responses
    const { error: mifidError } = await supabase
      .from("mifid_responses")
      .delete()
      .eq("user_id", userId);

    if (mifidError) {
      console.error("Error deleting MiFID responses:", mifidError);
      throw mifidError;
    }

    // Delete user settings
    const { error: settingsError } = await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", userId);

    if (settingsError) {
      console.error("Error deleting user settings:", settingsError);
      throw settingsError;
    }

    // Delete transactions
    const { error: transactionsError } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (transactionsError) {
      console.error("Error deleting transactions:", transactionsError);
      throw transactionsError;
    }

    // Delete portfolio snapshots
    const { error: snapshotsError } = await supabase
      .from("portfolio_snapshots")
      .delete()
      .eq("user_id", userId);

    if (snapshotsError) {
      console.error("Error deleting portfolio snapshots:", snapshotsError);
      throw snapshotsError;
    }

    // Delete notifications
    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (notificationsError) {
      console.error("Error deleting notifications:", notificationsError);
      throw notificationsError;
    }

    // Reset profile onboarding status
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: false })
      .eq("id", userId);

    if (profileError) {
      console.error("Error resetting profile:", profileError);
      throw profileError;
    }

    console.log("User data reset successfully");
  } catch (error) {
    console.error("Error during user reset:", error);
    throw error;
  }
}
