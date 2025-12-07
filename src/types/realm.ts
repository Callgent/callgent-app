import type { RealmQueryParams } from '@/api/realm'

export type PrincipalStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REFRESHING'

/** Provider shared: false=self, null=tenant, true=global */
export type ProviderShareType = boolean | null

/** Realm shared: false=self, true=tenant */
export type RealmShareType = boolean

export type TokenFormat = 'jwt' | 'apiKey' | 'basic' | 'oauth2'

export type TokenLocation = 'headers' | 'query' | 'body' | 'cookie' | 'cert'

/** Provider strategy for token processing */
export type ProviderStrategy = 'STATIC' | 'DYNAMIC' | 'REFRESHABLE' | 'ROTATING' | 'CUSTOM' | 'NONE'

export interface ProviderConfig {
  /** token location in request */
  location: TokenLocation
  /** token key */
  key?: string
  /** value prefix */
  prefix?: string
  /** value postfix */
  postfix?: string
  /** token format, e.g. 'jwt', etc */
  tokenFormat?: string
  /** token algorithm name */
  algorithm?: string
  /** algorithm params e.g. region, hashAlgorithm */
  algorithmParams?: Record<string, any>
  /** expression to extract uid from validation response */
  uidJsonPath?: string
}

export interface ProviderItem {
  id: number
  name: string
  desc?: string
  /** validation http method, default GET */
  method?: string
  /** token validation url */
  validUrl: string
  /** provider configs except credentials/secrets */
  config: ProviderConfig
  /** strategy name about how token is processed */
  strategy: ProviderStrategy
  /** false: self; null: tenant; true: global */
  shared?: ProviderShareType
  enabled: boolean
  tenantPk_?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: number
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
  pk?: number
  id: string
  name: string
  desc?: string
  enabled: boolean
  /** false: self; true: tenant */
  shared: RealmShareType
  providerId: number
  provider?: ProviderItem
  principalPk?: number
  principal?: PrincipalItem | null
  pricing?: any
  tenantPk_?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: number | bigint
}

export interface RealmFormValues {
  id?: string
  name: string
  desc?: string
  enabled?: boolean
  /** false: self; true: tenant */
  shared?: RealmShareType
  providerId: number
}

export interface ProviderFormValues {
  name: string
  desc?: string
  method?: string
  validUrl: string
  config: ProviderConfig
  strategy: ProviderStrategy
  /** false: self; null: tenant; true: global */
  shared?: ProviderShareType
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
