import { useState } from "react";
import { useAppStore, Photo } from "@/store/useAppStore";
import Image from "next/image";
import { Check, HelpCircle, X, Maximize2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "./image-viewer";
import { cn } from "@/lib/utils";

type FilterType = 'all' | 'selected' | 'maybe' | 'rejected';

export function GridView() {
    const { selectedPhotos, maybePhotos, rejectedPhotos, movePhoto } = useAppStore();
    const [filter, setFilter] = useState<FilterType>('all');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getPhotosByStatus = (status: FilterType) => {
        switch (status) {
            case 'selected': return selectedPhotos;
            case 'maybe': return maybePhotos;
            case 'rejected': return rejectedPhotos;
            case 'all': return [...selectedPhotos, ...maybePhotos, ...rejectedPhotos]; // Simplification for MVP
        }
    };

    const renderSection = (title: string, photos: Photo[], status: 'selected' | 'maybe' | 'rejected') => {
        if (photos.length === 0) return null;
        if (filter !== 'all' && filter !== status) return null;

        return (
            <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold flex items-center gap-2 dark:text-gray-100 border-b dark:border-gray-800 pb-2">
                    {title} <span className="text-sm font-normal text-gray-500">({photos.length})</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative group aspect-[3/4] rounded-lg overflow-hidden border dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-sm hover:shadow-md transition">
                            <Image
                                src={photo.url}
                                alt={photo.id}
                                fill
                                className="object-cover transition group-hover:scale-105"
                                onClick={() => setPreviewUrl(photo.url)}
                            />

                            {/* Expand Icon Hint */}
                            <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition backdrop-blur-sm pointer-events-none">
                                <Maximize2 size={12} />
                            </div>

                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 pointer-events-none">
                                <div className="pointer-events-auto flex flex-col w-full gap-2 px-2">
                                    {status !== 'selected' && (
                                        <Button size="sm" variant="default" className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => movePhoto(photo.id, status, 'selected')}>
                                            <Check size={12} className="mr-1" /> Select
                                        </Button>
                                    )}

                                    {status !== 'maybe' && (
                                        <Button size="sm" variant="secondary" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-none h-8 text-xs" onClick={() => movePhoto(photo.id, status, 'maybe')}>
                                            <HelpCircle size={12} className="mr-1" /> Maybe
                                        </Button>
                                    )}

                                    {status !== 'rejected' && (
                                        <Button size="sm" variant="destructive" className="w-full h-8 text-xs" onClick={() => movePhoto(photo.id, status, 'rejected')}>
                                            <X size={12} className="mr-1" /> Reject
                                        </Button>
                                    )}

                                    <Button size="sm" variant="outline" className="w-full h-8 text-xs border-white/30 text-white hover:bg-white/20" onClick={() => setPreviewUrl(photo.url)}>
                                        <Maximize2 size={12} className="mr-1" /> View Full
                                    </Button>
                                </div>
                            </div>

                            {/* Status Indicator (Corner) */}
                            <div className={`absolute top-2 right-2 p-1.5 rounded-full text-white shadow-sm z-10 ${status === 'selected' ? 'bg-green-500' :
                                    status === 'maybe' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                {status === 'selected' && <Check size={12} />}
                                {status === 'maybe' && <HelpCircle size={12} />}
                                {status === 'rejected' && <X size={12} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const tabs: { id: FilterType, label: string, icon: any }[] = [
        { id: 'all', label: 'All Photos', icon: Filter },
        { id: 'selected', label: 'Selected', icon: Check },
        { id: 'maybe', label: 'Maybe', icon: HelpCircle },
        { id: 'rejected', label: 'Rejected', icon: X },
    ];

    return (
        <div className="container mx-auto px-4 pb-20 pt-6">
            {/* Full Image Preview */}
            <ImageViewer url={previewUrl} onClose={() => setPreviewUrl(null)} />

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-full md:w-fit font-medium">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm",
                            filter === tab.id
                                ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {filter === tab.id && (
                            <span className="ml-1 text-xs opacity-60">
                                {tab.id === 'all'
                                    ? (selectedPhotos.length + maybePhotos.length + rejectedPhotos.length)
                                    : getPhotosByStatus(tab.id).length
                                }
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {selectedPhotos.length === 0 && maybePhotos.length === 0 && rejectedPhotos.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No photos categorized yet. Go back to Swipe Mode!
                </div>
            )}

            {renderSection("Selected (Keep)", selectedPhotos, 'selected')}
            {renderSection("Maybe (Undecided)", maybePhotos, 'maybe')}
            {renderSection("Rejected (Discard)", rejectedPhotos, 'rejected')}
        </div>
    );
}
