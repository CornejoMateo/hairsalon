export default class Client {
	id: number | null;
	name: string | null;
	phone: string | null;

	constructor({
		id = null,
		name = null,
		phone = null,
	}: {
		id?: number | null;
		name?: string | null;
		phone?: string | null;
	}) {
		this.id = id;
		this.name = name;
		this.phone = phone;
	}

	// convert attrs to object
	toMap() {
		return {
			id: this.id,
			name: this.name,
			phone: this.phone,
		};
	}

	// create Client from object
	static fromMap(map: any) {
		return new Client({
			id: map.id,
			name: map.name,
			phone: map.phone,
		});
	}
}
