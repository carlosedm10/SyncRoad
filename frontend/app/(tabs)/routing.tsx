import { Position, User } from "./types";

export async function loginUser(
  userData: User
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful: backend returns { message: "Login successful", user_id: ... }
      return { success: true };
    } else {
      // Backend returned an error message (e.g., "User not found. Please sign up." or "Incorrect password")
      return { success: false, error: data.detail };
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { success: false, error: "Network error" };
  }
}

export async function getPosition(): Promise<Position | null> {
  try {
    const response = await fetch("/get_position/");
    if (response.ok) {
      const position = await response.json();
      return position;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving position:", error);
    return null;
  }
}
