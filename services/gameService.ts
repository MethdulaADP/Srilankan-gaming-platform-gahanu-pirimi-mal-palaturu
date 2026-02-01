import { ref, set, onValue, get, child, update } from "firebase/database";
import { database } from "../src/firebase";
import { GameState, SpyGameState } from "../types";

export const GameService = {
    // Generic subscription
    subscribeToRoom: (roomCode: string, callback: (data: any) => void) => {
        const roomRef = ref(database, `rooms/${roomCode}`);
        return onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                callback(data);
            }
        });
    },

    // Save state (Generic)
    updateGameState: async (roomCode: string, state: GameState | SpyGameState | any) => {
        const roomRef = ref(database, `rooms/${roomCode}`);
        await set(roomRef, state);
    },

    // Check if room exists
    checkRoomExists: async (roomCode: string): Promise<boolean> => {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `rooms/${roomCode}`));
        return snapshot.exists();
    },

    // Get initial state
    getRoomState: async (roomCode: string): Promise<any> => {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `rooms/${roomCode}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            // FIREBASE FIX: Sanitize initial fetch
            if (data.players && !Array.isArray(data.players)) {
                data.players = Object.values(data.players).filter(Boolean);
            }
            if (data.messages && !Array.isArray(data.messages)) {
                data.messages = Object.values(data.messages).filter(Boolean);
            }
            return data;
        }
        return null;
    },

    // Update specific path (for concurrency)
    updatePath: async (roomCode: string, path: string, value: any) => {
        const roomRef = ref(database, `rooms/${roomCode}/${path}`);
        await set(roomRef, value);
    },

    // Patch state (Partial update)
    patchGameState: async (roomCode: string, updates: any) => {
        const roomRef = ref(database, `rooms/${roomCode}`);
        await update(roomRef, updates);
    }
};
