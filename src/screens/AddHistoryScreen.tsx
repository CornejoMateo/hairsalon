import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useDatabase } from '../database/databaseProvider';
import { main } from '../../constans/colors';

type AddHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddHistory'>;
type AddHistoryScreenRouteProp = RouteProp<RootStackParamList, 'AddHistory'>;

interface AddHistoryScreenProps {
	navigation: AddHistoryScreenNavigationProp;
	route: AddHistoryScreenRouteProp;
}

export default function AddHistoryScreen({ navigation, route }: AddHistoryScreenProps) {
	const { clientId, clientName } = route.params;
	const { db, isReady } = useDatabase();
	const [description, setDescription] = useState('');
	const [cost, setCost] = useState('');
	const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (!description.trim()) {
			Alert.alert('Error', 'La descripción es obligatoria');
			return;
		}

		const costNumber = parseFloat(cost);
		if (isNaN(costNumber) || costNumber <= 0) {
			Alert.alert('Error', 'El costo debe ser un número válido mayor a 0');
			return;
		}

		if (!db || !isReady) {
			Alert.alert('Error', 'Base de datos no está lista');
			return;
		}

		setLoading(true);

		try {
			await db.runAsync(
				'INSERT INTO history (client_id, description, cost, date) VALUES (?, ?, ?, ?)',
				[clientId, description.trim(), costNumber, date]
			);

			Alert.alert('Éxito', 'Servicio agregado correctamente', [
				{
					text: 'OK',
					onPress: () => navigation.goBack(),
				},
			]);
		} catch (error) {
			console.error('Error al agregar servicio:', error);
			Alert.alert('Error', 'No se pudo agregar el servicio');
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<View style={styles.content}>
					<View style={styles.clientInfo}>
						<Text style={styles.clientLabel}>Clienta</Text>
						<Text style={styles.clientName}>{clientName}</Text>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Descripción del servicio</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={description}
							onChangeText={setDescription}
							placeholderTextColor="#9ca3af"
							multiline
							numberOfLines={3}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Costo</Text>
						<View style={styles.costContainer}>
							<Text style={styles.currencySymbol}>$</Text>
							<TextInput
								style={[styles.input, styles.costInput]}
								value={cost}
								onChangeText={setCost}
								placeholder="0.00"
								placeholderTextColor="#9ca3af"
								keyboardType="decimal-pad"
							/>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Fecha</Text>
						<TextInput
							style={styles.input}
							value={date}
							onChangeText={setDate}
							placeholder="YYYY-MM-DD"
							placeholderTextColor="#9ca3af"
						/>
						<Text style={styles.hint}>Formato: Año-Mes-Día</Text>
					</View>

					<TouchableOpacity
						style={[styles.submitButton, loading && styles.submitButtonDisabled]}
						onPress={handleSubmit}
						disabled={loading}
					>
						<Text style={styles.submitButtonText}>
							{loading ? 'Guardando...' : 'Guardar servicio'}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.cancelButton}
						onPress={() => navigation.goBack()}
						disabled={loading}
					>
						<Text style={styles.cancelButtonText}>Cancelar</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FF',
	},
	content: {
		padding: 20,
		marginHorizontal: 20,
	},
	clientInfo: {
		backgroundColor: '#FFFFFF',
		padding: 16,
		borderRadius: 12,
		marginBottom: 20,
		borderWidth: 2,
		borderColor: main,
	},
	clientLabel: {
		fontSize: 12,
		color: '#64748B',
		fontWeight: '600',
		marginBottom: 4,
	},
	clientName: {
		fontSize: 20,
		color: main,
		fontWeight: 'bold',
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1E293B',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		padding: 14,
		fontSize: 16,
		color: '#1E293B',
	},
	textArea: {
		height: 80,
		textAlignVertical: 'top',
	},
	costContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		paddingLeft: 14,
	},
	currencySymbol: {
		fontSize: 18,
		color: '#059669',
		fontWeight: 'bold',
		marginRight: 4,
	},
	costInput: {
		flex: 1,
		borderWidth: 0,
		paddingLeft: 0,
	},
	hint: {
		fontSize: 12,
		color: '#64748B',
		marginTop: 4,
		fontStyle: 'italic',
	},
	submitButton: {
		backgroundColor: main,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 10,
		shadowColor: main,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	submitButtonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: 'bold',
	},
	cancelButton: {
		backgroundColor: '#F1F5F9',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 12,
	},
	cancelButtonText: {
		color: '#64748B',
		fontSize: 16,
		fontWeight: '600',
	},
});
