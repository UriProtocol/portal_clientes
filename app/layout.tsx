"use client";
import React, { useEffect } from "react";
import "./globals.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import { manrope } from "./ui/fonts";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import LoadingApp from "@/components/misc/LoadingApp";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, redirectPath } = useAuth({
    middleware: "guest",
    redirectIfAuthenticated: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && user && redirectPath) {
      router.push(redirectPath);
    }
  }, [loading, user, redirectPath, router]);


  if (loading) {
    return (
      <html lang="es-MX" className={manrope.className}>
        <body>
          <main>
            <LoadingApp gradientBg />
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="es-MX">
      <body>
        <header>
          <title>DATIA</title>
        </header>
        <main>
          <Providers>
            {children}
          </Providers>
          <Toaster richColors/>
          <AuthGuard />
        </main>
      </body>
    </html>
  );
}
