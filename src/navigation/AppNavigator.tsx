export type RootStackParamList = {
	Home: undefined;
	ClientList: undefined;
	AddClient: { clientId?: number; clientName?: string | null; clientPhone?: string | null } | undefined;
	HistoryClient: { clientId: number; clientName: string };
	AddHistory: { clientId: number; clientName: string; historyId?: number; description?: string | null; cost?: string | null; date?: string | null };
	Backup: undefined;
};
