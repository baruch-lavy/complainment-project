import { Routes, Route, BrowserRouter } from "react-router";

//pages
import { HomePage } from "./pages/HomePage";
import { SubmitComplaint } from "./pages/SubmitComplaintPage";
import { AdminComplaints } from "./pages/AdminComplaintsPage";
import { AdminLogin } from "./pages/AdminLoginPage";
import { ErrorPage } from "./pages/ErrorPage";

//cmps
import { ProtectedRoute } from "./components/ProtectedRoute";

export function RootCmp() {
  return (
    <div className="main-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submitComplaint" element={<SubmitComplaint />} />
          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/AdminComplaints" element={<AdminComplaints />} />
          </Route>
          <Route path="/ErrorPage" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
