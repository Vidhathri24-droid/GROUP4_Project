import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Researchers from "./pages/researchers/Researchers";
import Institutions from "./pages/Institutions";
import Publications from "./pages/Publications";
import CreatePublication from "./pages/CreatePublication";
import EditPublication from "./pages/EditPublication";
import PublicationDetails from "./pages/PublicationDetails";
import CreateResearcher from "./pages/researchers/CreateResearcher";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />



        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researchers"
          element={
            <ProtectedRoute>
              <Researchers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institutions"
          element={
            <ProtectedRoute>
              <Institutions />
            </ProtectedRoute>
          }
        />

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

	<Route
    path="/researchers/create"
    element={
        <ProtectedRoute>
            <CreateResearcher />
        </ProtectedRoute>
    }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
