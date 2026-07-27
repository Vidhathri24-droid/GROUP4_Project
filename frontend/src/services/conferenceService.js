import axios from "axios";

const API = "http://127.0.0.1:8000/conferences";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const getConferences = async () => {
  const res = await axios.get(API, {
    headers: headers(),
  });
  return res.data;
};

export const getConference = async (id) => {
  const res = await axios.get(`${API}/${id}`, {
    headers: headers(),
  });
  return res.data;
};

export const createConference = async (data) => {
  const res = await axios.post(API, data, {
    headers: headers(),
  });
  return res.data;
};

export const updateConference = async (id, data) => {
  const res = await axios.put(`${API}/${id}`, data, {
    headers: headers(),
  });
  return res.data;
};

export const deleteConference = async (id) => {
  const res = await axios.delete(`${API}/${id}`, {
    headers: headers(),
  });
  return res.data;
};

export const joinConference = async (conferenceId) => {
  const res = await axios.post(
    `${API}/${conferenceId}/join`,
    {},
    {
      headers: headers(),
    }
  );

  return res.data;
};
