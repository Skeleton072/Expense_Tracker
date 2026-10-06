import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Modal, FlatList, TouchableWithoutFeedback, SafeAreaView, Dimensions } from "react-native";
import { Ionicons, Feather, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function MonthPickerModal({ visible, setCalendarOn, date, setDateStatus }) {
  const mydate = date.split('-');

  const [selectedMonth, setSelectedMonth] = useState(Number(mydate[1]) - 1);
  const [selectedYear, setSelectedYear] = useState(Number(mydate[0]));

  function confirmFunction() {
    setDateStatus(prev => ({...prev, userClickDate : `${selectedYear}-${selectedMonth.toString().length > 1 ? '':'0'}${selectedMonth + 1}`}));
    setCalendarOn(false);
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/30">
        <View className="bg-[#ffffff] rounded-[20px] w-[90%]">
          <View className="bg-[#b0e1a2] w-full rounded-t-[20px]">
            <Text className="text-xl font-bold text-center mt-[10px] mb-[10px]">{months[selectedMonth]}, {selectedYear}</Text>
            
            {/* Year switch (optional) */}
            <View className="flex-row justify-between items-center mt-[6px] mb-[15px] px-6">
              <Pressable onPress={() => setSelectedYear(selectedYear-1)}>
                <Text className="text-xl">◀</Text>
              </Pressable>
              <Text className="text-[22px]">{selectedYear}</Text>
              <Pressable onPress={() => setSelectedYear(selectedYear+1)}>
                <Text className="text-xl">▶</Text>
              </Pressable>
            </View>
          </View>

          {/* Month grid */}
          <FlatList
            data={months}
            keyExtractor={(item) => item}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-around', marginBottom: 12 }}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setSelectedMonth(index)}
                className={`px-4 py-2 ${index === selectedMonth ? 'bg-green-600' : 'bg-transparent'}`}
              >
                <Text className={`text-center text-[16px] font-semibold ${index === selectedMonth ? 'text-white' : 'text-black'}`}>{item}</Text>
              </Pressable>
            )}
          />

          {/* Buttons */}
          <View className="flex-row justify-end my-4 space-x-4">
            <Pressable onPress={() => setCalendarOn(false)}>
              <Text className="text-green-700 font-semibold mr-[30px] text-[15px]">CANCEL</Text>
            </Pressable>
            <Pressable onPress={confirmFunction}>
              <Text className="text-green-700 font-semibold mr-[30px] text-[15px]">OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function YearPickerModal({ visible, setCalendarOn, date, setDateStatus }) {
  const [selectedYear, setSelectedYear] = useState(date)
  const years = Array.from({ length: 15 }, (_, i) => Number(new Date().getFullYear()) - i); // Change range as needed

  function confirmFunction() {
    setDateStatus(prev => ({...prev, userClickDate : selectedYear }));
    setCalendarOn(false);
  }

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/30">
        <View className="bg-white rounded-2xl p-4 w-[90%] max-h-[70%]">
          <Text className="text-xl font-bold text-center mb-4">Select Year</Text>

          <ScrollView>
            {years.map((year) => (
              <Pressable
                key={year}
                onPress={() => setSelectedYear(year)}
                className="flex-row items-center px-4 py-2"
              >
                <Ionicons
                  name={year === selectedYear ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={year === selectedYear ? 'green' : 'gray'}
                />
                <Text className="ml-3 text-lg">{year}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View className="flex-row justify-end mt-4 space-x-4">
            <Pressable onPress={() => setCalendarOn(false)}>
              <Text className="text-green-700 font-semibold mr-[30px] text-[15px]">CANCEL</Text>
            </Pressable>
            <Pressable onPress={confirmFunction}>
              <Text className="text-green-700 font-semibold mr-[30px] text-[15px]">OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function TransactionTypePickerModal({ dateStatus, setDateStatus }) {
  const [isMenuDown, setIsMenuDown] = useState(false);

  function menuPressFunction(type) {
    const today = new Date().toISOString().split("T")[0];
    let clickedDate;

    if (type == "Daily") {
      clickedDate = `${today}`;
    } else if (type == "Monthly") {
      clickedDate = today.split("-").slice(0, 2).join("-");
    } else {
      clickedDate = today.split("-").shift();
    }

    setDateStatus(prev => ({...prev, transactionsType : type, userClickDate : clickedDate }));
    setIsMenuDown(false);
  }

  return (
    <View>

      <Pressable
        className="flex-row items-center space-x-2 bg-white rounded-full py-[10px] w-[120px] ml-[7px] relative z-75"
        onPress={() => setIsMenuDown(!isMenuDown)}
      >
        <View className="flex-row items-center w-full">
          <Text className="text-[18px] text-gray-700 ml-[10px] font-semibold w-[65%]">
            {dateStatus.transactionsType}
          </Text>

          <View className="w-[35%]">
            <MaterialIcons name="keyboard-arrow-down" size={22} color="#000000" />
          </View>
        </View>

        <Modal
          visible={isMenuDown}
          transparent
          animationType="fade"
          onRequestClose={() => setIsMenuDown(false)}
        >

          {/* Background overlay to close on outside press */}
          <Pressable
            onPress={() => setIsMenuDown(false)}
            className="absolute top-0 left-0 right-0 bottom-0 bg-transparent"
          />

          {/* Dropdown box */}
          <View className="absolute top-[125px] left-[30px] bg-white w-[120px] rounded-[10px] z-100">
            {["Daily", "Monthly", "Yearly"].map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  menuPressFunction(item);
                }}
                className="p-[10px]"
              >
                <Text className="ml-[10px] text-[16px]">{item}</Text>
              </Pressable>
            ))}
          </View>

        </Modal>

      </Pressable>

    </View>

  )
}

export function SortingPickerModal({ sortingType, setSortingType }) {
  const [isSorting, setIsSorting] = useState(false);

  function menuPressFunction(item) {
    setSortingType(item);
    setIsSorting(false);
  }

  return (
    <Pressable
      className="flex-row items-center space-x-2 bg-white ml-[7px] border-purple-300 border-[2px] rounded-[10px] relative"
      onPress={() => setIsSorting(!isSorting)}
    >
      <View className="flex items-center justify-center w-[40px] h-[40px]">
        <Feather name="filter" size={26} color="#000000" />
      </View>
      
      <Modal
        visible={isSorting}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSorting(false)}
      >

        {/* Background overlay to close on outside press */}
        <Pressable
          onPress={() => setIsSorting(false)}
          className="absolute top-0 left-0 right-0 bottom-0 bg-transparent"
        />

        {/* Dropdown box */}
        <View className="absolute top-[115px] right-[20px] bg-white w-[120px] rounded-[10px] z-100">
          {[
            ['Decreasing', <View className="flex-row items-center"><FontAwesome name="long-arrow-up" color="#000000" size={22}/><Text className="ml-[10px] text-[15px] font-semibold">Amount</Text></View>], 
            ['Increasing', <View className="flex-row items-center"><FontAwesome name="long-arrow-down" color="#000000" size={22}/><Text className="ml-[10px] text-[15px] font-semibold">Amount</Text></View>]
          ].map((item, index) => (
            <Pressable
              key={index}
              onPress={() => {
                menuPressFunction(item[0]);
              }}
              className="p-[10px]"
            >
              {item[1]}
            </Pressable>
          ))}
        </View>
      </Modal>
      
    </Pressable>
  )
}

// rounded problem
export function FilterModal({ isVisible, setIsFilterOn, filterRef, setFilterStats }) {
  const [selectedType, setSelectedType] = useState(filterRef.current.selectedType); // type
  const [selectedSort, setSelectedSort] = useState(filterRef.current.selectedSort); // sort
  const [selectedCategories, setSelectedCategories] = useState([...filterRef.current.categories]); // ...categories
  const navigation = useNavigation();

  const filterTypes = ['Income','Expense','All'];
  const sortTypes   = ['Highest','Lowest','Newest','Oldest'];

  const [startDate, setStartDate] = useState(filterRef.current.startDate); // startDate
  const [endDate, setEndDate] = useState(filterRef.current.endDate); // endDate

  function applyFunction() {
    setFilterStats(prev => ({...prev, selectedType, selectedSort, categories : selectedCategories, startDate: startDate, endDate : endDate }));
    setIsFilterOn(false);
  }

  function navigateToCategories() {
    navigation.navigate("MiniCategories", {
      categories : selectedCategories,
      setCategory : (data) => {
        //setFilterStats(prev => ({...prev, categories : data, selectedType, selectedSort }));
        filterRef.current.selectedType = selectedType;
        filterRef.current.selectedSort = selectedSort;
        filterRef.current.categories = data;
        filterRef.current.startDate = startDate;
        filterRef.current.endDate = endDate;

        setSelectedCategories(data);
      },
      isIncome : selectedType == 'Income',
      allowMultiple : true,
      selectedType
    })
  }

  const [isCalendarOn, setIsCalendarOn] = useState(false);

  const onChange = (_, selectedDate) => {
    if (isCalendarOn.type == 'start') {

      const mydict = {
        iso: selectedDate.toISOString().split("T")[0],
        dateString: `${selectedDate.getDate()} ${months[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`
      }

      setStartDate(mydict);
      filterRef.current.startDate = mydict;
    } else {

      const mydict = {
        iso: selectedDate.toISOString().split("T")[0],
        dateString: `${selectedDate.getDate()} ${months[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`
      }

      setEndDate(mydict);
      filterRef.current.endDate = mydict;
    }
    setIsCalendarOn(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        setIsFilterOn(false);
      }}
    >
      {/* backdrop */}
      <TouchableWithoutFeedback onPress={() => setIsFilterOn(false)}>
        <View className="flex-1 bg-black/30" />
      </TouchableWithoutFeedback>
      
      {isCalendarOn && (
        <DateTimePicker
          value={new Date(isCalendarOn.date)}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}

      {/* sheet */}
      <SafeAreaView className="bg-[#faffd6] p-5 z-75">
        {/* drag handle */}
        <View className="items-center mb-4">
          <View className="h-1.5 w-14 bg-purple-200 rounded-full" />
        </View>

        {/* header */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-[20px] font-semibold">Filter Transaction</Text>
          <Pressable 
            onPress={() => {
              //setFilterStats({
              //  selectedType : 'All',
              //  selectedSort : 'Newest',
              //  categories : []
              //})
              filterRef.current.selectedType = 'All';
              filterRef.current.selectedSort = 'Newest';
              filterRef.current.categories = [];
              setIsFilterOn(false);
            }}
            className="px-[15px] py-[6px] rounded-[10px] bg-purple-100 border-purple-500 border-[1px]"
          >
            <Text className="text-#000000 font-medium text-[17px]">Reset</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-center mb-[20px]">
            {/* Start Date Picker */}
            <Pressable 
              className="px-4 py-3 rounded-lg flex-row items-center justify-between w-[150px] mr-2 border border-gray-300"
              onPress={() => {setIsCalendarOn({date : startDate.iso, type : 'start'})}}
            >
              <Text className="text-gray-600 text-[15px]">{startDate.dateString}</Text>
              <FontAwesome name="chevron-down" size={14} color="gray" />
            </Pressable>

            {/* Arrow Icon */}
            <FontAwesome name="exchange" size={24} color="gray" className="mx-2" />

            {/* End Date Picker */}
            <Pressable 
              className="px-4 py-3 rounded-lg flex-row items-center justify-between w-[150px] ml-2 border border-gray-300"
              onPress={() => {setIsCalendarOn({date : endDate.iso, type : 'end'})}}
            >
              <Text className="text-gray-600 text-[15px]">{endDate.dateString}</Text>
              <FontAwesome name="chevron-down" size={14} color="gray" />
            </Pressable>
          </View>

          {/* Filter By */}
          <Text className="text-[15px] text-gray-600 mb-[12px]">Filter By</Text>
          <View className="flex-row flex-wrap gap-2 mb-[15px]">
            {filterTypes.map(type => (
              <Pressable
                key={type}
                onPress={() => setSelectedType(type)}
                className={`
                  px-4 py-2 rounded-full border 
                  ${selectedType === type 
                    ? 'bg-purple-100 border-purple-500' 
                    : 'border-gray-300'}
                `}
              >
                <Text className={`text-[15px] ${selectedType === type ? 'text-purple-600' : 'text-gray-600'}`}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Sort By */}
          <Text className="text-[15px] text-gray-500 mb-[12px]">Sort By</Text>
          <View className="flex-row flex-wrap gap-2 mb-[15px]">
            {sortTypes.map(sort => (
              <Pressable
                key={sort}
                onPress={() => setSelectedSort(sort)}
                className={`
                  px-4 py-2 rounded-full border 
                  ${selectedSort === sort 
                    ? 'bg-purple-100 border-purple-500' 
                    : 'border-gray-300'}
                `}
              >
                <Text className={`text-[15px] ${selectedSort === sort ? 'text-purple-600' : 'text-gray-600'}`}>
                  {sort}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Category */}
          <Text className="text-[15px] text-gray-500 mb-[12px]">Category</Text>
          <Pressable 
            className="flex-row justify-between items-center p-4 border border-gray-200 rounded-xl mb-[25px]"
            onPress={navigateToCategories}
          >

            <Text className="text-gray-500">Choose Category</Text>

            <View className="flex-row items-center space-x-2">
              <View className="flex-row items-center ">
                <Text className="text-gray-500 mr-[5px]">{selectedCategories.length}</Text>
                <Text className="text-gray-500">Selected</Text>
              </View>
              <ChevronRight size={18} color="#aaa" />
            </View>

          </Pressable>

          {/* Apply */}
          <Pressable 
            onPress={applyFunction}
            className="bg-purple-100 border-purple-500 border-[1px] py-[12px] rounded-xl mb-[20px]"
          >
            <Text className="text-black text-center font-semibold text-[20px] tracking-[0.5px]">Apply</Text>
          </Pressable>
        </ScrollView>

      </SafeAreaView>
    </Modal>
  );
}




