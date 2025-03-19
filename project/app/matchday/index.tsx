import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const GlassCard = Platform.OS === 'web' 
  ? View 
  : ({ children, style }) => (
    <BlurView intensity={20} tint="dark" style={style}>
      {children}
    </BlurView>
  );

export default function MatchDayScreen() {
  const [players, setPlayers] = useState('');

  const handleCreateTeams = () => {
    const playerList = players
      .split('\n')
      .map(p => p.trim())
      .filter(p => p);

    if (playerList.length < 6) {
      alert('Please enter at least 6 players');
      return;
    }

    // Skip the players input screen and go directly to review
    router.push({
      pathname: '/teams/review',
      params: {
        players: JSON.stringify(playerList),
        numPlayers: playerList.length,
        numTeams: '3',
        includeLevel: 'true',
        includePosition: 'true',
        useMyPlayers: 'true',
        fromMatchday: 'true',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#2C1F4A', '#1A1238']}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Match Day</Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.instruction}>
              Enter the final list of players for today's game (one per line):
            </Text>

            <TextInput
              style={styles.input}
              multiline
              value={players}
              onChangeText={setPlayers}
              placeholder="Enter player names here..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              textAlignVertical="top"
              textAlign="right"
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Players entered:{' '}
                <Text style={styles.infoHighlight}>
                  {players.split('\n').filter(p => p.trim()).length}
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTeams}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.gradientButton}>
                <Text style={styles.buttonText}>Create Teams</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  card: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  instruction: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'right',
  },
  input: {
    height: 300,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
  },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  infoHighlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  createButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});