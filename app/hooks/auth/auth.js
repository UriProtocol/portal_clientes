import useSWR from "swr";
import { axios, axiosBase } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  const {
    data: user,
    error,
    mutate,
    isLoading,
  } = useSWR("/me", () =>
    axios
      .get("/me")
      .then((res) => res.data)
      .catch((error) => {
        if (error.response.status !== 409) throw error;
      })
      .finally(() => setLoading(false))
  );

  const csrf = () => axiosBase.get("sanctum/csrf-cookie");

  const login = async ({ setErrors, setStatus, ...props }) => {
    // Planta la cookie XSRF-TOKEN antes de mandar el POST.
    await csrf();

    setErrors([]);
    setStatus(null);

    try {
      await axios.post("/login", props);
      await mutate();
      router.replace("/");
    } catch (error) {
      if (error.response.status !== 422) throw error;
      toast.error(error.response.data.message ?? "Ocurrió un error al iniciar sesión");
      setErrors(error.response.data.errors);
    }
  };

  const logout = async () => {
    try {
      if (!error) {
        await axios.post("/logout");
      }
    } finally {
      // No usamos mutate() a secas: eso revalida contra /me, que ahora
      // devuelve 401, y SWR conserva el "user" viejo en caché cuando una
      // revalidación falla. Aquí lo limpiamos directamente sin refetch.
      await mutate(null, { revalidate: false });
      router.replace("/login");
    }
  };

  useEffect(() => {
    if (!loading) {
      if (middleware === "guest" && redirectIfAuthenticated && user) {
        router.push(redirectIfAuthenticated);
        return;
      }

      if (middleware === "guest" && !user && pathname !== "/login") {
        setRedirectPath(pathname);
        router.push("/login");
        return;
      }

      if (middleware === "guest" && user && pathname === "/login") {
        router.push("/");
        return;
      }

      if (middleware === "auth" && error) {
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, error, loading, middleware, pathname, redirectIfAuthenticated, router, isLoading, mutate]);

  return {
    user,
    loading,
    redirectPath,
    login,
    logout,
    isLoading,
    mutate,
  };
};