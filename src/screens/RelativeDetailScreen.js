// src/screens/RelativeDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { maskSensitiveData } from '../utils/sensitiveDataUtils';

const RelativeDetailScreen = ({ navigation, route }) => {
  const { relative } = route.params || {};

  if (!relative) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết người thân</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="person-outline" size={80} color="#ddd" />
          <Text style={styles.errorText}>Không tìm thấy thông tin người thân</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return '--';
    }
  };

  // Get relationship color
  const getRelationshipColor = (relationship) => {
    switch(relationship?.toLowerCase()) {
      case 'cha':
      case 'bố': return '#2196F3';
      case 'mẹ': return '#E91E63';
      case 'con': return '#4CAF50';
      case 'anh':
      case 'chị':
      case 'em': return '#FF9800';
      default: return '#9C27B0';
    }
  };

  // Get relationship icon
  const getRelationshipIcon = (relationship) => {
    switch(relationship?.toLowerCase()) {
      case 'cha':
      case 'bố': return 'man';
      case 'mẹ': return 'woman';
      case 'con': return 'happy';
      case 'anh':
      case 'em': return 'people';
      case 'chị': return 'woman-outline';
      default: return 'person';
    }
  };

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
        <Text style={styles.headerTitle}>Chi tiết người thân</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('RelativeForm', { relative })}
        >
          <Icon name="create-outline" size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: getRelationshipColor(relative.relationship) }]}>
            <Icon
              name={getRelationshipIcon(relative.relationship)}
              size={50}
              color="#fff"
            />
          </View>
          <Text style={styles.profileName}>{relative.name}</Text>
          <View style={[styles.relationshipBadge, { backgroundColor: getRelationshipColor(relative.relationship) }]}>
            <Text style={styles.relationshipText}>{relative.relationship}</Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Icon name="person-outline" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{relative.name || '--'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tuổi</Text>
            <Text style={styles.infoValue}>{relative.age ? `${relative.age} tuổi` : '--'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mối quan hệ</Text>
            <Text style={styles.infoValue}>{relative.relationship || '--'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày sinh</Text>
            <Text style={styles.infoValue}>{formatDate(relative.dateOfBirth)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Giới tính</Text>
            <Text style={styles.infoValue}>{relative.gender || '--'}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Icon name="call-outline" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{relative.phone || '--'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{relative.email || '--'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{relative.address || '--'}</Text>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Icon name="medical-outline" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Thông tin y tế</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>CMND/CCCD</Text>
            <Text style={styles.infoValue}>
              {relative.nationalId ? maskSensitiveData(relative.nationalId, 3) : '--'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Số thẻ BHYT</Text>
            <Text style={styles.infoValue}>
              {relative.healthInsuranceId ? maskSensitiveData(relative.healthInsuranceId, 3) : '--'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nhóm máu</Text>
            <Text style={styles.infoValue}>{relative.bloodType || '--'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dị ứng</Text>
            <Text style={styles.infoValue}>{relative.allergies || '--'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tiền sử bệnh</Text>
            <Text style={styles.infoValue}>{relative.medicalHistory || '--'}</Text>
          </View>
        </View>

        {/* Emergency Contact */}
        {(relative.emergencyContactName || relative.emergencyContactPhone) && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Icon name="call" size={20} color="#E53935" />
              <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tên người liên hệ</Text>
              <Text style={styles.infoValue}>{relative.emergencyContactName || '--'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{relative.emergencyContactPhone || '--'}</Text>
            </View>
          </View>
        )}

        {/* Additional Information */}
        {relative.notes && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Icon name="document-text-outline" size={20} color="#4285F4" />
              <Text style={styles.sectionTitle}>Ghi chú</Text>
            </View>

            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{relative.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editActionButton]}
          onPress={() => navigation.navigate('RelativeForm', { relative })}
        >
          <Icon name="create-outline" size={20} color="#4285F4" />
          <Text style={styles.editActionText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.careActionButton]}
          onPress={() => navigation.navigate('RelativeCare')}
        >
          <Icon name="heart-outline" size={20} color="#fff" />
          <Text style={styles.careActionText}>Đặt khám</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  relationshipBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  relationshipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 0.4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 0.6,
    textAlign: 'right',
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  editActionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  careActionButton: {
    backgroundColor: '#4285F4',
  },
  editActionText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  careActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default RelativeDetailScreen;