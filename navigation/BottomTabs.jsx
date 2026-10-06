//import React from "react";
//import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
//import { Home, BarChart2, Repeat, List, Settings } from "lucide-react-native"; // Import icons
//import HomeScreen from "../app/(Tabs)/Home";
//import AnalysisScreen from "../app/(Tabs)/Analysis";
//import { TransactionScreen } from "../app/(Tabs)/Transactions";
//import { CategoriesScreen } from "../app/(Tabs)/Categories";
//import SettingScreen from "../app/(Tabs)/Setting";
//import { View, Text } from "react-native";
//
//const Tab = createBottomTabNavigator();
//
//export default function BottomTabs() {
//  // we should make the bottomTabs disappear when the user scrolldown
//
//  return (
//    <Tab.Navigator
//      screenOptions={({ route }) => ({
//        tabBarIcon: ({ focused, size }) => {
//          let IconComponent;
//
//          // Assign icons based on the route name
//          if (route.name === "Home") {
//            IconComponent = Home;
//          } else if (route.name === "Analysis") {
//            IconComponent = BarChart2;
//          } else if (route.name === "Transaction") {
//            IconComponent = Repeat;
//          } else if (route.name === "Categories") {
//            IconComponent = List;
//          } else if (route.name === "Setting") {
//            IconComponent = Settings;
//          }
//
//          // Return the icon component
//          return (
//            <View className="flex-1 flex-col items-center justify-center w-[120px]">
//              <IconComponent
//                color={focused ? "#000000" : "#787c7c"}
//                size={size}
//                style={{
//                  transform: focused ? [{ translateY: -0.75 }] : [{translateY: 2.75}], // Move icon up when focused
//                }}
//              />
//              <Text className="text-[#000000] text-[12px]">{focused ? route.name : ''}</Text>
//            </View>
//            
//          );
//        },
//        tabBarShowLabel: false, // Hide the tab labels
//        tabBarActiveTintColor: "#007AFF", // Active icon color
//        tabBarInactiveTintColor: "#787c7c", // Inactive icon color
//        headerShown: false, // Hide the header for all screens
//        tabBarStyle: {
//          position: "absolute",
//          height: 60,
//          borderTopLeftRadius: 40,
//          borderTopRightRadius: 40,
//          backgroundColor: "#cbf5af",
//          paddingTop: 10,
//        },
//      })}
//    >
//      <Tab.Screen name="Home" component={HomeScreen} />
//      <Tab.Screen name="Analysis" component={AnalysisScreen} />
//      <Tab.Screen name="Transaction" component={TransactionScreen} />
//      <Tab.Screen name="Categories" component={CategoriesScreen} />
//      <Tab.Screen name="Setting" component={SettingScreen} />
//    </Tab.Navigator>
//  );
//}