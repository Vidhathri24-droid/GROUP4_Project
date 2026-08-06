import api from "../api/api";

// Get all conferences
export const getConferences = async () => {
    const response = await api.get("/conferences");
    return response.data;
};

// Get one conference
export const getConference = async (id) => {
    const response = await api.get(`/conferences/${id}`);
    return response.data;
};

// Create conference
export const createConference = async (data) => {
    const response = await api.post("/conferences", data);
    return response.data;
};

// Update conference
export const updateConference = async (id, data) => {
    const response = await api.put(`/conferences/${id}`, data);
    return response.data;
};

// Delete conference
export const deleteConference = async (id) => {
    const response = await api.delete(`/conferences/${id}`);
    return response.data;
};

// Joined conferences
export const getJoinedConferences = async () => {
    const response = await api.get("/conferences/joined");
    return response.data;
};

// Upcoming
export const getUpcomingConferences = async (sort = "latest") => {
    const response = await api.get(`/conferences/upcoming?sort=${sort}`);
    return response.data;
};

// Past
export const getPastConferences = async (sort = "latest") => {
    const response = await api.get(`/conferences/past?sort=${sort}`);
    return response.data;
};

export const joinConference = async (conferenceId, researcherId) => {
  const response = await api.post(
    `/conferences/${conferenceId}/join/${researcherId}`
  );
  return response.data;
};

export const leaveConference = async (conferenceId, researcherId) => {
  const response = await api.post(
    `/conferences/${conferenceId}/leave/${researcherId}`
  );
  return response.data;
};
