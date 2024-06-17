import React, { useState } from "react";
import "./header.css";
import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth";
import Account from "../Account/Account";

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
  }


  return (
    <div className="header Flex">
      <div className="logo_Container Flex" onClick={() => navigate("/")}>
        <img src={Logo} alt="logo" className="logo" />
        <h1>
          shutter<span>On</span>
        </h1>
      </div>
      <>
        {user ? (
          <>
            <h3 className="login_btn" onClick={handleOpenAccount}>
              {firstName}
            </h3>
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
