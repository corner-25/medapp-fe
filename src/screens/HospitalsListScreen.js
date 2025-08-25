// src/screens/HospitalsListScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHospitals } from '../data/hospitals';

const HospitalsListScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState(getHospitals());
  const [searchText, setSearchText] = useState('');

  // Filter hospitals based on search text
  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchText.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleHospitalPress = (hospital) => {
    navigation.navigate('HospitalDetail', { hospitalId: hospital.id });
  };

  const renderHospitalItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.hospitalItem}
      onPress={() => handleHospitalPress(item)}
    >
      <Image source={item.image} style={styles.hospitalImage} />
      <View style={styles.hospitalInfo}>
        <View style={styles.hospitalHeader}>
          <Text style={styles.hospitalName}>{item.name}</Text>
          <View style={styles.hospitalTypeTag}>
            <Text style={styles.hospitalTypeText}>{item.type}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <Icon name="location" size={14} color="#666" />
          <Text style={styles.hospitalAddress}>{item.address}</Text>
        </View>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingStars}>
            {[...Array(5)].map((_, index) => (
              <Icon 
                key={index}
                name={index < Math.floor(item.rating) ? "star" : "star-outline"} 
                size={12} 
                color="#FFD700" 
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {item.rating} ({item.totalReviews})
          </Text>
        </View>
        
        <Text style={styles.hospitalDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Bệnh viện hợp tác</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bệnh viện..."
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Hospitals List */}
      <FlatList
        data={filteredHospitals}
        renderItem={renderHospitalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.hospitalsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>Không tìm thấy bệnh viện nào</Text>
          </View>
        )}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  hospitalsList: {
    padding: 15,
  },
  hospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  hospitalTypeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hospitalTypeText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  hospitalDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default HospitalsListScreen;