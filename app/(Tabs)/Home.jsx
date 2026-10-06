import React, { useEffect, useState, useMemo } from 'react'
import { Text, View, ScrollView, TouchableOpacity, Pressable } from 'react-native'
import { ArrowDownRightSquare, ArrowUpLeftSquare, Icon } from "lucide-react-native"; // Import icons
import { initDb , getTodayTransactions, deleteFunction, getTotalIncome, getTotalExpenses, getFoodExpenses, getMonthlyTransactions, getAllCategories } from '../../database/database';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import '@/global.css';
import { useNavigation } from 'expo-router';

const categoryIcons = {
  Food: <MaterialIcons name='fastfood' color="#000000" size={23} />,
  Transport: <MaterialIcons name='directions-bus' color="#000000" size={23} />,
  Shopping: <MaterialIcons name='shopping-cart' color="#000000" size={23} />,
  Rent: <MaterialIcons name='house' color="#000000" size={23} />,
  Gift: <MaterialIcons name='wallet-giftcard' color="#000000" size={23} />,
  Medicine: <MaterialIcons name='medical-services' color="#000000" size={23} />,
  Entertainment: <MaterialIcons name='subscriptions' color="#000000" size={23} />,
  Salary: <FontAwesome5 name='money-bill-wave' color="#000000" size={21} />,
};

const iconsLibrary = {
  'MaterialIcons': MaterialIcons,
  'FontAwesome5': FontAwesome5,
  'MaterialCommunityIcons': MaterialCommunityIcons,
}

export default function HomeScreen() {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const formatCurrency = (amount) => amount.toLocaleString('en-US');

  const [stats, setStats] = useState({
    totalIncome : 0,
    totalExpenses : 0,
    foodExpenses : 0,
    todayTransactions : [],
    monthlyTransactions : []
  });

  const fetchData = async () => {
    await initDb();

    const tempTodayTransactions = await getTodayTransactions(); //
    const tempIncome = await getTotalIncome();
    const tempExpenses = await getTotalExpenses();
    const tempFoodExpenses = await getFoodExpenses(); //
    const tempMonthlyTransactions = await getMonthlyTransactions(); //


    const allCategories = await getAllCategories('all');

    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name] = cat; // Key by category name
    });

    const detailedExpenses = tempTodayTransactions.map(expense => {
      const category = categoryMap[expense.category]; // Look up once, super fast
      return {
        ...expense,
        iconLibrary: category?.iconLibrary,
        iconName: category?.iconName
      };
    });
    
    setStats({
      totalIncome : tempIncome,
      totalExpenses : tempExpenses,
      foodExpenses : tempFoodExpenses,
      todayTransactions : detailedExpenses,
      monthlyTransactions : detailedExpenses // we won't show this one
    })

  };

  useEffect(() => {
    fetchData();
  }, [isFocused]);


  const monthlyExpenses = useMemo(() => (
    stats.monthlyTransactions.reduce((total, item) => (
      total + (item.income ? item.amount : -item.amount)
    ), 0)
  ), [stats]);


  const percentageUsed = Math.min((50 / 100) * 100, 100); // we should use % of user budget not monthly income.

  return (
    <View className='bg-[#b0e1a2] flex-1 pt-[25px]'>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Header Section, change this header section */}
        <View  className='flex-row items-center justify-between w-full mt-[25px]'>
          <View className='pl-[30px]'>
            <Text className="text-[#000000] text-[20px] font-bold">Money Manager</Text>
          </View>

          <TouchableOpacity
            className='pr-[30px]'
            onPress={() => navigation.navigate('AddTransaction')} // Navigate to AddTransaction screen
          >
            <MaterialIcons name='add-circle-outline' color="#000000" size={27} />
          </TouchableOpacity>
        </View>

        {/* Overall income and expenses */}
        <View className="flex-col items-center justify-evenly mt-[40px]">

          <View className='flex-row justify-evenly'>
            <View className='flex items-center w-1/2 border-r-[3px] border-[#ffffff]'>
              <View className='flex-row items-start'>
                <ArrowDownRightSquare color="#000000" size={20} />
                <Text className='pl-[5px]'>Total Income</Text>
              </View>
              <Text className="text-[#ffffff] font-bold text-[24px]">{formatCurrency(stats.totalIncome)}</Text>
            </View>

            <View className='flex items-center w-1/2'>
              <View className='flex-row items-start'>
                <ArrowUpLeftSquare color="#000000" size={20} />
                <Text className='pl-[5px]'>Total Expense</Text>
              </View>
              <Text className="text-red-500 font-bold text-[24px]">-{formatCurrency(stats.totalExpenses)}</Text>
            </View>
          </View>

          <View className="w-[90%] mt-[20px] flex-col items-center justify-center" >
            {/* Progress Bar Container */}
            <View className="w-[90%] h-[20px] bg-[#e0e0e0] rounded-full overflow-hidden">
              {/* Progress Bar */}
              <View
                style={{
                  width: `${percentageUsed}%`,
                  backgroundColor: percentageUsed > 75 ? '#ff4d4d' : '#4caf50', // Red if > 75%, green otherwise
                  height: '100%'
                }}
              />
            </View>

            {/* Label */}
            <Text className="text-[16px] text-[#000000] mt-[10px]">
              {`You've used ${percentageUsed.toFixed(2)}% of This month's Income`}
            </Text>
          </View>
          
        </View>

        <View className='flex-1 bg-[#faffd6] mt-[20px] rounded-t-[50px] shadow items-center pb-[70px]'>
          
          {/* Overall Analysis */}
          <View className="flex-row items-center justify-evenly p-4 bg-[#b0e1a2] mt-[18px] rounded-[40px] shadow w-[90%] h-[170px]">
            
            <View className="w-[36%] flex items-center border-r-[3px] border-[#ffffff] pr-[10px]">
              
              <View className="w-[90px] h-[90px] bg-opacity-0 border-[3px] border-[#ffa1b3] rounded-full items-center justify-center">
                <FontAwesome5 name='car' color="#000000" size={60} />
              </View>

              <Text className='text-center text-[13px]'>Savings {'\n'} On Goals</Text>

            </View>       

            <View className="w-[64%] flex items-center justify-center pl-[10px] relative">

              <View className='h-[50%] border-b-[3px] border-[#ffffff] flex-row items-center justify-evenly w-full relative'>

                <View className='w-[50px] h-[50px] bg-[#cdf5af] rounded-full items-center justify-center'>
                  <FontAwesome5 name='money-bill-wave' color="#000000" size={21} />
                </View>
                
                <View className='ml-[10px] w-[80%] pl-[5px]'>
                  <Text className='text-[14px]'>Revenue this month</Text>
                  <Text className="text-[#ffffff] text-[18px] font-bold">{formatCurrency(monthlyExpenses)}</Text>
                </View>
              </View>

              <View className='h-[50%] flex-row items-center justify-evenly w-full relative'>
                <View className='w-[50px] h-[50px] bg-[#cdf5af] rounded-full items-center justify-center'>
                  <MaterialIcons name='fastfood' color="#000000" size={23} />
                </View>
                <View className='ml-[10px] w-[80%] pl-[5px]'>
                  <Text className='text-[14px]'>Food This Month</Text>
                  <Text className="text-red-500 text-[18px] font-bold">-{formatCurrency(stats.foodExpenses)}</Text>
                </View>
              </View>

            </View>
          </View>

          <TransactionsSection todayTransactions={stats.todayTransactions} monthlyTransactions={stats.monthlyTransactions}/>

        </View>

      </ScrollView>
    </View>
  )

}

function TransactionsSection({ todayTransactions, monthlyTransactions}) {
  // we have to deal with monthly transactions and yearly transactions
  // instead of showing all the transactions, we should show the expenses by categories
  // for example, food, 5 transactions, 50000
  
  const [showData, setShowData] = useState(0); // indicate which transaction to show; today or this month or even this year??
  const [data, setData] = useState(todayTransactions);
  const formatCurrency = (amount) => amount.toLocaleString('en-US');

  useEffect(() => {
    if (showData == 0) {
      setData(todayTransactions);
    } else if (showData == 1) {
      setData(monthlyTransactions);
    } else {
      setData(todayTransactions);
    }
  }, [todayTransactions, showData, monthlyTransactions]);



  return (
    <View className='mt-[25px] w-full flex items-center'>

      <View className='flex-row items-center justify-center mt-[10px] mb-[10px] rounded-[17px] bg-[#faffd6] border-[2px] border-[#b0e1a2] w-[90%]'>
        <TouchableOpacity className={`w-[33%] flex items-center justify-center rounded-l-[15px] border-r-[2px] border-r-[#b0e1a2] ${showData == 0 ? 'bg-[#b0e1a2]' : 'bg-[#faffd6]'}`} onPress={() => setShowData(0)}>
          <Text className={`text-[17px] text-[#000000] font-bold-800 pt-[12px] pb-[12px] ${showData == 0 ? 'text-[#faffd6]' : 'text-[#000000]'}`}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity className={`w-[33%] flex items-center justify-center border-r-[2px] border-r-[#b0e1a2] ${showData == 1 ? 'bg-[#b0e1a2]' : 'bg-[#faffd6]'}`} onPress={() => setShowData(1)}>
          <Text className={`text-[17px] text-[#000000] font-bold-800 pt-[12px] pb-[12px] ${showData == 1 ? 'text-[#faffd6]' : 'text-[#000000]'}`}>This Month</Text>
        </TouchableOpacity>
        <TouchableOpacity className={`w-[34%] flex items-center justify-center rounded-r-[15px] ${showData == 2 ? 'bg-[#b0e1a2]' : 'bg-[#faffd6]'}`} onPress={() => setShowData(2)}>
          <Text className={`text-[17px] text-[#000000] font-bold-800 pt-[12px] pb-[12px] ${showData == 2 ? 'text-[#faffd6]' : 'text-[#000000]'}`}>This Year</Text>
        </TouchableOpacity>
      </View>

      {
        data.length > 0 ? (
          <View className='w-[90%] flex-col items-center justify-center mt-[10px]'>
            {
              data.map((item, index) => {
                const IconComponent = iconsLibrary[item.iconLibrary];
                const size = item.iconLibrary === 'FontAwesome5' ? 23 : 21; // Adjust size based on icon library

                return (
                  <View 
                    key={index}
                    className="flex-row items-center justify-between bg-[#b0e1a2] p-4 rounded-xl mb-3 shadow-md w-full"
                  >
                    <View className="flex-row items-center space-x-4">
                      <View className={`w-[45px] h-[45px] rounded-full bg-[#cbf5af] flex items-center justify-center`}>
                        <IconComponent name={item.iconName} color="#000000" size={size} />
                      </View>
                      <View className='ml-[15px]'>
                        <Text className="text-black text-[17px]">{item.category}</Text>
                        <Text className="text-gray-500 text-[14px]">{item.title}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className={`text-[18px] font-semibold ${item.income ? 'text-green-800' : 'text-red-500'}`}>
                        {item.income ? '+' : '-'}{formatCurrency(item.amount)}
                      </Text>
                      {/*<Text className="text-[14px] text-gray-400">{item.date.split('T')[0]}</Text>we should also add time */}
                    </View>
                  </View>    
                )
              })
            }
          </View>
        ) : (
          <Text>No transactions yet.</Text>
        )
      }
    </View>
  )
}
