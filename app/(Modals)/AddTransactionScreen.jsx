import React, { useState, useRef, useEffect } from "react";
import "@/global.css";
import { ArrowLeftCircle, AlertCircle } from "lucide-react-native";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { insertFunction, updateTransactions } from '@/database/database';
import { useNavigation } from "expo-router";


const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]
// too many useStates
export default function AddTransactionScreen({ route }) { 
  const navigation = useNavigation();
  const { selectedCategory, stats, isEdit, onSave } = route.params || {};

  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState(stats?.title || '');
  const [amount, setAmount] = useState(stats?.amount || ''); // amount is actually price
  const [category, setCategory] = useState(selectedCategory || '');
  const [date, setDate] = useState(() => {
    const d = new Date(stats?.date);
    return isNaN(d) ? new Date() : d;
  });
  const [isIncome, setIsIncome] = useState(stats?.income ? true : false || false);
  const formatCurrency = (amount) => amount.toLocaleString('en-US');
  
  // later
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState('#000000');

  const [showPicker, setShowPicker] = useState(false);

  const titleRef = useRef(null);
  const amountRef = useRef(null);
  const noteRef = useRef(null); // we also have to add note


  const onChange = (_, selectedDate) => {
    setShowPicker(false); 
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  };

  function dateOnPressFunction() {
    setShowPicker(true);
    setIsFocused('date');
  }

  function categoryOnPressFunction() {
    setIsFocused('category');
    navigation.navigate('MiniCategories', {
      categories : [],
      setCategory : (category) => {
        setCategory(category);
      },
      isIncome : isIncome,
      allowMultiple : false,
    });
  }

  async function saveFunction() {
    if (title === '' || amount === '' || category === '') {
      setAlert('#ce0000');
      return;
    }
  
    const formattedDate = date === 'today' ? new Date().toISOString() : new Date(date).toISOString();
  
    if (isEdit) {
      await updateTransactions( isIncome, title, amount, category, formattedDate, stats.id );
      onSave(prev => ({...prev, income : isIncome, title, amount, category, date : formattedDate}))
    } else {
      await insertFunction(isIncome, title, amount, category, formattedDate);
    }
  
    navigation.goBack();
  }
  


  return (
    <View className="flex-1 bg-[#b0e1a2] items-center justify-start">

      <View className="flex-row items-center justify-between w-full mt-[25px] px-[30px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircle color="#000000" size={25} />
          </TouchableOpacity>

          <Text className="pl-[14px] text-[18px] font-bold">
            Add Transaction
          </Text>
        </View>

        <TouchableOpacity onPress={saveFunction}>
          <Text className="text-[#000000] text-[18px] font-bold">Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        setIsFocused(false);
      }}>
        <View className="bg-[#faffd6] w-[90%] rounded-[20px] mt-[22px] shadow relative flex items-center pb-[30px]">

          {/* determining if income or outcome, default is outcome */}
          <View className="flex-row justify-center items-center mt-[20px] w-[90%]">
            <TouchableOpacity
              onPress={() => setIsIncome(true)}
              className={`flex-1 h-[50px] justify-center items-center rounded-l-[10px] ${
                isIncome ? "bg-[#b0e1a2]" : "bg-white"
              }`}
            >
              <Text className='text-[#000000] text-[16px] font-bold-600'>Income</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsIncome(false)}
              className={`flex-1 h-[50px] justify-center items-center rounded-r-[10px] ${
                !isIncome ? "bg-[#b0e1a2]" : "bg-white"
              }`}
            >
              <Text className='text-[#000000] text-[16px] font-bold-600'>Outcome</Text>
            </TouchableOpacity>
          </View>
            
          {/* title section */}
          <View className="relative mt-[35px] w-[90%]">
            {
              alert === '#ce0000' && title === '' && (
                <View className="absolute w-full h-full" pointerEvents="box-none">
                  <Text
                    className="text-[#ce0000] text-[12px] absolute left-[10px] bottom-[-18px] bg-[#faffd6] pl-[6px] pr-[6px] z-100"
                    pointerEvents="none"
                  >
                    Title must not be empty
                  </Text>
              
                  <View className="absolute right-[10px] top-[28%] z-100" pointerEvents="none">
                    <AlertCircle color="#ce0000" size={20} />
                  </View>
                </View>
              )
            }

    
            <TextInput
              ref={titleRef}
              className={`w-full h-[50px] border-[1px] rounded-[10px] text-[16px] text-[#000000] pl-[10px] ${isFocused === 'title' ? `border-[#008000] border-[2px]` : `border-[#000000]`} ${alert === '#ce0000' ? 'border-[#ce0000]' : 'border-[#000000]'}`}
              cursorColor="#000000"
              onFocus={() => setIsFocused(() => 'title')}
              value={title}
              onChangeText={setTitle}
            />
          

            <Pressable
              onPress={() => titleRef.current?.focus()}
              className={`absolute left-[10px] text-[#000000] text-[15px] bg-[#faffd6] pl-[6px] pr-[6px] ${isFocused === 'title' || title !== '' ? 'top-[-8px]' : 'top-[28%]'}`}
            >
              <Text className={`${isFocused === 'title' || title !== '' ? 'text-[11px]' : 'text-[15px]'}`}>
                Title
              </Text>
            </Pressable>
          
          </View>

          {/* amount section */}
          <View className="relative mt-[35px] w-[90%]">
            {
              alert == '#ce0000' && amount == ''  ? (
                <View className="absolute w-full h-full">

                  <Text className="text-[#ce0000] text-[12px] absolute left-[10px] bottom-[-18px] bg-[#faffd6] pl-[6px] pr-[6px] z-100">Amount must not be empty</Text>
                  
                  <View className="absolute right-[10px] top-[28%] z-100">
                    <AlertCircle color="#ce0000" size={20} />
                  </View>

                </View>
              ) : null
            }

            <TextInput
              ref={amountRef}
              className={`w-full h-[50px] border-[1px] rounded-[10px] text-[16px] text-[#000000] pl-[10px] ${isFocused === 'amount' ? `border-[#008000] border-[2px]` : `border-[#000000]`} ${alert == '#ce0000' ? 'border-[#ce0000]':'border-[#000000'}`}
              cursorColor={"#000000"}
              keyboardType="numeric"
              onFocus={() => setIsFocused(() => 'amount')}
              value={formatCurrency(amount)}
              onChangeText={setAmount}
            />

            <Pressable
              onPress={() => amountRef.current?.focus()}
              className={`absolute left-[10px] text-[#000000] text-[16px] bg-[#faffd6] pl-[6px] pr-[6px] ${isFocused === 'amount' || amount !== '' ? 'top-[-8px]' : 'top-[28%]'}`}
            >
              <Text className={`${isFocused === 'amount' || amount !== '' ? 'text-[11px]' : 'text-[16px]'}`}>
                Amount
              </Text>
            </Pressable>

          </View>
          
          {/* category section */}
          <TouchableOpacity
            onPress={categoryOnPressFunction}
            className={`flex w-[90%] h-[50px] border-[1px] mt-[35px] rounded-[10px] text-[16px] ${isFocused == 'category' ? `border-[#008000] border-[2px]` : `border-[#000000]`} ${alert == '#ce0000' ? 'border-[#ce0000]':'border-[#000000'}`}
          >
            {
              alert == '#ce0000' && category == '' ? (
                <View className="absolute w-full h-full">

                  <Text className="text-[#ce0000] text-[12px] absolute left-[10px] bottom-[-18px] bg-[#faffd6] pl-[6px] pr-[6px] z-100">Category must not be empty</Text>
                  
                  <View className="absolute right-[10px] top-[28%] z-100">
                    <AlertCircle color="#ce0000" size={20} />
                  </View>

                </View>
              ) : null
            }

            <View 
              className={`absolute left-[10px] text-[#000000] text-[16px] bg-[#faffd6] pl-[6px] pr-[6px] ${isFocused === 'category' || category !== '' ? 'top-[-10px] text-[11px]' : 'top-[28%] text-[16px]'}`} 
            >
              <Text className={`${isFocused === 'category' || category !== '' ? 'text-[11px]' : 'text-[16px]'}`} >
                Category
              </Text>
            </View>

            <Text className="text-[16px] absolute top-[50%] left-[10px] -translate-y-[50%]">{category}</Text>
            
          </TouchableOpacity>
          
          {/* date section */}
          <View
            className={`w-[90%] h-[50px] border-[1px] mt-[35px] rounded-[10px] text-[16px] ${isFocused == 'date' ? 'border-[#5f50a9]' : 'border-[#000000]'}`}
          > 
            <Text
              className='absolute left-[10px] text-[#000000] text-[11px] bg-[#faffd6] pl-[6px] pr-[6px] top-[-8px] transition-all duration-1000'
            >
              Date
            </Text>

            <TouchableOpacity onPress={dateOnPressFunction}
              className="w-full h-full flex items-start justify-center"  
            >
              <Text className="text-[16px] pl-[10px]">
                {date.toDateString() == new Date().toDateString() ? 'Today':`${date.getDate()}, ${months[date.getMonth()]}, ${date.getFullYear()}`}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChange}
              />
            )}
          </View>

          {/* note section, not completed yer */}
          <View className="relative mt-[35px] w-[90%]">
            <Text
              className={`absolute left-[10px] text-[#000000] text-[16px] bg-[#faffd6] pl-[6px] pr-[6px] ${isFocused === 'notes' || notes != '' ? 'top-[-8px] text-[11px]' : 'top-[10px] text-[16px]'} transition-all duration-600`}
            >
              Notes
            </Text>

            {/* have to change the input to something like textarea in react */}
            <TextInput 
              className={`w-full h-[125px] border-[1px] rounded-[10px] text-[16px] text-[#000000] pl-[10px] flex justify-start ${isFocused === 'title' ? 'border-[#5f50a9]' : 'border-[#000000]'}`}
              cursorColor={"#000000"}
              onFocus={() => setIsFocused(() => 'notes')}
              value={notes}
              onChangeText={setNotes}
            ></TextInput>
          </View>
        </View>
      </TouchableWithoutFeedback>

    </View>
  );
}
