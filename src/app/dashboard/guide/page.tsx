"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Apple, Search, ShieldAlert, FolderOpen, User, PlusCircle, Settings, CheckCircle2 } from "lucide-react";

export default function GuidePage() {
    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-white pb-24">
            <div className="max-w-4xl mx-auto space-y-4">
                <h1 className="text-3xl font-black tracking-tight">Photographer Guide 📚</h1>
                <p className="text-gray-400 text-lg">
                    Complete workflow from setting up your drive to delivering photos securely.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="workflow" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-white/5 border border-white/5 rounded-xl">
                        <TabsTrigger value="setup" className="py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                            <Settings className="w-4 h-4 mr-2" /> Setup
                        </TabsTrigger>
                        <TabsTrigger value="create" className="py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg">
                            <PlusCircle className="w-4 h-4 mr-2" /> Create
                        </TabsTrigger>
                        <TabsTrigger value="workflow" className="py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg">
                            <Search className="w-4 h-4 mr-2" /> Workflow
                        </TabsTrigger>
                        <TabsTrigger value="security" className="py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                            <ShieldAlert className="w-4 h-4 mr-2" /> Security
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: SETUP */}
                    <TabsContent value="setup" className="space-y-6">
                        <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <FolderOpen className="text-blue-500" /> Google Drive & Profile Setup
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    First time here? Make sure your Google Drive is ready.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">1. Update Your Profile</h3>
                                    <p className="text-gray-400 text-sm">
                                        Go to the <strong>Profile & Branding</strong> menu. Upload your Logo and set your Social Media links. This logo will appear on the top of the gallery your clients see!
                                    </p>
                                </div>
                                <div className="w-full h-px bg-white/10" />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">2. Google Drive Permissions (Crucial!)</h3>
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm">
                                        <strong>Important:</strong> For the app to see your photos, the folder must be publicly accessible (Viewer only).
                                    </div>
                                    <ul className="space-y-3 text-gray-300 text-sm">
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Create a folder in Google Drive (e.g., "Wedding A & B").</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Upload your Resize/Web Size photos (Recommended: 2000px long edge).</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Right Click Folder &gt; <strong>Share</strong> &gt; <strong>Share</strong>.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Change "Restricted" to <strong>"Anyone with the link"</strong>.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Keep the role as <strong>"Viewer"</strong> (Do not give Editor access).</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Copy the Link! You will need this.</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: CREATE */}
                    <TabsContent value="create" className="space-y-6">
                        <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <PlusCircle className="text-purple-500" /> Creating a New Event
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Ready to share photos? Let's create an event.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Step number="1" title="New Event">
                                    <p className="text-gray-400">Click <strong>"New Event"</strong> on the sidebar.</p>
                                </Step>
                                <Step number="2" title="Event Details">
                                    <p className="text-gray-400">Enter the <strong>Event Name</strong> (e.g., "Sarah's Graduation") and Date.</p>
                                </Step>
                                <Step number="3" title="Set Selection Limit">
                                    <p className="text-gray-400">
                                        Decide how many photos the client can select (e.g., 50). They cannot submit more than this limit.
                                    </p>
                                </Step>
                                <Step number="4" title="Paste Drive Link">
                                    <p className="text-gray-400">
                                        Paste the Google Drive folder link you copied earlier. The system will automatically scan and import your photos.
                                    </p>
                                </Step>
                                <Step number="5" title="Share!">
                                    <p className="text-gray-400">
                                        Once created, open the event and click <strong>"Copy Link"</strong> or <strong>"WhatsApp"</strong> to send it to your client.
                                    </p>
                                </Step>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 3: WORKFLOW (Existing Guide) */}
                    <TabsContent value="workflow" className="space-y-6">
                        <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <Search className="text-green-500" /> The "Search & Drag" Method
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Client sent the list? Filter them in seconds without looking one by one.
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
                    </TabsContent>

                    {/* TAB 4: SECURITY */}
                    <TabsContent value="security" className="space-y-6">
                        <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl mb-24">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <ShieldAlert className="text-red-500" /> Finishing & Security
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Job done? Lock it down to prevent unauthorized access or further changes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                                    <strong>Why disable?</strong> Your Google Drive link is public. Once the client has selected their photos, you should disable the event so the public link no longer works.
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">How to Disable Event</h3>
                                    <Step number="1" title="Go to Dashboard">
                                        <p className="text-gray-400">Go to your <strong>Overview</strong> page where all events are listed.</p>
                                    </Step>
                                    <Step number="2" title="Toggle Active Switch">
                                        <p className="text-gray-400">
                                            Find the event card. You will see an <strong>"Active"</strong> switch (Green).
                                        </p>
                                    </Step>
                                    <Step number="3" title="Turn it Off">
                                        <p className="text-gray-400">
                                            Click the switch to turn it off (Grey).
                                        </p>
                                        <p className="text-gray-400 mt-2">
                                            ✅ The specific event link your client has will now show a <strong>"404 Not Found"</strong> page.
                                        </p>
                                        <p className="text-gray-400">
                                            ✅ Your photos in Drive are still safe, but no one can access them via our app anymore.
                                        </p>
                                    </Step>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/10 text-sm">
                {number}
            </div>
            <div>
                <h3 className="text-white font-bold mb-1 text-sm md:text-base">{title}</h3>
                <div className="text-sm text-gray-400">{children}</div>
            </div>
        </div>
    );
}
