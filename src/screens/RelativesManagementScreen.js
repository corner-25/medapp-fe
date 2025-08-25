// src/screens/RelativesManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { relativesService } from '../services/apiService';

const RelativesManagementScreen = ({ navigation }) => {
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load danh sách người thân khi màn hình được mount
  useEffect(() => {
    loadRelatives();
  }, []);

  // Reload khi navigate back từ form
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRelatives();
    });
    return unsubscribe;
  }, [navigation]);

  // Load danh sách người thân
  const loadRelatives = async () => {
    try {
      const data = await relativesService.getAll();
      setRelatives(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách người thân');
      console.error('Error loading relatives:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Xử lý refresh danh sách
  const handleRefresh = () => {
    setRefreshing(true);
    loadRelatives();
  };

  // Xử lý khi nhấn vào nút chỉnh sửa
  const handleEditRelative = (relative) => {
    navigation.navigate('RelativeForm', { relative });
  };

  // Xử lý khi nhấn vào nút thêm hồ sơ
  const handleAddRelative = () => {
    navigation.navigate('RelativeForm');
  };

  // Xử lý khi nhấn vào một người thân (xem chi tiết)
  const handleRelativePress = (relative) => {
    navigation.navigate('RelativeDetail', { relative });
  };

  // Xử lý xóa người thân
  const handleDeleteRelative = async (relativeId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa người thân này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await relativesService.delete(relativeId);
              // Reload danh sách sau khi xóa
              loadRelatives();
              Alert.alert('Thành công', 'Đã xóa người thân');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa người thân');
              console.error('Error deleting relative:', error);
            }
          },
        },
      ],
    );
  };

  // Render từng item trong danh sách người thân
  const renderRelativeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.relativeItem}
      onPress={() => handleRelativePress(item)}
      onLongPress={() => handleDeleteRelative(item._id)}
    >
      <View style={styles.relativeIconContainer}>
        <Icon 
          name={
            item.relationship === 'Cha' || item.relationship === 'Bố' ? 'man' : 
            item.relationship === 'Mẹ' ? 'woman' : 
            item.relationship === 'Con' ? 'walk' : 
            'person'
          } 
          size={26} 
          color="#fff" 
        />
      </View>
      
      <View style={styles.relativeInfo}>
        <Text style={styles.relativeName}>{item.name}</Text>
        <View style={styles.relativeDetails}>
          <Text style={styles.relativeAge}>{item.age} tuổi</Text>
          <Text style={styles.relationshipBadge}>{item.relationship}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => handleEditRelative(item)}
      >
        <Icon name="create-outline" size={22} color="#4285F4" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý người thân</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý người thân</Text>
      </View>
      
      {/* Danh sách người thân */}
      {relatives.length > 0 ? (
        <FlatList
          data={relatives}
          renderItem={renderRelativeItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.relativesList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Bạn chưa có người thân nào</Text>
        </View>
      )}
      
      {/* Nút thêm hồ sơ */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddRelative}
      >
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Thêm hồ sơ người thân</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relativesList: {
    padding: 15,
  },
  relativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  relativeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relativeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  relativeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  relativeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relativeAge: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  relationshipBadge: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default RelativesManagementScreen;