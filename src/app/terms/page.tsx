import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#030014] text-white py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
                    <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>

                <h1 className="text-4xl font-black mb-8">Terms of Service</h1>

                <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300">
                    <p className="text-sm text-gray-500">Last updated: January 2026</p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                        <p>By accessing and using SatSetPic, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. Use of Service</h2>
                        <p>You may use SatSetPic for lawful purposes only. You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Upload or share illegal, harmful, or offensive content</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Use the service to spam or harass others</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. Account Responsibility</h2>
                        <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Subscription & Payments</h2>
                        <p>Subscription fees are billed in advance on a monthly, quarterly, or annual basis. All fees are non-refundable unless otherwise specified.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Trial Period</h2>
                        <p>New users receive a 7-day free trial with limited event credits. After the trial period, a paid subscription is required to continue using the service.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">6. Termination</h2>
                        <p>We may terminate or suspend your account at any time for violations of these terms. You may cancel your subscription at any time through your account settings.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">7. Contact</h2>
                        <p>For questions about these Terms, please contact:</p>
                        <p className="font-bold text-purple-400">support@satsetpic.id</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
