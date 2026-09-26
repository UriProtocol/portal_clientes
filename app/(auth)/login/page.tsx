'use client'
import Image from "next/image";
import { motion } from "framer-motion";
import AuthCard from "./AuthCard";
import LoginForm from "./LoginForm"

// Chevron "tread" pattern used as a subtle texture on the brand panel
const treadPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M0 12 L24 0 L48 12 M0 36 L24 24 L48 36' fill='none' stroke='white' stroke-width='3'/%3E%3C/svg%3E")`;

function Tire({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 200" className={className} aria-hidden>
            <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="14" strokeDasharray="10 6" />
            <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="48" fill="none" stroke="currentColor" strokeWidth="6" />
            <circle cx="100" cy="100" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
            {Array.from({ length: 5 }).map((_, i) => (
                <line
                    key={i}
                    x1="100" y1="83" x2="100" y2="56"
                    stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                    transform={`rotate(${i * 72} 100 100)`}
                />
            ))}
        </svg>
    );
}

function Logo({ size = 120 }: { size?: number }) {
    return (
        <div className="w-fit rounded-2xl bg-white p-3 shadow-xl shadow-black/20 ring-1 ring-white/40">
            <Image src="/logo.jpg" alt="Proveedora de Llantas" width={size} height={Math.round(size * 296 / 337)} priority />
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-datia-primary/5">
            {/* Brand panel */}
            <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-datia-primary p-12 text-white">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: treadPattern }} />
                <div className="absolute -top-36 -left-36 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 h-112 w-md rounded-full bg-sky-400/15 blur-3xl" />
                <Tire className="absolute -bottom-40 -right-40 w-136 text-white/10 animate-[spin_80s_linear_infinite] motion-reduce:animate-none" />

                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                >
                    <Logo />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="relative max-w-lg"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tracking-widest text-white/90 ring-1 ring-white/20 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        PORTAL DE CLIENTES
                    </span>
                    <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight">
                        Proveedora <br />
                        <span className="text-yellow-400">de Llantas</span>
                    </h1>
                    <div className="mt-6 h-1 w-20 rounded-full bg-yellow-400" />
                </motion.div>

                <p className="relative text-sm text-white/50">
                    © {new Date().getFullYear()} Proveedora de Llantas México
                </p>
            </aside>

            {/* Form panel */}
            <main className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
                <div
                    className="absolute inset-0 opacity-60 bg-size-[22px_22px] bg-[radial-gradient(rgb(var(--datia-primary)/0.12)_1px,transparent_1px)]"
                />
                {/* Mobile brand header */}
                <div className="absolute inset-x-0 top-0 h-screen overflow-hidden bg-datia-primary lg:hidden">
                    <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: treadPattern }} />
                    <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-yellow-400/25 blur-3xl" />
                    <Tire className="absolute -top-24 -right-24 w-72 text-white/10 animate-[spin_80s_linear_infinite] motion-reduce:animate-none" />
                </div>

                <div className="relative mb-8 flex flex-col items-center gap-8 lg:hidden">
                    <Logo size={96} />
                    <span className="text-sm font-medium tracking-[0.3em] text-white/90">PORTAL DE CLIENTES</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="relative w-full max-w-md"
                >
                    <AuthCard>
                        <LoginForm />
                    </AuthCard>
                </motion.div>
            </main>
        </div>
    );
}
