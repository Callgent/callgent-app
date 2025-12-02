import type { RealmQueryParams } from '@/api/realm'

export type PrincipalStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REFRESHING'

export type ShareType = 'private' | 'tenant' | 'global'

export type TokenFormat = 'jwt' | 'apiKey' | 'basic' | 'oauth2'

export interface ProviderConfig {
  location?: 'headers' | 'query' | 'body' | 'cookie' | 'cert'
  key?: string
  prefix?: string
  postfix?: string
  tokenFormat?: TokenFormat
  algorithm?: string
  algorithmParams?: Record<string, any>
  uidExpl?: string
}

export interface ProviderItem {
  id: number
  name: string
  desc?: string
  method: 'GET' | 'POST'
  validUrl: string
  attachType: 'BEARER' | 'BASIC' | 'CUSTOM'
  config: ProviderConfig
  shared: ShareType
  enabled: boolean
  tenantPk_: number
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt: number
}

export interface PrincipalItem {
  pk: number
  userId: string
  providerId: number
  name: string
  token: any
  status?: PrincipalStatus
  metadata?: any
  usedAt?: string
  expiresAt?: string
  validatedAt?: string
  refreshedAt?: string
  createdAt: string
  updatedAt: string
  deletedAt: number | bigint
}

export interface RealmItem {
  pk: number
  id: string
  name: string
  desc?: string
  enabled: boolean
  shared: ShareType
  providerId: number
  provider?: ProviderItem
  principalPk?: number
  principal?: PrincipalItem | null
  pricing?: any
  tenantPk_?: number
  createdBy?: string
  createdAt: string
  updatedAt: string
  deletedAt: number | bigint
}

export interface RealmFormValues {
  id?: string
  name: string
  desc?: string
  enabled?: boolean
  shared?: ShareType
  providerId: number
}

export interface ProviderFormValues {
  name: string
  desc?: string
  method: 'GET' | 'POST'
  validUrl: string
  attachType: 'BEARER' | 'BASIC' | 'CUSTOM'
  config: ProviderConfig
  shared?: ShareType
  enabled?: boolean
}

export interface RealmState {
  realms: RealmItem[]
  providers: ProviderItem[]
  currentRealm: RealmItem | null
  currentProvider: ProviderItem | null
  loading: boolean
  error: string | null
  fetchRealms: (params?: RealmQueryParams) => Promise<void>
  fetchProviders: (search?: string) => Promise<void>
  fetchRealmById: (id: string) => Promise<void>
  createRealm: (data: RealmFormValues) => Promise<void>
  updateRealm: (id: string, data: RealmFormValues) => Promise<void>
  deleteRealm: (id: string) => Promise<void>
  createProvider: (data: ProviderFormValues) => Promise<void>
  setCurrentRealm: (realm: RealmItem | null) => void
}
