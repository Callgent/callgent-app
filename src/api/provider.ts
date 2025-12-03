import apiClient from "@/utils/apiClient";
import type { ProviderFormValues, ProviderQueryParams } from "@/types/provider";

// 获取 Provider 列表
export const getProvidersApi = async (params?: ProviderQueryParams) =>
  apiClient.get<any>({
    url: `/api/providers`,
    params
  });

// 获取单个 Provider 详情
export const getProviderByIdApi = async (id: number) =>
  apiClient.get<any>({
    url: `/api/providers/${id}`
  });

// 创建 Provider
export const createProviderApi = async (data: ProviderFormValues) =>
  apiClient.post<any>({
    url: `/api/providers`,
    data
  });

// 更新 Provider
export const updateProviderApi = async (id: number, data: ProviderFormValues) =>
  apiClient.put<any>({
    url: `/api/providers/${id}`,
    data
  });

// 删除 Provider
export const deleteProviderApi = async (id: number) =>
  apiClient.delete<any>({
    url: `/api/providers/${id}`
  });
