export default class Company {
	id: number | null;
	nameCompany: string | null;
	mainColor: string | null;
    logoUrl: string | null;

	constructor({
		id = null,
		nameCompany = null,
		mainColor = null,
        logoUrl = null
	}: {
		id?: number | null;
		nameCompany?: string | null;
		mainColor?: string | null;
        logoUrl?: string | null;
	}) {
		this.id = id;
		this.nameCompany = nameCompany;
        this.mainColor = mainColor;
        this.logoUrl = logoUrl;
    }

	// convert attrs to object
	toMap() {
		return {
			id: this.id,
			nameCompany: this.nameCompany,
            mainColor: this.mainColor,
            logoUrl: this.logoUrl
		};
	}

	static fromMap(map: any) {
		return new Company({
			id: map.id,
			nameCompany: map.nameCompany,
            mainColor: map.mainColor,
            logoUrl: map.logoUrl,
		});
	}
}
