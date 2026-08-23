import api from "./api";

// =========================================================
// GET ALL USERS
// =========================================================

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};


// =========================================================
// UPDATE USER ROLE
// =========================================================

export const updateUserRole = async (userId, role) => {
  const response = await api.put(
    `/admin/users/${userId}/role`,
    null,
    {
      params: {
        role,
      },
    }
  );

  return response.data;
};