import "./App.css";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import Home from "./Components/Home/Home";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Signin from "./Components/Signin/Signin";
import Login from "./Components/Login/Login";
import Gallery from "./Components/Gallery/Gallery";
import { UserProvider } from "./auth";
import HostForm from "./Components/HostForm/HostForm";
import Host from "./Components/Host/Host";
import Admin from "./Components/Admin/Admin";
import AdminEventPage from "./Components/Admin/AdminEventPage";
import Contact from "./Components/Contact/Contact";
import About from "./Components/About/About";

function App() {



  return (
    <BrowserRouter>
      <UserProvider>
        <MainLayout />
      </UserProvider>
    </BrowserRouter>
  );
}

const MainLayout = () => {
  return (
    <div>
      <HeaderFooterWrapper>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/gallery/:id" element={<Gallery />} />
          <Route path="/host/:userId" element={<HostForm />} />
          <Route path="/host/:userId/:functionID" element={<Host />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/:userId" element={<AdminEventPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </HeaderFooterWrapper>
    </div>
  );
};

const HeaderFooterWrapper = ({ children }) => {
  const location = useLocation();
  const isLoginRoute =
    location.pathname === "/signin" || location.pathname === "/login";

  return (
    <>
      {!isLoginRoute && <Header />}
      {children}
      {!isLoginRoute && <Footer />}
    </>
  );
};

export default App;
