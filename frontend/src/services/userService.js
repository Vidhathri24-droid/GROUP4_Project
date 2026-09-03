import api from "./api";

// ============================================================
// GET ALL USERS
// ============================================================

export const getUsers = async () => {
    const response = await api.get("/users/");
    return response.data;
};


// ============================================================
// GET USER BY ID
// ============================================================

export const getUserById = async (id) => {
    const response = await api.get(
        `/users/${id}`
    );

    return response.data;
};


// ============================================================
// UPDATE USER
// ============================================================

export const updateUser = async (
    id,
    userData
) => {
    const response = await api.put(
        `/users/${id}`,
        userData
    );

    return response.data;
};


// ============================================================
// DELETE USER
// ============================================================

export const deleteUser = async (id) => {
    const response = await api.delete(
        `/users/${id}`
    );

    return response.data;
};


// ============================================================
// UPDATE USER ROLE
// ============================================================

export const updateUserRole = async (
    userId,
    role
) => {

    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }

    if (!role) {
        throw new Error(
            "Role is required."
        );
    }

    const response = await api.put(
        `/admin/users/${userId}/role`,
        {
            role: role,
        }
    );

    /*
     * Backend returns:
     *
     * {
     *   message: "...",
     *   user: {
     *      id,
     *      username,
     *      email,
     *      role
     *   }
     * }
     */

    return (
        response.data?.user ||
        response.data
    );
};