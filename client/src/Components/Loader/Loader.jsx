import React from "react";
import "./loader.css";
import logo from '../../assets/logo.svg'

const Loader = ({ message }) => {
  return (
    <div className="loader-overlay Flex">
      <div className="loader Flex">
        <img src={logo} className="loader_svg" alt="logo" />
      </div>
      <p>{message}</p>
    </div>
  );
};

export default Loader;
