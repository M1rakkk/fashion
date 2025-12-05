export interface Store {
  id: number;
  name: string;
  description?: string;
}

export interface ShopsState {
  items: Store[];
  loading: boolean;
  error: string | null;
}
