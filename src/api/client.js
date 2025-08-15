import axios from 'axios';

const API_BASE= import.meta.env.VITE_API_BASE_URL 

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // API uses token auth; set true only if server needs cookies
});  

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}


let csrfToken;

export async function ensureCsrf() {
  if (csrfToken) return csrfToken;
    const response= await api.patch('/csrf');
    csrfToken = response.data?.csrfToken || response.headers['x-csrf-token'] || response.data;
        if(csrfToken) {
          api.defaults.headers.common['X-CSRF-Token'] = csrfToken;
        }
    
    return csrfToken;

  }
  
  export async function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    else {
        delete api.defaults.headers.common.Authorization;
    }
}
export const authApi= {
    register: (payload) => api.post('/auth/register', payload),
token: (payload) => api.post('/auth/token', payload)};

export const userApi = {
    getAll:(params)=> api.get('/users', {params}),
    getOne: (id) => api.get(`/users/${id}`),
    updateMe: async (payload) => {
        await ensureCsrf();
        return api.put('/user', payload);
    },
    deleteUser: async (id) => {
        await ensureCsrf();
        return api.delete(`/users/${id}`);
    },

};
export const msgApi = {
    list:(params) => api.get('/messages', {params}),
    create: async (payload) => {
        await ensureCsrf();
        return api.post('/messages', payload);
    },
    remove: async (msgId) => {
        await ensureCsrf();
        return api.delete(`/messages/${msgId}`);
    },
};
export default api;