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
import { loadTeamData, type Game, setGameWinner } from '../../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TEAM_COLORS = {
  'Team Blue': ['#2196F3', '#1976D2'],
  'Team Green': ['#4CAF50', '#388E3C'],
  'Team Red': ['#F44336', '#D32F2F'],
};

type GameWithId = Game & { id: string };

const GlassCard = Platform.OS === 'web' 
  ? View 
  : ({ children, style }) => (
    <BlurView intensity={20} tint="dark" style={style}>
      {children}
    </BlurView>
  );

const CalendarDay = ({ 
  date, 
  isToday, 
  isSelected, 
  hasGame,
  hasWinner,
  onPress 
}: { 
  date: Date | null;
  isToday: boolean;
  isSelected: boolean;
  hasGame: boolean;
  hasWinner: boolean;
  onPress: () => void;
}) => {
  if (!date) {
    return <View style={styles.dayCell} />;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.dayCell,
        isToday && styles.todayCell,
        isSelected && styles.selectedCell,
      ]}
      onPress={onPress}>
      <Text style={[
        styles.dayText,
        (isToday || isSelected) && styles.activeDayText
      ]}>
        {date.getDate()}
      </Text>
      {hasGame && (
        <View style={[
          styles.gameIndicator,
          isSelected && styles.selectedGameIndicator,
          hasWinner && styles.winnerGameIndicator
        ]} />
      )}
    </TouchableOpacity>
  );
};

export default function GamesScreen() {
  const [games, setGames] = useState<GameWithId[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameWithId | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await loadTeamData();
      const gamesArray = data.games.map((game, index) => ({
        ...game,
        id: index.toString(),
      }));
      setGames(gamesArray);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const hasGameOnDate = (date: Date) => {
    return games.some(game => {
      const gameDate = new Date(game.date);
      return gameDate.getDate() === date.getDate() &&
             gameDate.getMonth() === date.getMonth() &&
             gameDate.getFullYear() === date.getFullYear();
    });
  };

  const hasWinnerOnDate = (date: Date) => {
    return games.some(game => {
      const gameDate = new Date(game.date);
      return gameDate.getDate() === date.getDate() &&
             gameDate.getMonth() === date.getMonth() &&
             gameDate.getFullYear() === date.getFullYear() &&
             game.winner !== undefined;
    });
  };

  const getGameForDate = (date: Date) => {
    return games.find(game => {
      const gameDate = new Date(game.date);
      return gameDate.getDate() === date.getDate() &&
             gameDate.getMonth() === date.getMonth() &&
             gameDate.getFullYear() === date.getFullYear();
    });
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    const game = getGameForDate(date);
    if (game) {
      setSelectedGame(game);
      setIsModalVisible(true);
    }
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const handleSetWinner = async (teamName: string) => {
    if (!selectedGame) return;

    try {
      await setGameWinner(selectedGame.date, teamName);
      await loadGames();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error setting winner:', error);
    }
  };

  const renderTeamCard = (teamName: string, players: string[], isWinner: boolean) => {
    const colors = TEAM_COLORS[teamName as keyof typeof TEAM_COLORS] || ['#B4A0FF', '#9B85FF'];

    return (
      <View style={styles.teamCard}>
        <LinearGradient
          colors={colors}
          style={styles.teamCardHeader}>
          <Text style={styles.teamCardTitle}>{teamName}</Text>
          {selectedGame && !selectedGame.winner && (
            <TouchableOpacity
              style={styles.winnerButton}
              onPress={() => handleSetWinner(teamName)}>
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
        <View style={styles.teamCardBody}>
          {players.map((player, index) => (
            <Text key={index} style={styles.teamPlayerName}>{player}</Text>
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {DAYS.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <ScrollView style={styles.calendarContainer}>
        <View style={styles.calendar}>
          {getDaysInMonth(currentDate).map((date, index) => (
            <CalendarDay
              key={index}
              date={date}
              isToday={date ? isToday(date) : false}
              isSelected={date && selectedDate ? 
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
                : false}
              hasGame={date ? hasGameOnDate(date) : false}
              hasWinner={date ? hasWinnerOnDate(date) : false}
              onPress={() => date && handleDatePress(date)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Game Details Modal */}
      {isModalVisible && selectedGame && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(180, 160, 255, 0.95)', 'rgba(155, 133, 255, 0.95)']}
              style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Game Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.dateText}>
                {new Date(selectedGame.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              {selectedGame.teams ? (
                <>
                  <View style={styles.teamsContainer}>
                    {selectedGame.teams.map((team, index) => (
                      renderTeamCard(
                        team.name,
                        team.players,
                        selectedGame.winner === team.name
                      )
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.playersTitle}>
                    Players ({selectedGame.players.length})
                  </Text>
                  <View style={styles.playersList}>
                    {selectedGame.players.map((player, index) => (
                      <View key={index} style={styles.playerItem}>
                        <Text style={styles.playerName}>{player}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </GlassCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dayCell: {
    width: (width - 32) / 7,
    height: (width - 32) / 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  todayCell: {
    backgroundColor: 'rgba(180, 160, 255, 0.2)',
  },
  selectedCell: {
    backgroundColor: '#B4A0FF',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  activeDayText: {
    fontWeight: 'bold',
  },
  gameIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B4A0FF',
    marginTop: 4,
  },
  selectedGameIndicator: {
    backgroundColor: '#FFFFFF',
  },
  winnerGameIndicator: {
    backgroundColor: '#FFD700',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(26, 18, 56, 0.95)' : 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
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
  },
  teamsContainer: {
    gap: 16,
  },
  teamCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  teamCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamCardBody: {
    padding: 12,
  },
  teamPlayerName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
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