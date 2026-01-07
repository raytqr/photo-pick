"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  Camera,
  Sparkles,
  Zap,
  Cloud,
  MessageCircle,
  Check,
  ArrowRight,
  Star,
  Shield,
  Instagram,
  Linkedin,
  Mail,
  Smartphone,
  MousePointer2,
  Workflow,
  Menu,
  X,
  AtSign
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const features = [
  {
    icon: Smartphone,
    title: "Swipe & Done",
    description: "Make selection addictive. Clients swipe right to select, left to reject. Sat-Set, done.",
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
    title: "Sat-Set Speed",
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
    description: "Paste your Google Drive public folder link into SatSetPic."
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
    description: "Receive the final selection list on WhatsApp instantly. SatSet!"
  }
];

// Pricing data with billing cycles
const pricingPlans = [
  {
    name: "Starter",
    monthlyPrice: 50000,
    description: "Perfect for beginner photographers",
    features: ["10 Events per month", "Google Drive Sync", "WhatsApp Integration", "Custom Branding"],
    popular: false
  },
  {
    name: "Pro",
    monthlyPrice: 99000,
    description: "For professional photographers",
    features: ["50 Events per month", "Everything in Starter", "Priority Support", "Analytics Dashboard"],
    popular: true
  },
  {
    name: "Business",
    monthlyPrice: 199000,
    description: "For studios and agencies",
    features: ["Unlimited Events", "Everything in Pro", "Team Collaboration", "White Label"],
    popular: false
  }
];

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-12">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo-premium.png" alt="SatSetPic" width={40} height={40} className="rounded-lg" />
                <span className="text-xl font-bold tracking-tight text-white">SatSetPic</span>
              </Link>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X size={24} className="text-white" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 text-2xl font-bold">
              <a href="#features" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Features</a>
              <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Process</a>
              <a href="#pricing" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Pricing</a>
              <hr className="border-white/10 my-4" />
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Login</Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-lg font-bold">
                  Start Free Trial
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      )}
      <div id="mobile-nav-trigger" className="hidden" onClick={() => setIsOpen(true)} />
    </>
  );
}

// Improved hero background with animated gradient orbs
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient orbs - slow morphing animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/20 blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/20 blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 blur-[80px]"
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating subtle dots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  // Pricing billing cycle state
  const [billingCycle, setBillingCycle] = useState<'monthly' | '3month' | 'yearly'>('monthly');

  const getPrice = (monthlyPrice: number) => {
    switch (billingCycle) {
      case '3month':
        return Math.round(monthlyPrice * 3 * 0.9);
      case 'yearly':
        return Math.round(monthlyPrice * 12 * 0.75);
      default:
        return monthlyPrice;
    }
  };

  const getPeriodLabel = () => {
    switch (billingCycle) {
      case '3month': return '/3 months';
      case 'yearly': return '/year';
      default: return '/month';
    }
  };

  const getDiscount = () => {
    switch (billingCycle) {
      case '3month': return 'Save 10%';
      case 'yearly': return 'Save 25%';
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">

      {/* Nav */}
      <MobileNav />
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo-premium.png" alt="SatSetPic" width={48} height={48} className="rounded-xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-500/20" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">SatSetPic</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Process</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button className="rounded-full bg-white text-black hover:bg-gray-200 px-6 font-semibold transition-all hover:scale-105 active:scale-95">
                Start Free
              </Button>
            </Link>
            <button
              onClick={() => document.getElementById('mobile-nav-trigger')?.click()}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={targetRef} className="relative pt-44 pb-32 px-6">
        <HeroBackground />

        <motion.div style={{ opacity, scale, y }} className="max-w-5xl mx-auto text-center relative z-10">
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
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]"
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
              <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all shadow-2xl shadow-purple-500/25 font-bold">
                Start 7-Day Free Trial <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg rounded-full border-white/10 hover:bg-white/5 font-semibold transition-all">
                See How It Works
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
          <div className="glass rounded-[40px] p-4 sm:p-8 shadow-[0_0_80px_rgba(168,85,247,0.15)]">
            <img
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=2070"
              alt="Dashboard Preview"
              className="rounded-[30px] border border-white/5 shadow-2xl w-full h-[300px] sm:h-[500px] object-cover opacity-80"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-3xl flex items-center justify-center border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center"
              >
                <Sparkles size={28} className="text-purple-600" />
              </motion.div>
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
                className="group p-8 sm:p-10 rounded-[40px] glass border-white/5 hover:border-purple-500/40 transition-all duration-500"
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
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-12">The 4-Step<br />Magic.</h2>
              <div className="space-y-12">
                {steps.map((step) => (
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
                  <h3 className="text-2xl font-bold uppercase tracking-tighter">Powered by<br />SatSetPic</h3>
                </div>
              </div>

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

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Simple, Honest <span className="text-gradient">Pricing.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Pick a plan that matches your workflow. All plans include a 7-day free trial.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white/5 rounded-full p-1.5 border border-white/10">
              {[
                { key: 'monthly', label: 'Monthly' },
                { key: '3month', label: '3 Months' },
                { key: 'yearly', label: 'Yearly' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setBillingCycle(option.key as any)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === option.key
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {option.label}
                  {option.key === 'yearly' && <span className="ml-1 text-green-400 text-xs">-25%</span>}
                </button>
              ))}
            </div>
          </div>

          {getDiscount() && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-green-400 font-bold mb-8"
            >
              🎉 {getDiscount()}
            </motion.p>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-8 rounded-[40px] glass border ${plan.popular ? 'border-purple-500/50' : 'border-white/10'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-black">Rp {getPrice(plan.monthlyPrice).toLocaleString('id-ID')}</span>
                  <span className="text-gray-400">{getPeriodLabel()}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check size={18} className="text-green-400 shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <Button className={`w-full h-14 rounded-full font-bold ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10 hover:bg-white/20'}`}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeInUp} className="text-center text-gray-500 mt-12">
            Have a promo code? Enter it after registration to unlock your benefits!
          </motion.p>
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
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8">Ready to transform your client experience?</h2>
          <p className="text-gray-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto">
            Join photographers who value their time and their client's joy.
            Try it free for 7 days - no credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-16 sm:h-20 px-10 sm:px-12 text-lg sm:text-xl rounded-full bg-white text-black hover:bg-gray-200 font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
              Start Free Trial <ArrowRight className="ml-2" size={24} />
            </Button>
          </Link>
          <p className="mt-8 text-gray-500 text-sm font-medium">No credit card required • 7-day free trial • Cancel anytime</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/5 bg-black/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-12 mb-20 text-sm">

            <div className="col-span-2 lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center p-1.5 shadow-lg shadow-purple-500/10">
                  <Image src="/logo-premium.png" alt="SatSetPic" width={32} height={32} className="rounded-lg object-contain" />
                </div>
                <span className="text-xl font-black tracking-tighter">SatSetPic</span>
              </Link>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                The fastest standard for photo selection. We help professional photographers
                deliver stunning, interactive galleries. SatSet and done.
              </p>
              <div className="flex gap-4">
                <Link href="https://instagram.com/ray_tqr" target="_blank">
                  <Instagram size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                </Link>
                <Link href="https://threads.net/@ray_tqr" target="_blank">
                  <AtSign size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                </Link>
                <Link href="https://www.linkedin.com/in/rayhanwt/" target="_blank">
                  <Linkedin size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                </Link>
              </div>
            </div>

            <div className="space-y-6 text-gray-400 font-medium">
              <h4 className="text-white font-bold">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Process</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/guide" className="hover:text-white transition-colors">Guide</Link></li>
              </ul>
            </div>

            <div className="space-y-6 text-gray-400 font-medium">
              <h4 className="text-white font-bold">Resources</h4>
              <ul className="space-y-4">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/guide" className="hover:text-white transition-colors">Help Center</Link></li>
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
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Join 1,000+ Subscribers</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-medium">
            <p>© 2026 SatSetPic Team. All rights reserved.</p>
            <div className="flex gap-8">
              <span>SatSet Your Workflow</span>
              <span>v1.0.7-beta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
