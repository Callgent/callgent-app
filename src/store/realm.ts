import { create } from 'zustand'
import {
  getRealmsApi,
  getRealmByIdApi,
  createRealmApi,
  updateRealmApi,
  deleteRealmApi,
  getProvidersApi,
  createProviderApi,
  type RealmQueryParams
} from '@/api/realm'
import type { RealmState, RealmFormValues, ProviderFormValues } from '@/types/realm'

export const useRealmStore = create<RealmState>((set) => ({
  realms: [],
  providers: [],
  currentRealm: null,
  currentProvider: null,
  loading: false,
  error: null,

  fetchRealms: async (params?: RealmQueryParams) => {
    set({ loading: true, error: null })
    try {
      const res = await getRealmsApi(params)
      set({ realms: res.data || [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  fetchProviders: async (search?: string) => {
    set({ loading: true, error: null })
    try {
      const res = await getProvidersApi(search)
      set({ providers: res.data || [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  fetchRealmById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const res = await getRealmByIdApi(id)
      set({ currentRealm: res.data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  createRealm: async (data: RealmFormValues) => {
    set({ loading: true, error: null })
    try {
      await createRealmApi(data)
      set({ loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  updateRealm: async (id: string, data: RealmFormValues) => {
    set({ loading: true, error: null })
    try {
      await updateRealmApi(id, data)
      set({ loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  deleteRealm: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await deleteRealmApi(id)
      set({ loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
      throw e
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

  setCurrentRealm: (realm) => set({ currentRealm: realm }),
}))
