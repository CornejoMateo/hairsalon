import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Alert,
	StatusBar,
	ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { main } from '../../constans/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import db from '../database/db';

type BackupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Backup'>;

interface BackupProps {
	navigation: BackupScreenNavigationProp;
}

export default function BackupScreen({ navigation }: BackupProps) {
	const [loading, setLoading] = useState(false);

	const convertToCSV = (data: any[], headers: string[]): string => {
		if (data.length === 0) {
			return headers.join(',') + '\n';
		}

		const rows = data.map((item) => {
			return headers
				.map((header) => {
					const value = item[header];

					if (value === null || value === undefined) return '';
					const stringValue = String(value);
					if (
						stringValue.includes(',') ||
						stringValue.includes('"') ||
						stringValue.includes('\n')
					) {
						return '"' + stringValue.replace(/"/g, '""') + '"';
					}
					return stringValue;
				})
				.join(',');
		});

		return headers.join(',') + '\n' + rows.join('\n');
	};

	const handleBackup = async () => {
		try {
			setLoading(true);

			// get all clients
			const clientsResult = db.getAllSync('SELECT * FROM clients ORDER BY id');
			const clientsCSV = convertToCSV(clientsResult, ['id', 'name', 'phone']);

			// get all works
			const historyResult = db.getAllSync('SELECT * FROM history ORDER BY id');
			const historyCSV = convertToCSV(historyResult, [
				'id',
				'client_id',
				'description',
				'cost',
				'date',
			]);

			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
			const clientsFileName = `peluqueria_clientas_backup_${timestamp}.csv`;
			const historyFileName = `peluqueria_trabajos_backup_${timestamp}.csv`;

			const clientsFile = new File(Paths.cache, clientsFileName);
			const historyFile = new File(Paths.cache, historyFileName);

			await clientsFile.write(clientsCSV);
			await historyFile.write(historyCSV);

			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(clientsFile.uri);
				await new Promise(resolve => setTimeout(resolve, 1000));
				await Sharing.shareAsync(historyFile.uri);
			} else {
				Alert.alert('Backup creado', 'Los archivos CSV han sido guardados.');
			}
		} catch (error) {
			console.error('Error al crear backup:', error);
			Alert.alert('Error', 'No se pudo crear el backup: ' + error);
		} finally {
			setLoading(false);
		}
	};

	const parseCSV = (csvContent: string): any[] => {
		const lines = csvContent.split('\n').filter((line) => line.trim() !== '');
		if (lines.length === 0) return [];

		const headers = lines[0].split(',').map((h) => h.trim());
		const data: any[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values: string[] = [];
			let currentValue = '';
			let insideQuotes = false;

			for (let j = 0; j < lines[i].length; j++) {
				const char = lines[i][j];

				if (char === '"') {
					insideQuotes = !insideQuotes;
				} else if (char === ',' && !insideQuotes) {
					values.push(currentValue.replace(/""/g, '"'));
					currentValue = '';
				} else {
					currentValue += char;
				}
			}
			values.push(currentValue.replace(/""/g, '"'));

			const row: any = {};
			headers.forEach((header, index) => {
				const value = values[index] || '';
				row[header] = value === '' ? null : value;
			});
			data.push(row);
		}

		return data;
	};

	const handleRestore = async () => {
		try {
			setLoading(true);

			// Seleccionar archivo de clientas
			const resultClients = await DocumentPicker.getDocumentAsync({
				type: 'text/comma-separated-values',
				copyToCacheDirectory: true,
			});

			if (resultClients.canceled) {
				setLoading(false);
				return;
			}

			// Seleccionar archivo de historial
			const resultHistory = await DocumentPicker.getDocumentAsync({
				type: 'text/comma-separated-values',
				copyToCacheDirectory: true,
			});

			if (resultHistory.canceled) {
				setLoading(false);
				return;
			}

			// Restaurar clientas
			const fileClients = new File(resultClients.assets[0].uri);
			const fileContentClients = await fileClients.text();
			const clients = parseCSV(fileContentClients);

			let upsertedClients = 0;
			for (const clientData of clients) {
				try {
					db.runSync(
						'INSERT OR REPLACE INTO clients (id, name, phone) VALUES (?, ?, ?)',
						[clientData.id, clientData.name, clientData.phone]
					);
					upsertedClients++;
				} catch (err) {
					console.error('Error al insertar/actualizar clienta:', err);
				}
			}

			// Restaurar historial
			const fileHistory = new File(resultHistory.assets[0].uri);
			const fileContentHistory = await fileHistory.text();
			const historyRecords = parseCSV(fileContentHistory);

			let upsertedHistory = 0;
			for (const historyData of historyRecords) {
				try {
					db.runSync(
						'INSERT OR REPLACE INTO history (id, client_id, description, cost, date) VALUES (?, ?, ?, ?, ?)',
						[historyData.id, historyData.client_id, historyData.description, historyData.cost, historyData.date]
					);
					upsertedHistory++;
				} catch (err) {
					console.error('Error al insertar/actualizar historial:', err);
				}
			}

			Alert.alert(
				'Éxito',
				`Se han restaurado:\n${upsertedClients} clientas\n${upsertedHistory} registros de historial`
			);
		} catch (error) {
			console.error('Error al restaurar:', error);
			Alert.alert('Error', 'No se pudo restaurar los datos: ' + error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
			<StatusBar barStyle="light-content" backgroundColor={main} />

			<View style={styles.content}>
				<Text style={styles.title}>Gestión de backups</Text>
				<Text style={styles.subtitle}>
					Guarda tus datos de forma segura o restaura información desde archivos CSV
				</Text>

				{loading && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={main} />
						<Text style={styles.loadingText}>Procesando...</Text>
					</View>
				)}

				<TouchableOpacity
					style={[styles.actionButton, styles.backupButtonStyle]}
					onPress={handleBackup}
					activeOpacity={0.8}
					disabled={loading}
				>
					<View style={styles.buttonContent}>
						<View style={styles.buttonIcon}>
							<Text style={styles.buttonIconText}>💾</Text>
						</View>
						<View style={styles.buttonTextContainer}>
							<Text style={styles.buttonTitle}>Hacer backup</Text>
							<Text style={styles.buttonSubtitle}>Exporta tus datos como archivos CSV</Text>
						</View>
						<Text style={styles.chevron}>›</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.actionButton, styles.restoreButtonStyle]}
					onPress={handleRestore}
					activeOpacity={0.8}
					disabled={loading}
				>
					<View style={styles.buttonContent}>
						<View style={styles.buttonIcon}>
							<Text style={styles.buttonIconText}>📂</Text>
						</View>
						<View style={styles.buttonTextContainer}>
							<Text style={styles.buttonTitle}>Restaurar datos</Text>
							<Text style={styles.buttonSubtitle}>Importa datos desde archivos CSV</Text>
						</View>
						<Text style={styles.chevron}>›</Text>
					</View>
				</TouchableOpacity>

				<View style={styles.infoBox}>
					<Text style={styles.infoTitle}>ℹ️ Información</Text>
					<Text style={styles.infoText}>
					• El backup exporta ambas tablas (clientas y trabajos) juntas{'\n'}
					• Al restaurar, debes seleccionar primero el archivo de clientas y luego el de trabajos{'\n'}
					• Los datos se actualizan o insertan según el ID del backup{'\n'}
					• Esto mantiene la integridad entre clientas y sus historiales
					</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FF',
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#1E293B',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 15,
		color: '#64748B',
		marginBottom: 32,
		lineHeight: 22,
	},
	loadingContainer: {
		alignItems: 'center',
		marginVertical: 20,
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: '#64748B',
	},
	actionButton: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: 20,
		marginBottom: 16,
		shadowColor: main,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
	},
	backupButtonStyle: {
		borderWidth: 2,
		borderColor: main,
	},
	restoreButtonStyle: {
		borderWidth: 2,
		borderColor: '#10B981',
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	buttonIcon: {
		width: 56,
		height: 56,
		borderRadius: 16,
		backgroundColor: '#EEF2FF',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	buttonIconText: {
		fontSize: 28,
	},
	buttonTextContainer: {
		flex: 1,
	},
	buttonTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1E293B',
		marginBottom: 4,
	},
	buttonSubtitle: {
		fontSize: 13,
		color: '#64748B',
		fontWeight: '500',
	},
	chevron: {
		fontSize: 32,
		color: '#6366F1',
		fontWeight: '300',
	},
	infoBox: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 20,
		marginTop: 24,
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	infoTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1E293B',
		marginBottom: 12,
	},
	infoText: {
		fontSize: 14,
		color: '#64748B',
		lineHeight: 22,
	},
});
