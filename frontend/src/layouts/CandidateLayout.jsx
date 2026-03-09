import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const CandidateLayout = () => {
  const location = useLocation();

  const isInterview = location.pathname.startsWith("/interview");
  const hideNavbar = isInterview;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={!hideNavbar ? "main-content" : ""}>
        <Outlet />
      </main>
    </>
  );
};

export default CandidateLayout;
