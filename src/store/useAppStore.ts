import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Photo {
    id: string;
    url: string;
    name?: string; // Original filename
    width?: number;
    height?: number;
}

export type PhotoStatus = 'source' | 'selected' | 'maybe' | 'rejected' | 'superLiked';

interface AppState {
    // Photographer Setup
    eventName: string;
    eventSlug: string;
    driveLink: string;
    photoLimit: number;
    whatsappNumber: string;

    logoUrl: string | null;
    bio: string;
    portfolio: string[]; // ObjectURLs

    // App Logic
    isSetupComplete: boolean;

    // Client Actions
    sourceImages: Photo[]; // The deck to swipe
    stashedImages: Photo[]; // Temporary storage for sourceImages when re-swiping a specific category
    selectedPhotos: Photo[];
    maybePhotos: Photo[];
    rejectedPhotos: Photo[];
    superLikedPhotos: Photo[]; // New: Super Like category

    // History for Undo
    history: { photoId: string; from: PhotoStatus; to: PhotoStatus }[];

    // Actions
    setEventDetails: (details: Partial<AppState>) => void;
    initializeMockData: () => void;
    initializeRealData: (photos: Photo[], eventDetails: Partial<AppState>) => void;
    initializeWithCache: (photos: Photo[], eventDetails: Partial<AppState>) => void;
    movePhoto: (photoId: string, from: PhotoStatus, to: PhotoStatus) => void;
    undoLastAction: () => void;

    resetClientState: () => void;
    restoreStashedImages: () => void; // New helper

    // Re-swipe Feature
    restartingFrom: PhotoStatus | null;
    restartCategory: (category: PhotoStatus) => void;
}

// Mock Data Generator
const generateMockPhotos = (count: number): Photo[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `photo-${i + 1}`,
        url: `https://picsum.photos/seed/${i + 100}/800/1200`, // Portrait oriented mock images
        width: 800,
        height: 1200,
    }));
};

// Get saved selections from localStorage for specific event
const getSavedSelections = (eventSlug: string) => {
    if (typeof window === 'undefined') return null;
    try {
        const saved = localStorage.getItem(`selections-${eventSlug}`);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load saved selections:', e);
    }
    return null;
};

// Save selections to localStorage
const saveSelections = (eventSlug: string, data: {
    selectedPhotos: Photo[];
    maybePhotos: Photo[];
    rejectedPhotos: Photo[];
    superLikedPhotos: Photo[];
    sourceImages: Photo[];
}) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`selections-${eventSlug}`, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save selections:', e);
    }
};

export const useAppStore = create<AppState>()((set, get) => ({
    // ... (Initial Setup State remains same) ...
    // Initial Photographer State
    eventName: '',
    eventSlug: '',
    driveLink: '',
    photoLimit: 50,
    whatsappNumber: '',
    logoUrl: null,
    bio: '',
    portfolio: [],
    isSetupComplete: false,

    // Initial Client State
    sourceImages: [],
    stashedImages: [],
    selectedPhotos: [],
    maybePhotos: [],
    rejectedPhotos: [],
    superLikedPhotos: [],
    history: [],

    // Re-swipe Feature
    restartingFrom: null,

    setEventDetails: (details) => set((state) => ({ ...state, ...details })),

    initializeMockData: () => {
        const mockPhotos = generateMockPhotos(30);
        set({
            sourceImages: mockPhotos,
            stashedImages: [],
            selectedPhotos: [],
            maybePhotos: [],
            rejectedPhotos: [],
            superLikedPhotos: [],
            history: [],
            isSetupComplete: true,
            restartingFrom: null
        });
    },

    initializeRealData: (photos: Photo[], eventDetails: Partial<AppState>) => {
        set({
            sourceImages: photos,
            stashedImages: [],
            selectedPhotos: [],
            maybePhotos: [],
            rejectedPhotos: [],
            superLikedPhotos: [],
            history: [],
            isSetupComplete: true,
            restartingFrom: null,
            ...eventDetails
        });
    },

    // Initialize with cached selections if available
    initializeWithCache: (photos: Photo[], eventDetails: Partial<AppState>) => {
        const slug = eventDetails.eventSlug || '';
        const saved = getSavedSelections(slug);

        if (saved) {
            // Restore from cache, but filter to only include photos that exist
            const photoIds = new Set(photos.map(p => p.id));
            const validSelected = (saved.selectedPhotos || []).filter((p: Photo) => photoIds.has(p.id));
            const validMaybe = (saved.maybePhotos || []).filter((p: Photo) => photoIds.has(p.id));
            const validRejected = (saved.rejectedPhotos || []).filter((p: Photo) => photoIds.has(p.id));
            const validSuperLiked = (saved.superLikedPhotos || []).filter((p: Photo) => photoIds.has(p.id));

            // Get IDs of already categorized photos
            const categorizedIds = new Set([
                ...validSelected.map((p: Photo) => p.id),
                ...validMaybe.map((p: Photo) => p.id),
                ...validRejected.map((p: Photo) => p.id),
                ...validSuperLiked.map((p: Photo) => p.id)
            ]);

            // Source is all photos not yet categorized
            const remainingSource = photos.filter(p => !categorizedIds.has(p.id));

            set({
                sourceImages: remainingSource,
                stashedImages: [],
                selectedPhotos: validSelected,
                maybePhotos: validMaybe,
                rejectedPhotos: validRejected,
                superLikedPhotos: validSuperLiked,
                history: [],
                isSetupComplete: true,
                restartingFrom: null,
                ...eventDetails
            });
        } else {
            // No cache, initialize fresh
            set({
                sourceImages: photos,
                stashedImages: [],
                selectedPhotos: [],
                maybePhotos: [],
                rejectedPhotos: [],
                superLikedPhotos: [],
                history: [],
                isSetupComplete: true,
                restartingFrom: null,
                ...eventDetails
            });
        }
    },

    movePhoto: (photoId, from, to) => {
        set((state) => {
            const getList = (status: PhotoStatus) => {
                switch (status) {
                    case 'source': return state.sourceImages;
                    case 'selected': return state.selectedPhotos;
                    case 'maybe': return state.maybePhotos;
                    case 'rejected': return state.rejectedPhotos;
                    case 'superLiked': return state.superLikedPhotos;
                    default: return [];
                }
            };

            const sourceList = getList(from);
            const photo = sourceList.find(p => p.id === photoId);

            if (!photo) return state;

            const newSourceList = sourceList.filter(p => p.id !== photoId);

            let newState: Partial<AppState> = {};

            if (to === 'source') {
                newState = {
                    sourceImages: [photo, ...state.sourceImages],
                };
            } else if (to === 'superLiked') {
                newState = {
                    superLikedPhotos: [photo, ...state.superLikedPhotos]
                };
            } else {
                const targetList = state[`${to}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'];
                newState = {
                    [`${to}Photos`]: [photo, ...targetList]
                };
            }

            if (from === 'source') {
                newState.sourceImages = newSourceList;
            } else if (from === 'superLiked') {
                newState.superLikedPhotos = newSourceList;
            } else {
                newState[`${from}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'] = newSourceList;
            }

            // Check if we emptied source during a re-swipe session
            const isEmptied = (from === 'source' && newSourceList.length === 0);

            const finalState = {
                ...newState,
                history: [...state.history, { photoId, from, to }]
            };

            // Save to localStorage after move
            const eventSlug = state.eventSlug;
            if (eventSlug) {
                setTimeout(() => {
                    const currentState = get();
                    saveSelections(eventSlug, {
                        selectedPhotos: currentState.selectedPhotos,
                        maybePhotos: currentState.maybePhotos,
                        rejectedPhotos: currentState.rejectedPhotos,
                        superLikedPhotos: currentState.superLikedPhotos,
                        sourceImages: currentState.sourceImages
                    });
                }, 0);
            }

            return finalState;
        });

        // Auto-restore stashed images if deck is empty after move
        const updatedState = get();
        if (updatedState.sourceImages.length === 0 && updatedState.restartingFrom !== null) {
            updatedState.restoreStashedImages();
        }
    },

    undoLastAction: () => {
        const state = get();
        if (state.history.length === 0) return;

        const lastAction = state.history[state.history.length - 1];
        const { photoId, from, to } = lastAction;

        set((currentState) => {
            const getList = (status: PhotoStatus) => {
                switch (status) {
                    case 'source': return currentState.sourceImages;
                    case 'selected': return currentState.selectedPhotos;
                    case 'maybe': return currentState.maybePhotos;
                    case 'rejected': return currentState.rejectedPhotos;
                    case 'superLiked': return currentState.superLikedPhotos;
                    default: return [];
                }
            };

            const currentList = getList(to);
            const photo = currentList.find(p => p.id === photoId);

            if (!photo) return { history: currentState.history.slice(0, -1) };

            const newCurrentList = currentList.filter(p => p.id !== photoId);
            const targetOriginalList = getList(from);

            const updates: Partial<AppState> = {
                history: currentState.history.slice(0, -1)
            };

            if (to === 'source') updates.sourceImages = newCurrentList;
            else if (to === 'superLiked') updates.superLikedPhotos = newCurrentList;
            else updates[`${to}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'] = newCurrentList;

            if (from === 'source') updates.sourceImages = [photo, ...targetOriginalList];
            else if (from === 'superLiked') updates.superLikedPhotos = [photo, ...targetOriginalList];
            else updates[`${from}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'] = [photo, ...targetOriginalList];

            // Save after undo
            const eventSlug = currentState.eventSlug;
            if (eventSlug) {
                setTimeout(() => {
                    const latestState = get();
                    saveSelections(eventSlug, {
                        selectedPhotos: latestState.selectedPhotos,
                        maybePhotos: latestState.maybePhotos,
                        rejectedPhotos: latestState.rejectedPhotos,
                        superLikedPhotos: latestState.superLikedPhotos,
                        sourceImages: latestState.sourceImages
                    });
                }, 0);
            }

            return updates;
        });
    },

    restartCategory: (category: PhotoStatus) => {
        const state = get();
        let photosToRestart: Photo[] = [];
        let newSelected = state.selectedPhotos;
        let newMaybe = state.maybePhotos;
        let newRejected = state.rejectedPhotos;
        let newSuperLiked = state.superLikedPhotos;

        // If we are already in a restart session, first restore the stashed images to ensure we don't lose anything
        // Or should we just combine?
        // Let's safe-guard: if restartingFrom is not null, restore stash first.
        let currentSource = state.sourceImages;
        let currentStash = state.stashedImages;

        if (state.restartingFrom !== null) {
            // We were already re-swiping.
            // If we switch categories mid-way, we should put current source back to original stashed?
            // This gets complicated. 
            // Better behavior: Dump current source back to stashed, then proceed.
            currentStash = [...currentSource, ...currentStash];
            currentSource = [];
        } else {
            // New session: Stash the current source (Not Reviewed)
            currentStash = [...state.sourceImages];
        }

        // Extract photos based on category to restart
        if (category === 'selected') {
            photosToRestart = [...state.selectedPhotos];
            newSelected = [];
        } else if (category === 'maybe') {
            photosToRestart = [...state.maybePhotos];
            newMaybe = [];
        } else if (category === 'rejected') {
            photosToRestart = [...state.rejectedPhotos];
            newRejected = [];
        } else if (category === 'superLiked') {
            photosToRestart = [...state.superLikedPhotos];
            newSuperLiked = [];
        }

        if (photosToRestart.length === 0) return;

        set({
            sourceImages: photosToRestart, // Only the category photos
            stashedImages: currentStash,   // The previous "Not Reviewed" pile
            selectedPhotos: newSelected,
            maybePhotos: newMaybe,
            rejectedPhotos: newRejected,
            superLikedPhotos: newSuperLiked,
            restartingFrom: category,
        });

        // Save
        const eventSlug = state.eventSlug;
        if (eventSlug) {
            saveSelections(eventSlug, {
                selectedPhotos: newSelected,
                maybePhotos: newMaybe,
                rejectedPhotos: newRejected,
                superLikedPhotos: newSuperLiked,
                sourceImages: photosToRestart // We only save what's active usually? No, stash implies volatile state.
                // NOTE: Stashing might affect persistence if user reloads.
                // Ideally we persist stashedImages too.
            });
        }
    },

    restoreStashedImages: () => {
        const state = get();
        if (state.stashedImages.length === 0) {
            set({ restartingFrom: null });
            return;
        }

        const restoredSource = [...state.sourceImages, ...state.stashedImages];

        set({
            sourceImages: restoredSource,
            stashedImages: [],
            restartingFrom: null
        });

        // Save
        const eventSlug = state.eventSlug;
        if (eventSlug) {
            const latestState = get(); // grab fresh selected/etc
            saveSelections(eventSlug, {
                selectedPhotos: latestState.selectedPhotos,
                maybePhotos: latestState.maybePhotos,
                rejectedPhotos: latestState.rejectedPhotos,
                superLikedPhotos: latestState.superLikedPhotos,
                sourceImages: restoredSource
            });
        }
    },

    resetClientState: () => set({
        sourceImages: [],
        stashedImages: [],
        selectedPhotos: [],
        maybePhotos: [],
        rejectedPhotos: [],
        superLikedPhotos: [],
        history: [],
        isSetupComplete: false,
        restartingFrom: null
    })
}));
