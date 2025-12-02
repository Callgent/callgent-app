export interface Provider {
  id: number;
  name: string;
  method: string;
  attachType: string;
}

export interface Realm {
  pk: number;
  id: string;
  name: string;
  desc: string;
  enabled: boolean;
  shared: boolean;
  providerId: number;
  principalPk?: number;
  updatedAt: string;
}
