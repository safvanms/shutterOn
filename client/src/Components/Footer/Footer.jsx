import React from "react";
import "./footer.css";
import { Link } from "react-router-dom";

const year = new Date().getFullYear();

const Footer = () => {
  return (
    <div className="footer Flex">
      <div>
        <Link to={"/about"} style={{ color: "#ffff", textDecoration: "none" }}>
          <p>About us</p>
        </Link>
        <Link
          to={"/contact"}
          style={{ color: "#ffff", textDecoration: "none" }}
        >
          <p>Contact us</p>
        </Link>
      </div>
      <p className="copyright">&copy; {year} shutterOn. All rights reserved.</p>
    </div>
  );
};

export default Footer;
