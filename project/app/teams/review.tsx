import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ScrollView,
  Switch,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadTeamData, addGame } from '../../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

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

const TEAM_COLORS = {
  0: ['rgba(76, 175, 80, 0.8)', 'rgba(56, 142, 60, 0.8)'], // Green
  1: ['rgba(33, 150, 243, 0.8)', 'rgba(25, 118, 210, 0.8)'], // Blue
  2: ['rgba(244, 67, 54, 0.8)', 'rgba(211, 47, 47, 0.8)'], // Red
};

const POSITION_COLORS = {
  'Offensive': '#FFD700',
  'Defensive': '#B4A0FF',
  'Goalkeeper': '#FF9B85',
  'Both': '#85FF9B',
};

export default function ReviewTeams() {
  const params = useLocalSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [showDetails, setShowDetails] = useState(true);
  const [draggingPlayer, setDraggingPlayer] = useState<{ player: TeamPlayer; teamIndex: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropZone, setDropZone] = useState<number | null>(null);
  const dragPos = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!params.teams) {
      createTeams();
    } else {
      setTeams(JSON.parse(params.teams as string));
    }
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      dragPos.setOffset({
        x: dragPos.x._value,
        y: dragPos.y._value,
      });
      dragPos.setValue({ x: 0, y: 0 });
      setIsDragging(true);
      Animated.spring(scale, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_, gesture) => {
      dragPos.setValue({ x: gesture.dx, y: gesture.dy });
      // Calculate drop zone based on Y position
      const newDropZone = Math.floor((gesture.moveY - 100) / 200);
      if (newDropZone >= 0 && newDropZone < teams.length) {
        setDropZone(newDropZone);
      } else {
        setDropZone(null);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (dropZone !== null && draggingPlayer && dropZone !== draggingPlayer.teamIndex) {
        const { teamIndex, player } = draggingPlayer;
        const newTeams = [...teams];
        
        // Remove from original team
        newTeams[teamIndex].players = newTeams[teamIndex].players.filter(
          p => p.name !== player.name
        );
        
        // Add to new team
        newTeams[dropZone].players.push(player);
        
        // Sort players by rating within each team
        newTeams.forEach(team => {
          team.players.sort((a, b) => b.rating - a.rating);
          team.averageRating = team.players.reduce((sum, p) => sum + p.rating, 0) / team.players.length;
        });
        
        setTeams(newTeams);
      }
      
      setIsDragging(false);
      setDropZone(null);
      setDraggingPlayer(null);
      dragPos.setValue({ x: 0, y: 0 });
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    },
  });

  const createTeams = async () => {
    try {
      const players = JSON.parse(params.players as string) as string[];
      const numTeams = Number(params.numTeams);
      const includeLevel = params.includeLevel === 'true';
      const includePosition = params.includePosition === 'true';

      let playerData: TeamPlayer[] = [];

      if (params.useMyPlayers === 'true') {
        const data = await loadTeamData();
        playerData = players.map(name => ({
          name,
          rating: data.players[name]?.rating || 3.0,
          position: data.players[name]?.position || 'Both',
        }));
      } else {
        playerData = players.map(name => ({
          name,
          rating: 3.0,
          position: 'Both',
        }));
      }

      if (includeLevel) {
        playerData.sort((a, b) => b.rating - a.rating);
      }

      const createdTeams: Team[] = Array.from({ length: numTeams }, () => ({
        players: [],
        averageRating: 0,
      }));

      let forward = true;
      let currentTeam = 0;

      if (includePosition) {
        const positions = ['Goalkeeper', 'Defensive', 'Offensive', 'Both'];
        for (const position of positions) {
          const positionPlayers = playerData.filter(p => p.position === position);
          for (const player of positionPlayers) {
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
        }
      } else {
        for (const player of playerData) {
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
      }

      createdTeams.forEach(team => {
        team.averageRating =
          team.players.reduce((sum, p) => sum + p.rating, 0) / team.players.length;
      });

      setTeams(createdTeams);

      if (params.fromMatchday === 'true') {
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
        
        await addGame({
          date,
          day_of_week: dayOfWeek,
          players: players,
          teams: createdTeams.map((team, index) => ({
            name: `Team ${index + 1}`,
            players: team.players.map(p => p.name),
            color: TEAM_COLORS[index as keyof typeof TEAM_COLORS][0],
          })),
        });
      }
    } catch (error) {
      console.error('Error creating teams:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (params.fromMatchday === 'true') {
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
        
        await addGame({
          date,
          day_of_week: dayOfWeek,
          players: teams.flatMap(team => team.players.map(p => p.name)),
          teams: teams.map((team, index) => ({
            name: `Team ${index + 1}`,
            players: team.players.map(p => p.name),
            color: TEAM_COLORS[index as keyof typeof TEAM_COLORS][0],
          })),
        });
      }
      
      router.push({
        pathname: '/teams/share',
        params: { teams: JSON.stringify(teams), hideDetails: !showDetails }
      });
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  };

  const handleSortTeams = () => {
    const newTeams = teams.map(team => ({
      ...team,
      players: [...team.players].sort((a, b) => b.rating - a.rating),
    }));
    setTeams(newTeams);
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
          <Text style={styles.title}>Creating Teams</Text>
          <View style={styles.detailsToggle}>
            <Text style={styles.toggleLabel}>Show Details</Text>
            <Switch
              value={showDetails}
              onValueChange={setShowDetails}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#B4A0FF' }}
              thumbColor={showDetails ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={[styles.progressFill, { width: `${(3 / 4) * 100}%` }]}
          />
          <View style={styles.stepsContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View key={step} style={styles.step}>
                <View style={[
                  styles.stepDot,
                  step <= 3 && styles.completedDot
                ]} />
              </View>
            ))}
          </View>
        </View>

        <ScrollView style={styles.content}>
          {teams.map((team, teamIndex) => (
            <GlassCard 
              key={teamIndex} 
              style={[
                styles.teamSection,
                dropZone === teamIndex && styles.dropZoneActive
              ]}>
              <LinearGradient
                colors={TEAM_COLORS[teamIndex as keyof typeof TEAM_COLORS]}
                style={styles.teamHeader}>
                <Text style={styles.teamTitle}>Team {teamIndex + 1}</Text>
                <Text style={styles.teamAverage}>{team.averageRating.toFixed(1)} ★</Text>
              </LinearGradient>

              {team.players.map((player, playerIndex) => (
                <Animated.View
                  key={playerIndex}
                  {...(draggingPlayer?.player === player ? panResponder.panHandlers : {})}
                  style={[
                    styles.playerRow,
                    draggingPlayer?.player === player && {
                      transform: [
                        { translateX: dragPos.x },
                        { translateY: dragPos.y },
                        { scale: scale }
                      ],
                      zIndex: 1000,
                    }
                  ]}>
                  <TouchableOpacity
                    style={styles.dragHandle}
                    onPressIn={() => setDraggingPlayer({ player, teamIndex })}>
                    <Ionicons name="menu" size={20} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                  <View style={styles.playerDetails}>
                    {showDetails && (
                      <>
                        <Text style={styles.playerRating}>{player.rating.toFixed(1)} ★</Text>
                        <Text style={[
                          styles.playerPosition,
                          { color: POSITION_COLORS[player.position as keyof typeof POSITION_COLORS] }
                        ]}>
                          {player.position === 'Offensive' ? 'CF' :
                           player.position === 'Defensive' ? 'CB' :
                           player.position === 'Goalkeeper' ? 'GK' : 'CM'}
                        </Text>
                      </>
                    )}
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                </Animated.View>
              ))}
            </GlassCard>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSortTeams}>
            <LinearGradient colors={['#4A4A4A', '#333333']} style={styles.gradientButton}>
              <Ionicons name="swap-vertical" size={24} color="white" />
              <Text style={styles.buttonText}>Sort by Rating</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.gradientButton}>
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.buttonText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    top: -4,
  },
  step: {
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  completedDot: {
    backgroundColor: '#FFD700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  teamSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropZoneActive: {
    borderColor: '#FFD700',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamAverage: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 80,
  },
  playerRating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  playerPosition: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 12,
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
});