import { open, showToast, Toast } from "@raycast/api";

export default async function Command() {
  try {
    // Try to open ClaudeDeck using the app bundle identifier
    await open("com.claudedeck.app");
    
    await showToast({
      style: Toast.Style.Success,
      title: "Opening ClaudeDeck",
    });
  } catch (error) {
    // If the app isn't installed or can't be opened
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to open ClaudeDeck",
      message: "Make sure ClaudeDeck is installed",
    });
  }
}