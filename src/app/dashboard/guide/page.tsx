"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Apple, Search, ArrowRight, Video } from "lucide-react";
// Video import removed since lucide-react doesn't export it in older versions or user might not have it, using Monitor/smartphone instead if needed.
// Actually Video is standard in Lucide.

export default function GuidePage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-white">
            <div className="max-w-4xl mx-auto space-y-4">
                <h1 className="text-3xl font-black tracking-tight">How to Select Photos Faster ⚡</h1>
                <p className="text-gray-400 text-lg">
                    Client sent you the list? Here is the secret workflow to filter them in seconds without looking for filenames one by one.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">The "Search & Drag" Method</CardTitle>
                        <CardDescription className="text-gray-400">
                            Lightroom doesn't have a "Paste List" feature, but your Computer does.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm">
                            <strong>The Concept:</strong> We will use your File Explorer (Windows) or Finder (Mac) to filter the files first, then drag them into Lightroom.
                        </div>

                        <Tabs defaultValue="windows" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/5">
                                <TabsTrigger value="windows" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                    <Monitor className="w-4 h-4 mr-2" /> Windows PC
                                </TabsTrigger>
                                <TabsTrigger value="mac" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                                    <Apple className="w-4 h-4 mr-2" /> Mac / Finder
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="windows" className="space-y-4 mt-6">
                                <Step number="1" title="Copy the Search String">
                                    <p className="text-gray-400 mb-2">In the WhatsApp message from the client, copy the text in the <strong>"PC SEARCH STRING"</strong> section.</p>
                                    <code className="block p-3 rounded-lg bg-black border border-white/10 text-xs text-green-400 font-mono">
                                        IMG_9021 OR IMG_9025 OR IMG_9030
                                    </code>
                                </Step>

                                <Step number="2" title="Open Folder & Paste">
                                    <p className="text-gray-400">Open the folder containing your raw photos in <strong>File Explorer</strong>.</p>
                                    <p className="text-gray-400 mt-1">Click the <strong>Search Box</strong> (top right) and Paste (Ctrl+V).</p>
                                </Step>

                                <Step number="3" title="Select & Drag">
                                    <p className="text-gray-400">Wait for the green loading bar to finish. Only the selected photos will appear.</p>
                                    <p className="text-gray-400 mt-1">Press <strong>Ctrl + A</strong> (Select All), then <strong>Drag & Drop</strong> them into Lightroom.</p>
                                </Step>
                            </TabsContent>

                            <TabsContent value="mac" className="space-y-4 mt-6">
                                <Step number="1" title="Copy the Search String">
                                    <p className="text-gray-400 mb-2">In the WhatsApp message from the client, copy the text in the <strong>"PC SEARCH STRING"</strong> section.</p>
                                    <code className="block p-3 rounded-lg bg-black border border-white/10 text-xs text-green-400 font-mono">
                                        IMG_9021 OR IMG_9025 OR IMG_9030
                                    </code>
                                </Step>

                                <Step number="2" title="Open Folder & Find">
                                    <p className="text-gray-400">Open your folder in <strong>Finder</strong>. Press <strong>Cmd + F</strong>.</p>
                                </Step>

                                <Step number="3" title="Paste & Filter">
                                    <p className="text-gray-400">Paste (Cmd + V) the search string.</p>
                                    <p className="text-gray-400 mt-1">Important: <strong>Select "Name" matches</strong> if Finder asks.</p>
                                </Step>

                                <Step number="4" title="Select & Drag">
                                    <p className="text-gray-400">Press <strong>Cmd + A</strong> to select the filtered results.</p>
                                    <p className="text-gray-400 mt-1">Drag them directly onto the Lightroom icon in your dock.</p>
                                </Step>
                            </TabsContent>
                        </Tabs>

                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Search size={20} className="text-yellow-500" />
                                Why "OR"?
                            </h3>
                            <p className="text-sm text-gray-400">
                                Adding "OR" between filenames tells Windows/Mac to find <em>this file</em> <strong>OR</strong> <em>that file</em>. Without it, the computer thinks you are looking for one file with a super long name!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/10">
                {number}
            </div>
            <div>
                <h3 className="text-white font-bold mb-1">{title}</h3>
                <div className="text-sm">{children}</div>
            </div>
        </div>
    );
}
