import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function ConferenceCard({

  conference,
  onDelete,
  canManage = false,
}) {
  const navigate = useNavigate();

  // ============================================================
  // VIEW CONFERENCE
  // ============================================================

  const handleView = (event) => {
    event.stopPropagation();

    navigate(
      `/conferences/${conference.id}`
    );
  };

  // ============================================================
  // EDIT CONFERENCE
  // ============================================================

  const handleEdit = (event) => {
    event.stopPropagation();

    if (!canManage) {
      return;
    }

    navigate(
      `/conferences/${conference.id}/edit`
    );
  };

  // ============================================================
  // DELETE CONFERENCE
  // ============================================================

  const handleDelete = async (event) => {
    event.stopPropagation();

    if (!canManage) {
      return;
    }

    if (!onDelete) {
      console.error(
        "Delete handler is not available."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${conference.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await onDelete(conference.id);
    } catch (error) {
      console.error(
        "Unable to delete conference:",
        error
      );
    }
  };

  // ============================================================
  // EXPORT CONFERENCE TO EXCEL
  // ============================================================

  const handleExportExcel = async (event) => {
    event.stopPropagation();

    if (!canManage) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        alert(
          "Your session has expired. Please log in again."
        );

        return;
      }

      // --------------------------------------------------------
      // Get complete conference export data
      // --------------------------------------------------------

      const response = await axios.get(
        `${API_BASE}/conferences/${conference.id}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = response.data;

      const conferenceData =
        data.conference || {};

      const attendees =
        Array.isArray(data.attendees)
          ? data.attendees
          : [];

      const presenters =
        Array.isArray(data.presenters)
          ? data.presenters
          : [];

      // ========================================================
      // SHEET 1 — CONFERENCE
      // ========================================================

      const conferenceSheetData = [
        {
          "Conference ID":
            conferenceData.id || "",

          "Conference Title":
            conferenceData.title || "",

          "Date":
            conferenceData.conference_date ||
            "",

          "Time":
            conferenceData.conference_time ||
            "",

          "Venue":
            conferenceData.location ||
            "",

          "Description":
            conferenceData.description ||
            "",

          "Total Participants":
            data.total_participants ?? 0,

          "Total Attendees":
            data.total_attendees ?? 0,

          "Total Presenters":
            data.total_presenters ?? 0,
        },
      ];

      const conferenceWorksheet =
        XLSX.utils.json_to_sheet(
          conferenceSheetData
        );

      conferenceWorksheet["!cols"] = [
        { wch: 40 },
        { wch: 45 },
        { wch: 18 },
        { wch: 18 },
        { wch: 40 },
        { wch: 60 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
      ];

      // ========================================================
      // SHEET 2 — ATTENDEES
      // ========================================================

      const attendeeSheetData =
        attendees.map(
          (attendee, index) => ({
            "S.No": index + 1,

            "Registration ID":
              attendee.registration_id ||
              "",

            "User ID":
              attendee.user_id || "",

            "Name":
              attendee.name || "",

            "Email":
              attendee.email || "",

            "Participation Type":
              attendee.participation_type ||
              "Attendee",

            "Status":
              attendee.status || "",
          })
        );

      // Make sure empty attendee list still creates sheet
      if (
        attendeeSheetData.length === 0
      ) {
        attendeeSheetData.push({
          "S.No": "",
          "Registration ID": "",
          "User ID": "",
          "Name": "No attendees",
          "Email": "",
          "Participation Type": "",
          "Status": "",
        });
      }

      const attendeeWorksheet =
        XLSX.utils.json_to_sheet(
          attendeeSheetData
        );

      attendeeWorksheet["!cols"] = [
        { wch: 8 },
        { wch: 40 },
        { wch: 40 },
        { wch: 30 },
        { wch: 40 },
        { wch: 22 },
        { wch: 18 },
      ];

      // ========================================================
      // SHEET 3 — PRESENTERS
      // ========================================================

      const presenterSheetData =
        presenters.map(
          (presenter, index) => ({
            "S.No": index + 1,

            "Registration ID":
              presenter.registration_id ||
              "",

            "User ID":
              presenter.user_id || "",

            "Name":
              presenter.name || "",

            "Email":
              presenter.email || "",

            "Participation Type":
              presenter.participation_type ||
              "Presenter",

            "Status":
              presenter.status || "",
          })
        );

      if (
        presenterSheetData.length === 0
      ) {
        presenterSheetData.push({
          "S.No": "",
          "Registration ID": "",
          "User ID": "",
          "Name": "No presenters",
          "Email": "",
          "Participation Type": "",
          "Status": "",
        });
      }

      const presenterWorksheet =
        XLSX.utils.json_to_sheet(
          presenterSheetData
        );

      presenterWorksheet["!cols"] = [
        { wch: 8 },
        { wch: 40 },
        { wch: 40 },
        { wch: 30 },
        { wch: 40 },
        { wch: 22 },
        { wch: 18 },
      ];

      // ========================================================
      // CREATE WORKBOOK
      // ========================================================

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        conferenceWorksheet,
        "Conference"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        attendeeWorksheet,
        "Attendees"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        presenterWorksheet,
        "Presenters"
      );

      // ========================================================
      // SAFE FILE NAME
      // ========================================================

      const safeTitle = String(
        conferenceData.title ||
          conference.title ||
          "conference"
      )
        .trim()
        .replace(
          /[^a-zA-Z0-9-_ ]/g,
          ""
        )
        .replace(
          /\s+/g,
          "_"
        );

      // ========================================================
      // DOWNLOAD
      // ========================================================

      XLSX.writeFile(
        workbook,
        `${safeTitle || "conference"}_participants.xlsx`
      );

    } catch (error) {
      console.error(
        "Unable to export conference:",
        error
      );

      const backendMessage =
        error?.response?.data?.detail;

      alert(
        backendMessage ||
          "Unable to export the conference details. Please try again."
      );
    }
  };

  // ============================================================
  // CARD
  // ============================================================

  return (
    <div
      className="card h-100 shadow-sm conference-card"
      onClick={() =>
        navigate(
          `/conferences/${conference.id}`
        )
      }
      style={{
        cursor: "pointer",
      }}
    >

      {/* ========================================================
          CARD BODY
         ======================================================== */}

      <div className="card-body">

        <h4 className="card-title text-primary">
          {conference.title}
        </h4>

        <hr />

        <p>
          <strong>Date:</strong>
          <br />

          {conference.conference_date ||
            "Not specified"}
        </p>

        <p>
          <strong>Time:</strong>
          <br />

          {conference.conference_time ||
            "Not specified"}
        </p>

        <p>
          <strong>Venue:</strong>
          <br />

          {conference.location ||
            "Not specified"}
        </p>

        <p>
          <strong>
            Participants:
          </strong>{" "}

          {conference.participant_count ??
            0}
        </p>

      </div>

      {/* ========================================================
          ACTIONS
         ======================================================== */}

      <div className="card-footer bg-white">

        {/* ======================================================
            VIEW — EVERYONE
           ====================================================== */}

        <button
          type="button"
          className={
            canManage
              ? "btn btn-primary w-100 mb-2"
              : "btn btn-primary w-100"
          }
          onClick={handleView}
        >
          <i className="bi bi-eye me-1"></i>
          View Conference
        </button>

        {/* ======================================================
            ADMIN-ONLY ACTIONS
           ====================================================== */}

        {canManage && (
          <>

            <div className="d-flex gap-2 mb-2">

              {/* EDIT */}

              <button
                type="button"
                className="btn btn-outline-primary flex-fill"
                onClick={handleEdit}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit
              </button>

              {/* DELETE */}

              <button
                type="button"
                className="btn btn-outline-danger flex-fill"
                onClick={handleDelete}
              >
                <i className="bi bi-trash me-1"></i>
                Delete
              </button>

            </div>

            {/* ==================================================
                EXPORT
               ================================================== */}

            <button
              type="button"
              className="btn btn-outline-success w-100"
              onClick={handleExportExcel}
            >
              <i className="bi bi-file-earmark-excel me-1"></i>
              Export to Excel
            </button>

          </>
        )}

      </div>

    </div>
  );
}

export default ConferenceCard;