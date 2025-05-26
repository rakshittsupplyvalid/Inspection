import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginApp from './src/Component/Login/LoginApp';

import DrawerNavigator from './src/Navigation/DrawerNavigator'


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginApp" screenOptions={{ headerShown: true }}>

        <Stack.Screen name="LoginApp"
          component={LoginApp}
          options={{ headerShown: false }}

        />
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
