import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultData from '../data/soccer_team.json';

export interface Team {
  name: string;
  players: string[];
  color: string;
}

export interface Player {
  tuesday_games: number;
  thursday_games: number;
  saturday_games: number;
  total_games: number;
  rating: number;
  position: string;
  past_teams: string[];
}

export interface Game {
  date: string;
  day_of_week: string;
  players: string[];
  teams?: Team[];
  winner?: string;
}

export interface TeamData {
  games: Game[];
  players: Record<string, Player>;
}

const STORAGE_KEY = '@soccer_team_data';

export const saveTeamData = async (data: TeamData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

export const loadTeamData = async (): Promise<TeamData> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with default data from JSON file
    const initialData = defaultData as TeamData;
    await saveTeamData(initialData);
    return initialData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const addGame = async (game: Game) => {
  try {
    const data = await loadTeamData();
    data.games.unshift(game);
    
    // Update player statistics
    game.players.forEach(playerName => {
      if (!data.players[playerName]) {
        data.players[playerName] = {
          tuesday_games: 0,
          thursday_games: 0,
          saturday_games: 0,
          total_games: 0,
          rating: 3.0,
          position: 'Both',
          past_teams: []
        };
      }
      
      const player = data.players[playerName];
      switch (game.day_of_week) {
        case 'Tuesday':
          player.tuesday_games++;
          break;
        case 'Thursday':
          player.thursday_games++;
          break;
        case 'Saturday':
          player.saturday_games++;
          break;
      }
      player.total_games++;
    });

    await saveTeamData(data);
    return data;
  } catch (error) {
    console.error('Error adding game:', error);
    throw error;
  }
};

export const updateGameTeams = async (gameDate: string, teams: Team[]) => {
  try {
    const data = await loadTeamData();
    const gameIndex = data.games.findIndex(g => g.date === gameDate);
    if (gameIndex !== -1) {
      data.games[gameIndex].teams = teams;
      await saveTeamData(data);
    }
  } catch (error) {
    console.error('Error updating game teams:', error);
    throw error;
  }
};

export const setGameWinner = async (gameDate: string, winnerTeam: string) => {
  try {
    const data = await loadTeamData();
    const gameIndex = data.games.findIndex(g => g.date === gameDate);
    if (gameIndex !== -1) {
      data.games[gameIndex].winner = winnerTeam;
      await saveTeamData(data);
    }
  } catch (error) {
    console.error('Error setting game winner:', error);
    throw error;
  }
};