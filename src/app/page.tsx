"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  Camera,
  Sparkles,
  Zap,
  Cloud,
  MessageCircle,
  Check,
  ArrowRight,
  Star,
  Users,
  Shield,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Smartphone,
  MousePointer2,
  Workflow
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: Smartphone,
    title: "Tinder-Style Swipe",
    description: "Make selection addictive. Clients swipe right to select, left to reject. It's that simple.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Cloud,
    title: "Direct Drive Sync",
    description: "No more re-uploading. Link your Google Drive and we'll sync your photos instantly.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MessageCircle,
    title: "WA Reporting",
    description: "Results delivered instantly to your WhatsApp. One tap for the client, zero hassle for you.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Zero Latency",
    description: "Optimized delivery engine ensures high-res previews load instantly even on slow connections.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "We don't store your photos. We just provide the interface. Your data stays yours.",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: Workflow,
    title: "Lightroom Ready",
    description: "Copy-paste filename lists directly into Lightroom. Finish editing in minutes, not hours.",
    color: "from-indigo-500 to-purple-500"
  }
];

const steps = [
  {
    number: "01",
    title: "Connect Folder",
    description: "Paste your Google Drive public folder link into VibeSelect."
  },
  {
    number: "02",
    title: "Share Link",
    description: "Send the unique, branded link to your client via WhatsApp or Email."
  },
  {
    number: "03",
    title: "Client Swipes",
    description: "Your client selects their favorites with a fun swipe interface."
  },
  {
    number: "04",
    title: "Instant Report",
    description: "Receive the final selection list on WhatsApp instantly."
  }
];

export default function LandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] rounded-full bg-pink-900/10 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">VibeSelect</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Process</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-white text-black hover:bg-gray-200 px-6 font-semibold transition-all hover:scale-105 active:scale-95">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={targetRef} className="relative pt-44 pb-32 px-6">
        <motion.div style={{ opacity, scale, y }} className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-purple-300 text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Sparkles size={14} className="animate-pulse" /> The Modern Photographer's Secret Weapon
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]"
          >
            Ditch the Emails.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Just Swipe.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Stop wasting hours on photo selection drama. Give your clients a Tinder-style
            experience they'll actually enjoy using. Professional, fast, and addictive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all shadow-2xl shadow-purple-500/25 font-bold">
                Level Up Your Workflow <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg rounded-full border-white/10 hover:bg-white/5 font-semibold transition-all">
                Learn the Process
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-24 relative max-w-6xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="glass rounded-[40px] p-4 sm:p-8 animate-float shadow-[0_0_80px_rgba(168,85,247,0.15)]">
            <img
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=2070"
              alt="Dashboard Preview"
              className="rounded-[30px] border border-white/5 shadow-2xl w-full h-[500px] object-cover opacity-80"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-3xl flex items-center justify-center border border-white/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center animate-pulse">
                <Sparkles size={32} className="text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 {...fadeInUp} className="text-4xl md:text-6xl font-black mb-6">
              Modern Tools for<br /><span className="text-gray-500">Modern Creatives.</span>
            </motion.h2>
            <motion.p {...fadeInUp} className="text-gray-400 text-lg max-w-xl mx-auto">
              A complete workflow engine designed to get you from shutter to delivery in record time.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group p-10 rounded-[40px] glass border-white/5 hover:border-purple-500/40 transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-12">The 4-Step<br />Magic.</h2>
              <div className="space-y-12">
                {steps.map((step, i) => (
                  <motion.div key={step.number} className="flex gap-6 items-start">
                    <span className="text-4xl font-black text-white/10">{step.number}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square glass rounded-full flex items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 animate-pulse" />
                <Workflow size={200} className="text-purple-500 opacity-20 absolute" />
                <div className="relative z-10 text-center">
                  <Smartphone size={80} className="mx-auto mb-6 text-pink-500" />
                  <h3 className="text-2xl font-bold uppercase tracking-tighter">Powered by<br />VibeSelect</h3>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-24 h-24 glass rounded-3xl flex items-center justify-center"
              >
                <Star size={32} className="text-amber-500" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-10 -left-10 w-32 h-32 glass rounded-[40px] flex items-center justify-center"
              >
                <MousePointer2 size={40} className="text-blue-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/10 blur-[150px] -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-7xl font-black mb-8">Ready to transform your client experience?</h2>
          <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
            Join the elite circle of photographers who value their time and their client's joy.
            Start today for free.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-20 px-12 text-xl rounded-full bg-white text-black hover:bg-gray-200 font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
              Get Started for Free <ArrowRight className="ml-2" size={24} />
            </Button>
          </Link>
          <p className="mt-8 text-gray-500 text-sm font-medium">No credit card required • 7-day free trial • Cancel anytime</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/5 bg-black/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20 text-sm">

            <div className="col-span-2 lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                  <Camera size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold">VibeSelect</span>
              </Link>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                The modern standard for photo selection. We help professional photographers
                deliver stunning, interactive galleries that clients love swiping through.
              </p>
              <div className="flex gap-4">
                <Twitter size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div className="space-y-6 text-gray-400 font-medium">
              <h4 className="text-white font-bold">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Process</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/guide" className="hover:text-white transition-colors">Guide</Link></li>
              </ul>
            </div>

            <div className="space-y-6 text-gray-400 font-medium">
              <h4 className="text-white font-bold">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-6">
              <h4 className="text-white font-bold">Get Updates</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-purple-500/50 text-sm"
                />
                <Button size="icon" className="shrink-0 bg-white text-black hover:bg-gray-200">
                  <Mail size={16} />
                </Button>
              </div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Join 5,000+ Subscribers</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-medium">
            <p>© 2024 VibeSelect Team. All rights reserved.</p>
            <div className="flex gap-8">
              <span>Designed for Creatives</span>
              <span>v1.0.4-stable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
