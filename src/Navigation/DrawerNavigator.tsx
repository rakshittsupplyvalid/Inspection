import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Dashboard from '../Component/Dashboard';
import ReviewForm from '../Component/Reviewformcomp/Reviewform';



import Icon from 'react-native-vector-icons/MaterialIcons';
import Storage from '../utils/Storage';

import { useNavigation } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {

          Storage.removeItem('userToken');
          console.log('User logged out and token removed');
          navigation.navigate('LoginApp' as never);
        },
      },
    ]);
  };

  return (
     
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#000" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>

  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
       screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#FFFFFF', width: 290 },
        drawerActiveTintColor: '#6200EE',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: { fontSize: 16, fontWeight: 'bold' },
      }}
     
    >
      <Drawer.Screen
        name="Procurement List"
        component={Dashboard}
        options={{
          headerStyle: {
            backgroundColor: '#FF9500', 
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          drawerIcon: ({ color, size }) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Review Form"
        component={ReviewForm}
        options={{
          headerStyle: {
            backgroundColor: '#FF9500', // 💚 Header background color
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          drawerIcon: ({ color, size }) => (
            <Icon name="assignment" size={size} color={color} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
   logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f8f8f8',
    position : 'relative',
    bottom: -550
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
  },
});
