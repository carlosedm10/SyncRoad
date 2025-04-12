import { ErrorResponse, Position, User, UserLogged } from "./types";

export async function loginUser(
  userData: User
): Promise<UserLogged | ErrorResponse> {
  try {
    const response = await fetch("http://192.168.0.23:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("Response from backend:", data);

    if (data.logged) {
      return data;
    } else {
      return { error: data.detail };
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { error: "Network error" };
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
