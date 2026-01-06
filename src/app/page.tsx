"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
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
  Shield
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
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
    icon: Sparkles,
    title: "Swipe to Select",
    description: "Tinder-style card swiping makes photo selection fun and intuitive for your clients."
  },
  {
    icon: Cloud,
    title: "Google Drive Sync",
    description: "Link your Google Drive folder and photos appear instantly. No manual uploads needed."
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    description: "Clients send their final selections directly to your WhatsApp with one tap."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed. Your clients get a smooth experience on any device."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your photos stay on Google Drive. We never store or access your files."
  },
  {
    icon: Users,
    title: "Unlimited Clients",
    description: "Create unique links for each event. No limit on how many clients can access."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "50.000",
    period: "/bulan",
    description: "Perfect for beginner photographers",
    features: [
      "10 Events per month",
      "Google Drive Sync",
      "WhatsApp Integration",
      "Custom Branding",
      "Email Support"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Pro",
    price: "99.000",
    period: "/bulan",
    description: "For professional photographers",
    features: [
      "50 Events per month",
      "Everything in Starter",
      "Priority Support",
      "Analytics Dashboard",
      "Custom Domain"
    ],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Business",
    price: "199.000",
    period: "/bulan",
    description: "For studios and agencies",
    features: [
      "Unlimited Events",
      "Everything in Pro",
      "Team Collaboration",
      "White Label",
      "Dedicated Support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-950/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="VibeSelect" width={40} height={40} className="rounded-xl" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              VibeSelect
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <Link href="/login" className="hover:text-white transition">Login</Link>
          </div>

          <Link href="/register">
            <Button className="rounded-full bg-white text-black hover:bg-gray-200 px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-8"
          >
            <Star size={14} /> Trusted by 500+ photographers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Photo Selection
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Let your clients pick their favorite photos with a Tinder-style swipe interface.
            No more endless email threads or confusing spreadsheets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl shadow-purple-500/25">
                Start Free Trial <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-white/20 hover:bg-white/5">
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 mx-auto max-w-4xl">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 aspect-video flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Camera size={40} />
                  </div>
                  <p className="text-gray-400">Interactive Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              A complete solution for professional photographers to deliver stunning galleries.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Choose the plan that fits your business. All plans include a 7-day free trial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-8 rounded-3xl border ${plan.popular
                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                    : 'border-white/10 bg-white/5'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-bold">Rp {plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
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
                  <Button
                    className={`w-full h-12 rounded-full ${plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-white/10 hover:bg-white/20'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Redeem Code Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-400">
              Have a promo code? Enter it after registration to unlock your benefits!
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Elevate Your Workflow?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of photographers who deliver galleries faster with VibeSelect.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200">
              Get Started Free <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="VibeSelect" width={32} height={32} className="rounded-lg" />
            <span className="text-gray-400">© 2024 VibeSelect. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
