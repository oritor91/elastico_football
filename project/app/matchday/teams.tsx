import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { loadTeamData, updateGameTeams, type Team } from '../../utils/storage';

const GlassCard = Platform.OS === 'web' 
  ? View 
  : ({ children, style }) => (
    <BlurView intensity={20} tint="dark" style={style}>
      {children}
    </BlurView>
  );

const TEAM_COLORS = {
  'Team Blue': ['#2196F3', '#1976D2'],
  'Team Green': ['#4CAF50', '#388E3C'],
  'Team Red': ['#F44336', '#D32F2F'],
};

export default function TeamsScreen() {
  const params = useLocalSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    createTeams();
  }, []);

  const createTeams = async () => {
    try {
      const players = JSON.parse(params.players as string);
      const numTeams = Math.min(3, Math.ceil(players.length / 5));
      const data = await loadTeamData();

      // Create teams with colors
      const teamNames = ['Team Blue', 'Team Green', 'Team Red'].slice(0, numTeams);
      const createdTeams: Team[] = teamNames.map(name => ({
        name,
        players: [],
        color: TEAM_COLORS[name as keyof typeof TEAM_COLORS][0],
      }));

      // Distribute players
      let currentTeam = 0;
      let forward = true;

      for (const player of players) {
        createdTeams[currentTeam].players.push(player);

        if (forward) {
          currentTeam++;
          if (currentTeam === numTeams) {
            forward = false;
            currentTeam = numTeams - 1;
          }
        } else {
          currentTeam--;
          if (currentTeam === -1) {
            forward = true;
            currentTeam = 0;
          }
        }
      }

      setTeams(createdTeams);
    } catch (error) {
      console.error('Error creating teams:', error);
    }
  };

  const handleShuffle = () => {
    createTeams();
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleAddToCalendar = async () => {
    try {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
      
      const players = teams.flatMap(team => team.players);
      
      // Add game to storage
      const data = await loadTeamData();
      const game = {
        date,
        day_of_week: dayOfWeek,
        players,
        teams,
      };
      
      data.games.unshift(game);
      await updateGameTeams(date, teams);
      
      router.replace('/games');
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

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
          <Text style={styles.title}>Today's Teams</Text>
        </View>

        <ScrollView style={styles.content}>
          {teams.map((team, index) => (
            <GlassCard key={index} style={styles.teamContainer}>
              <LinearGradient
                colors={TEAM_COLORS[team.name as keyof typeof TEAM_COLORS]}
                style={styles.teamHeader}>
                <Text style={styles.teamTitle}>{team.name}</Text>
                <Text style={styles.playerCount}>
                  {team.players.length} Players
                </Text>
              </LinearGradient>

              <View style={styles.playersList}>
                {team.players.map((player, playerIndex) => (
                  <View key={playerIndex} style={styles.playerItem}>
                    <Text style={styles.playerName}>{player}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
              <LinearGradient
                colors={['#666666', '#4A4A4A']}
                style={styles.gradientButton}>
                <Ionicons name="shuffle" size={24} color="white" />
                <Text style={styles.buttonText}>Shuffle Teams</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#B4A0FF', '#9B85FF']}
                style={styles.gradientButton}>
                <Ionicons name="calendar" size={24} color="white" />
                <Text style={styles.buttonText}>Add to Calendar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Dialog */}
        {showSaveDialog && (
          <View style={styles.dialogOverlay}>
            <GlassCard style={styles.dialog}>
              <Text style={styles.dialogTitle}>Add to Calendar?</Text>
              <Text style={styles.dialogText}>
                Do you want to add these teams to today's calendar?
              </Text>
              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  style={styles.dialogButton}
                  onPress={() => setShowSaveDialog(false)}>
                  <Text style={styles.dialogButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogConfirmButton]}
                  onPress={handleAddToCalendar}>
                  <Text style={[styles.dialogButtonText, styles.dialogConfirmText]}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}
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
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  teamContainer: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerCount: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  playersList: {
    padding: 16,
  },
  playerItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
    gap: 16,
  },
  shuffleButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(26, 18, 56, 0.95)' : 'transparent',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dialogText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dialogButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  dialogConfirmButton: {
    backgroundColor: '#B4A0FF',
  },
  dialogConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});