"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface PasswordGateProps {
    eventName: string;
    logoUrl?: string | null;
    onSuccess: () => void;
    correctPassword: string;
}

export function PasswordGate({ eventName, logoUrl, onSuccess, correctPassword }: PasswordGateProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simple client-side check (password already fetched server-side)
        setTimeout(() => {
            if (password === correctPassword) {
                // Store in sessionStorage so user doesn't need to re-enter
                sessionStorage.setItem(`event-auth-${eventName}`, "true");
                onSuccess();
            } else {
                setError("Password salah. Silakan coba lagi.");
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black flex flex-col items-center justify-center p-6">
            <div className="max-w-sm w-full">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl">
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                        ) : (
                            <Lock size={32} className="text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {eventName}
                    </h1>
                    <p className="text-gray-500">
                        Galeri ini dilindungi password
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-14 pr-12 text-center text-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-2xl"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-center text-red-500 text-sm animate-pulse">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold text-lg"
                    >
                        {loading ? "Checking..." : (
                            <>
                                Buka Galeri <ArrowRight className="ml-2" size={20} />
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Hubungi fotografer jika Anda tidak memiliki password.
                </p>
            </div>
        </div>
    );
}
