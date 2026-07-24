import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Navbar & Protection
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Researchers
import Researchers from "./pages/researchers/Researchers";
import CreateResearcher from "./pages/researchers/CreateResearcher";

// Publications
import Publications from "./pages/Publications";
import CreatePublication from "./pages/CreatePublication";
import EditPublication from "./pages/EditPublication";
import PublicationDetails from "./pages/PublicationDetails";

// Conferences
import Conferences from "./pages/conferences/Conferences";
import CreateConference from "./pages/conferences/CreateConference";
import EditConference from "./pages/conferences/EditConference";
import ConferenceDetails from "./pages/conferences/ConferenceDetails";

// Institutions
import Institutions from "./pages/institutions/Institutions";
import CreateInstitution from "./pages/institutions/CreateInstitution";
import EditInstitution from "./pages/institutions/EditInstitution";
import InstitutionDetails from "./pages/institutions/InstitutionDetails";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* ================= Public Routes ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        {/* ================= Dashboard ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= Researchers ================= */}

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

        {/* ================= Publications ================= */}

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
          path="/publications/:id"
          element={
            <ProtectedRoute>
              <PublicationDetails />
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

        {/* ================= Conferences ================= */}

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
          path="/conferences/:id"
          element={
            <ProtectedRoute>
              <ConferenceDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conferences/edit/:id"
          element={
            <ProtectedRoute>
              <EditConference />
            </ProtectedRoute>
          }
        />

        {/* ================= Institutions ================= */}

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
          path="/institutions/:id"
          element={
            <ProtectedRoute>
              <InstitutionDetails />
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
