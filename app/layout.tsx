"use client";
import React, { useEffect } from "react";
import "./globals.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import { manrope } from "./ui/fonts";
import { Toaster } from "sonner";
import { Providers } from "./providers";

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


  // useEffect(() => {

  //   if (localStorage.getItem('primary-color')) {
  //     document.documentElement.style.setProperty("--datia-primary", localStorage.getItem('primary-color')?.replaceAll(',', ' ') || '0 20 145');
  //   }
  //   if (localStorage.getItem('secondary-color')) {
  //     document.documentElement.style.setProperty("--datia-secondary", localStorage.getItem('secondary-color')?.replaceAll(',', ' ') || '2 212 214');
  //   }

  // }, [])

  // useEffect(() => {
  //   if(!user?.preferences?.primary_color && !user?.preferences?.secondary_color) return

  //   if(user.preferences.primary_color){

  //     document.documentElement.style.setProperty("--datia-primary", user.preferences.primary_color.replaceAll(',', ' '));

  //     if(!localStorage.getItem('primary-color') || localStorage.getItem('primary-color') != user.preferences.primary_color){
  //       localStorage.setItem('primary-color', user.preferences.primary_color)
  //     }
  //   }
  //   if(user.preferences.secondary_color){

  //     document.documentElement.style.setProperty("--datia-secondary", user.preferences.secondary_color.replaceAll(',', ' '));
      
  //     if(!localStorage.getItem('secondary-color') || localStorage.getItem('secondary-color') != user.preferences.secondary_color){
  //       localStorage.setItem('secondary-color', user.preferences.secondary_color)
  //     }
  //   }


  // }, [user?.preferences?.primary_color, user?.preferences?.secondary_color])


  if (loading) {
    return (
      <html lang="es-MX" className={manrope.className}>
        <body>
          <main>
            {/* <LoadingApp gradientBg /> */}
            <p>Cargando...</p>
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
