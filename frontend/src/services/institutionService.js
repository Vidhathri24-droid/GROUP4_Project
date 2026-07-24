import axios from "axios";

const API = "http://127.0.0.1:8000/institutions";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const getInstitutions = async () => {
  const res = await axios.get(API, {
    headers: headers(),
  });

  return res.data;
};

export const getInstitution = async (id) => {
  const res = await axios.get(`${API}/${id}`, {
    headers: headers(),
  });

  return res.data;
};

export const createInstitution = async (data) => {
  const res = await axios.post(API, data, {
    headers: headers(),
  });

  return res.data;
};

export const updateInstitution = async (id, data) => {
  const res = await axios.put(`${API}/${id}`, data, {
    headers: headers(),
  });

  return res.data;
};

export const deleteInstitution = async (id) => {
  const res = await axios.delete(`${API}/${id}`, {
    headers: headers(),
  });

  return res.data;
};
