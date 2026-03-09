import api from './api';
import { APPLICATION_API_END_POINT } from '../utils/constant';

export const applyJob = async (id) => {
    return await api.get(`${APPLICATION_API_END_POINT}/apply/${id}`);
};

export const getAppliedJobs = async () => {
    return await api.get(`${APPLICATION_API_END_POINT}/get`);
};

export const getApplicants = async (id) => {
    return await api.get(`${APPLICATION_API_END_POINT}/${id}/applicants`);
};

export const updateStatus = async (id, status) => {
    return await api.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
};
