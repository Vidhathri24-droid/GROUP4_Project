import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getPublication,
  downloadPublication,
} from "../services/publicationService";

import { getCurrentUser } from "../services/authService";

function PublicationDetails() {
  const { id } = useParams();

  const [publication, setPublication] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublication();
  }, [id]);

  const loadPublication = async () => {
    try {
      const [publicationData, userData] = await Promise.all([
        getPublication(id),
        getCurrentUser(),
      ]);

      setPublication(publicationData);
      setCurrentUser(userData);
    } catch (err) {
      console.error(err);
      alert("Failed to load publication.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await downloadPublication(id);

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.download =
        publication.file_name || "publication.pdf";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed.");
    }
  };

  /*
   * Get the logged-in user's role.
   *
   * The backend may return the role using any of
   * these field names, so support all of them.
   */
  const userRole =
    currentUser?.role ||
    currentUser?.user_role ||
    currentUser?.role_name ||
    null;

  const normalizedRole = userRole?.toUpperCase();

  /*
   * Only System Admin and Institution Admin
   * can edit publications.
   *
   * Researchers and Reviewers can view/download
   * publications but cannot edit them.
   */
  const canEditPublication =
    normalizedRole === "SYSTEM_ADMIN" ||
    normalizedRole === "INSTITUTION_ADMIN";

  if (loading) {
    return (
      <div className="container mt-5">
        <h3>Loading...</h3>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Publication not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">

      <div className="card shadow">

        <div className="card-body">

          <h2 className="text-primary mb-4">
            {publication.title}
          </h2>

          <table className="table table-bordered">

            <tbody>

              <tr>
                <th>Abstract</th>
                <td>{publication.abstract}</td>
              </tr>

              <tr>
                <th>DOI</th>
                <td>{publication.doi}</td>
              </tr>

              <tr>
                <th>Journal</th>
                <td>{publication.journal}</td>
              </tr>

              <tr>
                <th>Conference</th>
                <td>{publication.conference}</td>
              </tr>

              <tr>
                <th>Publication Year</th>
                <td>{publication.publication_year}</td>
              </tr>

              <tr>
                <th>Publication Type</th>
                <td>{publication.publication_type}</td>
              </tr>

              <tr>
                <th>Status</th>
                <td>{publication.status}</td>
              </tr>

              <tr>
                <th>Citation Count</th>
                <td>{publication.citation_count}</td>
              </tr>

              <tr>
                <th>URL</th>
                <td>
                  {publication.url ? (
                    <a
                      href={publication.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {publication.url}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </td>
              </tr>

              <tr>
                <th>Uploaded File</th>
                <td>
                  {publication.file_name || "No file uploaded"}
                </td>
              </tr>

              <tr>
                <th>Created At</th>
                <td>{publication.created_at}</td>
              </tr>

              <tr>
                <th>Updated At</th>
                <td>{publication.updated_at}</td>
              </tr>

            </tbody>

          </table>

          {/* Download */}
          <button
            className="btn btn-success me-2"
            onClick={handleDownload}
          >
            Download PDF
          </button>

          {/* 
            Edit is visible ONLY to:
            - System Admin
            - Institution Admin

            It is hidden for:
            - Researcher
            - Reviewer
          */}
          {canEditPublication && (
            <Link
              to={`/publications/edit/${publication.id}`}
              className="btn btn-warning me-2"
            >
              Edit
            </Link>
          )}

          {/* Back */}
          <Link
            to="/publications"
            className="btn btn-secondary"
          >
            Back
          </Link>

        </div>

      </div>

    </div>
  );
}

export default PublicationDetails;