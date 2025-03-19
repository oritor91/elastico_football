import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Link } from 'expo-router';
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

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={['#2C1F4A', '#1A1238']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Team Manager</Text>
        <Text style={styles.subtitle}>Manage your soccer teams with ease</Text>
      </View>

      <View style={styles.grid}>
        <Link href="/matchday" asChild>
          <TouchableOpacity>
            <GlassCard style={styles.card}>
              <LinearGradient
                colors={['#FF9B85', '#FF7B85']}
                style={styles.iconContainer}>
                <Ionicons name="football" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Match Day</Text>
              <Text style={styles.cardDescription}>
                Create teams for today's game
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </Link>

        <Link href="/teams/create" asChild>
          <TouchableOpacity>
            <GlassCard style={styles.card}>
              <LinearGradient
                colors={['#B4A0FF', '#9B85FF']}
                style={styles.iconContainer}>
                <Ionicons name="people" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Create Teams</Text>
              <Text style={styles.cardDescription}>
                Generate balanced teams automatically
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </Link>

        <Link href="/games" asChild>
          <TouchableOpacity>
            <GlassCard style={styles.card}>
              <LinearGradient
                colors={['#85FF9B', '#7BFF85']}
                style={styles.iconContainer}>
                <Ionicons name="calendar" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Games</Text>
              <Text style={styles.cardDescription}>
                View and manage game history
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </Link>

        <Link href="/players" asChild>
          <TouchableOpacity>
            <GlassCard style={styles.card}>
              <LinearGradient
                colors={['#FFB300', '#FF9B00']}
                style={styles.iconContainer}>
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Players</Text>
              <Text style={styles.cardDescription}>
                Manage player profiles and stats
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  grid: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});