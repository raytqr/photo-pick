"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";

interface ClientLinkCopyProps {
    slug: string;
}

export function ClientLinkCopy({ slug }: ClientLinkCopyProps) {
    const [copied, setCopied] = useState(false);

    // In production, this would use the real domain
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/client/${slug}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:block px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-500 font-mono truncate max-w-[200px] border dark:border-gray-700">
                {url}
            </div>

            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Link"}
            </Button>

            <Button size="sm" variant="ghost" className="text-blue-600" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                </a>
            </Button>
        </div>
    );
}
