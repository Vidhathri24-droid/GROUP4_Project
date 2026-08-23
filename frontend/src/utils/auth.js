// =========================================================
// AUTHENTICATION UTILITIES
// =========================================================


/* =========================================================
   GET ACCESS TOKEN
   ========================================================= */

export const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
};


/* =========================================================
   AUTH STATUS
   ========================================================= */

export const isAuthenticated = () => {
  return !!getToken();
};

export const isLoggedIn = () => {
  return isAuthenticated();
};


/* =========================================================
   CURRENT USER
   ========================================================= */

export const getCurrentUser = () => {
  const user =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(user);

    // Make sure the stored value is actually an object.
    if (
      !parsedUser ||
      typeof parsedUser !== "object" ||
      Array.isArray(parsedUser)
    ) {
      console.error("Invalid stored user data.");
      return null;
    }

    return parsedUser;
  } catch (error) {
    console.error(
      "Failed to parse stored user:",
      error
    );

    return null;
  }
};


// =========================================================
// USER ROLE
// =========================================================

export const getUserRole = () => {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    user.role ||
    user.user_role ||
    user.userRole ||
    null
  );
};


// =========================================================
// NORMALIZED ROLE
// =========================================================

export const getNormalizedRole = () => {
  const role = getUserRole();

  if (!role) {
    return null;
  }

  return String(role)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};


// =========================================================
// SYSTEM ADMIN
// =========================================================

export const isSystemAdmin = () => {
  const role = getNormalizedRole();

  return (
    role === "SYSTEM_ADMIN" ||
    role === "SYSTEMADMIN"
  );
};


// =========================================================
// INSTITUTION ADMIN
// =========================================================

export const isInstitutionAdmin = () => {
  const role = getNormalizedRole();

  return (
    role === "INSTITUTION_ADMIN" ||
    role === "INSTITUTIONADMIN"
  );
};


// =========================================================
// RESEARCHER
// =========================================================

export const isResearcher = () => {
  const role = getNormalizedRole();

  return role === "RESEARCHER";
};


// =========================================================
// REVIEWER
// =========================================================

export const isReviewer = () => {
  const role = getNormalizedRole();

  return role === "REVIEWER";
};


// =========================================================
// ADMIN
// =========================================================

export const isAdmin = () => {
  return (
    isSystemAdmin() ||
    isInstitutionAdmin()
  );
};


/* =========================================================
   SAVE USER
   ========================================================= */

export const saveUser = (
  user,
  rememberMe = true
) => {
  if (!user) {
    return;
  }

  const storage = rememberMe
    ? localStorage
    : sessionStorage;

  /*
   * Remove the old user from both storages first.
   *
   * This prevents an old user object from one storage
   * overriding the newly saved user from another storage.
   */

  localStorage.removeItem("user");
  sessionStorage.removeItem("user");

  storage.setItem(
    "user",
    JSON.stringify(user)
  );
};


/* =========================================================
   SAVE TOKEN
   ========================================================= */

export const saveToken = (
  token,
  rememberMe = true
) => {
  if (!token) {
    return;
  }

  const storage = rememberMe
    ? localStorage
    : sessionStorage;

  /*
   * Remove old tokens first.
   */

  localStorage.removeItem("access_token");
  sessionStorage.removeItem("access_token");

  storage.setItem(
    "access_token",
    token
  );
};


/* =========================================================
   SAVE AUTH DATA
   ========================================================= */

export const saveAuthData = (
  user,
  token,
  rememberMe = true
) => {
  if (user) {
    saveUser(user, rememberMe);
  }

  if (token) {
    saveToken(token, rememberMe);
  }
};


/* =========================================================
   CLEAR STORED USER
   ========================================================= */

export const clearStoredUser = () => {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
};


/* =========================================================
   CLEAR STORED TOKEN
   ========================================================= */

export const clearStoredToken = () => {
  localStorage.removeItem("access_token");
  sessionStorage.removeItem("access_token");
};


/* =========================================================
   LOGOUT
   ========================================================= */

export const logout = () => {
  clearStoredToken();
  clearStoredUser();
};


/* =========================================================
   DEBUG AUTH
   ========================================================= */

export const debugAuth = () => {
  const user = getCurrentUser();

  console.log(
    "========== AUTH DEBUG =========="
  );

  console.log(
    "User:",
    user
  );

  console.log(
    "Email:",
    user?.email
  );

  console.log(
    "Raw Role:",
    getUserRole()
  );

  console.log(
    "Normalized Role:",
    getNormalizedRole()
  );

  console.log(
    "System Admin:",
    isSystemAdmin()
  );

  console.log(
    "Institution Admin:",
    isInstitutionAdmin()
  );

  console.log(
    "Researcher:",
    isResearcher()
  );

  console.log(
    "Reviewer:",
    isReviewer()
  );

  console.log(
    "Admin:",
    isAdmin()
  );

  console.log(
    "Authenticated:",
    isAuthenticated()
  );

  console.log(
    "Access Token:",
    !!getToken()
  );

  console.log(
    "================================"
  );
};