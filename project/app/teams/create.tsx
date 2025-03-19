import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
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

export default function CreateTeams() {
  const [numPlayers, setNumPlayers] = useState('15');
  const [numTeams, setNumTeams] = useState('3');
  const [includeLevel, setIncludeLevel] = useState(true);
  const [includePosition, setIncludePosition] = useState(true);
  const [useMyPlayers, setUseMyPlayers] = useState(true);

  const handleNext = () => {
    const playersCount = parseInt(numPlayers);
    const teamsCount = parseInt(numTeams);

    if (isNaN(playersCount) || playersCount < 6) {
      alert('Please enter at least 6 players');
      return;
    }

    if (isNaN(teamsCount) || teamsCount < 2 || teamsCount > 6) {
      alert('Number of teams must be between 2 and 6');
      return;
    }

    router.push({
      pathname: '/teams/players',
      params: {
        numPlayers: playersCount,
        numTeams: teamsCount,
        includeLevel,
        includePosition,
        useMyPlayers,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#2C1F4A', '#1A1238']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <Text style={styles.title}>Creating Teams</Text>
        </View>

        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={[styles.progressFill, { width: '25%' }]}
          />
          <View style={styles.stepsContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View key={step} style={styles.step}>
                <View style={[
                  styles.stepDot,
                  step === 1 && styles.completedDot
                ]} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Number of Players</Text>
              <TextInput
                style={styles.numberInput}
                value={numPlayers}
                onChangeText={setNumPlayers}
                keyboardType="number-pad"
                placeholder="Enter number of players"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Number of Teams</Text>
              <TextInput
                style={styles.numberInput}
                value={numTeams}
                onChangeText={setNumTeams}
                keyboardType="number-pad"
                placeholder="Enter number of teams"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.optionsContainer}>
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Include Players Level</Text>
                <Switch
                  value={includeLevel}
                  onValueChange={setIncludeLevel}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#FFD700' }}
                  thumbColor={includeLevel ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Include Player Position</Text>
                <Switch
                  value={includePosition}
                  onValueChange={setIncludePosition}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#FFD700' }}
                  thumbColor={includePosition ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Use My Players</Text>
                <Switch
                  value={useMyPlayers}
                  onValueChange={setUseMyPlayers}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#FFD700' }}
                  thumbColor={useMyPlayers ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
          </GlassCard>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.gradientButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  numberInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  nextButton: {
    width: '100%',
    maxWidth: 400,
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 16 : 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});