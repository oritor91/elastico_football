import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { loadTeamData, saveTeamData, type TeamData, type Player } from '../../utils/storage';
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

type DayType = 'Tuesday' | 'Thursday' | 'Saturday' | 'All Games';
type DayKey = 'tuesday_games' | 'thursday_games' | 'saturday_games' | 'total_games';

export default function ManageScreen() {
  const [players, setPlayers] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<DayType>('Tuesday');
  const [date, setDate] = useState<string>('');
  const [sortedPlayers, setSortedPlayers] = useState<string[]>([]);
  const [mode, setMode] = useState<'sort' | 'add'>('sort');

  const getDayKey = (day: DayType): DayKey => {
    switch (day) {
      case 'Tuesday': return 'tuesday_games';
      case 'Thursday': return 'thursday_games';
      case 'Saturday': return 'saturday_games';
      case 'All Games': return 'total_games';
    }
  };

  const sortPlayers = async () => {
    try {
      const data = await loadTeamData();
      const playerList = players.split('\n').map(p => p.trim()).filter(p => p);
      const dayKey = getDayKey(selectedDay);

      // Sort players based on game count and total games
      const sortedList = playerList.sort((a, b) => {
        const playerA = data.players[a] || { [dayKey]: 0, total_games: 0 };
        const playerB = data.players[b] || { [dayKey]: 0, total_games: 0 };
        
        if (playerA[dayKey] !== playerB[dayKey]) {
          return playerB[dayKey] - playerA[dayKey];
        }
        return playerB.total_games - playerA.total_games;
      });

      // Split into main team and reserves
      const mainTeam = sortedList.slice(0, 13);
      const nextTwo = sortedList.slice(13, 15);
      const onHold = sortedList.slice(15);

      setSortedPlayers([...mainTeam, ...nextTwo, ...onHold]);
    } catch (error) {
      console.error('Error sorting players:', error);
    }
  };

  const addGame = async () => {
    if (!date || !players) {
      alert('Please enter both date and players');
      return;
    }

    try {
      const data = await loadTeamData();
      const playerList = players.split('\n').map(p => p.trim()).filter(p => p);
      const dayKey = getDayKey(selectedDay);

      // Create new game entry
      const game = {
        date,
        day_of_week: selectedDay,
        players: playerList
      };

      // Add game to games array
      data.games.unshift(game);

      // Update player statistics
      playerList.forEach(player => {
        if (!data.players[player]) {
          data.players[player] = {
            tuesday_games: 0,
            thursday_games: 0,
            saturday_games: 0,
            total_games: 0,
            rating: 3.0,
            position: 'Both',
            past_teams: []
          };
        }

        data.players[player][dayKey]++;
        data.players[player].total_games++;
      });

      await saveTeamData(data);
      alert('Game added successfully');
      setPlayers('');
      setDate('');
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Error adding game');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2C1F4A', '#1A1238']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.content}>
        <GlassCard style={styles.card}>
          <View style={styles.modeSelector}>
            <TouchableOpacity 
              style={[styles.modeButton, mode === 'sort' && styles.selectedMode]}
              onPress={() => setMode('sort')}>
              <Text style={[
                styles.modeButtonText,
                mode === 'sort' && styles.selectedModeText
              ]}>Sort Players</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, mode === 'add' && styles.selectedMode]}
              onPress={() => setMode('add')}>
              <Text style={[
                styles.modeButtonText,
                mode === 'add' && styles.selectedModeText
              ]}>Add Game</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.daySelector}>
            {(['Tuesday', 'Thursday', 'Saturday'] as const).map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, selectedDay === day && styles.selectedDay]}
                onPress={() => setSelectedDay(day)}>
                <Text style={[
                  styles.dayButtonText,
                  selectedDay === day && styles.selectedDayText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
            {mode === 'sort' && (
              <TouchableOpacity
                style={[styles.dayButton, selectedDay === 'All Games' && styles.selectedDay]}
                onPress={() => setSelectedDay('All Games')}>
                <Text style={[
                  styles.dayButtonText,
                  selectedDay === 'All Games' && styles.selectedDayText
                ]}>
                  All Games
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {mode === 'add' && (
            <TextInput
              style={styles.input}
              placeholder="Enter date (YYYY-MM-DD)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={date}
              onChangeText={setDate}
            />
          )}

          <TextInput
            style={[styles.input, styles.playersInput]}
            placeholder="Enter player names (one per line)"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={players}
            onChangeText={setPlayers}
            multiline
            textAlignVertical="top"
          /> ```typescript
          <TouchableOpacity
            style={styles.actionButton}
            onPress={mode === 'sort' ? sortPlayers : addGame}>
            <LinearGradient
              colors={['#B4A0FF', '#9B85FF']}
              style={styles.gradientButton}>
              <Text style={styles.actionButtonText}>
                {mode === 'sort' ? 'Sort Players' : 'Add Game'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {sortedPlayers.length > 0 && mode === 'sort' && (
            <View style={styles.results}>
              <Text style={styles.resultsTitle}>Sorted Players:</Text>
              {sortedPlayers.map((player, index) => (
                <Text key={index} style={styles.playerItem}>
                  {index + 1}. {player}
                </Text>
              ))}
            </View>
          )}
        </GlassCard>
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
  card: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedMode: {
    backgroundColor: '#B4A0FF',
  },
  modeButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  selectedModeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedDay: {
    backgroundColor: '#B4A0FF',
  },
  dayButtonText: {
    color: 'rgba(255,255,255,0.7)',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  playersInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  playerItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#FFFFFF',
  },
});