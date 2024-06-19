import React from "react";
import "./loader.css";

const Loader = ({message}) => {
  return (
    <div className="loader-overlay Flex">
      <div className="loader"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loader;
