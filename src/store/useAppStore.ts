import { create } from 'zustand';

export interface Photo {
    id: string;
    url: string;
    name?: string; // Original filename
    width?: number;
    height?: number;
}

export type PhotoStatus = 'source' | 'selected' | 'maybe' | 'rejected';

interface AppState {
    // Photographer Setup
    eventName: string;
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
    selectedPhotos: Photo[];
    maybePhotos: Photo[];
    rejectedPhotos: Photo[];

    // History for Undo
    history: { photoId: string; from: PhotoStatus; to: PhotoStatus }[];

    // Actions
    setEventDetails: (details: Partial<AppState>) => void;
    initializeMockData: () => void;
    initializeRealData: (photos: Photo[], eventDetails: Partial<AppState>) => void;
    movePhoto: (photoId: string, from: PhotoStatus, to: PhotoStatus) => void;
    undoLastAction: () => void;
    resetClientState: () => void;
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

export const useAppStore = create<AppState>((set, get) => ({
    // Initial Photographer State
    eventName: '',
    driveLink: '',
    photoLimit: 50,
    whatsappNumber: '',
    logoUrl: null,
    bio: '',
    portfolio: [],
    isSetupComplete: false,

    // Initial Client State
    sourceImages: [],
    selectedPhotos: [],
    maybePhotos: [],
    rejectedPhotos: [],
    history: [],

    setEventDetails: (details) => set((state) => ({ ...state, ...details })),

    initializeMockData: () => {
        // We'll generate 30 mock photos for the deck
        const mockPhotos = generateMockPhotos(30);
        set({
            sourceImages: mockPhotos,
            selectedPhotos: [],
            maybePhotos: [],
            rejectedPhotos: [],
            history: [],
            // Mark setup as complete ONLY if we have basic event data (optional check logic can go here)
            isSetupComplete: true
        });
    },

    initializeRealData: (photos: Photo[], eventDetails: Partial<AppState>) => {
        set({
            sourceImages: photos,
            selectedPhotos: [],
            maybePhotos: [],
            rejectedPhotos: [],
            history: [],
            isSetupComplete: true,
            ...eventDetails
        });
    },

    movePhoto: (photoId, from, to) => {
        set((state) => {
            // Helper to find and remove photo from a list
            const getList = (status: PhotoStatus) => {
                switch (status) {
                    case 'source': return state.sourceImages;
                    case 'selected': return state.selectedPhotos;
                    case 'maybe': return state.maybePhotos;
                    case 'rejected': return state.rejectedPhotos;
                    default: return [];
                }
            };

            const sourceList = getList(from);
            const photo = sourceList.find(p => p.id === photoId);

            if (!photo) return state; // Should not happen

            // Remove from 'from' list
            const newSourceList = sourceList.filter(p => p.id !== photoId);

            // Add to 'to' list
            // Special case handling for 'source' to ensure correct typing
            let newState: Partial<AppState> = {};

            if (to === 'source') {
                newState = {
                    sourceImages: [photo, ...state.sourceImages], // returning to source goes to top of deck? Or bottom? standard is usually "back to deck"
                };
            } else {
                const targetList = state[`${to}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'];
                newState = {
                    [`${to}Photos`]: [photo, ...targetList]
                };
            }

            // Update source list
            if (from === 'source') {
                newState.sourceImages = newSourceList;
            } else {
                newState[`${from}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'] = newSourceList;
            }

            return {
                ...newState,
                history: [...state.history, { photoId, from, to }]
            };
        });
    },

    undoLastAction: () => {
        const state = get();
        if (state.history.length === 0) return;

        const lastAction = state.history[state.history.length - 1];
        const { photoId, from, to } = lastAction;

        // Reverse the move: move from 'to' back to 'from'
        // We need to call movePhoto but WITHOUT adding to history, or just manually manipulate state + pop history.
        // Manual manipulation is safer to avoid infinite loop or messy history.

        set((currentState) => {
            const getList = (status: PhotoStatus) => {
                switch (status) {
                    case 'source': return currentState.sourceImages;
                    case 'selected': return currentState.selectedPhotos;
                    case 'maybe': return currentState.maybePhotos;
                    case 'rejected': return currentState.rejectedPhotos;
                    default: return [];
                }
            };

            const currentList = getList(to); // It is currently in 'to'
            const photo = currentList.find(p => p.id === photoId);

            if (!photo) return { history: currentState.history.slice(0, -1) }; // Error fallback

            const newCurrentList = currentList.filter(p => p.id !== photoId);
            const targetOriginalList = getList(from);

            // Construct updates
            const updates: Partial<AppState> = {
                history: currentState.history.slice(0, -1)
            };

            // Update list we are taking FROM (which was the destination)
            if (to === 'source') updates.sourceImages = newCurrentList;
            else updates[`${to}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'] = newCurrentList;

            // Update list we are returning TO (which was the origin)
            // If returning to source, usually we want it back at the START of the deck if it was just swiped
            if (from === 'source') updates.sourceImages = [photo, ...targetOriginalList];
            else updates[`${from}Photos` as 'selectedPhotos' | 'maybePhotos' | 'rejectedPhotos'] = [photo, ...targetOriginalList];

            return updates;
        });
    },

    resetClientState: () => set({
        sourceImages: [],
        selectedPhotos: [],
        maybePhotos: [],
        rejectedPhotos: [],
        history: [],
        isSetupComplete: false
    })
}));
