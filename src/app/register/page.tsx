"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Camera, Sparkles, ArrowRight, Zap, Mail, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Generate a simple device fingerprint
function getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('VibeSelect', 2, 2);
    }
    const canvasHash = canvas.toDataURL().slice(-50);

    const data = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvasHash
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'DEV_' + Math.abs(hash).toString(36);
}

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVerification, setShowVerification] = useState(false);
    const [deviceBlocked, setDeviceBlocked] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Check if device already has an account
    useEffect(() => {
        const registeredDevices = localStorage.getItem('vs_registered_device');
        if (registeredDevices) {
            setDeviceBlocked(true);
        }
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Double check device limit
        const registeredDevice = localStorage.getItem('vs_registered_device');
        if (registeredDevice) {
            setError("Perangkat ini sudah pernah mendaftar. Silakan login atau gunakan perangkat lain.");
            setLoading(false);
            setDeviceBlocked(true);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data?.user?.identities?.length === 0) {
            // User already exists
            setError("An account with this email already exists. Please login instead.");
            setLoading(false);
        } else {
            // Mark device as registered
            const fingerprint = getDeviceFingerprint();
            localStorage.setItem('vs_registered_device', fingerprint);

            // Show verification modal
            setShowVerification(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-purple-900/10 blur-[130px]" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-blue-900/10 blur-[130px]" />

            {/* Email Verification Modal */}
            <AnimatePresence>
                {showVerification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="glass rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 max-w-md w-full text-center border-white/10"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 sm:mb-8 shadow-xl shadow-green-500/20">
                                <Mail size={32} className="text-white sm:hidden" />
                                <Mail size={40} className="text-white hidden sm:block" />
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-black mb-4">Check Your Email!</h2>
                            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
                                We've sent a verification link to <span className="text-white font-bold">{email}</span>.
                                Please click the link to activate your account.
                            </p>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-base sm:text-lg"
                                >
                                    Go to Login
                                </Button>
                                <button
                                    onClick={() => setShowVerification(false)}
                                    className="text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    Back to Register
                                </button>
                            </div>

                            <div className="mt-6 sm:mt-8 pt-6 border-t border-white/10">
                                <p className="text-xs text-gray-500">
                                    Didn't receive the email? Check your spam folder or
                                    <button className="text-purple-400 hover:underline ml-1">resend verification</button>
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 lg:p-12 border-white/5 shadow-2xl">
                    {/* Header */}
                    <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                        <Link href="/" className="inline-block mb-4 sm:mb-6 hover:scale-110 transition-transform duration-300">
                            <Image src="/logo.png" alt="SatSetPic" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] shadow-2xl shadow-purple-500/20" />
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Join VibeSelect.</h1>
                        <p className="text-gray-500 font-medium text-sm">Start delivering photo galleries that wow.</p>
                    </div>

                    {/* Benefit badges */}
                    <div className="flex gap-2 justify-center mb-6 sm:mb-8 flex-wrap">
                        <div className="px-3 py-1 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                            <Sparkles size={10} /> Free 7-Day Trial
                        </div>
                        <div className="px-3 py-1 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                            <Zap size={10} /> Instant Sync
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-5 sm:space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl bg-red-400/10 text-red-400 text-xs font-bold border border-red-400/20 text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Work Email</label>
                            <Input
                                type="email"
                                placeholder="you@studio.com"
                                className="h-12 sm:h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 characters"
                                    className="h-12 sm:h-14 bg-white/5 border-white/10 rounded-2xl px-6 pr-12 text-white placeholder:text-gray-600 font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
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
                            {loading ? "Creating Account..." : "Start Free Trial"}
                        </Button>

                        <div className="text-center pt-2 sm:pt-4">
                            <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-white transition-colors group">
                                Already have an account? <span className="text-purple-400 group-hover:underline">Login here</span> <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Info text */}
                <p className="mt-6 sm:mt-8 text-center text-[10px] text-gray-600 font-medium px-4 leading-relaxed tracking-wider uppercase">
                    By joining, you agree to our Terms of Service <br /> and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}
