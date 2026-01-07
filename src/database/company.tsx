import db from './db';
import Company from '../models/Company';


export const insertCompany = (company: { nameCompany: string; mainColor: string; logoUrl: string }): number => {
	const result = db.runSync(
		'INSERT INTO company (nameCompany, mainColor, logoUrl) VALUES (?, ?, ?)',
		[company.nameCompany, company.mainColor, company.logoUrl]
	);
	return result.lastInsertRowId;
};

export const getCompanies = (): Company[] => {
	const rows = db.getAllSync('SELECT * FROM company ORDER BY id ASC');
	return rows.map((row) => Company.fromMap(row));
};

export const getCompanyById = (id: number): Company | null => {
	const row = db.getFirstSync('SELECT * FROM company WHERE id = ?', [id]);
	if (row) {
		return Company.fromMap(row);
	}
	return null;
}
