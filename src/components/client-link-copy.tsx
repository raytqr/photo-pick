"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, Lock } from "lucide-react";

interface ClientLinkCopyProps {
    slug: string;
    password?: string | null;
}

export function ClientLinkCopy({ slug, password }: ClientLinkCopyProps) {
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    // Initial render (SSR & Hydration) uses relative path (empty origin)
    // After mount, origin is populated
    const url = `${origin}/client/${slug}`;

    const handleCopy = () => {
        // Always use fresh window origin for the action
        const fullUrl = `${window.location.origin}/client/${slug}`;

        // Format message with password if exists
        let copyText = `🔗 Link: ${fullUrl}`;
        if (password) {
            copyText += `\n🔐 Password: ${password}`;
        }

        navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-500 font-mono truncate max-w-[250px] border dark:border-gray-700">
                <span className="truncate">{url}</span>
                {password && <Lock size={12} className="text-green-500 flex-shrink-0" />}
            </div>

            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "Copied" : password ? "Copy with Password" : "Copy Link"}
            </Button>

            <Button size="sm" variant="ghost" className="text-blue-600" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                </a>
            </Button>
        </div>
    );
}
