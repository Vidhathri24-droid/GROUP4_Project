// src/services/homeService.js

export const getHomeAnalytics = async() => {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/network/stats");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching home analytics:", error);
        return {
            total_researchers: 0,
            total_publications: 0,
            total_institutions: 0,
            total_conferences: 0
        };
    }
};