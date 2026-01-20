import React, { useState, useEffect } from 'react';
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
import { main, defaultColor } from '../../constans/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCompany } from '../context/CompanyContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type AddHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddHistory'>;
type AddHistoryScreenRouteProp = RouteProp<RootStackParamList, 'AddHistory'>;

interface AddHistoryScreenProps {
	navigation: AddHistoryScreenNavigationProp;
	route: AddHistoryScreenRouteProp;
}

export default function AddHistoryScreen({ navigation, route }: AddHistoryScreenProps) {
	const { clientId, clientName } = route.params;
	const { db, isReady } = useDatabase();
	const { company } = useCompany();
	const mainColor = company?.mainColor || defaultColor;
	const [description, setDescription] = useState('');
	const [cost, setCost] = useState('');
	const [date, setDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [loading, setLoading] = useState(false);

	const isEditing = route.params?.historyId !== undefined;

	useEffect(() => {
		if (route.params?.description) {
			setDescription(route.params.description);
		}
		if (route.params?.cost) {
			setCost(route.params.cost);
		}
		if (route.params?.date) {
			setDate(new Date(route.params.date));
		}
	}, [route.params]);

	const handleSubmit = async () => {
		if (!description.trim()) {
			Alert.alert('Error', 'La descripción es obligatoria');
			return;
		}

		if (!db || !isReady) {
			Alert.alert('Error', 'Base de datos no está lista');
			return;
		}

		setLoading(true);

		try {
			const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
			
			if (isEditing) {
				await db.runAsync(
					'UPDATE history SET description = ?, cost = ?, date = ? WHERE id = ?',
					[description.trim(), cost, formattedDate, route.params?.historyId]
				);
				Alert.alert('Éxito', 'Servicio actualizado correctamente', [
					{
						text: 'OK',
						onPress: () => navigation.goBack(),
					},
				]);
			} else {
				await db.runAsync(
					'INSERT INTO history (client_id, description, cost, date) VALUES (?, ?, ?, ?)',
					[clientId, description.trim(), cost, formattedDate]
				);
				Alert.alert('Éxito', 'Servicio agregado correctamente', [
					{
						text: 'OK',
						onPress: () => navigation.goBack(),
					},
				]);
			}
		} catch (error) {
			console.error('Error al guardar servicio:', error);
			Alert.alert('Error', 'No se pudo guardar el servicio');
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
					<Text style={styles.title}>{isEditing ? 'Editar servicio' : 'Agregar servicio'}</Text>
					
					<View style={[styles.clientInfo, { borderColor: mainColor }]}>
						<Text style={styles.clientLabel}>Clienta</Text>
						<Text style={[styles.clientName, { color: mainColor }]}>{clientName}</Text>
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
								placeholderTextColor="#9ca3af"
								keyboardType="numbers-and-punctuation"
							/>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<TouchableOpacity
							style={styles.dateButton}
							onPress={() => setShowDatePicker(!showDatePicker)}
						>
							<Text style={styles.dateText}>
								{date.toLocaleDateString('es-ES', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</Text>
							<Text style={styles.calendarIcon}>📅</Text>
						</TouchableOpacity>
					</View>

					{showDatePicker && (
						<DateTimePicker
							value={date}
							mode="date"
							display={Platform.OS === 'ios' ? 'spinner' : 'default'}
							onChange={(event, selectedDate) => {
								setShowDatePicker(Platform.OS === 'ios');
								if (selectedDate) {
									setDate(selectedDate);
								}
							}}
						/>
					)}

					<TouchableOpacity
						style={[styles.submitButton, { backgroundColor: mainColor, shadowColor: mainColor }, loading && styles.submitButtonDisabled]}
						onPress={handleSubmit}
						disabled={loading}
					>
						<Text style={styles.submitButtonText}>
							{loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar servicio' : 'Guardar servicio')}
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
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1E293B',
		marginBottom: 16,
	},
	clientInfo: {
		backgroundColor: '#FFFFFF',
		padding: 16,
		borderRadius: 12,
		marginBottom: 20,
		borderWidth: 2,
	},
	clientLabel: {
		fontSize: 12,
		color: '#64748B',
		fontWeight: '600',
		marginBottom: 4,
	},
	clientName: {
		fontSize: 20,
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
	dateButton: {
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		padding: 14,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	dateText: {
		fontSize: 16,
		color: '#1E293B',
		fontWeight: '500',
	},
	calendarIcon: {
		fontSize: 20,
		paddingLeft: 14,
	},
	costContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		paddingHorizontal: 14,
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
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 10,
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
