import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Pressable, TextInput, Animated, Modal } from 'react-native';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import '@/global.css';
import { useNavigation } from 'expo-router';
import { getTransactionsByCategory, updateCategories, deleteTransactionsByCategoryName, deleteTransactionsBySelected } from '@/database/database'; 
import { useIsFocused } from "@react-navigation/native";
import { ArrowLeftCircle } from "lucide-react-native";
import { getCategoryByName } from '@/database/database';
import { ProgressBar } from 'react-native-paper'; // install with: `npm i react-native-paper`
import { Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MonthSelectorModal = ({ visible, onClose, onSelect, selectedMonth }) => {
  const [mymonth, setMymonth] = useState(selectedMonth);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable className="flex-1 bg-black/40 justify-center items-center" onPress={onClose}>
        <View className="bg-white p-5 rounded-2xl w-[90%] max-w-[350px] shadow-lg" onStartShouldSetResponder={() => true}>

          <View className='flex-row items-start justify-between w-full'>
            <Text className="text-center text-[20px] font-bold mb-4 text-gray-800">Select a Month</Text>

            <Pressable 
              className='px-[10px] py-[7px] rounded-[10px] bg-purple-300'
              onPress={() => {
                setMymonth('all');
              }}
            >
              <Text className='font-semibold font-md'>Reset</Text>
            </Pressable>
          </View>
          
          <View className="flex flex-row flex-wrap justify-between mt-[15px]">
            {months.map((month, index) => {
              const isSelected = mymonth === month;
              return (
                <TouchableOpacity
                  key={index}
                  className={`w-[30%] m-[1%] rounded-xl py-3 items-center justify-center
                    ${isSelected ? 'bg-[#b0e1a2]' : 'bg-gray-100'}
                  `}
                  onPress={() => setMymonth(month)}
                >
                  <Text className={`text-[16px] font-medium text-gray-800`}>
                    {month.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className='flex-row items-center justify-end mt-[20px]'>
            <Pressable 
              className='px-[10px] py-[7px] bg-blue-100 rounded-[10px] mr-[15px]'
              onPress={onClose}
            >
              <Text className='font-semibold text-lg text-blue-600'>Cancel</Text>
            </Pressable>

            <Pressable 
              className='px-[10px] py-[7px] bg-blue-100 rounded-[10px]'
              onPress={() => {
                onSelect(mymonth);
                onClose();
              }}
            >
              <Text className='font-semibold text-lg text-blue-600'>Ok</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

// too many re-renders
const BudgetComponent = ({ categoryStats, total, limit, editing, setEditing }) => {
  const [budget, setBudget] = useState(limit);
  const [expense, setExpense] = useState(0); // Replace with your actual data
  const [shownBudget, setShownBudget] = useState(limit);
  //const [editing, setEditing] = useState(false);
  const [inputWidth] = useState(new Animated.Value(250));
  const formatCurrency = (amount) => amount.toLocaleString('en-US');

  //console.log(total);

  const totalBudget = parseFloat(shownBudget);
  const progress = totalBudget > 0 ? expense / totalBudget : 0;

  useEffect(() => {
    setExpense(total);
  }, [total]);

  useEffect(() => {
    setBudget(limit);
    setShownBudget(limit);
  }, [limit])

  useEffect(() => {
    Animated.timing(inputWidth, {
      toValue: editing ? 280 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [editing]);

  const handleCreatePress = () => setEditing(true);

  const handleSubmit = () => {
    if (!isNaN(totalBudget) && totalBudget > 0) {
      setShownBudget(budget);
      updateCategories(categoryStats.name, Number(budget));
      setEditing(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete your budget plan?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBudget('');
            setExpense(0);
            setEditing(false);
            updateCategories(categoryStats.name, 0);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getExpenseProgressColor = () => {
    const ratio = expense / totalBudget;
    if (ratio < 0.5) return '#4ade80';
    if (ratio < 0.8) return '#facc15'; 
    return '#ce0000';
  };

  const getIncomeProgressColor = () => {
    const ratio = expense / totalBudget;
    if (ratio < 0.5) return '#ce0000'; 
    if (ratio < 0.8) return '#facc15'; 
    return '#4ade80';
  }

  return (
    <Pressable className="items-center justify-center w-full p-4 space-y-4 h-[125px]">
      {!editing && totalBudget > 0 ? (
        <View className="w-full p-4 space-y-3">

          <ProgressBar
            progress={progress}
            color={categoryStats.type == 'income' ? getIncomeProgressColor() : getExpenseProgressColor()}
            style={{ height: 14, borderRadius: 20, backgroundColor: '#e5e7eb' }}
          />

          <Text className="text-md text-center text-gray-600 mt-[7px]">
            {categoryStats.type == 'income' ? 'Made' : 'Spent'} 
            <Text className='font-semibold'> {formatCurrency(total)} </Text>
             of 
            <Text className='font-semibold'> {formatCurrency(shownBudget)} </Text>
            ({Math.min(100, Math.round(progress * 100))}%)
          </Text>

          <View className="flex-row justify-between items-center space-x-4 pt-4">
            <TouchableOpacity
              className="bg-blue-100 px-[25px] py-[8px] rounded-xl text-[18px]"
              onPress={handleEdit}
            >
              <Text className="text-blue-600 font-medium">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-100 px-[25px] py-[8px] rounded-xl text-[18px]"
              onPress={handleDelete}
            >
              <Text className="text-red-600 font-medium">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : !editing ? (
        <TouchableOpacity
          className="bg-[#faffd6] px-6 py-3 h-[50px] rounded-2xl shadow-lg active:scale-95"
          onPress={handleCreatePress}
          activeOpacity={0.8}
        >
          <Text className="text-lg font-semibold tracking-wide">
            Create {categoryStats.type == 'income' ? 'Target' : 'Budget'}
          </Text>
        </TouchableOpacity>
      ) : (
        <Animated.View style={{ width: inputWidth }}>
          <TextInput
            className="bg-[#faffd6] px-6 py-3 h-[50px] rounded-2xl shadow-lg text-center text-gray-800 text-lg font-medium"
            placeholder="Enter budget amount"
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
            autoFocus
            onSubmitEditing={handleSubmit}
          />
        </Animated.View>
      )}
    </Pressable>
  );
};

const DeleteModal = ({ visible, cancelFunction, deleteFunction }) => {

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable 
        className='flex-1 items-center justify-center bg-black/30'
        onPress={cancelFunction}
      >

        <View className='bg-[#faffd6] rounded-[20px] w-[90%] flex items-center px-[10px] py-[25px]'>
          <Feather name='alert-circle' size={60} color={'#ce0000'}/>

          <Text className='text-[22px] text-center mt-[20px] font-semibold'>Are you sure?</Text>
          <Text className='text-[16px] text-gray-400 text-center mt-[15px]'>Are you really going to delete all the transactions. This process cannot be undone.</Text>

          <View className='flex-row items-center justify-center gap-[20px] mt-[25px]'>
            <Pressable 
              onPress={cancelFunction}
              className='flex items-center justify-center rounded-[10px] w-[130px] py-[15px] bg-gray-400'
            >
              <Text className='text-[16px] text-white'>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={deleteFunction}
              className='flex items-center justify-center rounded-[10px] w-[130px] py-[15px] h-[55px] bg-red-500'
            >
              <Text className='text-[16px] text-white'>Delete</Text>
            </Pressable>
          </View>
        </View>

      </Pressable>

    </Modal>
  )
}

export default function CategoryDetailScreen({ route }) {
  const { category } = route.params;

  const [mystats, setMystats] = useState({
    total : 0,
    categoryStats : {},
    icon : null
  })

  const [transactions, setTransactions] = useState({});
  const [budget, setBudget] = useState(0);
  const [editing, setEditing] = useState(false);

  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const transactionsRef = useRef({});
  const navigation = useNavigation();
  const formatCurrency = (amount) => amount.toLocaleString('en-US');
  const isFocused = useIsFocused();


  const fetchData = useCallback(async () => {
    const fetchedData = await getTransactionsByCategory(category.name);
    let res = {};
    let tempTotal = 0;

    fetchedData.forEach(item => {
      const mymonth = months[new Date(item.date).getMonth()];
      if (!res[mymonth]) {
        res[mymonth] = {total : 0, transactions : []};
      }
      res[mymonth].transactions.push(item);
      res[mymonth].total += item.amount;
      tempTotal += item.amount;
    });

    let tempCategory = await getCategoryByName(category.name);
    tempCategory = tempCategory[0];
    
    const IconComponent = iconsLibrary[tempCategory.iconLibrary]; 
    const size = tempCategory.iconLibrary === 'FontAwesome5' ? 21 : 23;

    const sortedMonth = Object.entries(res).sort((a, b) => months.indexOf(b[0]) - months.indexOf(a[0]));
    res = Object.fromEntries(sortedMonth);

    for (const month in res) {
      res[month].transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    transactionsRef.current = Object.entries(res).length > 0 ? res : {[months[new Date().getMonth()]] : { total : 0, transactions : [] }};
    setTransactions(res);
    setMystats({
      total : tempTotal,
      categoryStats : tempCategory,
      icon : <IconComponent name={tempCategory.iconName} color="black" size={size} />
    })
    setBudget(tempCategory.budget);
  });

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    if (selectedMonth == 'all') {
      setTransactions({...transactionsRef.current});
    } else if (transactionsRef.current[selectedMonth]) {
      setTransactions({ [selectedMonth] : transactionsRef.current[selectedMonth] });
    } else {
      setTransactions({ [selectedMonth] : { total : 0, transactions : [] } });
    }
  }, [selectedMonth]);



  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const handleLongPress = (item) => {
    setSelectionMode(true);
    setSelectedTransactions([item.id]); // assume each item has a unique `id`
  };

  const handleItemPress = (item) => {
    if (!selectionMode) {
      navigation.navigate('TransactionsDetail', { stats : item })
    } else {
      setSelectedTransactions((prev) => {
        if (prev.includes(item.id)) {
          const temp = prev.filter(id => id !== item.id);
          if (temp.length == 0) {
            setSelectionMode(false);
          }
          return temp;
        } else {
          return [...prev, item.id];
        }
      });
    }
  };


  // rewrite this shit
  function deleteFunction() {
    if (selectedTransactions.length > 0) {
      deleteTransactionsBySelected(selectedTransactions);
    } else {
      deleteTransactionsByCategoryName(category.name);
    }
    setDeleteModalVisible(false);
    setSelectionMode(false);
    fetchData();

  }

  const renderLeftActions = (item) => (
    <Pressable
      onPress={() => {
        deleteTransactionsBySelected([item.id]);
        fetchData();
      }}
      className="bg-red-500 justify-center items-center w-[65px] rounded-xl mt-[7px] mr-2"
    >
      <FontAwesome5 name='trash-alt' color="#fff" size={25} />
    </Pressable>
  );
  
  

  return (
    <Pressable 
      className="flex-1 bg-[#b0e1a2] items-center"
      onPress={() => {
        if (editing) {
          setEditing(false);
        }
      }}
    >

      <View className="flex-row items-center px-4 pt-[15px] pb-[6px]">

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeftCircle color="#000000" size={25} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-[23px] font-semibold">{category.name}</Text>

        <View className='flex-row items-center'>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddTransaction', { selectedCategory : category.name })} // Navigate to AddTransaction screen
            className='mr-[15px]'
          >
            <MaterialIcons name='add-circle-outline' color="#000000" size={27} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeleteModalVisible(true)}
          >
            <FontAwesome5 name='trash-alt' color="#000000" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <BudgetComponent
        categoryStats={mystats.categoryStats}
        total={transactionsRef.current[`${months[new Date().getMonth()]}`]?.total || 0}
        limit={budget}
        editing={editing}
        setEditing={setEditing}
      />

      <MonthSelectorModal
        visible={monthModalVisible}
        onClose={() => setMonthModalVisible(false)}
        selectedMonth={selectedMonth}
        onSelect={(month) => setSelectedMonth(month)}
      />

      <DeleteModal 
        visible={deleteModalVisible}
        cancelFunction={() => setDeleteModalVisible(false)}
        deleteFunction={() => deleteFunction()}
      />


      <View 
        className="flex-1 mt-6 rounded-t-[50px] bg-[#faffd6] p-6 w-full"
      >

        <View className="flex-row justify-between items-start mb-4">

          <Text className="text-[18px] font-bold">All Transactions</Text>

          {
            selectionMode ? (
              <Pressable 
              onPress={() => {
                const res = Object.entries(transactions).flatMap(([_, { transactions }]) => 
                  transactions.map(item => item.id)
                );

                setSelectedTransactions(() => {
                  if (selectedTransactions.length == res.length) {
                    setSelectionMode(false);
                    return [];
                  } else {
                    return res
                  }
                });

              }}>
                <FontAwesome5 name="check-square" color="#000000" size={25} />
              </Pressable>
            ) : (
              <Pressable onPress={() => setMonthModalVisible(true)}>
                <MaterialIcons name="calendar-month" color="#000000" size={25} />
              </Pressable>
            )
          }


        </View>

        {
          Object.entries(transactions).map(([month, {total, transactions}], index) => (
            <View key={index} className='flex items-center justify-between mt-[10px] pb-[10px]'>

              <View className='flex-row justify-between w-[95%]'>
                <Text className='text-[18px] font-bold'>{month}</Text>
                <Text className={`text-[17px] font-semibold text-blue-500`}>
                  {category.type == 'income' ? '+':'-'}{formatCurrency(total)}
                </Text>
              </View>

              <View className='mt-[8px] w-full'>
                {transactions.map((item) => {
                  const mydate = new Date(item.date);
                  const isSelected = selectedTransactions.includes(item.id);

                  return (
                    <Swipeable
                      renderLeftActions={() => renderLeftActions(item)}
                      overshootRight={false}
                      key={item.id} // use item.id or something unique, not index
                    >

                      <Pressable
                        onLongPress={() => handleLongPress(item)}
                        onPress={() => handleItemPress(item)}
                        delayLongPress={700}
                      >
                        <View
                          className={`flex-row items-center justify-between p-4 rounded-xl mt-[7px] shadow-md ${
                            isSelected ? 'bg-green-300' : 'bg-[#b0e1a2]'
                          }`}
                        >
                          <View className="flex-row items-center space-x-4">
                            <View className="w-[45px] h-[45px] rounded-full bg-[#cbf5af] flex items-center justify-center">
                              {mystats.icon}
                            </View>
                            <View className="ml-[15px] w-[65%]">
                              <Text className="text-black text-[17px]" numberOfLines={1}>{item.title}</Text>
                              <Text className="text-gray-500 text-[13px]">
                                {`${String(mydate.getHours() % 12 || 12).padStart(2, '0')}:${String(
                                  mydate.getMinutes()
                                ).padStart(2, '0')} - ${Number(mydate.getDate())} ${months[Number(mydate.getMonth())]}`}
                              </Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className="text-[17px] font-semibold text-blue-500">
                              {item.income ? '+' : '-'}{formatCurrency(item.amount) ?? 0}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </Swipeable>
                  );
                })}
              </View>

            </View>
          ))
        }

        
      </View>
    </Pressable>
  );
}