import apiClient from "@/utils/apiClient";
import type { RealmFormValues, ProviderFormValues } from "@/types/realm";

export interface RealmQueryParams {
  search?: string;
  enabled?: 'all' | 'enabled' | 'disabled';
}

// 获取安全域列表
export const getRealmsApi = async (params?: RealmQueryParams) =>
  apiClient.get<any>({
    url: `/api/realms`,
    params
  });

// 获取单个安全域详情
export const getRealmByIdApi = async (id: string) =>
  apiClient.get<any>({
    url: `/api/realms/${id}`
  });

// 创建新安全域
export const createRealmApi = async (data: RealmFormValues) =>
  apiClient.post<any>({
    url: `/api/realms`,
    data
  });

// 更新安全域
export const updateRealmApi = async (id: string, data: RealmFormValues) =>
  apiClient.put<any>({
    url: `/api/realms/${id}`,
    data
  });

// 删除安全域
export const deleteRealmApi = async (id: string) =>
  apiClient.delete<any>({
    url: `/api/realms/${id}`
  });

// 绑定安全域
export const bindRealmApi = async (realmIds: Array<{ realmId: string }>, entryId: string, level: number) =>
  apiClient.put<any>({
    url: `/api/${level === 3 ? 'entries' : 'endpoints'}/${entryId}/realms/bind`,
    data: realmIds
  });

// 解除绑定
export const unbindRealmApi = async (entryId: string, level: number) =>
  apiClient.delete<any>({
    url: `/api/${level === 3 ? 'entries' : 'endpoints'}/${entryId}/realms/bind`,
  });


// 获取认证提供者列表
export const getProvidersApi = async (search?: string) =>
  apiClient.get<any>({
    url: `/api/providers`,
    params: search ? { search } : undefined
  });

// 创建新认证提供者
export const createProviderApi = async (data: ProviderFormValues) =>
  apiClient.post<any>({
    url: `/api/providers`,
    data
  });

// 测试认证提供者配置
export const testProviderApi = async (data: {
  validUrl: string;
  method?: string;
  strategy: string;
  token: string;
  config: {
    location?: string;
    key?: string;
    prefix?: string;
    postfix?: string;
    uidJsonPath?: string;
  };
}) =>
  apiClient.post<any>({
    url: `/api/providers/test`,
    data
  });
