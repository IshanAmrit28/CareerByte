import api from './api';
import { COMPANY_API_END_POINT } from '../utils/constant';

export const getCompanies = async () => {
    return await api.get(`${COMPANY_API_END_POINT}/get`);
};

export const getCompanyById = async (id) => {
    return await api.get(`${COMPANY_API_END_POINT}/get/${id}`);
};

export const registerCompany = async (data) => {
    return await api.post(`${COMPANY_API_END_POINT}/register`, data);
};

export const updateCompany = async (id, data) => {
    return await api.put(`${COMPANY_API_END_POINT}/update/${id}`, data);
};
