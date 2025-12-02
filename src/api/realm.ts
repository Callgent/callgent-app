import apiClient from "@/utils/apiClient";
import type { RealmFormValues, ProviderFormValues } from "@/types/realm";

export interface RealmQueryParams {
  search?: string;
  enabled?: 'all' | 'enabled' | 'disabled';
}

/** GET /api/realms */
export const getRealmsApi = async (params?: RealmQueryParams) =>
  apiClient.get<any>({
    url: `/api/realms`,
    params
  });

/** GET /api/realms/:id */
export const getRealmByIdApi = async (id: string) =>
  apiClient.get<any>({
    url: `/api/realms/${id}`
  });

/** POST /api/realms */
export const createRealmApi = async (data: RealmFormValues) =>
  apiClient.post<any>({
    url: `/api/realms`,
    data
  });

/** PUT /api/realms/:id */
export const updateRealmApi = async (id: string, data: RealmFormValues) =>
  apiClient.put<any>({
    url: `/api/realms/${id}`,
    data
  });

/** DELETE /api/realms/:id */
export const deleteRealmApi = async (id: string) =>
  apiClient.delete<any>({
    url: `/api/realms/${id}`
  });

/** GET /api/providers */
export const getProvidersApi = async (search?: string) =>
  apiClient.get<any>({
    url: `/api/providers`,
    params: search ? { search } : undefined
  });

/** POST /api/providers */
export const createProviderApi = async (data: ProviderFormValues) =>
  apiClient.post<any>({
    url: `/api/providers`,
    data
  });


/** POST /api/providers/test - 测试 Provider 配置 */
export const testProviderApi = async (data: {
  validUrl: string;
  method: 'GET' | 'POST';
  attachType: string;
  token: string;
  config: {
    location?: string;
    key?: string;
    prefix?: string;
    postfix?: string;
    uidExpl?: string;
  };
}) =>
  apiClient.post<any>({
    url: `/api/providers/test`,
    data
  });
