/** Zustand store for realms and providers */
import { create } from "zustand";
import { getRealmApi, getRealmDetailApi } from "@/api/callgent-auth";
import type { Realm, Provider } from "@/components/callgent-auth/types";

interface AuthRealmStore {
  realms: Realm[];
  providers: Provider[];
  selectedRealm: Realm | null;

  fetchRealms: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  selectRealm: (realm: Realm | null) => void;
}

export const useAuthRealmStore = create<AuthRealmStore>((set) => ({
  realms: [],
  providers: [],
  selectedRealm: null,

  /** load realms from API */
  fetchRealms: async () => {
    const { data } = await getRealmApi();
    set({ realms: data });
  },

  /** load providers from API */
  fetchProviders: async () => {
    const res = await getRealmDetailApi();
    set({ providers: res.data });
  },

  /** set selected realm */
  selectRealm: (realm) => set({ selectedRealm: realm }),
}));
