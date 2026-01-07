"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 lg:p-12 border-white/5 shadow-2xl">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-8 sm:mb-10">
                        <Link href="/" className="inline-block mb-4 sm:mb-6 hover:scale-110 transition-transform duration-300">
                            <Image src="/logo.png" alt="SatSetPic" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] shadow-2xl shadow-purple-500/20" />
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">New Password</h1>
                        <p className="text-gray-500 font-medium text-sm sm:text-base">Secure your account with a fresh password.</p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={40} className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
                                <p className="text-gray-400 text-sm">Redirecting you to dashboard...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 sm:h-14 pl-12 pr-12 bg-white/5 border-white/10 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-gray-600 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 sm:h-14 pl-12 pr-12 bg-white/5 border-white/10 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-gray-600 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] hover:shadow-purple-900/40"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles size={18} /> Update Password
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
