import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Mail, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function AuthCodeErrorPage({
    searchParams,
}: {
    searchParams: { error?: string; error_code?: string; error_description?: string };
}) {
    const errorCode = searchParams.error_code || "unknown";
    const errorDescription = searchParams.error_description?.replace(/\+/g, " ") || "An authentication error occurred.";

    // Determine the type of error for better messaging
    const isExpiredLink = errorCode === "otp_expired" || errorDescription.toLowerCase().includes("expired");
    const isInvalidLink = errorCode === "invalid" || errorDescription.toLowerCase().includes("invalid");

    return (
        <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-red-900/10 blur-[130px]" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-purple-900/10 blur-[130px]" />

            <div className="w-full max-w-md relative z-10">
                <div className="glass rounded-[32px] p-8 border-white/5 shadow-2xl text-center">
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-6">
                        <Image src="/logo.png" alt="SatSetPic" width={64} height={64} className="rounded-[16px] shadow-xl mx-auto" />
                    </Link>

                    {/* Error Icon */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-6 border border-red-500/30">
                        <AlertTriangle size={40} className="text-red-400" />
                    </div>

                    {/* Error Message */}
                    <h1 className="text-2xl font-black mb-3">
                        {isExpiredLink ? "Link Expired ⏰" : isInvalidLink ? "Invalid Link ⚠️" : "Authentication Error"}
                    </h1>

                    <p className="text-gray-400 mb-6 text-sm">
                        {isExpiredLink
                            ? "The verification link has expired. Please request a new one."
                            : isInvalidLink
                                ? "This link is invalid or has already been used."
                                : errorDescription
                        }
                    </p>

                    {/* Technical Details (collapsible) */}
                    {errorCode !== "unknown" && (
                        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Error Code</p>
                            <p className="text-xs text-gray-400 font-mono">{errorCode}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {isExpiredLink && (
                            <Button asChild className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold">
                                <Link href="/login">
                                    <Mail className="mr-2" size={18} />
                                    Request New Link
                                </Link>
                            </Button>
                        )}

                        <Button asChild variant="outline" className="w-full h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold">
                            <Link href="/login">
                                <ArrowRight className="mr-2" size={18} />
                                Back to Login
                            </Link>
                        </Button>

                        <Button asChild variant="ghost" className="w-full h-10 rounded-xl text-gray-500 hover:text-white font-medium">
                            <Link href="/register">
                                <RefreshCw className="mr-2" size={16} />
                                Create New Account
                            </Link>
                        </Button>
                    </div>

                    {/* Help Text */}
                    <p className="mt-6 text-xs text-gray-600">
                        Need help? Contact us at{" "}
                        <a href="mailto:support@satsetpic.com" className="text-purple-400 hover:underline">
                            support@satsetpic.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
