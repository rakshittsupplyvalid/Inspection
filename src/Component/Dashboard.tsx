import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../service/api/apiInterceptors'; // Adjust the import path as necessary

const { width } = Dimensions.get('window');

type ProcurementCenter = {
  createdDate: string;
  federationName: string;
  id: string;
  latitude: number;
  location: string;
  longitude: number;
  name: string;
  vendorName: string;
};

const Dashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [data, setData] = useState<ProcurementCenter[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatusData = async (status: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/procurecenter?ApprovalStatus=${status}`);
      setData(response.data);
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusData(selectedStatus);
  }, [selectedStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderItem = ({ item }: { item: ProcurementCenter }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Icon name="business" size={20} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color="#6c757d" />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="people" size={16} color="#6c757d" />
          <Text style={styles.infoText}>{item.federationName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="person" size={16} color="#6c757d" />
          <Text style={styles.infoText}>{item.vendorName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="date-range" size={16} color="#6c757d" />
          <Text style={styles.infoText}>{formatDate(item.createdDate)}</Text>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.coordinatesContainer}
            onPress={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
              Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
            }}
          >
            <View style={styles.coordinateItem}>
              <Icon name="language" size={14} color="#6c757d" />
              <Text style={styles.coordinateText}>Lat: {item.latitude.toFixed(4)}</Text>
            </View>

            <View style={styles.coordinateItem}>
              <Icon name="language" size={14} color="#6c757d" />
              <Text style={styles.coordinateText}>Lng: {item.longitude.toFixed(4)}</Text>
            </View>

          </TouchableOpacity>
        </View>
      </View>

      {/* <View style={styles.cardFooter}>
        <Text style={styles.idText}>ID: {item.id}</Text>
      </View> */}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>FILTER BY STATUS</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={setSelectedStatus}
            style={styles.picker}
            dropdownIconColor="#495057"
          >
            <Picker.Item label="Approved" value="APPROVED" />
            <Picker.Item label="Pending" value="PENDING" />
            <Picker.Item label="Rejected" value="REJECTED" />
          </Picker>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={40} color="#adb5bd" />
              <Text style={styles.emptyText}>No procurement centers found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#212529',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5a70a',  // Primary blue
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#3a56e0',      // Slightly darker blue shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  iconContainer: {
    backgroundColor: '#f5a70a',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flexShrink: 1,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 70,


  },
  coordinateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  coordinateText: {
    fontSize: 12,
    color: '#495057',
    marginLeft: 6,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    padding: 5,
    backgroundColor: '#f8f9fa',
  },
  idText: {
    fontSize: 11,
    color: '#868e96',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#adb5bd',
    marginTop: 16,
  },
});

export default Dashboard;