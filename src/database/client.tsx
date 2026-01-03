import db from './db';
import Client from '../models/Client';

export const insertClient = (client: { name: string; phone: string }): number => {
	const result = db.runSync('INSERT INTO clients (name, phone) VALUES (?, ?)', [
		client.name,
		client.phone,
	]);
	return result.lastInsertRowId;
};

export const getClients = (): Client[] => {
	const rows = db.getAllSync('SELECT * FROM clients ORDER BY name ASC');
	return rows.map((row) => Client.fromMap(row));
};

export const deleteClient = (clientId: number): void => {
	db.runSync('DELETE FROM clients WHERE id = ?', [clientId]);
	db.runSync('DELETE FROM history WHERE client_id = ?', [clientId]);
}