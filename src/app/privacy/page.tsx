import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#030014] text-white py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
                    <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>

                <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>

                <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300">
                    <p className="text-sm text-gray-500">Last updated: January 2026</p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, upload photos, or contact us for support.</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Account information (email, name)</li>
                            <li>Event data (event names, photo links)</li>
                            <li>Usage data (how you interact with our service)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. Photo Storage</h2>
                        <p>We do NOT store your original photos. All photos are served directly from your Google Drive. We only store references (URLs) to facilitate the selection interface.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                        <p className="font-bold text-purple-400">support@vibeselect.id</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
