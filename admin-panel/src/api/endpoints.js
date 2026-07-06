import API from './axiosConfig';

export const endpoints = {
  // 🔐 Authentication Gateways
  auth: {
    login: (data) => API.post('/v1/auth/login', data),
    register: (data) => API.post('/v1/auth/register', data),
    verifyToken: () => API.get('/v1/auth/me'),
  },

  // 🪙 Wallet Operations
  wallet: {
  getSettings: () => API.get('/v1/wallet/get-config'),
  updateSettings: (data) => API.put('/v1/wallet/update-config', data),
  triggerAirdrop: (data) => API.post('/v1/wallet/trigger-airdrop', data),
},

  // 📦 Core E-commerce Entities
  products: {
    getAll: () => API.get('/v1/product/All-product'),
    create: (data) => API.post('/v1/product/create-product', data),
    update: (id, data) => API.put(`/v1/product/update-product/${id}`, data), 
    delete: (id) => API.delete(`/v1/product/delete-product/${id}`, id)
  },
  orders: {
    getAll: () => API.get('/v1/orders/admin/all-orders'),
    updateStatus :(id ,data) => API.put(`/v1/orders/admin/update-status/${id}`,{status:data})
  },
  reviews:{
     getAllReveiews:()=> API.get(`/v1/review/admin/product-reviews`),
     postReview:()=>API.post('/v1/review/add-review')
  },
  users:{
    getAllUsers:()=> API.get(`/v1/userList/admin/users`),
    updateUserStatus:(id,data)=> API.put(`/v1/userList/admin/users/status/${id}`,{status:data})
  }
};