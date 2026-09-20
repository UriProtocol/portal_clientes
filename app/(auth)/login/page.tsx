'use client'
import AuthCard from "./AuthCard";
import LoginForm from "./LoginForm"
import { Toaster } from "sonner";
//const backgroundImage = 'url(/fondo.jpg)';

export default function LoginPage() {
    return (
        <div className=" bg-datia-primary">
            <h1 className=" text-yellow-500 mr-3 font-semibold text-4xl absolute top-28 text-center text-shadow-2xs w-full">
                    PROVEEDORA DE LLANTAS 
            </h1>
            <h2 className=" text-white/90 mr-3 text-2xl absolute top-40 text-center text-shadow-2xs w-full">
                    - PORTAL DE CLIENTES -
            </h2>
            <div className="h-screen lg:px-6 bg-linear-to-tr from-datia_secondary/80 to-datia_primary/80">
                <AuthCard

                >
                    <LoginForm />
                </AuthCard>
            </div>
            <Toaster richColors/>
        </div>
    );
}
