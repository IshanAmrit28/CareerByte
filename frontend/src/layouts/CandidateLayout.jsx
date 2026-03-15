import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const CandidateLayout = () => {
  const location = useLocation();

  const hideNavbar = [
    "/practice/",
    "/solve/",
    "/interview",
    "/assessment/"
  ].some(path => location.pathname.includes(path));

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
