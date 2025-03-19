import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadTeamData, saveTeamData, type Player } from '../../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const GlassCard = Platform.OS === 'web' 
  ? View 
  : ({ children, style }) => (
    <BlurView intensity={20} tint="dark" style={style}>
      {children}
    </BlurView>
  );

type PlayerWithName = Player & { name: string };
type SortKey = 'name' | 'rating' | 'position' | 'total_games';

const POSITIONS = {
  Offensive: '#FFB300',
  Defensive: '#2196F3',
  Both: '#4CAF50',
  Goalkeeper: '#F44336',
};

const POSITION_LABELS = {
  Offensive: 'CF',
  Defensive: 'CB',
  Both: 'CM',
  Goalkeeper: 'GK',
};

export default function PlayersScreen() {
  const [players, setPlayers] = useState<PlayerWithName[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithName | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedRating, setEditedRating] = useState(3);
  const [editedPosition, setEditedPosition] = useState('Both');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const data = await loadTeamData();
      const playersArray = Object.entries(data.players).map(([name, player]) => ({
        ...player,
        name,
        rating: player.rating || 3.0,
        position: player.position || 'Both',
      }));
      setPlayers(playersArray);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleSavePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      const data = await loadTeamData();
      data.players[selectedPlayer.name] = {
        ...data.players[selectedPlayer.name],
        rating: editedRating,
        position: editedPosition,
      };
      await saveTeamData(data);
      await loadPlayers();
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const sortPlayers = (a: PlayerWithName, b: PlayerWithName) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'rating':
        return direction * ((a.rating || 0) - (b.rating || 0));
      case 'position':
        return direction * (a.position || '').localeCompare(b.position || '');
      case 'total_games':
        return direction * (a.total_games - b.total_games);
      default:
        return 0;
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const filteredPlayers = players
    .filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(sortPlayers);

  const renderSortButton = (title: string, key: SortKey) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === key && styles.sortButtonActive]}
      onPress={() => handleSort(key)}>
      <Text style={[
        styles.sortButtonText,
        sortBy === key && styles.sortButtonTextActive
      ]}>
        {title}
        {sortBy === key && (
          <Text> {sortDirection === 'asc' ? '↑' : '↓'}</Text>
        )}
      </Text>
    </TouchableOpacity>
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFB300" />
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFB300" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFB300" />
        );
      }
    }
    return stars;
  };

  const renderPlayerItem = ({ item }: { item: PlayerWithName }) => {
    const positionColor = POSITIONS[item.position as keyof typeof POSITIONS] || '#757575';
    const positionLabel = POSITION_LABELS[item.position as keyof typeof POSITION_LABELS] || 'CM';
    
    return (
      <TouchableOpacity 
        onPress={() => {
          setSelectedPlayer(item);
          setEditedRating(item.rating || 3);
          setEditedPosition(item.position || 'Both');
          setIsEditModalVisible(true);
        }}>
        <GlassCard style={styles.playerItem}>
          <LinearGradient
            colors={['rgba(180, 160, 255, 0.2)', 'rgba(155, 133, 255, 0.2)']}
            style={styles.playerItemGradient}>
            <View style={[styles.positionBadge, { backgroundColor: positionColor }]}>
              <Text style={styles.positionText}>{positionLabel}</Text>
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.ratingContainer}>
                  {renderStars(item.rating || 3)}
                </View>
                <Text style={styles.gamesPlayed}>
                  {item.total_games} games
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </LinearGradient>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2C1F4A', '#1A1238']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.searchContainer}>
        <GlassCard style={styles.searchCard}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search player..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </GlassCard>
      </View>

      <View style={styles.sortContainer}>
        {renderSortButton('Name', 'name')}
        {renderSortButton('Rating', 'rating')}
        {renderSortButton('Position', 'position')}
        {renderSortButton('Games', 'total_games')}
      </View>

      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayerItem}
        keyExtractor={item => item.name}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Player</Text>
            <Text style={styles.modalSubtitle}>{selectedPlayer?.name}</Text>

            <Text style={styles.label}>Rating</Text>
            <View style={styles.ratingSelector}>
              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    editedRating === rating && styles.ratingOptionSelected,
                  ]}
                  onPress={() => setEditedRating(rating)}>
                  <Text style={[
                    styles.ratingText,
                    editedRating === rating && styles.ratingTextSelected
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Position</Text>
            <View style={styles.positionSelector}>
              {Object.keys(POSITIONS).map((position) => (
                <TouchableOpacity
                  key={position}
                  style={[
                    styles.positionOption,
                    { backgroundColor: POSITIONS[position as keyof typeof POSITIONS] },
                    editedPosition === position && styles.positionOptionSelected,
                  ]}
                  onPress={() => setEditedPosition(position)}>
                  <Text style={styles.positionOptionText}>
                    {POSITION_LABELS[position as keyof typeof POSITION_LABELS]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePlayer}>
                <LinearGradient
                  colors={['#B4A0FF', '#9B85FF']}
                  style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#B4A0FF', '#9B85FF']}
          style={styles.fabGradient}>
          <Ionicons name="add" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sortButtonActive: {
    backgroundColor: '#B4A0FF',
  },
  sortButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  playerItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  playerItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  positionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  positionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  gamesPlayed: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  editButton: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  ratingSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  ratingOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ratingOptionSelected: {
    backgroundColor: '#B4A0FF',
  },
  ratingText: {
    color: 'rgba(255,255,255,0.7)',
  },
  ratingTextSelected: {
    color: '#FFFFFF',
  },
  positionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  positionOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.6,
  },
  positionOptionSelected: {
    opacity: 1,
  },
  positionOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});