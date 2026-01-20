import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, View, ActivityIndicator, Image } from 'react-native';
import { DatabaseProvider } from './src/database/databaseProvider';
import { CompanyProvider, useCompany } from './src/context/CompanyContext';
import { RootStackParamList } from './src/navigation/AppNavigator';
import HomeScreen from './src/screens/HomeScreen';
import ClientListScreen from './src/screens/ClientListScreen';
import AddClientScreen from './src/screens/AddClientScreen';
import HistoryClientScreen from './src/screens/HistoryClientScreen';
import AddHistoryScreen from './src/screens/AddHistoryScreen';
import BackupScreen from './src/screens/BackupScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ConfigurationScreen from './src/screens/ConfigurationScreen';
import { main } from './constans/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
	const { company, isLoading } = useCompany();

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color={company?.mainColor || main} />
			</View>
		);
	}

	const initialRoute = company?.id ? 'Home' : 'Register';

	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName={initialRoute}
				screenOptions={{
					headerStyle: {
						backgroundColor: company?.mainColor || main,
					},
					headerTintColor: '#fff',
					headerTitleStyle: {
						fontWeight: 'bold',
					},
					headerBackTitle: 'Volver',
				}}
			>
				<Stack.Screen
					name="Register"
					component={RegisterScreen}
					options={{ title: 'Registrar Peluquería', headerShown: false }}
				/>
				<Stack.Screen
					name="Home"
					component={HomeScreen}
					options={({ navigation }) => ({
						title: company?.nameCompany || 'Sin nombre',
						headerRight: () => (
							<TouchableOpacity 
								onPress={() => navigation.navigate('Configuration')}
								style={{ marginRight: 8 }}
							>
								{company?.logoUrl ? (
									<Image 
										source={{ uri: company.logoUrl }} 
										style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff' }} 
									/>
								) : (
									<View style={{ 
										width: 36, 
										height: 36, 
										borderRadius: 18, 
										backgroundColor: '#fff', 
										justifyContent: 'center', 
										alignItems: 'center' 
									}}>
										<Text style={{ fontSize: 18 }}>⚙️</Text>
									</View>
								)}
							</TouchableOpacity>
						),
					})}
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
				<Stack.Screen 
					name="HistoryClient"
					component={HistoryClientScreen} 
					options={({ navigation, route }) => ({
						title: '',
						headerRight: () => (
							<TouchableOpacity
								onPress={() => navigation.navigate('AddHistory', {
									clientId: route.params.clientId,
									clientName: route.params.clientName
								})}
								style={{ marginRight: 8 }}
							>
								<Text style={{ color: '#fff', fontSize: 32, fontWeight: '300' }}>+</Text>
							</TouchableOpacity>
						),
					})}
				/>
				<Stack.Screen
					name="AddHistory"
					component={AddHistoryScreen}
					options={{ title: 'Agregar servicio' }}
				/>
				<Stack.Screen
					name="Backup"
					component={BackupScreen}
					options={{ title: 'Backup y restauración' }}
				/>
				<Stack.Screen
					name="Configuration"
					component={ConfigurationScreen}
					options={{ title: 'Configuración' }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<DatabaseProvider>
			<CompanyProvider>
				<AppNavigator />
			</CompanyProvider>
		</DatabaseProvider>
	);
}
