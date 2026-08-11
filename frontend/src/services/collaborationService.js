import api from "../api/api";

// ============================================================
// COLLABORATION NETWORK
// ============================================================

export const getCollaborationNetwork = async (scope = "all") => {
  const response = await api.get(
    `/collaborations/network?scope=${scope}`
  );

  return response.data;
};

export const downloadCollaborationCSV = async (scope = "all") => {
  const response = await api.get(
    `/collaborations/network/export?scope=${scope}`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "text/csv",
    })
  );

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute(
    "download",
    "research_collaborations.csv"
  );

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

// ============================================================
// SEND COLLABORATION REQUEST
// ============================================================

export const sendCollaborationRequest = async (data) => {
  const response = await api.post(
    "/collaborations/request",
    data
  );

  return response.data;
};

// ============================================================
// REQUEST LISTS
// ============================================================

export const getSentCollaborationRequests = async () => {
  const response = await api.get(
    "/collaborations/requests/sent"
  );

  return response.data;
};

export const getReceivedCollaborationRequests = async () => {
  const response = await api.get(
    "/collaborations/requests/received"
  );

  return response.data;
};

export const getAcceptedCollaborations = async () => {
  const response = await api.get(
    "/collaborations/requests/accepted"
  );

  return response.data;
};

// ============================================================
// ACCEPT
// ============================================================

export const acceptCollaboration = async (id) => {
  const response = await api.put(
    `/collaborations/${id}/accept`
  );

  return response.data;
};

// ============================================================
// REJECT
// ============================================================

export const rejectCollaboration = async (id) => {
  const response = await api.put(
    `/collaborations/${id}/reject`
  );

  return response.data;
};

export const searchResearchers = async (query) => {
  const response = await api.get(
    `/collaborations/researchers/search?q=${encodeURIComponent(query)}`
  );

  return response.data;
};

export const getCollaborationStats = async () => {
  const response = await api.get("/collaborations/stats");

  return response.data;
};