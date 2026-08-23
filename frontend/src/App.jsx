import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ============================================================
// NAVBAR
// ============================================================

import Navbar from "./components/Navbar";

// ============================================================
// AUTH
// ============================================================

import {
  isAuthenticated,
  isSystemAdmin,
  isInstitutionAdmin,
} from "./utils/auth";

// ============================================================
// AUTH PAGES
// ============================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ============================================================
// HOME
// ============================================================

import Home from "./pages/Home";

// ============================================================
// DASHBOARD
// ============================================================

import Dashboard from "./pages/Dashboard";

// ============================================================
// NETWORK
// ============================================================

import Network from "./pages/network/Network.jsx";

// ============================================================
// RESEARCHERS
// ============================================================

import Researchers from "./pages/researchers/Researchers";
import CreateResearcher from "./pages/researchers/CreateResearcher";
import EditResearcher from "./pages/researchers/EditResearcher";
import ResearcherDetails from "./pages/researchers/ResearcherDetails";
import ResearcherProfile from "./pages/researchers/ResearcherProfile";

// ============================================================
// PUBLICATIONS
// ============================================================

import Publications from "./pages/Publications";
import CreatePublication from "./pages/CreatePublication";
import EditPublication from "./pages/EditPublication";
import PublicationDetails from "./pages/PublicationDetails";

// ============================================================
// CONFERENCES
// ============================================================

import Conferences from "./pages/conferences/Conferences";
import CreateConference from "./pages/conferences/CreateConference";
import EditConference from "./pages/conferences/EditConference";
import ConferenceDetails from "./pages/conferences/ConferenceDetails";

// ============================================================
// INSTITUTIONS
// ============================================================

import Institutions from "./pages/institutions/Institutions";
import CreateInstitution from "./pages/institutions/CreateInstitution";
import EditInstitution from "./pages/institutions/EditInstitution";
import InstitutionDetails from "./pages/institutions/InstitutionDetails";

// ============================================================
// SEARCH
// ============================================================

import Search from "./pages/Search";

// ============================================================
// USER MANAGEMENT
// ============================================================

import UserManagement from "./pages/UserManagement";

// ============================================================
// CITATIONS
// ============================================================

import Citations from "./pages/citations/Citations";
import CreateCitation from "./pages/citations/CreateCitation";
import EditCitation from "./pages/citations/EditCitation";
import CitationDetails from "./pages/citations/CitationDetails";

// ============================================================
// COLLABORATIONS
// ============================================================

import Collaboration from "./pages/Collaboration";

// ============================================================
// REVIEWER
// ============================================================

import ReviewerDashboard from "./pages/ReviewerDashboard";

// ============================================================
// SYSTEM ADMIN
// ============================================================

import AdminUsers from "./pages/admin/AdminUsers";

// ============================================================
// INSTITUTION ADMIN
// ============================================================
import InstitutionAdminUsers from "./pages/admin/InstitutionAdminUsers";

// ============================================================
// PROTECTED ROUTE
// ============================================================
//
// User must be authenticated.
//
// This is only authentication protection.
// Role-based authorization is handled separately.
// ============================================================

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ============================================================
// SYSTEM ADMIN ROUTE
// ============================================================
//
// ONLY SYSTEM_ADMIN users can access this route.
//
// Frontend protection:
//     SYSTEM_ADMIN -> allowed
//     everyone else -> dashboard
//
// Backend must ALSO protect the API.
// ============================================================

function SystemAdminRoute({ children }) {
  if (!isSystemAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


// ============================================================
// INSTITUTION ADMIN ROUTE
// ============================================================
//
// ONLY INSTITUTION_ADMIN users can access this panel.
//
// System Admin does NOT use this panel.
// System Admin continues using AdminUsers.jsx.
// ============================================================

function InstitutionAdminRoute({ children }) {

  if (!isInstitutionAdmin()) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}


// ============================================================
// SYSTEM ADMIN REDIRECT
// ============================================================
//
// System Admin users should NOT be sent to:
//
//     /dashboard
//     /profile
//
// because those pages are researcher/user-oriented.
//
// Instead:
//
//     SYSTEM_ADMIN -> /admin/users
//
// Other users continue normally.
// ============================================================


// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <Navbar />


      {/* ======================================================
          ROUTES
      ====================================================== */}

      <Routes>

        {/* ====================================================
            PUBLIC ROUTES
        ==================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/resend-verification"
          element={<ResendVerification />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            NETWORK
        ==================================================== */}

        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <Network />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            RESEARCHERS
        ==================================================== */}

        <Route
          path="/researchers"
          element={
            <ProtectedRoute>
              <Researchers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researchers/create"
          element={
            <ProtectedRoute>
              <CreateResearcher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researchers/:id"
          element={
            <ProtectedRoute>
              <ResearcherDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researchers/edit/:id"
          element={
            <ProtectedRoute>
              <EditResearcher />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            PROFILE
        ==================================================== */}

        {/*
          IMPORTANT:

          The /profile page is NOT a System Admin page.

          Therefore:

              SYSTEM_ADMIN
                    ↓
              /admin/users

          Other authenticated users:

              RESEARCHER / REVIEWER / etc.
                    ↓
              ResearcherProfile
        */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ResearcherProfile />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            PUBLICATIONS
        ==================================================== */}

        <Route
          path="/publications"
          element={
            <ProtectedRoute>
              <Publications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publications/create"
          element={
            <ProtectedRoute>
              <CreatePublication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publications/edit/:id"
          element={
            <ProtectedRoute>
              <EditPublication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publications/:id"
          element={
            <ProtectedRoute>
              <PublicationDetails />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            CONFERENCES
        ==================================================== */}

        <Route
          path="/conferences"
          element={
            <ProtectedRoute>
              <Conferences />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conferences/create"
          element={
            <ProtectedRoute>
              <CreateConference />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conferences/:id/edit"
          element={
            <ProtectedRoute>
              <EditConference />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conferences/:id"
          element={
            <ProtectedRoute>
              <ConferenceDetails />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            INSTITUTIONS
        ==================================================== */}

        <Route
          path="/institutions"
          element={
            <ProtectedRoute>
              <Institutions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institutions/create"
          element={
            <ProtectedRoute>
              <CreateInstitution />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institutions/edit/:id"
          element={
            <ProtectedRoute>
              <EditInstitution />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institutions/:id"
          element={
            <ProtectedRoute>
              <InstitutionDetails />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            SEARCH
        ==================================================== */}

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            USER MANAGEMENT
        ==================================================== */}

        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            CITATIONS
        ==================================================== */}

        <Route
          path="/citations"
          element={
            <ProtectedRoute>
              <Citations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citations/create"
          element={
            <ProtectedRoute>
              <CreateCitation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citations/edit/:id"
          element={
            <ProtectedRoute>
              <EditCitation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citations/:id"
          element={
            <ProtectedRoute>
              <CitationDetails />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            COLLABORATION
        ==================================================== */}

        <Route
          path="/collaboration"
          element={
            <ProtectedRoute>
              <Collaboration />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            REVIEWER
        ==================================================== */}

        <Route
          path="/reviewer"
          element={
            <ProtectedRoute>
              <ReviewerDashboard />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            SYSTEM ADMIN
        ==================================================== */}

        {/*
          /admin/users

          Protected by TWO layers:

          1. ProtectedRoute
             -> must be logged in

          2. SystemAdminRoute
             -> must be SYSTEM_ADMIN

          Therefore:

              SYSTEM_ADMIN
                    ↓
              AdminUsers

              RESEARCHER
                    ↓
              /dashboard

              INSTITUTION_ADMIN
                    ↓
              /dashboard
        */}

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <SystemAdminRoute>
                <AdminUsers />
              </SystemAdminRoute>
            </ProtectedRoute>
          }
        />

      {/* ====================================================
          INSTITUTION ADMIN
      ==================================================== */}

        <Route
          path="/admin/institution"
          element={
            <ProtectedRoute>
              <InstitutionAdminRoute>
                <InstitutionAdminUsers />
              </InstitutionAdminRoute>
            </ProtectedRoute>
          }
        />

        {/* ====================================================
            ADMIN SHORTCUT
        ==================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <SystemAdminRoute>
                <AdminUsers />
              </SystemAdminRoute>
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            FALLBACK
        ==================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;