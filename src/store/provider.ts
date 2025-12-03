import { create } from 'zustand'
import {
  getProvidersApi,
  getProviderByIdApi,
  createProviderApi,
  updateProviderApi,
  deleteProviderApi,
} from '@/api/provider'
import type { ProviderState, ProviderFormValues, ProviderQueryParams } from '@/types/provider'

export const useProviderStore = create<ProviderState>((set) => ({
  providers: [],
  currentProvider: null,
  loading: false,
  error: null,

  fetchProviders: async (params?: ProviderQueryParams) => {
    set({ loading: true, error: null })
    try {
      const res = await getProvidersApi(params)
      set({ providers: res.data || [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  fetchProviderById: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const res = await getProviderByIdApi(id)
      set({ currentProvider: res.data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  createProvider: async (data: ProviderFormValues) => {
    set({ loading: true, error: null })
    try {
      await createProviderApi(data)
      set({ loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  updateProvider: async (id: number, data: ProviderFormValues) => {
    set({ loading: true, error: null })
    try {
      await updateProviderApi(id, data)
      set({ loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  deleteProvider: async (id: number) => {
    set({ loading: true, error: null })
    try {
      await deleteProviderApi(id)
      set({ loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  setCurrentProvider: (provider) => set({ currentProvider: provider }),
}))
