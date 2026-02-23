"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { affiliateLogin } from "@/actions/affiliate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Lock, Mail } from "lucide-react";

export default function AffiliateLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        setError("");

        const res = await affiliateLogin(email, password);
        if (res.success) {
            router.push("/affiliate/dashboard");
        } else {
            setError(res.error || "Login gagal");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users size={32} />
                    </div>
                    <h1 className="text-2xl font-black">Affiliate Portal</h1>
                    <p className="text-gray-400 text-sm mt-1">Login untuk melihat komisi dan performa kode Anda</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="glass border border-white/10 rounded-3xl p-6 md:p-8">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    placeholder="email@example.com"
                                    className="bg-white/5 border-white/10 pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    className="bg-white/5 border-white/10 pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full h-12 mt-6 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {loading ? (
                            <><Loader2 size={16} className="mr-2 animate-spin" /> Logging in...</>
                        ) : (
                            "Login"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
