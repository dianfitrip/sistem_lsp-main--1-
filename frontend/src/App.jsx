import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import About from "./pages/public/About";
import Complaint from "./pages/public/Complaint";
import FAQ from "./pages/public/FAQ";
import Information from "./pages/public/Information";
import Profile from "./pages/public/Profile";
import Registration from "./pages/public/Registration";
import Surveillance from "./pages/public/Surveillance";

/* ================= ADMIN PAGES ================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import DokumenMutu from "./pages/admin/DokumenMutu";
import IA01Observasi from "./pages/admin/IA01Observasi";
import IA03Pertanyaan from "./pages/admin/IA03Pertanyaan";
import JadwalUji from "./pages/admin/JadwalUji";
import Notifikasi from "./pages/admin/Notifikasi";
import Pengaduan from "./pages/admin/Pengaduan";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import Skema from "./pages/admin/Skema";
import Skkni from "./pages/admin/Skkni";
import TempatUji from "./pages/admin/TempatUji";
import UnitKompetensi from "./pages/admin/UnitKompetensi";
import VerifikasiPendaftaran from "./pages/admin/VerifikasiPendaftaran";
import Asesor from "./pages/admin/Asesor";

/* ================= ROLE GUARD ================= */

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const ProtectedRoute = ({ children, role }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role?.toLowerCase() !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/information" element={<Information />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/surveillance" element={<Surveillance />} />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/dokumen-mutu" element={<ProtectedRoute role="admin"><DokumenMutu /></ProtectedRoute>} />
        <Route path="/admin/ia01-observasi" element={<ProtectedRoute role="admin"><IA01Observasi /></ProtectedRoute>} />
        <Route path="/admin/ia03-pertanyaan" element={<ProtectedRoute role="admin"><IA03Pertanyaan /></ProtectedRoute>} />
        <Route path="/admin/jadwal-uji" element={<ProtectedRoute role="admin"><JadwalUji /></ProtectedRoute>} />
        <Route path="/admin/notifikasi" element={<ProtectedRoute role="admin"><Notifikasi /></ProtectedRoute>} />
        <Route path="/admin/pengaduan" element={<ProtectedRoute role="admin"><Pengaduan /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute role="admin"><ProfileAdmin /></ProtectedRoute>} />
        <Route path="/admin/skema" element={<ProtectedRoute role="admin"><Skema /></ProtectedRoute>} />
        <Route path="/admin/skkni" element={<ProtectedRoute role="admin"><Skkni /></ProtectedRoute>} />
        <Route path="/admin/tempat-uji" element={<ProtectedRoute role="admin"><TempatUji /></ProtectedRoute>} />
        <Route path="/admin/unit-kompetensi" element={<ProtectedRoute role="admin"><UnitKompetensi /></ProtectedRoute>} />
        <Route path="/admin/verifikasi" element={<ProtectedRoute role="admin"><VerifikasiPendaftaran /></ProtectedRoute>} />
        <Route path="/admin/asesor" element={<ProtectedRoute role="admin"><Asesor /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}