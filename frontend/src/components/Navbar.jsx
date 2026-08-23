import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Search,
  UserCircle,
} from "lucide-react";

import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getWebSocketUrl = (userId) => {
  const wsUrl = API_URL
    .replace(/^http:/, "ws:")
    .replace(/^https:/, "wss:");

  return `${wsUrl}/notifications/ws?user_id=${userId}`;
};

import {
  getToken,
  getCurrentUser,
  getNormalizedRole,
  isSystemAdmin as checkSystemAdmin,
  isInstitutionAdmin as checkInstitutionAdmin,
  isReviewer as checkReviewer,
  isResearcher as checkResearcher,
  logout as authLogout,
} from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const [accessToken, setAccessToken] = useState(() => {
    return getToken();
  });

  const isLoggedIn = !!accessToken;

  // ============================================================
  // CURRENT USER
  // ============================================================

  const [currentUser, setCurrentUser] = useState(() => {
    return getCurrentUser();
  });

  // ============================================================
  // NORMALIZED ROLE
  // ============================================================

  const normalizedRole = getNormalizedRole();

  const isSystemAdmin =
    checkSystemAdmin();

  const isInstitutionAdmin =
    checkInstitutionAdmin();

  const isReviewer =
    checkReviewer();

  const isResearcher =
    checkResearcher();

  const isAdmin =
    isSystemAdmin ||
    isInstitutionAdmin;

  /*
   * Keep the existing navigation for every authenticated user
   * except REVIEWER.
   *
   * REVIEWER gets only:
   * - My Profile
   * - Reviewer Panel
   *
   * System Admin and Institution Admin keep their normal
   * navigation, including Citations and Collaboration.
   */
  const canSeeResearcherFeatures = !isReviewer;

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    authLogout();

    setAccessToken(null);
    setCurrentUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setNotificationsOpen(false);

    navigate("/login");
  };

  // ============================================================
  // KEEP AUTH DATA SYNCHRONIZED
  // ============================================================

  useEffect(() => {
    const updateAuth = () => {
      const user = getCurrentUser();
      const token = getToken();

      setCurrentUser(user);
      setAccessToken(token);
    };

    /*
     * Storage event handles changes from other tabs.
     */
    window.addEventListener(
      "storage",
      updateAuth
    );

    /*
     * Custom event allows the current tab to
     * immediately refresh when login/user data
     * changes.
     */
    window.addEventListener(
      "auth:user-updated",
      updateAuth
    );

    /*
     * Also check when the window receives focus.
     *
     * This helps when login/logout changes storage
     * in the same tab without dispatching the event.
     */
    window.addEventListener(
      "focus",
      updateAuth
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateAuth
      );

      window.removeEventListener(
        "auth:user-updated",
        updateAuth
      );

      window.removeEventListener(
        "focus",
        updateAuth
      );
    };
  }, []);

  // ============================================================
  // LOAD EXISTING NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    const loadNotifications = async () => {
      if (
        !isLoggedIn ||
        !currentUser?.id
      ) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        const token = getToken();

        if (!token) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }

        const response = await axios.get(
          `${API_URL}/notifications/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        const data = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        const sortedData = [...data].sort(
          (a, b) => {
            const dateA = new Date(
              a.created_at || 0
            ).getTime();

            const dateB = new Date(
              b.created_at || 0
            ).getTime();

            return dateB - dateA;
          }
        );

        setNotifications(sortedData);

        const unread =
          sortedData.filter(
            (notification) =>
              !notification.is_read
          ).length;

        setUnreadCount(unread);

        console.log(
          `Loaded ${sortedData.length} notifications`
        );
      } catch (error) {
        console.error(
          "Unable to load previous notifications:",
          error
        );

        if (error.response) {
          console.error(
            "Notification API response:",
            error.response.data
          );

          console.error(
            "Notification API status:",
            error.response.status
          );
        }
      }
    };

    loadNotifications();
  }, [
    isLoggedIn,
    currentUser?.id,
  ]);

  // ============================================================
  // REAL-TIME NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    if (
      !isLoggedIn ||
      !currentUser?.id
    ) {
      return;
    }
    const socket = new WebSocket(
      getWebSocketUrl(currentUser.id)
    );


    socket.onopen = () => {
      console.log(
        "Notification WebSocket connected."
      );
    };

    socket.onmessage = (event) => {
      try {
        const notification =
          JSON.parse(event.data);

        setNotifications(
          (previous) => {
            const alreadyExists =
              notification.id &&
              previous.some(
                (item) =>
                  item.id === notification.id
              );

            if (alreadyExists) {
              return previous;
            }

            return [
              notification,
              ...previous,
            ];
          }
        );

        if (!notification.is_read) {
          setUnreadCount(
            (previous) =>
              previous + 1
          );
        }
      } catch (error) {
        console.error(
          "Unable to process notification:",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error(
        "Notification WebSocket error:",
        error
      );
    };

    socket.onclose = () => {
      console.log(
        "Notification WebSocket disconnected."
      );
    };

    return () => {
      socket.close();
    };
  }, [
    isLoggedIn,
    currentUser?.id,
  ]);

  // ============================================================
  // MARK SINGLE NOTIFICATION AS READ
  // ============================================================

  const markAsRead = async (
    notificationId
  ) => {
    if (!notificationId) {
      return;
    }

    const selectedNotification =
      notifications.find(
        (notification) =>
          notification.id ===
          notificationId
      );

    if (!selectedNotification) {
      return;
    }

    if (selectedNotification.is_read) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        return;
      }

      await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );

      setUnreadCount(
        (previous) =>
          Math.max(
            0,
            previous - 1
          )
      );
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error
      );
    }
  };

  // ============================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ============================================================

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        return;
      }

      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Unable to mark all notifications as read:",
        error
      );
    }
  };

  // ============================================================
  // FORMAT NOTIFICATION TIME
  // ============================================================

  const formatNotificationTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    try {
      const notificationDate =
        new Date(date);

      if (
        Number.isNaN(
          notificationDate.getTime()
        )
      ) {
        return "";
      }

      return notificationDate.toLocaleString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // ============================================================
  // NAVBAR
  // ============================================================

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary shadow sticky-top"
      style={{
        paddingTop: "12px",
        paddingBottom: "12px",
      }}
    >
      <div className="container-fluid px-4">

        {/* ======================================================
            LOGO
        ====================================================== */}

        <Link
          className="navbar-brand fw-bold fs-2"
          to="/"
        >
          SCNA
        </Link>

        {/* ======================================================
            MOBILE TOGGLER
        ====================================================== */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
          aria-controls="navbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ======================================================
            NAVIGATION

            IMPORTANT:
            Explicit display:flex prevents the navbar links
            from remaining hidden if Bootstrap's collapse
            behavior/CSS is not loaded correctly.
        ====================================================== */}

        <div
          className="navbar-collapse"
          id="navbar"
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
          }}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">

            {!isReviewer && (
              <>

                {/* ==================================================
                    HOME
                ================================================== */}

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active fw-bold"
                        : "nav-link"
                    }
                    to="/"
                  >
                    <i className="bi bi-house-door me-1"></i>
                    Home
                  </NavLink>
                </li>

                {isLoggedIn && (
                  <>

                    {/* ==================================================
                        RESEARCHERS
                    ================================================== */}

                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "nav-link active fw-bold"
                            : "nav-link"
                        }
                        to="/researchers"
                      >
                        <i className="bi bi-people me-1"></i>
                        Researchers
                      </NavLink>
                    </li>

                    {/* ==================================================
                        PUBLICATIONS
                    ================================================== */}

                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "nav-link active fw-bold"
                            : "nav-link"
                        }
                        to="/publications"
                      >
                        <i className="bi bi-journal-text me-1"></i>
                        Publications
                      </NavLink>
                    </li>

                    {/* ==================================================
                        CITATIONS
                    ================================================== */}

                    {canSeeResearcherFeatures && (
                      <li className="nav-item">
                        <NavLink
                          className={({ isActive }) =>
                            isActive
                              ? "nav-link active fw-bold"
                              : "nav-link"
                          }
                          to="/citations"
                        >
                          <i className="bi bi-quote me-1"></i>
                          Citations
                        </NavLink>
                      </li>
                    )}

                    {/* ==================================================
                        INSTITUTIONS
                    ================================================== */}

                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "nav-link active fw-bold"
                            : "nav-link"
                        }
                        to="/institutions"
                      >
                        <i className="bi bi-bank me-1"></i>
                        Institutions
                      </NavLink>
                    </li>

                    {/* ==================================================
                        CONFERENCES
                    ================================================== */}

                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "nav-link active fw-bold"
                            : "nav-link"
                        }
                        to="/conferences"
                      >
                        <i className="bi bi-calendar-event me-1"></i>
                        Conferences
                      </NavLink>
                    </li>

                    {/* ==================================================
                        DASHBOARD
                    ================================================== */}

                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "nav-link active fw-bold"
                            : "nav-link"
                        }
                        to="/dashboard"
                      >
                        <i className="bi bi-speedometer2 me-1"></i>
                        Dashboard
                      </NavLink>
                    </li>

                    {/* ==================================================
                        COLLABORATION
                    ================================================== */}

                    {canSeeResearcherFeatures && (
                      <li className="nav-item">
                        <NavLink
                          className={({ isActive }) =>
                            isActive
                              ? "nav-link active fw-bold"
                              : "nav-link"
                          }
                          to="/collaboration"
                        >
                          <i className="bi bi-people-fill me-1"></i>
                          Collaboration
                        </NavLink>
                      </li>
                    )}

                    {/* ==================================================
                        ADMIN PANEL
                    ================================================== */}

                    {isAdmin && (
                      <li className="nav-item">
                        <NavLink
                          className={({ isActive }) =>
                            isActive
                              ? "nav-link active fw-bold"
                              : "nav-link"
                          }
                          to={
                            isSystemAdmin
                              ? "/admin"
                              : "/admin/institution"
                          }
                        >
                          <i className="bi bi-shield-lock me-1"></i>
                          Admin Panel
                        </NavLink>
                      </li>
                    )}

                  </>
                )}
              </>
            )}

            {/* ==================================================
                REVIEWER NAVIGATION
            ================================================== */}

            {isLoggedIn && isReviewer && (
              <>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active fw-bold"
                        : "nav-link"
                    }
                    to="/profile"
                  >
                    <i className="bi bi-person me-1"></i>
                    My Profile
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active fw-bold"
                        : "nav-link"
                    }
                    to="/reviewer"
                  >
                    <i className="bi bi-clipboard-check me-1"></i>
                    Review Panel
                  </NavLink>
                </li>

              </>
            )}

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            {isLoggedIn && (
              <li className="nav-item dropdown ms-lg-2">

                <button
                  type="button"
                  className="nav-link position-relative border-0 bg-transparent"
                  title="Notifications"
                  aria-label="Notifications"
                  onClick={() =>
                    setNotificationsOpen(
                      (previous) =>
                        !previous
                    )
                  }
                  style={{
                    fontSize: "22px",
                    padding: "8px 12px",
                    color: "white",
                  }}
                >
                  <Bell size={22} />

                  {unreadCount > 0 && (
                    <span
                      className="position-absolute badge rounded-pill bg-danger"
                      style={{
                        top: "0px",
                        right: "0px",
                        fontSize: "10px",
                        minWidth: "17px",
                      }}
                    >
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </button>

                {/* ==================================================
                    NOTIFICATION DROPDOWN
                ================================================== */}

                {notificationsOpen && (
                  <div
                    className="dropdown-menu dropdown-menu-end shadow show"
                    style={{
                      width: "380px",
                      maxWidth:
                        "calc(100vw - 30px)",
                      maxHeight:
                        "520px",
                      overflowY: "auto",
                      padding: 0,
                    }}
                  >

                    {/* HEADER */}

                    <div
                      className="px-3 py-3 border-bottom d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>
                          Notifications
                        </strong>

                        <div className="text-muted small">
                          Stay updated
                        </div>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-primary p-0"
                          onClick={
                            markAllAsRead
                          }
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* NOTIFICATION LIST */}

                    {notifications.length === 0 ? (

                      <div className="text-center py-5 px-3">

                        <div
                          className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "52px",
                            height: "52px",
                          }}
                        >
                          <Bell
                            size={24}
                            className="text-primary"
                          />
                        </div>

                        <div className="fw-semibold">
                          No notifications
                        </div>

                        <div className="text-muted small mt-1">
                          You're all caught up.
                        </div>

                      </div>

                    ) : (

                      <div>

                        {notifications.map(
                          (
                            notification,
                            index
                          ) => (

                            <button
                              key={
                                notification.id ||
                                `notification-${index}`
                              }
                              type="button"
                              className="w-100 text-start border-0"
                              onClick={() => {
                                if (
                                  !notification.is_read &&
                                  notification.id
                                ) {
                                  markAsRead(
                                    notification.id
                                  );
                                }
                              }}
                              style={{
                                padding:
                                  "14px 16px",
                                borderBottom:
                                  "1px solid #eee",
                                backgroundColor:
                                  notification.is_read
                                    ? "white"
                                    : "#f0f7ff",
                                cursor:
                                  notification.is_read
                                    ? "default"
                                    : "pointer",
                              }}
                            >

                              <div className="d-flex gap-3">

                                <div
                                  className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: "38px",
                                    height: "38px",
                                  }}
                                >
                                  <Bell size={17} />
                                </div>

                                <div
                                  className="flex-grow-1"
                                  style={{
                                    minWidth: 0,
                                  }}
                                >

                                  <div className="d-flex justify-content-between gap-2">

                                    <strong
                                      className="small"
                                      style={{
                                        overflow:
                                          "hidden",
                                        textOverflow:
                                          "ellipsis",
                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {notification.title ||
                                        "Notification"}
                                    </strong>

                                    {!notification.is_read && (
                                      <span
                                        className="bg-primary rounded-circle flex-shrink-0"
                                        style={{
                                          width: "7px",
                                          height: "7px",
                                          marginTop: "5px",
                                        }}
                                      />
                                    )}

                                  </div>

                                  <div
                                    className="text-muted small mt-1"
                                    style={{
                                      lineHeight:
                                        "1.4",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {notification.message ||
                                      "You have a new notification."}
                                  </div>

                                  <div
                                    className="text-muted mt-1"
                                    style={{
                                      fontSize:
                                        "11px",
                                    }}
                                  >
                                    {formatNotificationTime(
                                      notification.created_at
                                    )}
                                  </div>

                                </div>

                              </div>

                            </button>

                          )
                        )}

                      </div>

                    )}

                    {/* FOOTER */}

                    {notifications.length > 0 && (
                      <div className="border-top text-center p-2">

                        <Link
                          to="/notifications"
                          className="small text-primary text-decoration-none"
                          onClick={() =>
                            setNotificationsOpen(
                              false
                            )
                          }
                        >
                          View all notifications
                        </Link>

                      </div>
                    )}

                  </div>
                )}

              </li>
            )}

            {/* ==================================================
                SEARCH
            ================================================== */}

            <li className="nav-item ms-lg-2">

              <button
                type="button"
                onClick={() =>
                  navigate("/search")
                }
                title="Search"
                aria-label="Search"
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "22px",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                <Search size={22} />
              </button>

            </li>

            {/* ==================================================
                USER MENU
            ================================================== */}

            {isLoggedIn && (
              <li className="nav-item dropdown ms-lg-3">

                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  onClick={(event) =>
                    event.preventDefault()
                  }
                >
                  <UserCircle
                    size={22}
                    className="me-1"
                  />
                </a>

                <ul className="dropdown-menu dropdown-menu-end shadow">

                  {/* ==================================================
                      PROFILE
                  ================================================== */}

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/profile"
                    >
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </Link>
                  </li>

                  {/* ==================================================
                      SYSTEM ADMIN PANEL
                  ================================================== */}

                  {isSystemAdmin && (
                    <>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/admin"
                        >
                          <i className="bi bi-shield-lock me-2"></i>
                          Admin Panel
                        </Link>
                      </li>

                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}

                  {/* ==================================================
                      INSTITUTION ADMIN PANEL
                  ================================================== */}

                  {isInstitutionAdmin && (
                    <>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/admin/institution"
                        >
                          <i className="bi bi-building me-2"></i>
                          Institution Admin Panel
                        </Link>
                      </li>

                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}

                  {/* SETTINGS */}

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/settings"
                    >
                      <i className="bi bi-gear me-2"></i>
                      Settings
                    </Link>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {/* LOGOUT */}

                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={logout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>

                </ul>

              </li>
            )}

            {/* ======================================================
                LOGIN
            ====================================================== */}

            {!isLoggedIn && (
              <li className="nav-item ms-lg-3">

                <Link
                  className="btn btn-light"
                  to="/login"
                >
                  Login
                </Link>

              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}
