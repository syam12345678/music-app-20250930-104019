import { DurableObject } from "cloudflare:workers";
import type { Room, User, Song, ChatMessage, AddSongPayload } from '@shared/types';
const INACTIVE_THRESHOLD = 30000; // 30 seconds
const MAX_HISTORY_LENGTH = 20;
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    private async getRoom(code: string): Promise<Room | undefined> {
        return this.ctx.storage.get<Room>(`room_${code}`);
    }
    private async saveRoom(code: string, room: Room): Promise<void> {
        room.version = (room.version || 0) + 1;
        await this.ctx.storage.put(`room_${code}`, room);
    }
    async createRoom(): Promise<Room> {
        let roomCode: string;
        let existingRoom: Room | undefined;
        let attempts = 0;
        do {
            roomCode = Math.floor(1000 + Math.random() * 9000).toString();
            existingRoom = await this.getRoom(roomCode);
            attempts++;
        } while (existingRoom && attempts < 100);
        if (existingRoom) {
            throw new Error("Failed to generate a unique room code.");
        }
        const newRoom: Room = {
            code: roomCode,
            users: [],
            queue: [],
            chatHistory: [],
            playHistory: [],
            nowPlaying: undefined,
            nowPlayingStartedAt: undefined,
            version: 1,
        };
        await this.ctx.storage.put(`room_${roomCode}`, newRoom); // Use put directly to avoid version increment on creation
        return newRoom;
    }
    async fetchRoom(code: string): Promise<Room | null> {
        const room = await this.getRoom(code);
        if (room) {
            const activeUsers = room.users.filter(u => u.lastHeartbeat && (Date.now() - u.lastHeartbeat < INACTIVE_THRESHOLD));
            if (activeUsers.length !== room.users.length) {
                room.users = activeUsers;
                await this.saveRoom(code, room);
            }
        }
        return room || null;
    }
    async addUser(roomCode: string, user: User): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        const userIndex = room.users.findIndex(u => u.id === user.id);
        const now = Date.now();
        if (userIndex > -1) {
            room.users[userIndex].lastHeartbeat = now;
        } else {
            room.users.push({ ...user, lastHeartbeat: now });
        }
        await this.saveRoom(roomCode, room);
        return room;
    }
    async userHeartbeat(roomCode: string, userId: string): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        const user = room.users.find(u => u.id === userId);
        if (user) {
            user.lastHeartbeat = Date.now();
            await this.saveRoom(roomCode, room);
        }
        return room;
    }
    async playNextSong(roomCode: string): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        // Add current song to history if it exists
        if (room.nowPlaying) {
            room.playHistory = room.playHistory || [];
            room.playHistory.push(room.nowPlaying);
            if (room.playHistory.length > MAX_HISTORY_LENGTH) {
                room.playHistory.shift();
            }
        }
        if (room.queue.length > 0) {
            const nextSong = room.queue.shift();
            room.nowPlaying = nextSong;
            room.nowPlayingStartedAt = Date.now();
        } else {
            room.nowPlaying = undefined;
            room.nowPlayingStartedAt = undefined;
        }
        await this.saveRoom(roomCode, room);
        return room;
    }
    async playPreviousSong(roomCode: string): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room || !room.playHistory || room.playHistory.length === 0) {
            return room || null;
        }
        // Put current song back at the start of the queue
        if (room.nowPlaying) {
            room.queue.unshift(room.nowPlaying);
        }
        // Get the previous song from history
        const previousSong = room.playHistory.pop();
        room.nowPlaying = previousSong;
        room.nowPlayingStartedAt = Date.now();
        await this.saveRoom(roomCode, room);
        return room;
    }
    async addSong(roomCode: string, songData: AddSongPayload): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        const newSong: Song = {
            ...songData,
            id: crypto.randomUUID(),
            votes: 1,
            tags: songData.tags || [],
        };
        room.queue.push(newSong);
        if (!room.nowPlaying) {
            return this.playNextSong(roomCode);
        }
        await this.saveRoom(roomCode, room);
        return room;
    }
    async voteForSong(roomCode: string, songId: string): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        const song = room.queue.find(s => s.id === songId);
        if (song) {
            song.votes++;
            room.queue.sort((a, b) => b.votes - a.votes);
        }
        await this.saveRoom(roomCode, room);
        return room;
    }
    async downvoteSong(roomCode: string, songId: string): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        const song = room.queue.find(s => s.id === songId);
        if (song) {
            song.votes--;
            room.queue.sort((a, b) => b.votes - a.votes);
        }
        await this.saveRoom(roomCode, room);
        return room;
    }
    async addChatMessage(roomCode: string, text: string, user: User): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        const newMessage: ChatMessage = {
            id: crypto.randomUUID(),
            user,
            text,
            timestamp: Date.now(),
        };
        room.chatHistory.push(newMessage);
        if (room.chatHistory.length > 50) {
            room.chatHistory.shift();
        }
        await this.saveRoom(roomCode, room);
        return room;
    }
    async reactToMessage(roomCode: string, messageId: string, emoji: string, user: User): Promise<Room | null> {
        const room = await this.getRoom(roomCode);
        if (!room) return null;
        const message = room.chatHistory.find(m => m.id === messageId);
        if (!message) return room;
        message.reactions = message.reactions || {};
        message.reactions[emoji] = message.reactions[emoji] || [];
        const userIndex = message.reactions[emoji].indexOf(user.id);
        if (userIndex > -1) {
            message.reactions[emoji].splice(userIndex, 1);
            if (message.reactions[emoji].length === 0) {
                delete message.reactions[emoji];
            }
        } else {
            message.reactions[emoji].push(user.id);
        }
        await this.saveRoom(roomCode, room);
        return room;
    }
}