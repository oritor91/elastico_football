import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const GlassCard = Platform.OS === 'web' 
  ? View 
  : ({ children, style }) => (
    <BlurView intensity={20} tint="dark" style={style}>
      {children}
    </BlurView>
  );

interface TeamPlayer {
  name: string;
  rating: number;
  position: string;
}

interface Team {
  players: TeamPlayer[];
  averageRating: number;
}

const getTeamColor = (index: number) => {
  const colors = ['#4CAF50', '#2196F3', '#F44336'];
  return colors[index % colors.length];
};

const getPositionIcon = (position: string) => {
  switch (position) {
    case 'Offensive': return '⚔️';
    case 'Defensive': return '🛡️';
    case 'Goalkeeper': return '🧤';
    default: return '⚽';
  }
};

export default function ShareTeams() {
  const params = useLocalSearchParams();
  let teams: Team[] = [];
  
  try {
    // Safely parse the teams parameter
    if (typeof params.teams === 'string') {
      teams = JSON.parse(decodeURIComponent(params.teams));
    }
  } catch (error) {
    console.error('Error parsing teams:', error);
  }
  
  const hideDetails = params.hideDetails === 'true';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#2C1F4A', '#1A1238']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Teams</Text>
        </View>

        <View style={styles.teamsContainer}>
          {teams.map((team, teamIndex) => (
            <GlassCard key={teamIndex} style={styles.teamCard}>
              <View style={[styles.teamHeader, { backgroundColor: getTeamColor(teamIndex) }]}>
                <View style={styles.teamIcon}>
                  <Ionicons name="shirt" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.teamTitle}>Team {teamIndex + 1}</Text>
                {!hideDetails && (
                  <Text style={styles.teamAverage}>
                    {team.averageRating.toFixed(1)} ★
                  </Text>
                )}
              </View>

              <View style={styles.playersList}>
                {team.players.map((player, playerIndex) => (
                  <View key={playerIndex} style={styles.playerItem}>
                    <View style={styles.playerIcon}>
                      <Ionicons name="person" size={20} color={getTeamColor(teamIndex)} />
                    </View>
                    <Text style={styles.playerName}>{player.name}</Text>
                    {!hideDetails && (
                      <View style={styles.playerDetails}>
                        <Text style={styles.playerRating}>{player.rating.toFixed(1)} ★</Text>
                        <Text style={styles.positionIcon}>
                          {getPositionIcon(player.position)}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </GlassCard>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2C1F4A',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamsContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  teamCard: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  teamIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamAverage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playersList: {
    padding: 12,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 4,
    padding: 8,
    gap: 8,
  },
  playerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerRating: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  positionIcon: {
    fontSize: 16,
  },
});