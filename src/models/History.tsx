export default class History {
	id: number | null;
	client_id: number;
	description: string | null;
	cost: string | null;
	date: string | null;

	constructor({
		id = null,
		client_id,
		description = null,
		date = null,
		cost = null,
	}: {
		id?: number | null;
		client_id: number;
		description?: string | null;
		date?: string | null;
		cost?: string | null;
	}) {
		this.id = id;
		this.client_id = client_id;
		this.description = description;
		this.date = date;
		this.cost = cost;
	}

	toMap() {
		return {
			id: this.id,
			client_id: this.client_id,
			description: this.description,
			date: this.date,
			cost: this.cost,
		};
	}

	static fromMap(map: any) {
		return new History({
			id: map.id,
			client_id: map.client_id,
			description: map.description,
			date: map.date,
			cost: map.cost,
		});
	}
}
