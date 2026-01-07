"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Camera, Sparkles, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
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
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-purple-900/10 blur-[130px]" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-blue-900/10 blur-[130px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass rounded-[40px] p-8 sm:p-12 border-white/5 shadow-2xl">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-10">
                        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-xl shadow-purple-500/20 mb-6 group transition-transform hover:rotate-12">
                            <Camera size={32} className="text-white" />
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter">Join VibeSelect.</h1>
                        <p className="text-gray-500 font-medium text-sm">Start delivering photo galleries that wow.</p>
                    </div>

                    {/* Benefit badges */}
                    <div className="flex gap-2 justify-center mb-8">
                        <div className="px-3 py-1 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                            <Sparkles size={10} /> Free 7-Day Trial
                        </div>
                        <div className="px-3 py-1 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                            <Zap size={10} /> Instant Sync
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-6">
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
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-600 transition-all font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
                            <Input
                                type="password"
                                placeholder="Min 8 characters"
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-600 transition-all font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all shadow-xl shadow-purple-500/20 font-black text-lg border-none" disabled={loading}>
                            {loading ? "Creating Account..." : "Start Free Trial"}
                        </Button>

                        <div className="text-center pt-4">
                            <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-white transition-colors group">
                                Already have an account? <span className="text-purple-400 group-hover:underline">Login here</span> <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Info text */}
                <p className="mt-8 text-center text-[10px] text-gray-600 font-medium px-4 leading-relaxed tracking-wider uppercase">
                    By joining, you agree to our Terms of Service <br /> and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}
