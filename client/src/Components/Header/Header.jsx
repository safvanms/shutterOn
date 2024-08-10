import React, { useState } from "react";
import "./header.css";
import logo from "../../assets/shutterOnLogo.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth";
import Account from "../Account/Account";
import USER from "../../assets/user.svg";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleOpenAccount = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  let firstName = "";

  if (user && user.name) {
    const nameParts = user.name.split(" ");
    firstName = nameParts[0];
    console.log(firstName);
  }

  return (
    <div className="header Flex">
      <div className="logo_Container Flex" onClick={() => navigate("/")}>
        <img src={logo} alt="logo" className="logo" />
        {window.location.pathname.includes('admin') && (
          <div className="admin_header">
            <h2>Admin</h2>
          </div>
        )}
      </div>
      <>
        {user ? (
          <>
            <div className="login_btn" onClick={handleOpenAccount}>
              <img src={USER} alt="user" />
            </div>
            {isModalOpen && (
              <Account
                isOpen={isModalOpen}
                userId={user.userId} // Pass the userId as a prop
                closeModal={handleCloseModal}
                logout={logout}
              />
            )}
          </>
        ) : (
          <h3 className="login_btn" onClick={handleLoginClick}>
            Login
          </h3>
        )}
      </>
    </div>
  );
};

export default Header;
