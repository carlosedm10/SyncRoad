import { useEffect } from "react";
import { useRouter, useNavigationContainerRef } from "expo-router";

export default function IndexRedirect() {
  const router = useRouter();
  const navReadyRef = useNavigationContainerRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/login");
    }, 0); // espera un tick para asegurar que <Slot /> esté montado

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
