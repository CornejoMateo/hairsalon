import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { main } from '../../constans/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeProps {
	navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeProps) {
	return (
		<SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
			<StatusBar barStyle="light-content" backgroundColor={main} />

			<View style={styles.content}>
				<Text style={styles.sectionTitle}>Secciones</Text>
				<TouchableOpacity
					style={styles.mainButton}
					onPress={() => navigation.navigate('ClientList')}
					activeOpacity={0.8}
				>
					<View style={styles.buttonContent}>
						<View style={styles.buttonIcon}>
							<Text style={styles.buttonIconText}>👥</Text>
						</View>
						<View style={styles.buttonTextContainer}>
							<Text style={styles.buttonTitle}>Mis clientas</Text>
							<Text style={styles.buttonSubtitle}>Ver y gestionar todas tus clientas</Text>
						</View>
						<Text style={styles.chevron}>›</Text>
					</View>
				</TouchableOpacity>

				<View style={styles.bottomRightContainer}>
					<TouchableOpacity
						style={styles.backupButton}
						onPress={() => navigation.navigate('Backup')}
						activeOpacity={0.8}
					>
						<View style={styles.backupContent}>
							<Text style={styles.backupIcon}>💾</Text>
							<Text style={styles.backupText}>Backup</Text>
						</View>
					</TouchableOpacity>
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
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#1E293B',
		marginBottom: 16,
	},
	mainButton: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: 20,
		marginBottom: 24,
		shadowColor: main,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
		borderWidth: 2,
		borderColor: main,
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
	bottomRightContainer: {
		position: 'absolute',
		bottom: 20,
		right: 20,
	},
	backupButton: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		shadowColor: main,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
		borderWidth: 2,
		borderColor: main,
		minWidth: 100,
	},
	backupContent: {
		alignItems: 'center',
		gap: 4,
	},
	backupIcon: {
		fontSize: 32,
	},
	backupText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#1E293B',
	},
});
