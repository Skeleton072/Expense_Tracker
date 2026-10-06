import { Tabs } from 'expo-router';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabLayout() {
  return (

    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',      // Active tab color
        tabBarInactiveTintColor: '#8E8E93',    // Inactive tab color
        tabBarStyle: { 
          backgroundColor : '#faffd6', borderTopLeftRadius : 30, borderTopRightRadius : 30
        }
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={21} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Analysis"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="chart-pie" size={21} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Transactions"
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="repeat" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="Categories"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="list" size={21} color={color} />  // Fixed icon name
          ),
        }}
      />
      
      <Tabs.Screen
        name="Setting"
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>

  );
}