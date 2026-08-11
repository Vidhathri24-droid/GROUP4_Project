import api from "../api/api";

export const getReviewerPublications = async () => {
  const response = await api.get("/reviewer/publications");
  return response.data;
};

export const acceptPublication = async (id) => {
  const response = await api.patch(
    `/reviewer/publications/${id}/accept`
  );

  return response.data;
};

export const rejectPublication = async (id) => {
  const response = await api.patch(
    `/reviewer/publications/${id}/reject`
  );

  return response.data;
};