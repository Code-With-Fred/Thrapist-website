import { config } from '../config/index.js';

const DAILY_API_BASE = 'https://api.daily.co/v1';

interface DailyRoom {
  id: string;
  name: string;
  url: string;
}

interface DailyToken {
  token: string;
}

export const dailyService = {
  async createRoom(roomName: string, expiresAt: Date): Promise<DailyRoom> {
    const response = await fetch(`${DAILY_API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.daily.apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          exp: Math.floor(expiresAt.getTime() / 1000),
          max_participants: 2,
          enable_recording: false,
          enable_chat: true,
        },
      }),
    });
    if (!response.ok) throw new Error('Failed to create Daily.co room');
    return response.json() as Promise<DailyRoom>;
  },

  async createToken(roomName: string, userId: string, isOwner: boolean): Promise<string> {
    const response = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.daily.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: userId,
          is_owner: isOwner,
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      }),
    });
    if (!response.ok) throw new Error('Failed to create meeting token');
    const data = await response.json() as DailyToken;
    return data.token;
  },

  async deleteRoom(roomName: string): Promise<void> {
    await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${config.daily.apiKey}` },
    });
  },
};
