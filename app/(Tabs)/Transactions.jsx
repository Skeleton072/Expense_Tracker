import React, { useEffect, useState, useCallback, useRef, useContext, createContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable, Modal, TouchableWithoutFeedback, FlatList } from "react-native";
import { FontAwesome5, MaterialIcons, Entypo, Feather, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import { ArrowLeftCircle } from "lucide-react-native";
import { getAllExpenses, fetchExpensesByDate, getAllCategories, deleteTransactionsBySelected } from "../../database/database";
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { PieChart } from "react-native-svg-charts";
import { G, Line, Path, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import DateTimePicker from '@react-native-community/datetimepicker';
import { MonthPickerModal, YearPickerModal, TransactionTypePickerModal, SortingPickerModal, FilterModal } from '../(Modals)/Modal';
import * as shape from 'd3-shape';
import { Swipeable } from "react-native-gesture-handler";
//import { Picker } from '@react-native-picker/picker';
// uninstall picker if we don't need one


const iconsLibrary = {
  'MaterialIcons': MaterialIcons,
  'FontAwesome5': FontAwesome5,
  'MaterialCommunityIcons': MaterialCommunityIcons,
}


function TransactionItem({ icon, stats, onDelete }) {
  const { title, category, amount, income, date } = stats;
  const formatCurrency = (amount) => amount.toLocaleString("en-US");
  let mydate = '';
  const navigation = useNavigation();

  //console.log(stats);
  if (date) {
    mydate = new Date(date);
  }

  const renderLeftActions = (item) => (
    <Pressable
      onPress={() => {
        deleteTransactionsBySelected([item.id]);
        onDelete();
      }}
      className="bg-red-500 justify-center items-center w-[65px] h-[72px] rounded-xl mr-2"
    >
      <FontAwesome5 name='trash-alt' color="#fff" size={25} />
    </Pressable>
  );

  return (
    <Swipeable
      renderLeftActions={() => renderLeftActions(stats)}
      overshootRight={false}
    >

      <Pressable 
        className="flex-row items-center justify-between bg-[#b0e1a2] p-4 rounded-xl mb-3 shadow-md"
        onPress={() => navigation.navigate('TransactionsDetail', { stats })}
      >

        <View className="flex-row items-center space-x-4">
          <View
            className={`w-[45px] h-[45px] rounded-full bg-[#cbf5af] flex items-center justify-center`}
          >
            {icon}
          </View>
          <View className="ml-[15px] w-[60%]">
            <Text className="text-black text-[17px]">{category}</Text>
            <Text className="text-gray-500 text-[13px]" ellipsizeMode='tail' numberOfLines={1}>{title}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text
            className={`text-[17px] font-semibold ${
              income ? "text-green-800" : "text-red-500"
            }`}
          >
            {income ? "+" : "-"}
            {formatCurrency(amount)}
          </Text>
          <Text className="text-[13px] text-gray-500">{mydate ? `${String(mydate.getHours() % 12 || 12).padStart(2, '0')}:${String(mydate.getMinutes()).padStart(2, '0')}`:''}</Text>
        </View>
      </Pressable>

    </Swipeable>
  );
}

// we should consider a pie chart like the one in wallet tracker app
// do something with padAngle, it looks suck
// also make the circle rotateable
export const Pie = React.memo(function Pie({ data }) {
  const chartSize = 200;
  const formatCurrency = (amount) => amount.toLocaleString("en-US");

  const pieData = Object.entries(data).map(([label, info], index) => {
    
    return {
      key: index,
      value: info.amount,
      label,
      color: info.color, // should be 
      svg: {
        fill: info.color, // should be info.color
      },
      arc: {
        outerRadius: "90%",
      },
    };
  });

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  // Custom labels outside the chart
  const Labels = ({ slices }) => {
    return slices.map((slice, index) => {
      const { pieCentroid, data } = slice;

      const percentage = `${Math.round((data.value / total) * 100)}%`;

      return (
        <G key={`label-${index}`}>

          <SvgText
            key={index}
            x={pieCentroid[0]}
            y={pieCentroid[1]}
            fill={"white"}
            textAnchor={"middle"}
            alignmentBaseline={"middle"}
            fontSize={12}
            stroke={"white"}
            strokeWidth={0.2}
          >
            {percentage}
          </SvgText>
        </G>
      );
    });
  };

  return (      
  <View className="flex items-center justify-center">
    <PieChart
      style={{ height: chartSize, width: chartSize }}
      data={pieData}
      innerRadius={60}
      padAngle={0}
    >
      <Labels />
    </PieChart>

    <Text className="absolute top-[43%] left-[50%] -translate-x-[50%] -trnaslate-y-[50%] text-black text-[22px] font-bold">{formatCurrency(total)}</Text>

  </View>
  );
})


// too many re-rendering
// need to improve this
const monthFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];


export default function TransactionScreen() {
  const navigation = useNavigation();
  const [mystats, setMystats] = useState({
    originalTransactions : {}, 
    allTransactions : {},
    allTransactionsList : []
  });
  const [filterStats, setFilterStats] = useState({
    selectedType : 'All',
    selectedSort : 'Newest',
    categories : [],
    startDate : null,
    endDate : null,
  });
  const isFocused = useIsFocused();
  const [isFilterOn, setIsFilterOn] = useState(false);

  const filterRef = useRef({
    selectedType : 'All',
    selectedSort : 'Newest',
    categories : [],
    startDate : null,
    endDate : null,
  });

  // newly added codes
  function setMonthDates() {
    const now = new Date();
  
    const startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
    const start = `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}-${startDateObj.getDate()}`;
    const end = `${endDateObj.getFullYear()}-${endDateObj.getMonth() + 1}-${endDateObj.getDate()}`;
  
    filterRef.current.startDate = {
      iso: start,
      dateString: `${startDateObj.getDate()} ${months[startDateObj.getMonth()]}, ${startDateObj.getFullYear()}`
    };
  
    filterRef.current.endDate = {
      iso: end,
      dateString: `${endDateObj.getDate()} ${months[endDateObj.getMonth()]}, ${endDateObj.getFullYear()}`
    };
  }


  if (filterRef.current.startDate == null || filterRef.current.endDate == null) {
    setMonthDates();
  }


  const fetchData = useCallback(async () => {
    const tempMonthlyTransactions = await getAllExpenses();
    const allCategories = await getAllCategories('all');

    let mydict = {};
    
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name] = cat; // Key by category name
    });

    tempMonthlyTransactions.forEach((item) => {
      //const mydate = new Date(item.date).toISOString().split("T")[0];
      const mydate = item.date.split("T")[0];
      const category = categoryMap[item.category]; 
      const myitem = {...item, iconLibrary: category?.iconLibrary, iconName: category?.iconName};

      if (mydate in mydict) {
        mydict[mydate].push(myitem);
      } else {
        mydict[mydate] = [myitem];
      }
    });

    mydict = Object.entries(mydict).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
    mydict = Object.fromEntries(mydict);

    //console.log(mydict, 'mydict');
 
    setMystats({
      originalTransactions: mydict,
      allTransactions: filterAndSortTransactions(mydict), // date as a key and detail info as a value
      allTransactionsList: tempMonthlyTransactions,
    });

  }, [filterStats]);


  useEffect(() => {
    fetchData();
    if (isFocused && isFilterOn) {
      // This forces the modal to show again
      setIsFilterOn(false);
      setTimeout(() => setIsFilterOn(true), 2);
    }
  }, [isFocused]);


  useEffect(() => {
    const res = filterAndSortTransactions();
    setMystats((prev) => ({...prev, allTransactions : res}));
  }, [filterStats]);


  function filterAndSortTransactions(allTransactions = mystats.originalTransactions) {
    const type = filterStats.selectedType.toLowerCase();
    const sort = filterStats.selectedSort.toLowerCase();
    const startDate = new Date(filterRef.current.startDate?.iso);
    const endDate = new Date(filterRef.current.endDate?.iso);

    if (!allTransactions) return {};

    const filteredByDate = Object.entries(allTransactions).filter((acc, _) => {
      const mydate = new Date(acc[0]);
      if (mydate >= startDate && mydate <= endDate) {
        return acc;
      }
      return null;
    });
  
    const filtered = filteredByDate.reduce((acc, [date, transactions]) => {
      const filteredTx = transactions.filter(tx => {
        if (type === "income") return tx.income === 1;
        if (type === "expense") return tx.income === 0;
        return true; // all
      });
  
      if (filteredTx.length > 0) {
        acc[date] = filteredTx;
      }
  
      return acc;
    }, {});
  
    const sortedWithinDays = Object.entries(filtered).reduce((acc, [date, transactions]) => {
      let sortedTx = [...transactions];
  
      if (sort === "highest") {
        sortedTx.sort((a, b) => b.amount - a.amount);
      } else if (sort === "lowest") {
        sortedTx.sort((a, b) => a.amount - b.amount);
      } // newest/oldest sorting handled in step 3
  
      acc[date] = sortedTx;
      return acc;
    }, {});
  
    let sortedDays = Object.entries(sortedWithinDays);
    if (sort === "newest") {
      sortedDays.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    } else if (sort === "oldest") {
      sortedDays.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    }

    if (filterStats.categories.length != 0) {
      sortedDays = sortedDays.map(([date, transactions]) => {
        const filtered = transactions.filter(
          (t) => filterStats.categories.includes(t.category)
        );
        return filtered.length > 0 ? [date, filtered] : null;
      })
      .filter(Boolean);
    }

    return Object.fromEntries(sortedDays);
  }

  return (

    <View className="flex-1 bg-[#faffd6] px-6 pt-6 pb-[70px]">

      <View className="flex-row justify-between items-center mb-1 relative">

        <Pressable
          className="flex items-center justify-center w-[40px] h-[40px]"
          onPress={() => setIsFilterOn(true)}
        >
          <Feather name="menu" size={26} color="#000000" />
        </Pressable>

        <TouchableOpacity
          className="flex-row items-center space-x-2 ml-[15px]"
          onPress={() => navigation.navigate("AddTransaction")}
        >
          <MaterialIcons name="add-circle-outline" color="#000000" size={27} />
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        className="bg-purple-100 p-4 rounded-xl mb-4 flex-row justify-between items-center z-50"
        onPress={() => navigation.navigate("Report")}
      >

        <Text className="text-purple-700 font-medium">
          See your financial report.
        </Text>

        <Entypo name="chevron-right" size={20} color="#7C3AED" />

      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(mystats.allTransactions ?? {}).map((item, index) => {
          const mydate = item[0].split('-');

          return (
            <View key={index}>
              <Text className="text-lg font-semibold mb-3">
                {item[0] == new Date().toISOString().split("T")[0]
                  ? "Today"
                  : `${monthFull[Number(mydate[1])-1]} ${Number(mydate[2])}, ${mydate[0]}`}
              </Text>
              {item[1].map((item) => {
                const IconComponent = iconsLibrary[item.iconLibrary];
                const size = item.iconLibrary === 'FontAwesome5' ? 21 : 23;
                return (
                  <TransactionItem
                    key={item.id}
                    icon={<IconComponent name={item.iconName} color="#000000" size={size} />}
                    stats={item}
                    onDelete={() => fetchData()}
                  />
                )
              })}
            </View>
          )
        })}
      </ScrollView>
      
      
      <FilterModal
        isVisible={isFilterOn}
        setIsFilterOn={setIsFilterOn}
        setFilterStats={setFilterStats}
        filterRef={filterRef}
      />
    </View>

  );

}


// so many useState for fuck sake
// need to improve this
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function ReportScreen() {
  const navigation = useNavigation();
  const [shownTransactions, setShownTransactions] = useState({
    expenseList: [],
    incomeList: [],
    allTransactions: [], // not sure we need this one or not
    totalIncome: 0,
    totalExpense: 0
  });
  //const [analysis, setAnalysis] = useState("pie");
  const [isExpense, setIsExpense] = useState(true);

  const [dateStatus, setDateStatus] = useState({
    transactionsType : "Daily",
    userClickDate : new Date().toISOString().split("T")[0],
  })

  const mylist = dateStatus.userClickDate.split("-")

  const [sortingType, setSortingType] = useState('Increasing');

  // should we make them into a single object?
  const [calendarOn, setCalendarOn] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const formatCurrency = (amount) => amount.toLocaleString("en-US");

  const onChange = (_, selectedDate) => {
    setCalendarOn(false); 
    if (selectedDate) {
      setCalendarDate(new Date(selectedDate));
      setDateStatus(prev => ({...prev, userClickDate : new Date(selectedDate).toISOString().split('T')[0]}));
    }
  };

  const fetchData = async () => {
    const myTransactions = await fetchExpensesByDate(dateStatus.userClickDate);
    const categories = await getAllCategories('all');

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat; 
    });
    
    let tempIncomeList = {};
    let tempExpenseList = {};
    let totalIncome = 0;
    let totalExpense = 0;

    myTransactions.forEach((item) => {
      const category = item.category;
      const isIncome = item.income;

      // title = number of transactions
      if (isIncome) {
        if (!tempIncomeList[category]) {
          tempIncomeList[category] = { amount: 0, count: 0, iconsLibrary : categoryMap[category].iconLibrary, iconName : categoryMap[category].iconName, color : categoryMap[category].color };
        }
        tempIncomeList[category].amount += item.amount;
        tempIncomeList[category].count += 1;
        totalIncome += item.amount;
      } else {
        if (!tempExpenseList[category]) {
          tempExpenseList[category] = { amount: 0, count: 0, iconsLibrary : categoryMap[category].iconLibrary, iconName : categoryMap[category].iconName, color : categoryMap[category].color };  
        }
        tempExpenseList[category].amount += item.amount;
        tempExpenseList[category].count += 1;
        totalExpense += item.amount;
      }
    });

    setShownTransactions({
      incomeList: tempIncomeList,
      expenseList: tempExpenseList,
      allTransactions: myTransactions,
      totalIncome,
      totalExpense
    });
  };

  useEffect(() => {
    fetchData();
  }, [dateStatus]); 

  // this causes the pie-chart to re-render without necessary
  useEffect(() => {
    const tempIncomeList = sortingFunction(shownTransactions.incomeList);
    const tempExpenseList = sortingFunction(shownTransactions.expenseList);

    setShownTransactions(prev => ({
      ...prev,
      incomeList: tempIncomeList,
      expenseList: tempExpenseList,
    }));
  }, [sortingType]);


  // this isn't right
  // it's checking the same condition twice
  function sortingFunction(mylist) {
    let res = {};
    if (sortingType == 'Increasing') {
      res = Object.entries(mylist).sort((a,b) => a[1].amount - b[1].amount);
      res = Object.fromEntries(res);
    } else {
      res = Object.entries(mylist).sort((a,b) => b[1].amount - a[1].amount);
      res = Object.fromEntries(res);
    }
    return res;
  }

  return (
    <View className="flex-1 bg-[#faffd6] px-6 items-center">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-[20px] mt-[10px] w-full">
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeftCircle color="#000000" size={30} />
        </Pressable>

        <Text className="text-[21px] font-bold">Financial Report</Text>

        {/* should we separate this or not */}
        <Pressable onPress={() => setCalendarOn(true)}>
          <MaterialIcons name="calendar-month" color="#000000" size={25} />
        </Pressable>

        {calendarOn && dateStatus.transactionsType == "Daily" && (
          <DateTimePicker
            value={calendarDate}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}

        {calendarOn && dateStatus.transactionsType == "Monthly" && (
          <MonthPickerModal
            visible={calendarOn && dateStatus.transactionsType == "Monthly"}
            setCalendarOn={setCalendarOn} // e.g. '2025-04'
            date={dateStatus.userClickDate}
            setDateStatus={setDateStatus}
          />
        )}

        {calendarOn && dateStatus.transactionsType == "Yearly" && (
          <YearPickerModal
            visible={calendarOn && dateStatus.transactionsType == "Yearly"}
            date={dateStatus.userClickDate}
            setCalendarOn={setCalendarOn}
            setDateStatus={setDateStatus} // e.g. '2025'
          />
        )}
      </View>

      {/* Month Selector */}
      <View className="mb-4 flex-row items-start justify-between w-full mt-[7px]">
        {/* this would cause re-rendering without necessary */}
        <TransactionTypePickerModal
          dateStatus={dateStatus}
          setDateStatus={setDateStatus}
        />

        <View className="flex-row items-center justify-center">

          <SortingPickerModal
            sortingType={sortingType}
            setSortingType={setSortingType}
          />
          
        </View>
      </View>

      {/* Chart Placeholder */}
      <View className="bg-[#b0e1a2] rounded-2xl shadow-md mx-4 mb-[15px] w-full z-50 h-[200px] rounded-[25px] relative">
        {/* should I rewrite the graph the way I did in pie chart*/}
        {Object.entries(
          isExpense
            ? shownTransactions.expenseList
            : shownTransactions.incomeList
        ).length == 0 ? (
          <View className="w-full h-full flex items-center justify-center">
            <Text className="text-[25px] text-[#ffffff] font-semibold text-shadow-md">
              No data yet.
            </Text>
          </View>
        ) : (
          <View className="flex-row justify-center items-center w-full">
            <View
              className={`${isExpense ? "hidden pointer-events-none" : "flex"}`}
            >
              <Pie data={shownTransactions.incomeList} />
            </View>

            <View
              className={`${isExpense ? "flex" : "hidden pointer-events-none"}`}
            >
              <Pie data={shownTransactions.expenseList} />
            </View>
          </View>
        )}
      </View>

      {/* Expense/Income Toggle */}
      <View className="flex-row justify-center items-center w-[300px] rounded-full w-full bg-gray-100">
        <Pressable
          className={`w-[50%] h-[48px] flex items-center justify-center ${
            isExpense ? "rounded-full bg-[#b0e1a2]" : ""
          }`}
          onPress={() => setIsExpense(true)}
        >
          <Text className="text-[17px] text-black font-semibold">Expense</Text>
        </Pressable>

        <Pressable
          className={`w-[50%] h-[48px] flex items-center justify-center ${
            !isExpense ? "rounded-full bg-[#b0e1a2]" : ""
          }`}
          onPress={() => setIsExpense(false)}
        >
          <Text className="text-[17px] text-black font-semibold">Income</Text>
        </Pressable>
      </View>

      <View className="w-full mb-4">
        <View className="flex-row items-center justify-between my-[14px]">
          <Text className="text-[18px] font-bold">
            {months[Number(mylist[1])-1]} {mylist[2]}, {mylist[0]}
          </Text>

          <Text
            className={`text-[18px] font-semibold mr-[10px] ${
              isExpense ? "text-red-500" : "text-green-800"
            }`}
          >
            {isExpense
              ? `-${formatCurrency(shownTransactions.totalExpense)}`
              : `+${formatCurrency(shownTransactions.totalIncome)}`}
          </Text>
        </View>

        {/* should use flatlist */}
        <ScrollView>
          {Object.keys(
            (isExpense
              ? shownTransactions.expenseList
              : shownTransactions.incomeList) ?? {}
          ).length === 0 ? (
            <Text className="text-center text-black mt-4 text-[20px] font-semibold">No data yet.</Text>
          ) : (
            Object.entries(
              isExpense
                ? shownTransactions.expenseList
                : shownTransactions.incomeList
            ).map((item, index) => {
              const IconComponent = iconsLibrary[item[1].iconsLibrary];
              const size = item[1].iconsLibrary === 'FontAwesome5' ? 21 : 23;
              //const temp = {title : item[1].title, category : item[1].category, amount : item[1].amount, income : !isExpense, date : item[1].date}

              return (
                <View 
                  key={index}
                  className="flex-row items-center justify-between bg-[#b0e1a2] p-4 rounded-xl mb-3 shadow-md"
                >

                  <View className="flex-row items-center space-x-4">
                    <View
                      className={`w-[45px] h-[45px] rounded-full bg-[#cbf5af] flex items-center justify-center`}
                    >
                      <IconComponent name={`${item[1].iconName}`} size={size}/>
                    </View>
                    <View className="ml-[15px] w-[60%]">
                      <Text className="text-black text-[17px]">{item[0]}</Text>
                      <Text className="text-gray-500 text-[13px]" ellipsizeMode='tail' numberOfLines={1}>{`${item[1].count} transaction${item[1].count > 1 ? 's':''}`}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`text-[17px] font-semibold ${
                        !isExpense ? "text-green-800" : "text-red-500"
                      }`}
                    >
                      {!isExpense ? "+" : "-"}
                      {formatCurrency(item[1].amount)}
                    </Text>
                  </View>
                </View>

                //<TransactionItem
                //  key={index}
                //  icon={<IconComponent name={item[1].iconName} color="#000000" size={size} />}
                //  stats={temp}
                //  onDelete={() => fetchData()}
                ///>
                
              )
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}
