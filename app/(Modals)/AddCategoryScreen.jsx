import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, Pressable, ScrollView, Modal, TouchableWithoutFeedback, Dimensions, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 , Entypo} from '@expo/vector-icons';
import { ArrowLeftCircle, AlertCircle } from "lucide-react-native";
import { useNavigation } from 'expo-router';
import WheelColorPicker from 'react-native-wheel-color-picker';
import { insertIntoCategories } from '../../database/database';

// what exactly e.stopPropagation() does?
function ColorPickerSection({ visible, setVisible, onSubmit }) {
  const [color, setColor] = useState('#ff0000');

  return (
    <Modal 
      transparent visible={visible} animationType="slide"
      className='flex-1 bg-black/30 w-full h-full'
    >
      <Pressable 
        className='relative bg-black/20 w-full h-full'
        onPress={() => setVisible(false)}
      >
        <Pressable
          className="flex items-center justify-center bg-[#faffd6] w-[90%] rounded-[20px] absolute left-[50%] top-[48%] -translate-x-[50%] -translate-y-[50%] overflow-hidden"
          onPress={(e) => e.stopPropagation()} 
        >
          <Text className='font-bold text-[22px] mt-[10px] mb-[15px]'>Pick a color</Text>

          <WheelColorPicker
            color={color}  // Changed from initialColor to color
            onColorChangeComplete={setColor}
            thumbStyle={{ height: 40, width: 40, borderRadius: 15 }}
            style={{ height: 250, width: 250 }}
          />

          <Pressable
            className='flex items-center justify-center px-[35px] py-[10px] rounded-[10px] bg-[#cbf5af] mt-[50px] mb-[20px]'
            onPress={() => onSubmit(color)}
          >
            <Text className='text-[20px] font-semibold'>Submit</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const iconList = [
  'home', 'car', 'tv', 'gamepad', 'tshirt', 'briefcase', 'money-bill', 'wallet', 'heartbeat', 'book', 'coins', 'file-invoice-dollar',
  'paw', 'bolt', 'dog', 'shield-alt', 'laptop', 'suitcase-rolling', 'piggy-bank', 'hand-holding-usd', 'chart-pie', 'chart-line',
  'file-invoice-dollar', 'business-time', 'wifi', 'credit-card', 'question-circle'
];
const numColumns = 4;
const iconSize = Dimensions.get('window').width / numColumns - 30;

function IconPickerModal({ visible, onClose, onSelect }) {
  const [search, setSearch] = useState('');

  const filteredIcons = iconList.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/40 justify-center items-center">

        <View className="bg-[#faffd6] p-4 rounded-2xl w-[90%] max-h-[85%]">

          <Pressable onPress={onClose} className='absolute top-[-7px] right-[-7px]'>
            <Entypo name='circle-with-cross' size={30} color={'#000'}/>
          </Pressable>

          <Text className="text-[22px] font-semibold mb-[15px] ml-[15px]">Choose an Icon</Text>

          <FlatList
            data={filteredIcons}
            keyExtractor={(item) => item}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  width: iconSize,
                  height: iconSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 5,
                  borderRadius: 10,
                  backgroundColor: '#cbf5af'
                }}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <FontAwesome5 name={item} size={25} color="#333" />
              </TouchableOpacity>
            )}
          />
        </View>

      </View>
    </Modal>
  );
}


export default function AddCategoryScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [type, setType] = useState('income');
  const [budget, setBudget] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [alert, setAlert] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const nameRef = useRef(null);
  const budgetRef = useRef(null);

  const formatCurrency = (amount) => amount.toLocaleString('en-US');

  const handleSubmit = async () => {
    if (!name.trim() || !selectedColor) {
      setAlert('#ce0000');
      //Alert.alert('Missing Fields', 'Please fill all required fields: name, type, and color.');
      return;
    }

    const newCategory = {
      name,
      type,
      budget: budget ? parseFloat(budget) : 0,
      color: selectedColor,
      iconLibrary: 'FontAwesome5',
      iconName: selectedIcon
    };

    await insertIntoCategories(newCategory);
    navigation.goBack();
  };

  const [modalVisible, setModalVisible] = useState(false);

  function submitFunction(color) {
    setSelectedColor(color);
    setModalVisible(false);
  }

  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  return (
    <Pressable 
      className="flex-1 bg-[#b0e1a2] items-center justify-start"
      onPress={() => {
        Keyboard.dismiss();
        setIsFocused('');
      }}
    >

      <View className="flex-row items-center justify-between w-full mt-[25px] px-[30px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircle color="#000000" size={25} />
          </TouchableOpacity>

          <Text className="pl-[14px] text-[18px] font-bold">
            Add New Category
          </Text>
        </View>

        <Pressable onPress={handleSubmit}>
          <Text className='text-[18px] font-bold'>Save</Text>
        </Pressable>
      </View>

      <View className="bg-[#faffd6] w-[90%] rounded-[20px] mt-[22px] shadow relative flex items-center pb-[30px]">

        <View className="flex-row justify-center items-center mt-[20px] w-[90%]">
          <TouchableOpacity
            onPress={() => setType('income')}
            className={`flex-1 h-[50px] justify-center items-center rounded-l-[10px] ${
              type == 'income' ? "bg-[#b0e1a2]" : "bg-white"
            }`}
          >
            <Text className='text-[#000000] text-[18px] font-semibold'>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType('expense')}
            className={`flex-1 h-[50px] justify-center items-center rounded-r-[10px] ${
              type == 'expense' ? "bg-[#b0e1a2]" : "bg-white"
            }`}
          >
            <Text className='text-[#000000] text-[18px] font-semibold'>Outcome</Text>
          </TouchableOpacity>
        </View>

        <View className="relative mt-[35px] w-[90%]">
          {
            alert === '#ce0000' && name === '' && (
              <View className="absolute w-full h-full" pointerEvents="box-none">
                <Text
                  className="text-[#ce0000] text-[12px] absolute left-[10px] bottom-[-18px] bg-[#faffd6] pl-[6px] pr-[6px] z-100"
                  pointerEvents="none"
                >
                  Name must not be empty
                </Text>
            
                <View className="absolute right-[10px] top-[28%] z-100" pointerEvents="none">
                  <AlertCircle color="#ce0000" size={20} />
                </View>
              </View>
            )
          }
  
          <TextInput
            ref={nameRef}
            className={`w-full h-[50px] border-[1px] rounded-[10px] text-[16px] text-[#000000] pl-[10px] ${isFocused === 'name' ? `border-[#008000] border-[2px]` : `border-[#000000]`} ${alert === '#ce0000' ? 'border-[#ce0000]' : 'border-[#000000]'}`}
            cursorColor="#000000"
            onFocus={() => setIsFocused(() => 'name')}
            value={name}
            onChangeText={setName}
          />
        
          <Pressable
            onPress={() => nameRef.current?.focus()}
            className={`absolute left-[10px] text-[#000000] text-[15px] bg-[#faffd6] pl-[6px] pr-[6px] ${isFocused === 'name' || name !== '' ? 'top-[-8px]' : 'top-[28%]'}`}
          >
            <Text className={`${isFocused === 'name' || name !== '' ? 'text-[11px]' : 'text-[16px] text-gray-500'}`}>
              Name
            </Text>
          </Pressable>
        </View>

        <View className="relative mt-[35px] w-[90%]">
          <TextInput
            ref={budgetRef}
            className={`w-full h-[50px] border-[1px] rounded-[10px] text-[16px] text-[#000000] pl-[10px] ${isFocused === 'budget' ? `border-[#008000] border-[2px]` : `border-[#000000]`}`}
            cursorColor={"#000000"}
            keyboardType="numeric"
            onFocus={() => setIsFocused(() => 'budget')}
            value={formatCurrency(budget)}
            onChangeText={setBudget}
          />

          <Pressable
            onPress={() => budgetRef.current?.focus()}
            className={`absolute left-[10px] text-[#000000] text-[16px] bg-[#faffd6] pl-[6px] pr-[6px] ${isFocused === 'budget' || budget !== '' ? 'top-[-8px]' : 'top-[28%]'}`}
          >
            <Text className={`${isFocused === 'budget' || budget !== '' ? 'text-[11px]' : 'text-[16px] text-gray-500'}`}>
              {type == 'income' ? 'Target' : 'Budget'} (Optional) 
            </Text>
          </Pressable>

        </View>

        <Pressable 
          className={`mt-[35px] w-[90%] h-[50px] rounded-[10px] text-[16px] text-[#000000] pl-[10px] ${isFocused === 'color' ? 'border-[2px] border-[#008000]':'border border-[#000]'} mt-[35px] ${alert === '#ce0000' ? 'border-[#ce0000]' : 'border-[#000000]'}`}
          onPress={() => {
            setModalVisible(true);
            setIsFocused('color');
          }}
        >

          {
            alert === '#ce0000' && selectedColor === '' && (
              <View className="absolute w-full h-full" pointerEvents="box-none">
                <Text
                  className="text-[#ce0000] text-[12px] absolute left-[10px] bottom-[-18px] bg-[#faffd6] pl-[6px] pr-[6px] z-100"
                  pointerEvents="none"
                >
                  Color have to be something
                </Text>
            
                <View className="absolute right-0 top-[28%] z-100" pointerEvents="none">
                  <AlertCircle color="#ce0000" size={20} />
                </View>
              </View>
            )
          }

          {
            selectedColor == '' ? (
              <Text className="absolute left-[10px] text-[16px] top-[28%] text-gray-500">
                Color
              </Text>
            ) : (
              <View className='w-[30px] h-[30px] rounded-full border border-[#000] absolute left-[10px] top-[22%]' style={{ backgroundColor: selectedColor }}/>
            )
          }

        </Pressable>
        <ColorPickerSection visible={modalVisible} setVisible={setModalVisible} onSubmit={submitFunction}/>


        <Pressable 
          className={`mt-[35px] w-[90%] h-[50px] rounded-[10px] text-[16px] text-[#000000] pl-[10px] ${isFocused === 'icon' ? 'border-[2px] border-[#008000]':'border border-[#000]'} mt-[35px] ${alert === '#ce0000' ? 'border-[#ce0000]' : 'border-[#000000]'}`}
          onPress={() => {
            setIconPickerVisible(true);
            setIsFocused('icon');
          }}
        >

          {
            alert === '#ce0000' && selectedIcon === '' && (
              <View className="absolute w-full h-full" pointerEvents="box-none">
                <Text
                  className="text-[#ce0000] text-[12px] absolute left-[10px] bottom-[-18px] bg-[#faffd6] pl-[6px] pr-[6px] z-100"
                  pointerEvents="none"
                >
                  Icon have to be something
                </Text>
            
                <View className="absolute right-0 top-[28%] z-100" pointerEvents="none">
                  <AlertCircle color="#ce0000" size={20} />
                </View>
              </View>
            )
          }

          {
            selectedIcon == '' ? (
              <Text className="absolute left-[10px] text-[16px] top-[28%] text-gray-500">
                Icon
              </Text>
            ) : (
              <View className='absolute left-[10px] top-[22%]'>
                <FontAwesome5 name={selectedIcon} size={23} color={'black'}/>
              </View>
            )
          }

        </Pressable>
        <IconPickerModal visible={iconPickerVisible} onClose={() => setIconPickerVisible(false)} onSelect={(iconName) => setSelectedIcon(iconName)}/>

        <TouchableOpacity
          onPress={handleSubmit}
          className='w-[90%] items-center bg-[#cbf5af] p-[15px] rounded-[10px] mt-[60px]'
        >
          <Text className='font-bold text-[18px]'>Add Category</Text>
        </TouchableOpacity>
      </View>

      

    </Pressable>
  );
}
