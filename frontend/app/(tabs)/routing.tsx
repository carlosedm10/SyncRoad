import { User } from "./types";

export async function loginUser(
  userData: User
): Promise<{ logged: boolean; user_id?: number; error?: string }> {
  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return { logged: true, user_id: data.user_id };
    } else {
      return { logged: false, error: data.detail };
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { logged: false, error: "Network error" };
  }
}

export async function getPosition(userId: number) {
  try {
    const response = await fetch(
      `http://localhost:8000/get-locations/${userId}`
    );
    if (response.ok) {
      return await response.json(); // contiene lat, long, timestamp
    }
    return null;
  } catch (error) {
    console.error("Error al obtener posición:", error);
    return null;
  }
}

export async function updateDriver(
  userId: number,
  isDriver: boolean,
  linked: boolean
) {
  try {
    const response = await fetch("http://localhost:8000/update-driver/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        linked: linked,
        driver: isDriver,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error al actualizar driver:", error);
    return null;
  }
}
