// src/screens/LoginApp.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  StatusBar
} from 'react-native';

import Storage from '../../utils/Storage';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';
import styles from './LoginStyles'


const LoginApp = ({ navigation }: any) => {
  const { state, updateState } = useForm();
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    updateState({
      form: {
        mobileNo: '9634958888',
        password: 'Password@123'
      }
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    updateState({
      form: {
        ...state.form,
        [field]: value
      }
    });

  };

  // const handleLogin = async () => {
  //   const { mobileNo, password } = state.form;

  //   navigation.navigate('DrawerNavigator');


  //   if (!mobileNo || !password) {
  //     Alert.alert('Error', 'Please enter both mobile number and password');
  //     return;
  //   }

  //   if (mobileNo.length !== 10) {
  //     Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
  //     return;
  //   }
  //   setIsLoading(true);
  // };


  const handleLogin = async () => {
    const { mobileNo, password } = state.form;

    if (!mobileNo || !password) {
      Alert.alert('Error', 'Please enter both mobile number and password');
      return;
    }

    if (mobileNo.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/login/user', {
        mobileNo,
        password,
      });

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Login failed');
      }

      const { token } = response.data;
      if (!token) {
        throw new Error('Authentication token not received');
      }

      // Store token securely using MMKV
      Storage.setString('userToken', token);
      console.log('Login successful, token:', token);

      // Reset form after successful login
      updateState(null);

      navigation.navigate('DrawerNavigator');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials or network error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FF9500" />
      <Image
        source={require('../../../assets/logo.jpg')}
        style={{
          width: 250,
          height: 250,
          resizeMode: 'center', // or 'cover', 'stretch', 'center'
          marginLeft: 30

        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        placeholderTextColor="#a0aec0"
        keyboardType="number-pad"
        value={state.form?.mobileNo || ''}
        onChangeText={(text) => handleChange('mobileNo', text)}
        maxLength={10}
      />
        <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#a0aec0"
        secureTextEntry
        value={state.form?.password || ''}
        onChangeText={(text) => handleChange('password', text)}
      />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4f46e5" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.forgotPassword}>Forgot Password?</Text>
    </View>
  );
};


export default LoginApp;