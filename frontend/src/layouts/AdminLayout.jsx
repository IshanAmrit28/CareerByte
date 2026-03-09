import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar.jsx";

const AdminLayout = () => {
  return (
    <>
      <AdminNavbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default AdminLayout;
