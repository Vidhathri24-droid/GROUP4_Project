import { useEffect, useMemo, useState } from "react";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../services/notificationService";

import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications();

      console.log("Notifications:", data);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error(error);
      alert("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this notification?"
    );

    if (!confirmDelete) return;

    try {
      await deleteNotification(id);
      await loadNotifications();
    } catch (error) {
      console.error(error);
      alert("Failed to delete notification");
    }
  };

  /*
   * Search + filter
   * Does not change the original notification data.
   */
  const filteredNotifications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !searchText ||
        notification.title
          ?.toLowerCase()
          .includes(searchText) ||
        notification.message
          ?.toLowerCase()
          .includes(searchText) ||
        notification.notification_type
          ?.toLowerCase()
          .includes(searchText);

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !notification.is_read) ||
        (filter === "read" && notification.is_read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const getNotificationIcon = (type) => {
    if (
      type?.toUpperCase() === "COLLABORATION_REQUEST"
    ) {
      return "🤝";
    }

    if (type?.toUpperCase().includes("PUBLICATION")) {
      return "📄";
    }

    if (type?.toUpperCase().includes("CONFERENCE")) {
      return "📅";
    }

    if (type?.toUpperCase().includes("RESEARCH")) {
      return "🔬";
    }

    return "🔔";
  };

  const formatNotificationType = (type) => {
    if (!type) return "Notification";

    return type
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        {/* ================= HEADER ================= */}

        <div className="notifications-header">
          <div className="notifications-header-left">

            <p className="notifications-eyebrow">
              SCNA • Updates
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h1 className="notifications-title">
                Notifications
              </h1>

              <span className="notifications-count">
                {notifications.length}
              </span>
            </div>

            <p className="notifications-subtitle">
              Stay updated with collaboration requests,
              publications and other research activity.
            </p>

          </div>
        </div>

        {/* ================= TOOLBAR ================= */}

        <div className="notifications-toolbar">

          <div className="notifications-search">

            <span className="notifications-search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <select
            className="notifications-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">
              All notifications
            </option>

            <option value="unread">
              Unread
            </option>

            <option value="read">
              Read
            </option>
          </select>

        </div>

        {/* ================= MAIN CARD ================= */}

        <div className="notifications-card">

          <div className="notifications-card-header">

            <h2 className="notifications-card-title">

              <span className="notifications-card-title-icon">
                🔔
              </span>

              All Notifications

            </h2>

            {unreadCount > 0 && (
              <span className="notification-status unread">
                {unreadCount} unread
              </span>
            )}

          </div>

          {/* ================= LOADING ================= */}

          {loading ? (
            <div className="notifications-loading">

              <span className="notifications-spinner" />

              Loading notifications...

            </div>
          ) : filteredNotifications.length === 0 ? (

            /* ================= EMPTY STATE ================= */

            <div className="notifications-empty">

              <div className="notifications-empty-icon">
                🔔
              </div>

              <h3>
                {notifications.length === 0
                  ? "No notifications yet"
                  : "No matching notifications"}
              </h3>

              <p>
                {notifications.length === 0
                  ? "You're all caught up. New research activity and collaboration requests will appear here."
                  : "Try changing your search or notification filter."}
              </p>

            </div>

          ) : (

            /* ================= TABLE ================= */

            <div className="notifications-table-wrapper">

              <table className="notifications-table">

                <thead>
                  <tr>
                    <th>Notification</th>
                    <th>Message</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredNotifications.map(
                    (notification) => (

                      <tr key={notification.id}>

                        {/* Notification */}

                        <td>
                          <div className="notification-title-cell">

                            <div className="notification-icon">
                              {getNotificationIcon(
                                notification.notification_type
                              )}
                            </div>

                            <div>
                              <div className="notification-title">
                                {notification.title ||
                                  "Notification"}
                              </div>
                            </div>

                          </div>
                        </td>

                        {/* Message */}

                        <td>
                          <div className="notification-message">
                            {notification.message ||
                              "No message available."}
                          </div>
                        </td>

                        {/* Type */}

                        <td>
                          <span
                            className={`notification-type ${
                              notification.notification_type
                                ?.toUpperCase() ===
                              "COLLABORATION_REQUEST"
                                ? "collaboration"
                                : ""
                            }`}
                          >
                            {formatNotificationType(
                              notification.notification_type
                            )}
                          </span>
                        </td>

                        {/* Status */}

                        <td>

                          {notification.is_read ? (
                            <span className="notification-status read">
                              Read
                            </span>
                          ) : (
                            <span className="notification-status unread">
                              Unread
                            </span>
                          )}

                        </td>

                        {/* Created */}

                        <td>
                          <span className="notification-date">
                            {notification.created_at
                              ? new Date(
                                  notification.created_at
                                ).toLocaleString()
                              : "—"}
                          </span>
                        </td>

                        {/* Actions */}

                        <td>

                          <div className="notification-actions">

                            {!notification.is_read && (
                              <button
                                type="button"
                                className="notification-read-btn"
                                onClick={() =>
                                  handleRead(
                                    notification.id
                                  )
                                }
                              >
                                Mark read
                              </button>
                            )}

                            <button
                              type="button"
                              className="notification-delete-btn"
                              onClick={() =>
                                handleDelete(
                                  notification.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Notifications;