import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const CandidateLayout = () => {
  const location = useLocation();

  const isLanding = location.pathname === "/";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);
  const isInterview = location.pathname.startsWith("/interview");
  const hideNavbar = isLanding || isInterview || isAuthPage;

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
