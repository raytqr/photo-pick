"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Shield, Eye, EyeOff, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ADMIN_EMAIL = "rayhanwhyut27@gmail.com";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Check if email matches admin email
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            setError("Akses ditolak. Email ini tidak memiliki akses admin.");
            setLoading(false);
            return;
        }

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            if (authError.message.includes("Invalid login credentials")) {
                setError("Email atau password salah. Pastikan akun sudah terdaftar.");
            } else {
                setError(authError.message);
            }
            setLoading(false);
            return;
        }

        if (!data.user) {
            setError("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
            setLoading(false);
            return;
        }

        // Double check the email
        if (data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            await supabase.auth.signOut();
            setError("Akses ditolak. Anda tidak memiliki izin admin.");
            setLoading(false);
            return;
        }

        // Set admin session cookie (8 hours)
        document.cookie = `admin_session=${Date.now()}; path=/; max-age=${8 * 60 * 60}; SameSite=Lax`;

        router.push("/admin");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-red-900/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-orange-900/10 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06] shadow-2xl">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Shield size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Masuk ke panel administrator
                            </p>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-yellow-200/80 text-xs leading-relaxed">
                            Halaman ini hanya untuk administrator. Akses tidak sah akan ditolak.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center"
                        >
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                Email Admin
                            </label>
                            <Input
                                type="email"
                                placeholder="admin@example.com"
                                className="h-12 bg-white/[0.03] border-white/10 rounded-xl px-4 text-white placeholder:text-gray-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl px-4 pr-12 text-white placeholder:text-gray-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:via-orange-700 hover:to-amber-700 font-semibold shadow-lg shadow-orange-500/20"
                        >
                            {loading ? "Memverifikasi..." : "Masuk sebagai Admin"}
                        </Button>
                    </form>

                    {/* Back Link */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft size={14} />
                            Kembali ke beranda
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                    🔒 Secure Admin Access
                </div>
            </motion.div>
        </div>
    );
}
