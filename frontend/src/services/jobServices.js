import api from './api';
import { JOB_API_END_POINT } from '../utils/constant';

export const getAllJobs = async (keyword = '') => {
    const query = keyword ? `?keyword=${keyword}` : '';
    return await api.get(`${JOB_API_END_POINT}/get${query}`);
};

export const getJobById = async (id) => {
    return await api.get(`${JOB_API_END_POINT}/get/${id}`);
};

export const getAdminJobs = async () => {
    return await api.get(`${JOB_API_END_POINT}/getadminjobs`);
};

export const postJob = async (data) => {
    return await api.post(`${JOB_API_END_POINT}/post`, data);
};
