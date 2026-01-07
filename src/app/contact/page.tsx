"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageCircle, Instagram, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to an API
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white py-20 px-6">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
                    <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Contact Info */}
                    <div>
                        <h1 className="text-4xl font-black mb-4">Get in Touch</h1>
                        <p className="text-gray-400 mb-8">
                            Have questions about VibeSelect? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <Mail className="text-purple-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Email</h3>
                                    <p className="text-gray-400">support@vibeselect.id</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                                    <MessageCircle className="text-green-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">WhatsApp</h3>
                                    <p className="text-gray-400">+62 812-xxxx-xxxx</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                                    <Instagram className="text-pink-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Instagram</h3>
                                    <p className="text-gray-400">@vibeselect.id</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <MapPin className="text-blue-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Location</h3>
                                    <p className="text-gray-400">Jakarta, Indonesia</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass rounded-3xl p-8 border-white/5">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Mail className="text-green-400" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Name</label>
                                    <Input
                                        placeholder="Your name"
                                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Subject</label>
                                    <Input
                                        placeholder="How can we help?"
                                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Message</label>
                                    <Textarea
                                        placeholder="Tell us more..."
                                        className="min-h-[120px] bg-white/5 border-white/10 rounded-xl text-white resize-none"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg">
                                    Send Message
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
