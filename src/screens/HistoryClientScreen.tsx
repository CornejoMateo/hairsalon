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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getHistoryByClient } from '../database/history';
import History from '../models/History';
import { main } from '../../constans/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate, formatCost } from '../utils/HistoryClient';

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

	useEffect(() => {
		navigation.setOptions({ title: clientName });
		loadHistory();
	}, [clientName]);

	const renderHistoryItem = ({ item }: { item: History }) => (
		<View style={styles.row}>
			<Text style={styles.cellDate}>{formatDate(item.date)}</Text>
			<Text style={styles.cellDescription}>{item.description || '-'}</Text>
			<Text style={styles.cellCost}>{formatCost(item.cost)}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
			<StatusBar barStyle="light-content" backgroundColor={main} />

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
						style={styles.addFirstButton}
						onPress={() => navigation.navigate('AddHistory', { clientId, clientName })}
					>
						<Text style={styles.addFirstButtonText}>Agregar primer servicio</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.tableContainer}>
					<View style={styles.headerRow}>
						<Text style={styles.headerCellDate}>Fecha</Text>
						<Text style={styles.headerCellDescription}>Descripción</Text>
						<Text style={styles.headerCellCost}>Costo</Text>
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

			{!loading && history.length > 0 && (
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => navigation.navigate('AddHistory', { clientId, clientName })}
					activeOpacity={0.8}
				>
					<Text style={styles.addButtonText}>Agregar servicio</Text>
				</TouchableOpacity>
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
		backgroundColor: main,
		paddingVertical: 16,
		paddingHorizontal: 12,
		borderBottomWidth: 2,
		borderBottomColor: '#4F46E5',
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
		backgroundColor: main,
		paddingHorizontal: 32,
		paddingVertical: 14,
		borderRadius: 24,
		shadowColor: main,
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
	addButton: {
		position: 'absolute',
		bottom: 24,
		right: 20,
		backgroundColor: main,
		paddingHorizontal: 24,
		paddingVertical: 16,
		borderRadius: 30,
		shadowColor: main,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 8,
	},
	addButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
});
