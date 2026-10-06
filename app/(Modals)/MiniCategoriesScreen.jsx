import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import '@/global.css';
import { useNavigation } from 'expo-router';
import { getAllCategories } from '@/database/database';



export function MiniCategoriesScreen({ route }) {
  const { categories, setCategory, isIncome, allowMultiple, selectedType='All' } = route.params;
  const navigation = useNavigation();
  const [tempCategory, setTempCategory] = useState([...categories]); // categories mean selected categories
  const [myCategories, setMyCategories] = useState([]);
  let categoryOnPressFunction;


  // rewrite this shit
  if (allowMultiple) {
    categoryOnPressFunction = (item) => {
      if (tempCategory.includes(item)) {
        let temp = tempCategory.filter(a => a != item);
        setTempCategory(temp);
      } else {
        setTempCategory(prev => [...prev, item]);
      }
    }

  } else {
    categoryOnPressFunction = (item) => {
      setCategory(item);
      navigation.goBack();
    }

  }

  // if anything goes wrong, this is the problem
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getAllCategories(allowMultiple ? selectedType.toLowerCase() : isIncome ? 'income' : 'expense');

      setMyCategories(res);
    };

    fetchCategories();
  }, []);


  function confirmFunction() {
    setCategory(tempCategory);
    navigation.goBack();
  }

  return (
    <View className='flex-1 bg-[#faffd6] items-center'>

      <View className='flex-row items-center relative pt-[25px] pl-[20px] pb-[12px] w-full'>

        <View className='flex-row items-center w-[60%] pl-[3px]'>
          <MaterialIcons name='arrow-circle-left' color="#000000" size={27} onPress={() => navigation.goBack()} />
          <Text className='text-[18px] text-[#000000] ml-[20px]'>Choose Categories</Text>
        </View>

        <Pressable 
          className='flex w-[40%] items-end pr-[20px]'
          onPress={() => navigation.navigate('AddCategory')}
        >
          <MaterialIcons name='add-circle-outline' color="#000000" size={27} />
        </Pressable>
      </View>
      

      <ScrollView
        className="flex w-full"
        contentContainerStyle={{alignItems: 'center'}}
      >
        {myCategories.map((item, index) => {
          const IconComponent = iconsLibrary[item.iconLibrary];
          const size = item.iconLibrary === 'FontAwesome5' ? 20 : 25; 

          return (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between pl-[20px] mt-[6px] bg-[#b0e1a2] py-[6px] w-[95%] rounded-[15px]"
              onPress={() => categoryOnPressFunction(item.name)}
            >
              {/* Render the icon */}
              <View className='mr-[10px] flex-row items-center'>
                <View className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#cbf5af] mr-[15px]">
                  <IconComponent name={item.iconName} color="#000000" size={size} />
                </View>             

                {/* Render the category name */}
                <Text className='text-[17px] text-[#000000]'>{item.name}</Text>
              </View>
              
              {tempCategory.includes(item.name) ? (
                <View className=' mr-[12px]'>
                  <MaterialIcons name='check-circle' size={23} color={"#008000"}/>
                </View>
              ) : null}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      
      {
        allowMultiple ? (
          <Pressable 
            onPress={confirmFunction}
            className='w-[80%] py-[10px] flex items-center justify-center bg-[#cbf5af] mb-[15px] rounded-[20px]'
          >
            <Text className='text-[22px] font-bold'>Confirm</Text>
          </Pressable>
        ) : (
          null
        )
      }
      
    </View>
  );
}