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
import { useCompany } from '../context/CompanyContext';

type AddClientScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddClient'>;
type AddClientScreenRouteProp = RouteProp<RootStackParamList, 'AddClient'>;

type AddClientScreenProps = {
	navigation: AddClientScreenNavigationProp;
	route: AddClientScreenRouteProp;
};

export default function AddClientScreen({ navigation, route }: AddClientScreenProps) {
	const { db, isReady } = useDatabase();
	const { company } = useCompany();
	const mainColor = company?.mainColor || defaultColor;
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [loading, setLoading] = useState(false);

	const isEditing = route.params?.clientId !== undefined;

	useEffect(() => {
		if (route.params?.clientName) {
			setName(route.params.clientName);
		}
		if (route.params?.clientPhone) {
			setPhone(route.params.clientPhone);
		}
	}, [route.params]);

	const handleSubmit = async () => {
		if (!name.trim()) {
			Alert.alert('Error', 'El nombre es obligatorio');
			return;
		}

		if (!db || !isReady) {
			Alert.alert('Error', 'Base de datos no está lista');
			return;
		}

		setLoading(true);

		try {
			if (isEditing) {
				await db.runAsync(
					'UPDATE clients SET name = ?, phone = ? WHERE id = ?',
					[name.trim(), phone.trim() || null, route.params?.clientId]
				);
				Alert.alert('Éxito', 'Clienta actualizada correctamente', [
					{
						text: 'OK',
						onPress: () => navigation.goBack(),
					},
				]);
			} else {
				await db.runAsync('INSERT INTO clients (name, phone) VALUES (?, ?)', [
					name.trim(),
					phone.trim() || null,
				]);
				Alert.alert('Éxito', 'Clienta agregada correctamente', [
					{
						text: 'OK',
						onPress: () => {
							setName('');
							setPhone('');
							navigation.goBack();
						},
					},
				]);
			}
		} catch (error) {
			console.error('Error al guardar clienta:', error);
			Alert.alert('Error', 'No se pudo guardar la clienta');
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
					<Text style={styles.title}>{isEditing ? 'Editar clienta' : 'Agregar clienta'}</Text>
					
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Nombre</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							placeholder="Ingresa el nombre de la clienta"
							placeholderTextColor="#9ca3af"
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Teléfono</Text>
						<TextInput
							style={styles.input}
							value={phone}
							onChangeText={setPhone}
							placeholder="Ingresa el teléfono"
							placeholderTextColor="#9ca3af"
							keyboardType="phone-pad"
						/>
					</View>

					<TouchableOpacity
						style={[styles.submitButton, { backgroundColor: mainColor }, loading && styles.submitButtonDisabled]}
						onPress={handleSubmit}
						disabled={loading}
					>
						<Text style={styles.submitButtonText}>
							{loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar clienta' : 'Guardar clienta')}
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
		backgroundColor: '#f7f7fbff',
	},
	content: {
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'black',
		marginBottom: 24,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: 'black',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	submitButton: {
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 8,
	},
	submitButtonDisabled: {
		backgroundColor: '#f9a8d4',
	},
	submitButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	cancelButton: {
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 8,
	},
	cancelButtonText: {
		color: 'black',
		fontSize: 16,
	},
});
