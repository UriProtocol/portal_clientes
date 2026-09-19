"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ModalSelectLocation() {
const router = useRouter();
  const [noAccess, setNoAccess] = useState<boolean>(false);

  useEffect(() => {
    const checkAccess = () => {
      const exists = localStorage.getItem("no_access") !== null;
      setNoAccess(exists);
    };

    checkAccess(); // 

    const interval = setInterval(() => {
      checkAccess();
    }, 500); // 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (noAccess) {
      toast.error("No tienes permisos para acceder.");
      localStorage.removeItem("no_access");
      router.push("/");
    }
  }, [noAccess, router]);

  return null;
}
