import db from './db';
import History from '../models/History';

export const insertHistory = (history: {
	client_id: number;
	description?: string;
	date?: string;
	cost?: string;
}): number => {
	const result = db.runSync(
		'INSERT INTO history (client_id, description, date, cost) VALUES (?, ?, ?, ?)',
		[
			history.client_id || null,
			history.description || null,
			history.date || null,
			history.cost || null,
		]
	);
	return result.lastInsertRowId;
};

export const getHistoryByClient = (client_id: number): History[] => {
	const rows = db.getAllSync('SELECT * FROM history WHERE client_id = ? ORDER BY date DESC', [client_id]);
	return rows.map((row) => History.fromMap(row));
};

export const deleteHistory = (historyId: number): void => {
	db.runSync('DELETE FROM history WHERE id = ?', [historyId]);
}
