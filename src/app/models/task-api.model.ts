export type TaskApiCategory = 'feina' | 'estudis' | 'casa' | 'salut' | 'personal';

export type TaskApiStatus = 'pendent' | 'en_curs' | 'completada';

export interface TaskApiResponse {
  id: string;
  titol: string;
  descripcio?: string;
  categoria: string;
  data_limit: string;
  estat: string;
  hores_estimades: string;
  destacada?: boolean;
}

export type TaskApiRequest = Omit<TaskApiResponse, 'id'>;
