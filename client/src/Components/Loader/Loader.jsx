import React from "react";
import "./loader.css";
import Logo from "../../assets/logo.png";

const Loader = ({ message }) => {
  return (
    <div className="loader-overlay Flex">
      <div className="loader Flex">
        <img src={Logo} alt="logo" />
      </div>
      <p>{message}</p>
    </div>
  );
};

export default Loader;
