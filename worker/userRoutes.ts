import { Hono } from "hono";
import { Env } from './core-utils';
import type { Room, ApiResponse, AddSongPayload, User, SearchResultSong } from '@shared/types';
// Using royalty-free music from Pixabay with unique URLs for each track
const MOCK_SEARCH_RESULTS: SearchResultSong[] = [
    // English Recommendations
    { title: 'Perfect', artist: 'Ed Sheeran', albumArtUrl: 'https://picsum.photos/seed/perfect/100', url: 'https://cdn.pixabay.com/audio/2022/11/23/audio_91b173744b.mp3', tags: ['recommendation', 'love', 'pop', 'chill'], lyrics: "I found a love for me\nDarling, just dive right in and follow my lead...", metadata: { Genre: 'Pop', Released: '2017', BPM: '95' } },
    { title: 'All of Me', artist: 'John Legend', albumArtUrl: 'https://picsum.photos/seed/allofme/100', url: 'https://cdn.pixabay.com/audio/2023/02/03/audio_51c72dce30.mp3', tags: ['recommendation', 'love', 'pop', 'chill'], lyrics: "'Cause all of me\nLoves all of you\nLove your curves and all your edges...", metadata: { Genre: 'R&B', Released: '2013' } },
    { title: 'Thinking Out Loud', artist: 'Ed Sheeran', albumArtUrl: 'https://picsum.photos/seed/thinkingoutloud/100', url: 'https://cdn.pixabay.com/audio/2022/08/03/audio_5939059b9a.mp3', tags: ['love', 'pop', 'chill'] },
    { title: 'A Thousand Years', artist: 'Christina Perri', albumArtUrl: 'https://picsum.photos/seed/thousandyears/100', url: 'https://cdn.pixabay.com/audio/2022/05/23/audio_755d4f5873.mp3', tags: ['love', 'pop'] },
    { title: 'I Will Always Love You', artist: 'Whitney Houston', albumArtUrl: 'https://picsum.photos/seed/iwillalwaysloveyou/100', url: 'https://cdn.pixabay.com/audio/2022/08/27/audio_528f2b572a.mp3', tags: ['love', 'pop'] },
    { title: 'Blinding Lights', artist: 'The Weeknd', albumArtUrl: 'https://picsum.photos/seed/blindinglights/100', url: 'https://cdn.pixabay.com/audio/2023/09/10/audio_07918f2292.mp3', tags: ['pop', 'upbeat', 'electronic'], lyrics: "I've been tryna call\nI've been on my own for long enough\nMaybe you can show me how to love, maybe", metadata: { Genre: 'Synth-pop', Released: '2019', BPM: '171' } },
    { title: 'Shape of You', artist: 'Ed Sheeran', albumArtUrl: 'https://picsum.photos/seed/shapeofyou/100', url: 'https://cdn.pixabay.com/audio/2023/05/18/audio_1e363a5770.mp3', tags: ['pop', 'upbeat'] },
    { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', albumArtUrl: 'https://picsum.photos/seed/uptownfunk/100', url: 'https://cdn.pixabay.com/audio/2023/04/24/audio_319b097fde.mp3', tags: ['funk', 'upbeat'] },
    { title: 'Bohemian Rhapsody', artist: 'Queen', albumArtUrl: 'https://picsum.photos/seed/bohemian/100', url: 'https://cdn.pixabay.com/audio/2022/01/27/audio_84283c524c.mp3', tags: ['rock', 'classic'], lyrics: "Is this the real life?\nIs this just fantasy?\nCaught in a landslide,\nNo escape from reality.", metadata: { Genre: 'Rock', Released: '1975' } },
    { title: 'Hotel California', artist: 'Eagles', albumArtUrl: 'https://picsum.photos/seed/hotelcalifornia/100', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde64cae0.mp3', tags: ['rock', 'classic'] },
    // Hindi Recommendations
    { title: 'Tum Hi Ho', artist: 'Arijit Singh', albumArtUrl: 'https://picsum.photos/seed/tumhiho/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_853b361429.mp3', tags: ['recommendation', 'love', 'hindi', 'chill'], lyrics: "Hum tere bin ab reh nahi sakte\nTere bina kya wajood mera...", metadata: { Movie: 'Aashiqui 2', Released: '2013' } },
    { title: 'Channa Mereya', artist: 'Arijit Singh', albumArtUrl: 'https://picsum.photos/seed/channa/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_1c7d283323.mp3', tags: ['recommendation', 'love', 'hindi'] },
    { title: 'Kabira', artist: 'Tochi Raina, Rekha Bhardwaj', albumArtUrl: 'https://picsum.photos/seed/kabira/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_d12a2a69b7.mp3', tags: ['love', 'hindi'] },
    { title: 'Raabta', artist: 'Arijit Singh', albumArtUrl: 'https://picsum.photos/seed/raabta/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_b544617154.mp3', tags: ['love', 'hindi', 'pop'] },
    { title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam', albumArtUrl: 'https://picsum.photos/seed/kalhonaho/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_031a535071.mp3', tags: ['love', 'hindi'] },
    { title: 'Ghungroo', artist: 'Arijit Singh, Shilpa Rao', albumArtUrl: 'https://picsum.photos/seed/ghungroo/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_352f0a285d.mp3', tags: ['hindi', 'upbeat'] },
    { title: 'Jai Ho', artist: 'A. R. Rahman', albumArtUrl: 'https://picsum.photos/seed/jaiho/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_331e640e79.mp3', tags: ['hindi', 'upbeat'] },
    { title: 'Dil Chahta Hai', artist: 'Shankar Mahadevan', albumArtUrl: 'https://picsum.photos/seed/dilchahtahai/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_941b32314a.mp3', tags: ['hindi', 'pop'] },
    { title: 'Maa Tujhe Salaam', artist: 'A. R. Rahman', albumArtUrl: 'https://picsum.photos/seed/maasalaam/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_05090a3073.mp3', tags: ['hindi', 'patriotic'] },
    // Telugu Recommendations
    { title: 'Samajavaragamana', artist: 'Sid Sriram', albumArtUrl: 'https://picsum.photos/seed/samajavaragamana/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_47694b307e.mp3', tags: ['recommendation', 'love', 'telugu', 'chill'], lyrics: "Nee kaallani pattuku vadalanannavi\nChoode naa kallu...", metadata: { Movie: 'Ala Vaikunthapurramuloo', Released: '2019' } },
    { title: 'ButtaBomma', artist: 'Armaan Malik', albumArtUrl: 'https://picsum.photos/seed/buttabomma/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_651ce5611a.mp3', tags: ['recommendation', 'love', 'telugu', 'upbeat'], lyrics: "Intha adanga gottu de\nNannu chuttu allukunnave...", metadata: { Movie: 'Ala Vaikunthapurramuloo', Released: '2019' } },
    { title: 'Inkem Inkem Inkem Kaavaale', artist: 'Sid Sriram', albumArtUrl: 'https://picsum.photos/seed/inkem/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_5909e29691.mp3', tags: ['love', 'telugu', 'chill'] },
    { title: 'Hrudayam Ekkadunnadi', artist: 'Sid Sriram', albumArtUrl: 'https://picsum.photos/seed/hrudayam/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_23b331a039.mp3', tags: ['love', 'telugu'] },
    { title: 'Nee Kannu Neeli Samudram', artist: 'Javed Ali', albumArtUrl: 'https://picsum.photos/seed/neekannu/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_43a3a8397a.mp3', tags: ['love', 'telugu'] },
    { title: 'Ramuloo Ramulaa', artist: 'Anurag Kulkarni, Mangli', albumArtUrl: 'https://picsum.photos/seed/ramuloo/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_14b06d4f13.mp3', tags: ['telugu', 'upbeat'] },
    { title: 'Saahore Baahubali', artist: 'Daler Mehndi, M. M. Keeravani', albumArtUrl: 'https://picsum.photos/seed/saahore/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_915a636657.mp3', tags: ['telugu', 'epic'] },
    { title: 'Naatu Naatu', artist: 'Rahul Sipligunj, Kaala Bhairava', albumArtUrl: 'https://picsum.photos/seed/naatu/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_4101c72740.mp3', tags: ['telugu', 'upbeat', 'dance'] },
    { title: 'Ammadu Lets Do Kummudu', artist: 'Devi Sri Prasad', albumArtUrl: 'https://picsum.photos/seed/kummudu/100', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_6a3493110a.mp3', tags: ['telugu', 'upbeat', 'dance'] },
];
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const getDO = (c: any) => c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    // Music Search (Mock)
    app.get('/api/music/search', async (c) => {
        const { query } = c.req.query();
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!query) {
            return c.json({ success: true, data: MOCK_SEARCH_RESULTS } satisfies ApiResponse<SearchResultSong[]>);
        }
        const filteredResults = MOCK_SEARCH_RESULTS.filter(
            song => song.title.toLowerCase().includes(query.toLowerCase()) ||
                    song.artist.toLowerCase().includes(query.toLowerCase())
        );
        return c.json({ success: true, data: filteredResults } satisfies ApiResponse<SearchResultSong[]>);
    });
    // Create a new room
    app.post('/api/rooms', async (c) => {
        try {
            const newRoom = await getDO(c).createRoom();
            return c.json({ success: true, data: newRoom } satisfies ApiResponse<Room>);
        } catch (error) {
            console.error("Failed to create room:", error);
            return c.json({ success: false, error: "Could not create a room. Please try again." }, 500);
        }
    });
    // Get an existing room's data
    app.get('/api/rooms/:code', async (c) => {
        const { code } = c.req.param();
        if (!code || !/^\d{4}$/.test(code)) {
            return c.json({ success: false, error: "Invalid room code format." }, 400);
        }
        const room = await getDO(c).fetchRoom(code);
        if (!room) {
            return c.json({ success: false, error: "Room not found." }, 404);
        }
        return c.json({ success: true, data: room } satisfies ApiResponse<Room>);
    });
    // Get room version
    app.get('/api/rooms/:code/version', async (c) => {
        const { code } = c.req.param();
        const room = await getDO(c).fetchRoom(code);
        if (!room) return c.json({ success: false, error: "Room not found." }, 404);
        return c.json({ success: true, data: { version: room.version } } satisfies ApiResponse<{ version: number | undefined }>);
    });
    // User heartbeat
    app.post('/api/rooms/:code/heartbeat', async (c) => {
        const { code } = c.req.param();
        const { userId } = await c.req.json<{ userId: string }>();
        if (!userId) return c.json({ success: false, error: "User ID is required." }, 400);
        await getDO(c).userHeartbeat(code, userId);
        return c.json({ success: true });
    });
    // Add a user to a room
    app.post('/api/rooms/:code/users', async (c) => {
        const { code } = c.req.param();
        const user = await c.req.json<User>();
        const updatedRoom = await getDO(c).addUser(code, user);
        if (!updatedRoom) return c.json({ success: false, error: "Room not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
    // Play the next song
    app.post('/api/rooms/:code/playback/next', async (c) => {
        const { code } = c.req.param();
        const updatedRoom = await getDO(c).playNextSong(code);
        if (!updatedRoom) return c.json({ success: false, error: "Room not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
    // Play the previous song
    app.post('/api/rooms/:code/playback/previous', async (c) => {
        const { code } = c.req.param();
        const updatedRoom = await getDO(c).playPreviousSong(code);
        if (!updatedRoom) return c.json({ success: false, error: "Room not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
    // Add a song to the queue
    app.post('/api/rooms/:code/queue', async (c) => {
        const { code } = c.req.param();
        const songData = await c.req.json<AddSongPayload>();
        const updatedRoom = await getDO(c).addSong(code, songData);
        if (!updatedRoom) return c.json({ success: false, error: "Room not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
    // Vote for a song
    app.post('/api/rooms/:code/queue/:songId/vote', async (c) => {
        const { code, songId } = c.req.param();
        const updatedRoom = await getDO(c).voteForSong(code, songId);
        if (!updatedRoom) return c.json({ success: false, error: "Room or song not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
    // Downvote a song
    app.post('/api/rooms/:code/queue/:songId/downvote', async (c) => {
        const { code, songId } = c.req.param();
        const updatedRoom = await getDO(c).downvoteSong(code, songId);
        if (!updatedRoom) return c.json({ success: false, error: "Room or song not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
    // Add a chat message
    app.post('/api/rooms/:code/chat', async (c) => {
        const { code } = c.req.param();
        const { text, user } = await c.req.json<{ text: string; user: User }>();
        const updatedRoom = await getDO(c).addChatMessage(code, text, user);
        if (!updatedRoom) return c.json({ success: false, error: "Room not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
    // React to a chat message
    app.post('/api/rooms/:code/chat/:messageId/react', async (c) => {
        const { code, messageId } = c.req.param();
        const { emoji, user } = await c.req.json<{ emoji: string; user: User }>();
        const updatedRoom = await getDO(c).reactToMessage(code, messageId, emoji, user);
        if (!updatedRoom) return c.json({ success: false, error: "Room not found." }, 404);
        return c.json({ success: true, data: updatedRoom } satisfies ApiResponse<Room>);
    });
}