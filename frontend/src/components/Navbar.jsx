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

export default function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn =
    !!localStorage.getItem("access_token");

  // ============================================================
  // CURRENT USER
  // ============================================================

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );

      return null;
    }
  });

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
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setCurrentUser(null);
    setNotifications([]);
    setUnreadCount(0);

    navigate("/login");
  };

  // ============================================================
  // KEEP USER SYNCHRONIZED
  // ============================================================

  useEffect(() => {
    const updateUser = () => {
      try {
        const storedUser =
          localStorage.getItem("user");

        setCurrentUser(
          storedUser
            ? JSON.parse(storedUser)
            : null
        );
      } catch (error) {
        console.error(
          "Unable to read logged-in user:",
          error
        );

        setCurrentUser(null);
      }
    };

    window.addEventListener(
      "storage",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateUser
      );
    };
  }, []);

  // ============================================================
  // LOAD EXISTING NOTIFICATIONS FROM DATABASE
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
        const token =
          localStorage.getItem(
            "access_token"
          );

        if (!token) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }

        const response = await axios.get(
          "http://127.0.0.1:8000/notifications/",
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

        // Sort newest first
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

        console.log(
          "Notifications:",
          sortedData
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

        /*
         * Do NOT clear existing notification
         * state if loading fails.
         */
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
      `ws://127.0.0.1:8000/notifications/ws?user_id=${currentUser.id}`
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

        console.log(
          "New real-time notification:",
          notification
        );

        setNotifications(
          (previous) => {
            /*
             * Prevent duplicate notifications
             * if the same notification already
             * exists in the list.
             */
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

        /*
         * Only increment unread count when
         * the incoming notification is unread.
         */
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

    /*
     * Find the notification first so that
     * we only decrease unreadCount if it
     * was actually unread.
     */
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
      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        return;
      }

      await axios.patch(
        `http://127.0.0.1:8000/notifications/${notificationId}/read`,
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

      console.log(
        `Notification ${notificationId} marked as read`
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
      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        return;
      }

      await axios.patch(
        "http://127.0.0.1:8000/notifications/read-all",
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

      console.log(
        "All notifications marked as read"
      );
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
        ====================================================== */}

        <div
          className="collapse navbar-collapse"
          id="navbar"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">

            {/* HOME */}

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

                {/* RESEARCHERS */}

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

                {/* PUBLICATIONS */}

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

                {/* CITATIONS */}

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

                {/* INSTITUTIONS */}

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

                {/* CONFERENCES */}

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

                {/* DASHBOARD */}

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

                {/* COLLABORATION */}

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active fw-bold"
                        : "nav-link"
                    }
                    to="/collaborations"
                  >
                    <i className="bi bi-people-fill me-1"></i>
                    Collaboration
                  </NavLink>
                </li>

                {/* ==================================================
                    NOTIFICATIONS
                ================================================== */}

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

                    {/* UNREAD BADGE */}

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

                      {/* ==================================================
                          NOTIFICATIONS LIST
                      ================================================== */}

                      {notifications.length === 0 ? (

                        /* EMPTY STATE */

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

                        /* NOTIFICATION LIST */

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

                                  /*
                                   * Only call API if the
                                   * notification is unread.
                                   */
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

                                  {/* ICON */}

                                  <div
                                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                      width: "38px",
                                      height: "38px",
                                    }}
                                  >
                                    <Bell
                                      size={17}
                                    />
                                  </div>

                                  {/* CONTENT */}

                                  <div
                                    className="flex-grow-1"
                                    style={{
                                      minWidth: 0,
                                    }}
                                  >

                                    {/* TITLE + UNREAD DOT */}

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
                                            width:
                                              "7px",

                                            height:
                                              "7px",

                                            marginTop:
                                              "5px",
                                          }}
                                        />
                                      )}

                                    </div>

                                    {/* MESSAGE */}

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

                                    {/* TIME */}

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

                      {/* ==================================================
                          FOOTER
                      ================================================== */}

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

                    <li>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                      >
                        <i className="bi bi-person me-2"></i>
                        My Profile
                      </Link>
                    </li>

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

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={logout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>

                  </ul>

                </li>

              </>
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