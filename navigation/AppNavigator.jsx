//import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import BottomTabs from './BottomTabs';
//import AddTransactionScreen from '../app/(Modals)/AddTransactionScreen';
//import { MiniCategoriesScreen, CategoryDetailScreen } from '../app/(Tabs)/Categories';
//import { ReportScreen, TransactionScreen } from '../app/(Tabs)/Transactions';
//import AddCategoryScreen from '../app/(Modals)/AddCategoryScreen';
//import TransactionDetailScreen from '../app/(Modals)/TransactionDetailScreen'
//
//// should this file in the app directory?
//const Stack = createNativeStackNavigator();
//
//export default function AppNavigator() {
//  return (
//    <Stack.Navigator 
//      screenOptions={{
//        headerShown: false, 
//        tabBarStyle: {
//          position: "absolute"
//        }
//      }}
//    >
//      <Stack.Screen name="Main" component={BottomTabs} />
//      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
//      <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
//      <Stack.Screen name="MiniCategories" component={MiniCategoriesScreen} />
//      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
//      <Stack.Screen name="Transactions" component={TransactionScreen}/>
//      <Stack.Screen name="TransactionsDetail" component={TransactionDetailScreen}/>
//      <Stack.Screen name="Report" component={ReportScreen}/>
//    </Stack.Navigator>
//  );
//}
