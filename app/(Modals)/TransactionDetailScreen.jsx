import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or use Feather / MaterialIcons
import { useNavigation } from 'expo-router';
import { deleteTransactionsBySelected } from '@/database/database';
//import { styled } from 'nativewind';

//const StyledTouchableOpacity = styled(TouchableOpacity);
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// it works but the data doesn't change?
export default function TransactionDetailScreen({ route }) {
  const { stats } = route.params;

  const [mystats, setMystats] = useState(stats);

  const navigation = useNavigation();
  const date = new Date(stats.date);
  const formatCurrency = (amount) => amount.toLocaleString('en-US');


  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className={`pb-6 pt-[20px] px-4 rounded-b-3xl ${mystats.income ? 'bg-green-500' : 'bg-red-500'}`}>
        <View className="flex-row justify-between items-center mb-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>

          <Text className="text-white text-[18px] font-semibold">Detail Transaction</Text>

          <Pressable onPress={() => {
            deleteTransactionsBySelected([mystats.id]);
            navigation.goBack();
          }}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </Pressable>

        </View>

        <Text className="text-white text-[40px] font-bold text-center mt-[10px]">{formatCurrency(Number(mystats.amount))}</Text>
        <Text className="text-white text-lg text-center mt-2">{mystats.title}</Text>
        <Text className="text-white text-md text-center mt-1 mb-[15px]">{days[Number(date.getDay())]} {date.getDate()} {months[Number(date.getMonth())]} {date.getFullYear()}  {String(date.getHours() % 12 || 12).padStart(2, '0')}:{String(date.getMinutes()).padStart(2, '0')}</Text>
      </View>

      {/* Info Tags */}
      <View className="bg-white shadow-md rounded-xl mx-4 -mt-6 p-4 flex-row justify-between">
        <View className="items-center">
          <Text className="text-gray-500 text-md">Type</Text>
          <Text className="font-semibold text-[16px]">{mystats.income ? 'Income':'Expense'}</Text>
        </View>

        <View className="items-center">
          <Text className="text-gray-500 text-md">Category</Text>
          <Text className="font-semibold text-[16px]">{mystats.category}</Text>
        </View>
      </View>

      {/* Handle with this later */}
      <View className="px-4 mt-6">
        <Text className="text-gray-500 text-lg mb-2">Description</Text>
        <Text className="text-base text-gray-800">
          {mystats?.desc || 'No Description'}
        </Text>
      </View>

      {/* Handle with this later */}
      <View className="px-4 mt-6 w-full">
        <Text className="text-gray-500 text-lg mb-2">Attachment</Text>

        <View className='w-full flex items-center justify-center'>
          <View className='w-[95%] h-[200px] border-dotted border-gray-300 border-[2px] rounded-[25px]'>
            
          </View>
        </View>
      </View>

      {/* Edit Button */}
      <View className="px-4 mt-6 mb-10">
        <Pressable 
          className="bg-purple-600 py-3 rounded-xl"
          onPress={() => navigation.navigate('AddTransaction', {
            selectedCategory : mystats.category,
            stats : mystats,
            isEdit : true,
            onSave : setMystats
          })}
        >
          <Text className="text-white text-center font-semibold text-lg">Edit</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
