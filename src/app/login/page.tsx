"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Camera, Sparkles, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address first");
            return;
        }
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setResetEmailSent(true);
        }
        setLoading(false);
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
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Welcome back.</h1>
                        <p className="text-gray-500 font-medium text-sm sm:text-base">Log in to your photographer hub.</p>
                    </div>

                    {/* Forgot Password Success */}
                    <AnimatePresence mode="wait">
                        {resetEmailSent ? (
                            <motion.div
                                key="reset-sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center space-y-6 py-8"
                            >
                                <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                                    <Mail size={40} className="text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black mb-2">Check Your Email</h2>
                                    <p className="text-gray-400 text-sm">
                                        We&apos;ve sent a password reset link to<br />
                                        <span className="text-white font-bold">{email}</span>
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setResetEmailSent(false);
                                        setShowForgotPassword(false);
                                    }}
                                    className="border-white/20"
                                >
                                    Back to Login
                                </Button>
                            </motion.div>
                        ) : showForgotPassword ? (
                            <motion.form
                                key="forgot-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleForgotPassword}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-black mb-2">Reset Password</h2>
                                    <p className="text-gray-500 text-sm">Enter your email to receive a reset link.</p>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-black text-lg" disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="w-full text-center text-sm font-bold text-gray-500 hover:text-white transition-colors"
                                >
                                    ← Back to Login
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleLogin}
                                className="space-y-5 sm:space-y-6"
                            >
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="h-12 sm:h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors"
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-12 sm:h-14 bg-white/5 border-white/10 rounded-2xl px-6 pr-12 text-white placeholder:text-gray-600"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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

                                <Button type="submit" className="w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all shadow-xl shadow-purple-500/20 font-black text-base sm:text-lg border-none" disabled={loading}>
                                    {loading ? "Authenticating..." : "Sign In"}
                                </Button>

                                <div className="text-center pt-2 sm:pt-4">
                                    <Link href="/register" className="text-sm font-bold text-gray-500 hover:text-white transition-colors group">
                                        Don&apos;t have an account? <span className="text-purple-400 group-hover:underline">Sign up free</span> <ArrowRight size={14} className="inline ml-1" />
                                    </Link>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer text */}
                <div className="mt-8 sm:mt-12 text-center flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    <Sparkles size={12} /> Powered by VibeSelect Studio
                </div>
            </motion.div>
        </div>
    );
}
