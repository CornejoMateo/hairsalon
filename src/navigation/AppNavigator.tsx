export type RootStackParamList = {
	Home: undefined;
	ClientList: undefined;
	AddClient: undefined;
	HistoryClient: { clientId: number; clientName: string };
	AddHistory: { clientId: number; clientName: string };
	Backup: undefined;
};
