import type { ProviderItem, ProviderFormValues, ProviderShareType, ProviderStrategy, ProviderConfig } from './realm'

export type { ProviderItem, ProviderFormValues, ProviderShareType, ProviderStrategy, ProviderConfig }

export interface ProviderQueryParams {
  search?: string
  enabled?: 'all' | 'enabled' | 'disabled'
}

export interface ProviderState {
  providers: ProviderItem[]
  currentProvider: ProviderItem | null
  loading: boolean
  error: string | null
  fetchProviders: (params?: ProviderQueryParams) => Promise<void>
  fetchProviderById: (id: number) => Promise<void>
  createProvider: (data: ProviderFormValues) => Promise<void>
  updateProvider: (id: number, data: ProviderFormValues) => Promise<void>
  deleteProvider: (id: number) => Promise<void>
  setCurrentProvider: (provider: ProviderItem | null) => void
}
