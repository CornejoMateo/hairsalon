import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	StatusBar,
	Alert,
	TouchableOpacity,
	
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getHistoryByClient, deleteHistory } from '../database/history';
import History from '../models/History';
import { main, defaultColor } from '../../constans/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate } from '../utils/HistoryClient';
import { useCompany } from '../context/CompanyContext';

type HistoryClientScreenNavigationProp = NativeStackNavigationProp<
	RootStackParamList,
	'HistoryClient'
>;
type HistoryClientScreenRouteProp = RouteProp<RootStackParamList, 'HistoryClient'>;

interface HistoryClientScreenProps {
	navigation: HistoryClientScreenNavigationProp;
	route: HistoryClientScreenRouteProp;
}

export default function HistoryClientScreen({ navigation, route }: HistoryClientScreenProps) {
	const { clientId, clientName } = route.params;
	const [history, setHistory] = useState<History[]>([]);
	const [loading, setLoading] = useState(true);
	const { company } = useCompany();
	const mainColor = company?.mainColor || defaultColor;

	const loadHistory = () => {
		try {
			const data = getHistoryByClient(clientId);
			setHistory(data);
		} catch (error) {
			Alert.alert('Error', 'No se pudo cargar el historial');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteHistory = (history: History) => {
		Alert.alert(
			'Eliminar servicio',
			`¿Estás seguro de que deseas eliminar este servicio?`,
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
							deleteHistory(history.id || 0);
							setHistory(prev => prev.filter(h => h.id !== history.id));
							Alert.alert('Éxito', 'Servicio eliminado correctamente');
						} catch (error) {
							Alert.alert('Error', 'No se pudo eliminar el servicio');
							console.error(error);
						}
					},
				},
			]
		);
	};
		
	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({ title: clientName });
			loadHistory();
		}, [clientName])
	);

	const renderHistoryItem = ({ item }: { item: History }) => (
		<View style={styles.row}>
			<Text style={styles.cellDate}>{formatDate(item.date)}</Text>
			<Text style={styles.cellDescription}>{item.description || '-'}</Text>
			<Text style={styles.cellCost}>${item.cost}</Text>
			<View style={styles.cellAction}>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate('AddHistory', {
							clientId,
							clientName,
							historyId: item.id || undefined,
							description: item.description,
							cost: item.cost,
							date: item.date,
						})
					}
					activeOpacity={0.7}
				>
					<Text style={styles.editIcon}>✏️</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => handleDeleteHistory(item)}
					activeOpacity={0.7}
				>
					<Text style={styles.deleteIcon}>🗑️</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
			<StatusBar barStyle="light-content" backgroundColor={mainColor} />

			{loading ? (
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Cargando...</Text>
				</View>
			) : history.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyIcon}>📋</Text>
					<Text style={styles.emptyText}>Sin historial</Text>
					<Text style={styles.emptySubtext}>
						Aún no hay servicios registrados para esta clienta
					</Text>
					<TouchableOpacity
						style={[styles.addFirstButton, { backgroundColor: mainColor, shadowColor: mainColor }]}
						onPress={() => navigation.navigate('AddHistory', { clientId, clientName })}
					>
						<Text style={styles.addFirstButtonText}>Agregar primer servicio</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.tableContainer}>
					<View style={[styles.headerRow, { backgroundColor: mainColor }]}>
						<Text style={styles.headerCellDate}>Fecha</Text>
						<Text style={styles.headerCellDescription}>Descripción</Text>
						<Text style={styles.headerCellCost}>Costo</Text>
						<Text style={styles.HeaderCellAction}>Acciones</Text>
					</View>

					<FlatList
						data={history}
						renderItem={renderHistoryItem}
						keyExtractor={(item) => item.id?.toString() || ''}
						showsVerticalScrollIndicator={false}
						refreshing={loading}
						onRefresh={loadHistory}
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
	tableContainer: {
		flex: 1,
		margin: 16,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		overflow: 'hidden',
		shadowColor: '#6366F1',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	headerRow: {
		flexDirection: 'row',
		paddingVertical: 16,
		paddingHorizontal: 12,
		borderBottomWidth: 2,
		borderBottomColor: '#cacaca',
	},
	headerCellDate: {
		flex: 0.25,
		color: '#FFFFFF',
		fontWeight: 'bold',
		fontSize: 14,
		textAlign: 'center',
	},
	headerCellDescription: {
		flex: 0.5,
		color: '#FFFFFF',
		fontWeight: 'bold',
		fontSize: 14,
		paddingLeft: 8,
		textAlign: 'center',
	},
	headerCellCost: {
		flex: 0.25,
		color: '#FFFFFF',
		fontWeight: 'bold',
		fontSize: 14,
		textAlign: 'center',
	},
	HeaderCellAction: {
		flex: 0.25,
		color: '#FFFFFF',
		fontWeight: 'bold',
		fontSize: 14,
		textAlign: 'center',
	},
	row: {
		flexDirection: 'row',
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
		alignItems: 'center',
	},
	cellDate: {
		flex: 0.25,
		fontSize: 13,
		color: '#475569',
		textAlign: 'center',
		fontWeight: '500',
	},
	cellDescription: {
		flex: 0.5,
		fontSize: 14,
		color: '#1E293B',
		paddingLeft: 8,
	},
	cellCost: {
		flex: 0.25,
		fontSize: 14,
		color: '#059669',
		fontWeight: '600',
		textAlign: 'center',
		paddingHorizontal: 5,
	},
	cellAction: {
		flex: 0.25,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
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
	},
	addFirstButton: {
		paddingHorizontal: 32,
		paddingVertical: 14,
		borderRadius: 24,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
		marginTop: 24,
	},
	addFirstButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
	editIcon: {
		fontSize: 20,
		marginHorizontal: 8,
	},
	deleteIcon: {
		fontSize: 20,
		marginHorizontal: 8,
	},
});
