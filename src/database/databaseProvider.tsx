import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import db, { initDB } from './db';
import { main } from '../../constans/colors';

type DatabaseContextType = {
	db: SQLite.SQLiteDatabase | null;
	isReady: boolean;
};

const DatabaseContext = createContext<DatabaseContextType>({
	db: null,
	isReady: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		try {
			initDB(db);
			setIsReady(true);
		} catch (error) {
			console.error('Error al inicializar la base de datos:', error);
			Alert.alert('Error', 'No se pudo inicializar la base de datos. Por favor, reinicia la aplicación.');
		}
	}, []);

	if (!isReady) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={main} />
				<Text style={styles.loadingText}>Cargando...</Text>
			</View>
		);
	}

	return <DatabaseContext.Provider value={{ db, isReady }}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
	return useContext(DatabaseContext);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#666',
	},
});
