import { Outlet } from "react-router-dom";
import RecruiterNavbar from "./RecruiterNavbar.jsx";

const RecruiterLayout = () => {
  return (
    <>
      <RecruiterNavbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default RecruiterLayout;
