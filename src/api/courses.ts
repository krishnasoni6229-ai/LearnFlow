import { apiClient } from './client';
import {
  ApiResponse,
  PaginatedResponse,
  RawProduct,
  RawUser,
} from '../types/course';

export const coursesApi = {
  getProducts: async (page = 1, limit = 10): Promise<PaginatedResponse<RawProduct>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RawProduct>>>(
      `/api/v1/public/randomproducts?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<RawUser>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RawUser>>>(
      `/api/v1/public/randomusers?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },
};
