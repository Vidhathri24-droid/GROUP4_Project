export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getCurrentUser();

  return user?.role || null;
};

export const isAdmin = () => {
  return getUserRole() === "SystemAdmin";
};

export const isResearcher = () => {
  return getUserRole() === "Researcher";
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("access_token");
};
