"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Camera, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    return (
        <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass rounded-[40px] p-8 sm:p-12 border-white/5 shadow-2xl">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-10">
                        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-xl shadow-purple-500/20 mb-6 group transition-transform hover:scale-110">
                            <Camera size={32} className="text-white" />
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter">Welcome back.</h1>
                        <p className="text-gray-500 font-medium">Log in to your photographer hub.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
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
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Password</label>
                                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors">Forgot?</a>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all shadow-xl shadow-purple-500/20 font-black text-lg border-none" disabled={loading}>
                            {loading ? "Authenticating..." : "Sign In"}
                        </Button>

                        <div className="text-center pt-4">
                            <Link href="/register" className="text-sm font-bold text-gray-500 hover:text-white transition-colors group">
                                Don&apos;t have an account? <span className="text-purple-400 group-hover:underline">Sign up free</span> <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer text */}
                <div className="mt-12 text-center flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    <Sparkles size={12} /> Powered by VibeSelect Studio
                </div>
            </motion.div>
        </div>
    );
}
