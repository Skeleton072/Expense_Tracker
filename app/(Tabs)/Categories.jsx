import React, { useEffect, useState, useRef } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import '@/global.css';
import { useNavigation } from 'expo-router';
import { getAllCategories, getMonthlyTransactions } from '@/database/database'; 
import { useIsFocused } from "@react-navigation/native";
import { ProgressBar } from 'react-native-paper'; // install with: `npm i react-native-paper`


const iconsLibrary = {
  'MaterialIcons': MaterialIcons,
  'FontAwesome5': FontAwesome5,
  'MaterialCommunityIcons': MaterialCommunityIcons,
}

// make a different color set for progress
// heading should be different
export default function CategoriesScreen() {
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const categorizedRef = useRef(null)
  const formatCurrency = (amount) => amount.toLocaleString('en-US');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllCategories('all');
      const monthlyTransactions = await getMonthlyTransactions();
      const mydict = { totalExpense : 0, totalBudget : 0 };


      monthlyTransactions.forEach(transaction => {
        if (!mydict[transaction.category]) {
          mydict[transaction.category] = 0;
        }
        mydict[transaction.category] += transaction.amount;
      
        // Only add expenses to totalExpense
        if (!transaction.income) {
          mydict.totalExpense += transaction.amount;
        }
      });
      
      res.forEach(category => {
        if (category.type === 'expense') {
          mydict.totalBudget += category.budget;
        }
      });
      
      setProgress(mydict.totalExpense / mydict.totalBudget);

      categorizedRef.current = mydict;
      setCategories(res);
    }

    fetchData();
  }, [isFocused]);

  const getExpenseProgressColor = () => {
    if (progress < 0.5) return '#4ade80';
    if (progress < 0.8) return '#facc15'; 
    return '#ce0000';
  };

  return (
    <ScrollView className="flex-1 bg-[#faffd6] mb-[60px]">
      {/* Top Header */}
      <View className='flex items-center justify-between w-full bg-[#b0e1a2] pt-[15px] pb-[15px]'>
        <View className="flex-row justify-between items-center relative w-[90%]">
          {/* should use a hamburger menu */}
          <Pressable
            className="flex items-center justify-center w-[40px] h-[40px]"
          >
            <Feather name="menu" size={26} color="#000000" />
          </Pressable>

          <View className='flex-row items-center'>

            <Pressable
              className="flex-row items-center space-x-2 ml-[15px]"
              onPress={() => navigation.navigate('AddCategory')}
            >
              <MaterialIcons name="add-circle-outline" color="#000000" size={27} />
            </Pressable>
          </View>
        </View>

        <View className='w-[90%] mt-[5px] mb-[15px] flex items-center'>
          <Text className='text-2xl font-semibold mb-[10px]'>Monthly Budget</Text>

          <ProgressBar
            progress={progress}
            color={getExpenseProgressColor()}
            style={{ height: 14, borderRadius: 20, backgroundColor: '#e5e7eb' }}
          />

          <Text className="text-lg text-center text-gray-600 mt-[9px]">
            Spent
            <Text className='font-semibold'> {formatCurrency(categorizedRef.current?.totalExpense || 0)} </Text>
            of 
            <Text className='font-semibold'> {formatCurrency(categorizedRef.current?.totalBudget || 0)} </Text>
            ({Math.min(100, Math.round(progress * 100))}%)
          </Text>
        </View>

      </View>

      {/* Categories Grid */}
      <View className='px-1 '>
        <View className="flex-row flex-wrap justify-center gap-[15px] mt-[10px]">
          {categories.map((category, index) => {

            const IconComponent = iconsLibrary[category.iconLibrary];
            const size = category.iconLibrary === 'FontAwesome5' ? 26 : 30;

            const getExpenseProgressColor = () => {
              const ratio = categorizedRef.current[category.name] / category.budget;

              if (!ratio || ratio < 0.5) return '#b0e1a2';
              if (ratio < 0.8) return '#facc15'; 
              return '#f44336';
            };

            return (
              <Pressable
                key={index}
                onPress={() => navigation.navigate('CategoryDetail', { category })}
                className={`w-[110px] h-[110px] rounded-2xl items-center justify-center shadow-md`}
                style={{ backgroundColor : getExpenseProgressColor() }}
              >
                <IconComponent name={category.iconName} color="black" size={size} />
                <Text className="text-[14px] text-black mt-2">{category.name}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </ScrollView>
  );
}

