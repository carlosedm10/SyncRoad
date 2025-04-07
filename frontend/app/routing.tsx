import { Position, User } from "./types";

export async function getUser(userData: User): Promise<boolean> {
  const response = await fetch(`/get_user/${userData}`);
  if (response.ok) {
    return true;
  } else {
    return false;
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
