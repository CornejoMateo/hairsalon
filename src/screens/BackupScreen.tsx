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
	const [infoPage, setInfoPage] = useState(1);

	const handleBackup = async () => {
		try {
			setLoading(true);

			const clients = db.getAllSync(
				'SELECT id, name, phone FROM clients ORDER BY id'
			);

			const history = db.getAllSync(
				'SELECT id, client_id, description, cost, date FROM history ORDER BY id'
			);

			const backupData = {
				app: 'PeluqueriaApp',
				version: 1,
				createdAt: new Date().toISOString(),
				clients,
				history,
			};

			const timestamp = new Date()
				.toISOString()
				.replace(/[:.]/g, '-')
				.slice(0, -5);

			const fileName = `peluqueria_backup_${timestamp}.json`;
			const file = new File(Paths.cache, fileName);

			await file.write(JSON.stringify(backupData, null, 2));

			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(file.uri);
			} else {
				Alert.alert('Backup creado', 'El archivo fue guardado.');
			}
		} catch (error) {
			console.error('Error al crear backup:', error);
			Alert.alert('Error', 'No se pudo crear el backup');
		} finally {
			setLoading(false);
		}
	};

	const handleRestore = async () => {
		try {
			setLoading(true);

			const result = await DocumentPicker.getDocumentAsync({
				type: 'application/json',
				copyToCacheDirectory: true,
			});

			if (result.canceled) {
				setLoading(false);
				return;
			}

			const file = new File(result.assets[0].uri);
			const content = await file.text();
			const backup = JSON.parse(content);

			if (!backup.clients || !backup.history) {
				throw new Error('Archivo de backup inválido');
			}

			let upsertedClients = 0;
			for (const client of backup.clients) {
				db.runSync(
					'INSERT OR REPLACE INTO clients (id, name, phone) VALUES (?, ?, ?)',
					[client.id, client.name, client.phone]
				);
				upsertedClients++;
			}

			let upsertedHistory = 0;
			for (const record of backup.history) {
				db.runSync(
					'INSERT OR REPLACE INTO history (id, client_id, description, cost, date) VALUES (?, ?, ?, ?, ?)',
					[
						record.id,
						record.client_id,
						record.description,
						record.cost, 
						record.date,
					]
				);
				upsertedHistory++;
			}

			Alert.alert(
				'Éxito',
				`Se restauraron:\n${upsertedClients} clientas\n${upsertedHistory} trabajos`
			);
		} catch (error) {
			console.error('Error al restaurar:', error);
			Alert.alert('Error', 'No se pudo restaurar el backup');
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
					Guarda tus datos de forma segura o restaura información desde archivos JSON
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
							<Text style={styles.buttonSubtitle}>Exporta tus datos como archivos JSON</Text>
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
							<Text style={styles.buttonSubtitle}>Importa datos desde archivos JSON</Text>
						</View>
						<Text style={styles.chevronRestore}>›</Text>
					</View>
				</TouchableOpacity>

				<View style={styles.infoBox}>
					<Text style={styles.infoTitle}>ℹ️ Información {infoPage}/2</Text>
					
					{infoPage === 1 ? (
						<Text style={styles.infoText}>
						• El backup exporta ambas tablas (clientas y trabajos) juntas en un mismo archivo{'\n'}
						• Al restaurar, debes seleccionar el archivo JSON que contiene ambos datos{'\n'}
						• Los datos se actualizan o insertan según el ID del backup
						</Text>
					) : (
						<Text style={styles.infoText}>
						• Esto mantiene la integridad entre clientas y sus historiales{'\n'}
						• IMPORTANTE: la base de datos debe estar vacía para restaurar correctamente. De lo contrario se pueden generar conflictos o datos duplicados
						</Text>
					)}

					<View style={styles.paginationContainer}>
						<TouchableOpacity
							style={[styles.pageButton, infoPage === 1 && styles.pageButtonDisabled]}
							onPress={() => setInfoPage(1)}
							disabled={infoPage === 1}
						>
							<Text style={[styles.pageButtonText, infoPage === 1 && styles.pageButtonTextActive]}>1</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.pageButton, infoPage === 2 && styles.pageButtonDisabled]}
							onPress={() => setInfoPage(2)}
							disabled={infoPage === 2}
						>
							<Text style={[styles.pageButtonText, infoPage === 2 && styles.pageButtonTextActive]}>2</Text>
						</TouchableOpacity>
					</View>
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
		color: main,
		fontWeight: '300',
	},
	chevronRestore: {
		fontSize: 32,
		color: '#10B981',
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
	paginationContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 16,
		gap: 12,
	},
	pageButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#E2E8F0',
		justifyContent: 'center',
		alignItems: 'center',
	},
	pageButtonDisabled: {
		backgroundColor: main,
	},
	pageButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#64748B',
	},
	pageButtonTextActive: {
		color: '#FFFFFF',
	},
});
