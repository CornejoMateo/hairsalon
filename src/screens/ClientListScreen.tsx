import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Alert,
	StatusBar,
	TextInput,
	Linking,
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getClients, deleteClient } from '../database/client';
import Client from '../models/Client';
import { main, defaultColor } from '../../constans/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getInitials } from '../utils/ClientList';
import { useDatabase } from '../database/databaseProvider';
import { useCompany } from '../context/CompanyContext';

type ClientListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ClientList'>;

interface ClientsListProps {
	navigation: ClientListScreenNavigationProp;
}

export default function ClientsListScreen({ navigation }: ClientsListProps) {
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchText, setSearchText] = useState('');
	const { isReady } = useDatabase();
	const { company } = useCompany();
	const mainColor = company?.mainColor || defaultColor;

	const loadClients = () => {
		try {
			const data = getClients();
			setClients(data);
		} catch (error) {
			Alert.alert('Error', 'No se pudieron cargar los clientes');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (!isReady) {
				Alert.alert('Error', 'La base de datos no está lista');
				return;
			}
			loadClients(); 
		}, [])
	);

	const filteredClients = clients.filter((client) => {
		if (!searchText) return true;
		const search = searchText.toLowerCase();
		return (
			client.name?.toLowerCase().includes(search) || client.phone?.toLowerCase().includes(search)
		);
	});

	const handleDeleteClient = (client: Client) => {
		Alert.alert(
			'Eliminar clienta',
			`¿Estás seguro de que deseas eliminar a ${client.name}? También se eliminará todo su historial.`,
			[
				{
					text: 'Cancelar',
					style: 'cancel',
				},
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: () => {
						try {
							deleteClient(client.id || 0);
							setClients(clients.filter((c) => c.id !== client.id));
							Alert.alert('Éxito', 'Clienta eliminada correctamente');
						} catch (error) {
							Alert.alert('Error', 'No se pudo eliminar la clienta');
							console.error(error);
						}
					},
				},
			]
		);
	};

	const handleOpenWhatsApp = (phone: string | null) => {
		if (!phone) {
			Alert.alert('Error', 'Esta clienta no tiene número de teléfono');
			return;
		}
		
		const cleanPhone = phone.replace(/\D/g, '');
		
		const url = `https://wa.me/${cleanPhone}`;
		
		Linking.canOpenURL(url)
			.then((supported) => {
				if (supported) {
					return Linking.openURL(url);
				} else {
					Alert.alert('Error', 'No se puede abrir WhatsApp');
				}
			})
			.catch((err) => {
				Alert.alert('Error', 'No se pudo abrir WhatsApp');
			});
	};

	const renderClient = ({ item }: { item: Client }) => (
		<View style={styles.clientItemWrapper}>
			<TouchableOpacity
				style={styles.clientItem}
				onPress={() =>
					navigation.navigate('HistoryClient', {
						clientId: item.id || 0,
						clientName: item.name || 'Cliente',
					})
				}
				activeOpacity={0.7}
			>
				<View style={[styles.avatar, { backgroundColor: mainColor }]}>
					<Text style={styles.avatarText}>{getInitials(item.name || null)}</Text>
				</View>
				<View style={styles.clientInfo} pointerEvents="box-none">
					<Text style={styles.clientName}>{item.name}</Text>
					{item.phone ? (
						<TouchableOpacity 
							onPress={(e) => {
								handleOpenWhatsApp(item.phone);
							}} 
							activeOpacity={0.7}
							style={styles.phoneButton}
						>
							<Text style={styles.clientPhone}>📱 {item.phone}</Text>
						</TouchableOpacity>
					) : (
						<Text style={styles.clientPhone}>Sin teléfono</Text>
					)}
				</View>
				<Text style={styles.chevron}>›</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.editButton}
				onPress={() =>
					navigation.navigate('AddClient', {
						clientId: item.id ?? undefined,
						clientName: item.name,
						clientPhone: item.phone,
					})
				}
				activeOpacity={0.7}
			>
				<Text style={styles.editIcon}>✏️</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.deleteButton}
				onPress={() => handleDeleteClient(item)}
				activeOpacity={0.7}
			>
				<Text style={styles.deleteIcon}>🗑️</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView style={styles.container} edges={['left', 'bottom', 'right']}>
			<StatusBar barStyle="light-content" backgroundColor={mainColor} />
			{loading ? (
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Cargando...</Text>
				</View>
			) : clients.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyIcon}>👥</Text>
					<Text style={styles.emptyText}>No hay clientas aún</Text>
					<Text style={styles.emptySubtext}>Comienza agregando tu primer clienta</Text>
					<TouchableOpacity
						style={[styles.emptyButton, { backgroundColor: mainColor, shadowColor: mainColor }]}
						onPress={() => navigation.navigate('AddClient')}
					>
						<Text style={styles.emptyButtonText}>+ Agregar clienta</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.listWrapper}>
					<View style={styles.statsBar}>
						<Text style={styles.statsText}>Mis clientas({filteredClients.length})</Text>
						<TouchableOpacity
						style={[styles.addButton, { backgroundColor: mainColor, shadowColor: mainColor }]}
							onPress={() => navigation.navigate('AddClient')}
							activeOpacity={0.8}
						>
							<Text style={styles.addButtonText}>Agregar clienta</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.searchContainer}>
						<TextInput
							style={styles.searchInput}
							placeholder="Buscar por nombre o teléfono..."
							placeholderTextColor="#94A3B8"
							value={searchText}
							onChangeText={setSearchText}
							autoCapitalize="none"
							autoCorrect={false}
						/>
						{searchText.length > 0 && (
							<TouchableOpacity onPress={() => setSearchText('')}>
								<Text style={styles.clearIcon}>✕</Text>
							</TouchableOpacity>
						)}
					</View>
					<FlatList
						data={filteredClients}
						renderItem={renderClient}
						keyExtractor={(item) => item.id?.toString() || ''}
						contentContainerStyle={styles.listContainer}
						showsVerticalScrollIndicator={false}
						refreshing={loading}
						onRefresh={loadClients}
					/>
				</View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FF',
	},
	addButton: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 4,
	},
	addButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
	listWrapper: {
		flex: 1,
		marginTop: 8,
	},
	statsBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		marginHorizontal: 16,
		marginTop: 8,
		marginBottom: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E2E8F0',
		shadowColor: '#6366F1',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	searchIcon: {
		fontSize: 18,
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		color: '#1E293B',
		padding: 0,
	},
	clearIcon: {
		fontSize: 18,
		color: '#94A3B8',
		paddingLeft: 8,
	},
	statsText: {
		fontSize: 20,
		color: '#64748B',
		fontWeight: '600',
	},
	listContainer: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	clientItemWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		gap: 8,
	},
	clientItem: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderRadius: 16,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: main,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		borderWidth: 1,
		borderColor: '#F1F5F9',
	},
	deleteButton: {
		width: 52,
		height: 52,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#EF4444',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	deleteIcon: {
		fontSize: 15,
	},
	avatar: {
		width: 52,
		height: 52,
		borderRadius: 26,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 14,
	},
	avatarText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: 'bold',
	},
	clientInfo: {
		flex: 1,
		gap: 4,
	},
	phoneButton: {
		alignSelf: 'flex-start',
	},
	clientName: {
		fontSize: 17,
		fontWeight: '700',
		color: '#1E293B',
		marginBottom: 2,
	},
	clientPhone: {
		fontSize: 14,
		color: '#64748B',
		fontWeight: '500',
	},
	chevron: {
		fontSize: 28,
		color: '#CBD5E1',
		fontWeight: '300',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
		color: '#64748B',
		fontWeight: '500',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyText: {
		fontSize: 22,
		color: '#1E293B',
		fontWeight: '700',
		marginBottom: 8,
	},
	emptySubtext: {
		fontSize: 15,
		color: '#64748B',
		textAlign: 'center',
		marginBottom: 24,
	},
	emptyButton: {
		paddingHorizontal: 32,
		paddingVertical: 14,
		borderRadius: 24,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	emptyButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
	editButton: {
		width: 52,
		height: 52,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#2563EB',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	editIcon: {
		fontSize: 15,
	},
});
