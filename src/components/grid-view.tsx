"use client";

import { useState, useMemo } from "react";
// ... (imports remain)

export function GridView({ setViewMode }: GridViewProps) {
    const { sourceImages, selectedPhotos, maybePhotos, rejectedPhotos, superLikedPhotos, movePhoto, restartCategory } = useAppStore();
    const [filter, setFilter] = useState<FilterType>('all');
    const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

    // Optimize: Create Sets for O(1) lookup
    const { selectedSet, superLikedSet, maybeSet, rejectedSet } = useMemo(() => ({
        selectedSet: new Set(selectedPhotos.map(p => p.id)),
        superLikedSet: new Set(superLikedPhotos.map(p => p.id)),
        maybeSet: new Set(maybePhotos.map(p => p.id)),
        rejectedSet: new Set(rejectedPhotos.map(p => p.id))
    }), [selectedPhotos, superLikedPhotos, maybePhotos, rejectedPhotos]);

    // Optimize: Memoize all photos array
    const allPhotos = useMemo(() =>
        [...sourceImages, ...selectedPhotos, ...superLikedPhotos, ...maybePhotos, ...rejectedPhotos],
        [sourceImages, selectedPhotos, superLikedPhotos, maybePhotos, rejectedPhotos]);

    const getPhotoStatus = (photo: Photo): PhotoStatus | 'source' => {
        if (selectedSet.has(photo.id)) return 'selected';
        if (superLikedSet.has(photo.id)) return 'superLiked';
        if (maybeSet.has(photo.id)) return 'maybe';
        if (rejectedSet.has(photo.id)) return 'rejected';
        return 'source';
    };

    const getFilteredPhotos = () => {
        switch (filter) {
            case 'pending': return sourceImages;
            case 'selected': return selectedPhotos;
            case 'superLiked': return superLikedPhotos;
            case 'maybe': return maybePhotos;
            case 'rejected': return rejectedPhotos;
            case 'all':
            default: return allPhotos;
        }
    };

    const filteredPhotos = getFilteredPhotos();

    const tabs = [
        { id: 'all' as FilterType, label: 'All', icon: Filter, count: allPhotos.length },
        { id: 'pending' as FilterType, label: 'Not Reviewed', icon: Clock, count: sourceImages.length },
        { id: 'selected' as FilterType, label: 'Selected', icon: Check, count: selectedPhotos.length },
        { id: 'superLiked' as FilterType, label: 'Super Like', icon: Star, count: superLikedPhotos.length },
        { id: 'maybe' as FilterType, label: 'Maybe', icon: HelpCircle, count: maybePhotos.length },
        { id: 'rejected' as FilterType, label: 'Rejected', icon: X, count: rejectedPhotos.length },
    ];

    const handleMove = (photo: Photo, fromStatus: PhotoStatus | 'source', toStatus: PhotoStatus) => {
        movePhoto(photo.id, fromStatus, toStatus);
    };

    // Helper to optimize Google Drive thumbnail URLs for grid view
    const getOptimizedThumbnailUrl = (url: string) => {
        if (url.includes('drive.google.com/thumbnail')) {
            // Replace existing sz parameter or append it
            return url.replace(/sz=w\d+/, 'sz=w400');
        }
        return url;
    };

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(30);

    // Reset pagination when filter changes
    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setVisibleCount(30);
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 30);
    };

    const hasMore = filteredPhotos.length > visibleCount;
    const visiblePhotos = filteredPhotos.slice(0, visibleCount);

    return (
        <div className="px-3 pb-24 pt-4">
            {/* Full Image Preview */}
            <ImageViewer url={previewPhoto?.url || null} onClose={() => setPreviewPhoto(null)} />

            {/* Filter Tabs - Scrollable on mobile */}
            <div className="overflow-x-auto -mx-3 px-3 mb-4">
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl w-max min-w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleFilterChange(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-medium whitespace-nowrap",
                                filter === tab.id
                                    ? tab.id === 'superLiked' ? "bg-blue-500 text-white shadow-sm" :
                                        tab.id === 'rejected' ? "bg-red-500 text-white shadow-sm" :
                                            "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <tab.icon size={14} />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px]",
                                filter === tab.id
                                    ? (tab.id === 'superLiked' || tab.id === 'rejected') ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                                    : "bg-gray-200/50 dark:bg-gray-800"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Swipe Action Bar */}
            {filter !== 'all' && filteredPhotos.length > 0 && (
                <div className="mb-6 animate-in slide-in-from-top-2 fade-in">
                    <Button
                        onClick={() => {
                            if (filter === 'pending') {
                                // Just switch to swipe view
                                setViewMode('swipe');
                            } else {
                                // Restart this category
                                restartCategory(filter as PhotoStatus);
                                setViewMode('swipe');
                            }
                        }}
                        className={cn(
                            "w-full rounded-xl h-12 text-sm font-bold shadow-lg transition-all hover:scale-[1.02]",
                            filter === 'pending' ? "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800" :
                                filter === 'selected' ? "bg-green-500 hover:bg-green-600 text-white" :
                                    filter === 'superLiked' ? "bg-blue-500 hover:bg-blue-600 text-white" :
                                        filter === 'maybe' ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                                            "bg-red-500 hover:bg-red-600 text-white"
                        )}
                    >
                        {filter === 'pending' ? (
                            <>
                                <Play size={16} className="mr-2" /> Resume Swiping ({filteredPhotos.length})
                            </>
                        ) : (
                            <>
                                <RotateCcw size={16} className="mr-2" /> Re-Swipe {filter === 'superLiked' ? 'Super Likes' : filter.charAt(0).toUpperCase() + filter.slice(1)} ({filteredPhotos.length})
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {filteredPhotos.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {filter === 'pending' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <p className="font-medium">
                        {filter === 'pending'
                            ? "All photos reviewed!"
                            : filter === 'all'
                                ? "No photos available"
                                : `No ${filter} photos yet`
                        }
                    </p>
                </div>
            )}

            {/* Photo Grids */}
            <div className="space-y-8">
                {/* Photo Grid Logic - Re-implementing correctly */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                    {visiblePhotos.map(photo => {
                        const status = getPhotoStatus(photo);
                        const isSource = status === 'source';
                        const isRejected = status === 'rejected';
                        const isSuperLiked = status === 'superLiked';

                        return (
                            <div
                                key={photo.id}
                                className={cn(
                                    "relative group aspect-[3/4] rounded-lg overflow-hidden",
                                    isRejected ? "ring-2 ring-red-500 bg-red-500/20" :
                                        isSuperLiked ? "ring-2 ring-blue-500 bg-blue-500/20" :
                                            "bg-gray-100 dark:bg-gray-900"
                                )}
                            >
                                <Image
                                    src={getOptimizedThumbnailUrl(photo.url)}
                                    alt={photo.name || photo.id}
                                    fill
                                    className={cn(
                                        "object-cover",
                                        isRejected && "opacity-60"
                                    )}
                                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                                />

                                {/* Status Badge */}
                                <div className={cn(
                                    "absolute top-1.5 right-1.5 p-1 rounded-full text-white z-10 shadow-lg",
                                    isSource ? "bg-gray-500" :
                                        status === 'selected' ? "bg-green-500" :
                                            status === 'superLiked' ? "bg-blue-500" :
                                                status === 'maybe' ? "bg-yellow-500" : "bg-red-500"
                                )}>
                                    {isSource && <Clock size={10} />}
                                    {status === 'selected' && <Check size={10} />}
                                    {status === 'superLiked' && <Star size={10} />}
                                    {status === 'maybe' && <HelpCircle size={10} />}
                                    {status === 'rejected' && <X size={10} />}
                                </div>

                                {/* Filename - Mobile visible */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                                    <p className="text-[10px] text-white/80 truncate">
                                        {photo.name || photo.id.slice(0, 8)}
                                    </p>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full h-7 text-[10px] border-white/30 text-white hover:bg-white/20"
                                        onClick={() => setPreviewPhoto(photo)}
                                    >
                                        <Maximize2 size={10} className="mr-1" /> View
                                    </Button>

                                    {status !== 'superLiked' && (
                                        <Button
                                            size="sm"
                                            className="w-full h-7 text-[10px] bg-blue-600 hover:bg-blue-700"
                                            onClick={() => handleMove(photo, status, 'superLiked')}
                                        >
                                            <Star size={10} className="mr-1" /> Super Like
                                        </Button>
                                    )}
                                    {status !== 'selected' && (
                                        <Button
                                            size="sm"
                                            className="w-full h-7 text-[10px] bg-green-600 hover:bg-green-700"
                                            onClick={() => handleMove(photo, status, 'selected')}
                                        >
                                            <Check size={10} className="mr-1" /> Select
                                        </Button>
                                    )}
                                    {status !== 'maybe' && (
                                        <Button
                                            size="sm"
                                            className="w-full h-7 text-[10px] bg-yellow-500 hover:bg-yellow-600"
                                            onClick={() => handleMove(photo, status, 'maybe')}
                                        >
                                            <HelpCircle size={10} className="mr-1" /> Maybe
                                        </Button>
                                    )}
                                    {status !== 'rejected' && (
                                        <Button
                                            size="sm"
                                            className="w-full h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => handleMove(photo, status, 'rejected')}
                                        >
                                            <X size={10} className="mr-1" /> Reject
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="flex justify-center pt-8">
                        <Button
                            onClick={handleLoadMore}
                            variant="outline"
                            className="h-12 px-8 rounded-full border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Load More Photos ({filteredPhotos.length - visibleCount} remaining)
                        </Button>
                    </div>
                )}
            </div>
        </div >
    );
}

