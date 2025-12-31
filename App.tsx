import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DatabaseProvider } from './src/database/databaseProvider';
import { RootStackParamList } from './src/navigation/AppNavigator';
import HomeScreen from './src/screens/HomeScreen';
import ClientListScreen from './src/screens/ClientListScreen';
import AddClientScreen from './src/screens/AddClientScreen';
import HistoryClientScreen from './src/screens/HistoryClientScreen';
import AddHistoryScreen from './src/screens/AddHistoryScreen';
import { main } from './constans/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
	return (
		<DatabaseProvider>
			<NavigationContainer>
				<Stack.Navigator
					initialRouteName="Home"
					screenOptions={{
						headerStyle: {
							backgroundColor: main,
						},
						headerTintColor: '#fff',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				>
					<Stack.Screen
						name="Home"
						component={HomeScreen}
						options={{ title: 'Eliana Zabala Peluquería' }}
					/>
					<Stack.Screen
						name="ClientList"
						component={ClientListScreen}
						options={{ title: 'Lista de clientas' }}
					/>
					<Stack.Screen
						name="AddClient"
						component={AddClientScreen}
						options={{ title: 'Agregar clienta' }}
					/>
					<Stack.Screen name="HistoryClient" component={HistoryClientScreen} />
					<Stack.Screen
						name="AddHistory"
						component={AddHistoryScreen}
						options={{ title: 'Agregar turno' }}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</DatabaseProvider>
	);
}
