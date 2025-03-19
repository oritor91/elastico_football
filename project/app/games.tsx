import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadTeamData, type Game, setGameWinner } from '../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const cardWidth = Math.min(width - 32, 400);

const GlassCard = Platform.OS === 'web' 
  ? View 
  : ({ children, style }) => (
    <BlurView intensity={20} tint="dark" style={style}>
      {children}
    </BlurView>
  );

const TEAM_COLORS = {
  'Team 1': ['#4CAF50', '#388E3C'],
  'Team 2': ['#2196F3', '#1976D2'],
  'Team 3': ['#F44336', '#D32F2F'],
};

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await loadTeamData();
      setGames(data.games);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleSetWinner = async (gameDate: string, teamName: string) => {
    try {
      await setGameWinner(gameDate, teamName);
      await loadGames();
    } catch (error) {
      console.error('Error setting winner:', error);
    }
  };

  const renderTeamCard = (team: any, isWinner: boolean) => {
    const colors = TEAM_COLORS[team.name as keyof typeof TEAM_COLORS] || ['#B4A0FF', '#9B85FF'];

    return (
      <View style={styles.teamCard}>
        <LinearGradient colors={colors} style={styles.teamHeader}>
          <Text style={styles.teamTitle}>{team.name}</Text>
          {!selectedGame?.winner && (
            <TouchableOpacity
              style={styles.winnerButton}
              onPress={() => selectedGame && handleSetWinner(selectedGame.date, team.name)}>
              <Text style={styles.winnerButtonText}>Set as Winner</Text>
            </TouchableOpacity>
          )}
          {isWinner && (
            <View style={styles.winnerBadge}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
              <Text style={styles.winnerText}>Winner</Text>
            </View>
          )}
        </LinearGradient>
        <View style={styles.teamPlayers}>
          {team.players.map((player: string, index: number) => (
            <Text key={index} style={styles.playerName}>{player}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2C1F4A', '#1A1238']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.content}>
        {games.map((game, index) => (
          <GlassCard key={index} style={styles.gameCard}>
            <Text style={styles.dateText}>
              {new Date(game.date).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {game.teams ? (
              <View style={styles.teamsContainer}>
                {game.teams.map((team, teamIndex) => (
                  renderTeamCard(team, game.winner === team.name)
                ))}
              </View>
            ) : (
              <View style={styles.playersList}>
                {game.players.map((player, playerIndex) => (
                  <View key={playerIndex} style={styles.playerItem}>
                    <Text style={styles.playerName}>{player}</Text>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gameCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  teamsContainer: {
    gap: 16,
  },
  teamCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamPlayers: {
    padding: 12,
  },
  playersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'right',
  },
  winnerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  winnerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  winnerText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
});