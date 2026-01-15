"use client";

import { Instagram, Mail, MessageCircle } from 'lucide-react';

interface PortfolioContactProps {
    photographerName: string;
    whatsappNumber: string | null;
    instagramHandle: string | null;
    email: string | null;
    contactMethod: string;
    contactButtonText: string;
    customTitle?: string | null;
}

export default function PortfolioContact({ photographerName, whatsappNumber, instagramHandle, email, contactMethod, contactButtonText, customTitle }: PortfolioContactProps) {
    const handleContact = () => {
        if (contactMethod === 'whatsapp' && whatsappNumber) {
            const message = encodeURIComponent(`Hello ${photographerName}, I would like to book a session!`);
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        } else if (contactMethod === 'instagram' && instagramHandle) {
            window.open(`https://instagram.com/${instagramHandle}`, '_blank');
        } else if (contactMethod === 'email' && email) {
            window.open(`mailto:${email}`, '_blank');
        }
    };

    return (
        <footer id="contact" className="bg-black py-24 px-6 border-t border-white/10">
            <div className="max-w-4xl mx-auto text-center">
                <div>
                    <h2 className="font-bold text-5xl md:text-7xl text-white mb-6 uppercase tracking-tight">{customTitle || "LET'S CREATE MAGIC TOGETHER."}</h2>
                    <p className="text-neutral-400 text-lg mb-12">Ready to tell your story? Book a session or just say hello.</p>
                    <button onClick={handleContact} className="inline-flex items-center gap-2 bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:scale-105 transition-transform duration-300">
                        {contactMethod === 'whatsapp' && <MessageCircle size={20} />}
                        {contactMethod === 'instagram' && <Instagram size={20} />}
                        {contactMethod === 'email' && <Mail size={20} />}
                        {contactButtonText}
                    </button>
                </div>
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-12">
                    {instagramHandle && <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2"><div className="p-3 bg-white/5 rounded-full mb-2 group-hover:bg-white/10 transition-colors"><Instagram className="text-white" size={20} /></div><span className="text-neutral-400 group-hover:text-white transition-colors">@{instagramHandle}</span></a>}
                    {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2"><div className="p-3 bg-white/5 rounded-full mb-2 group-hover:bg-white/10 transition-colors"><MessageCircle className="text-white" size={20} /></div><span className="text-neutral-400 group-hover:text-white transition-colors">WhatsApp</span></a>}
                    {email && <a href={`mailto:${email}`} className="group flex flex-col items-center gap-2"><div className="p-3 bg-white/5 rounded-full mb-2 group-hover:bg-white/10 transition-colors"><Mail className="text-white" size={20} /></div><span className="text-neutral-400 group-hover:text-white transition-colors break-all">{email}</span></a>}
                </div>
                <div className="mt-12 text-neutral-600 text-sm font-light">&copy; {new Date().getFullYear()} {photographerName}. All Rights Reserved.</div>
            </div>
        </footer>
    );
}
