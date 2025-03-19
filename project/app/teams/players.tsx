import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, router } from 'expo-router';
import { loadTeamData } from '../../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const GlassCard = Platform.OS === 'web' 
  ? View 
  : ({ children, style }) => (
    <BlurView intensity={20} tint="dark" style={style}>
      {children}
    </BlurView>
  );

export default function PlayersInput() {
  const params = useLocalSearchParams();
  const [playersText, setPlayersText] = useState('');
  const [existingPlayers, setExistingPlayers] = useState<string[]>([]);
  const steps = [1, 2, 3, 4];
  const currentStep = 2;

  useEffect(() => {
    if (params.useMyPlayers === 'true') {
      loadExistingPlayers();
    }
  }, [params.useMyPlayers]);

  const loadExistingPlayers = async () => {
    try {
      const data = await loadTeamData();
      const playerNames = Object.keys(data.players);
      setExistingPlayers(playerNames);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleNext = () => {
    const players = playersText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p);

    if (players.length !== Number(params.numPlayers)) {
      alert(`Please enter exactly ${params.numPlayers} players`);
      return;
    }

    router.push({
      pathname: '/teams/review',
      params: {
        ...params,
        players: JSON.stringify(players),
      },
    });
  };

  const handleUseExistingPlayers = () => {
    setPlayersText(existingPlayers.join('\n'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#2C1F4A', '#1A1238']}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter Players</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step) => (
            <View key={step} style={styles.stepRow}>
              <View
                style={[
                  styles.stepCircle,
                  step === currentStep && styles.activeStep,
                  step < currentStep && styles.completedStep,
                ]}>
                <Text
                  style={[
                    styles.stepText,
                    (step === currentStep || step < currentStep) &&
                      styles.activeStepText,
                  ]}>
                  {step}
                </Text>
              </View>
              {step < steps.length && (
                <View
                  style={[
                    styles.stepLine,
                    step < currentStep && styles.completedStepLine,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <ScrollView style={styles.content}>
          <GlassCard style={styles.card}>
            <Text style={styles.instruction}>
              Enter {params.numPlayers} player names (one per line):
            </Text>

            {params.useMyPlayers === 'true' && existingPlayers.length > 0 && (
              <TouchableOpacity
                style={styles.existingPlayersButton}
                onPress={handleUseExistingPlayers}>
                <LinearGradient
                  colors={['#B4A0FF', '#9B85FF']}
                  style={styles.gradientButton}>
                  <Text style={styles.existingPlayersButtonText}>
                    Use Existing Players
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.input}
              multiline
              value={playersText}
              onChangeText={setPlayersText}
              placeholder="Enter player names here..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              textAlignVertical="top"
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Players entered:{' '}
                <Text style={styles.infoHighlight}>
                  {playersText.split('\n').filter(p => p.trim()).length}
                </Text>
              </Text>
              <Text style={styles.infoText}>
                Players needed:{' '}
                <Text style={styles.infoHighlight}>{params.numPlayers}</Text>
              </Text>
            </View>
          </GlassCard>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#B4A0FF', '#9B85FF']}
              style={styles.gradientButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2C1F4A', // Match gradient start color
  },
  container: {
    flex: 1,
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
  },
  existingPlayersButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  existingPlayersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    textAlign: 'left',
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
    marginBottom: 4,
  },
  infoHighlight: {
    color: '#B4A0FF',
    fontWeight: 'bold',
  },
  nextButton: {
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});