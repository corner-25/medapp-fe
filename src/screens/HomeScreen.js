import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { getHospitals } from '../data/hospitals';

const HomeScreen = ({ navigation }) => {
  const { getToken, getUserInfo } = useContext(AuthContext);
  const userToken = getToken();
  const userInfo = getUserInfo();
  
  // Lấy danh sách bệnh viện và chỉ hiển thị 3 bệnh viện đầu tiên
  const [hospitals] = useState(getHospitals());
  const displayedHospitals = hospitals.slice(0, 3);

  const handleLoginPress = () => {
    navigation.navigate('LoginScreen');
  };

  const handleHospitalPress = (hospital) => {
    navigation.navigate('HospitalDetail', { hospitalId: hospital.id });
  };

  const handleSeeAllHospitals = () => {
    navigation.navigate('HospitalsList');
  };

  // Hàm để lấy tên hiển thị
  const getDisplayName = () => {
    if (userToken && userInfo?.name) {
      const name = userInfo.name;
      return name.length > 15 ? name.substring(0, 15) + '...' : name;
    }
    return 'Người dùng';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background with Doctor Image */}
      <View style={styles.backgroundContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/healthcare-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Xin chào!</Text>
            {userToken ? (
              <Text style={styles.loginText}>{getDisplayName()}</Text>
            ) : (
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={styles.loginText}>Đăng ký / Đăng nhập</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.greetingText}>How is it going today ?</Text>
          </View>
        </View>

        {/* Doctor Image */}
        <Image
          source={require('../../assets/doctor.png')}
          style={styles.doctorImage}
          resizeMode="contain"
        />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dịch vụ, bác sĩ, bài báo..."
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Service Icons */}
        <View style={styles.serviceContainer}>
          <TouchableOpacity 
            style={styles.serviceItem}
            onPress={() => navigation.navigate('RelativeCare')}
          >
            <View style={[styles.serviceIcon, { backgroundColor: '#4285F4' }]}>
              <Icon name="people" size={28} color="white" />
            </View>
            <Text style={styles.serviceText}>Chăm sóc sức khoẻ người thân</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceItem}
            onPress={() => navigation.navigate('MedicalExam')}
          >
            <View style={[styles.serviceIcon, { backgroundColor: '#4285F4' }]}>
              <Icon name="fitness" size={28} color="white" />
            </View>
            <Text style={styles.serviceText}>Đặt khám bệnh</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceItem}
            onPress={() => navigation.navigate('Emergency')}
          >
            <View style={[styles.serviceIcon, { backgroundColor: '#E53935' }]}>
              <Icon name="medkit" size={28} color="white" />
            </View>
            <Text style={styles.serviceText}>Cấp cứu</Text>
          </TouchableOpacity>
        </View>

        {/* Hospital List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bệnh viện hợp tác</Text>
          <TouchableOpacity onPress={handleSeeAllHospitals}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.hospitalList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.hospitalListContent}
        >
          {displayedHospitals.map((hospital) => (
            <TouchableOpacity
              key={hospital.id}
              style={styles.hospitalItem}
              onPress={() => handleHospitalPress(hospital)}
            >
              <Image
                source={hospital.image}
                style={styles.hospitalImage}
              />
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <View style={styles.hospitalLocationRow}>
                  <Icon name="location" size={12} color="#888" />
                  <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                </View>
                <View style={styles.hospitalRatingRow}>
                  <View style={styles.hospitalRatingStars}>
                    {[...Array(5)].map((_, index) => (
                      <Icon 
                        key={index}
                        name={index < Math.floor(hospital.rating) ? "star" : "star-outline"} 
                        size={12} 
                        color="#FFD700" 
                      />
                    ))}
                  </View>
                  <Text style={styles.hospitalRatingText}>{hospital.rating}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  backgroundContainer: {
    backgroundColor: '#F0F7FF',
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 25, 
    paddingBottom: 10,
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  logo: {
    width: 40,
    height: 40,
  },
  welcomeContainer: {
    flex: 1,
    marginTop: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
  },
  loginText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  greetingText: {
    fontSize: 14,
    color: '#888',
  },
  doctorImage: {
    height: 220,
    alignSelf: 'flex-end',
    marginRight: -100,
    marginTop: -10,
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -50,
    marginBottom: -35,
    paddingTop: 10,
    paddingBottom: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  serviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  serviceItem: {
    alignItems: 'center',
    width: '33%',
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4285F4',
  },
  hospitalList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hospitalListContent: {
    paddingBottom: 100, // Thêm padding để có thể scroll qua tab bar
  },
  hospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hospitalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  hospitalRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalRatingStars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  hospitalRatingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default HomeScreen;