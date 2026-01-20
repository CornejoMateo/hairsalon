import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDB } from './db';

type DatabaseContextType = {
	db: SQLite.SQLiteDatabase | null;
	isReady: boolean;
};

const DatabaseContext = createContext<DatabaseContextType>({
	db: null,
	isReady: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
	const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		try {
			const database = SQLite.openDatabaseSync('hairsalon.db');
			initDB(database);
			setDb(database);
			setIsReady(true);
		} catch (error) {
			console.error('Error al inicializar la base de datos:', error);
		}
	}, []);

	return <DatabaseContext.Provider value={{ db, isReady }}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
	return useContext(DatabaseContext);
}
