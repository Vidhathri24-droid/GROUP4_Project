import api from "../api/api";

export const getHomeAnalytics = async () => {
    const response = await api.get("/analytics/home");
    return response.data;
};
