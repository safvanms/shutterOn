import React, { useEffect } from "react";
import "./about.css";
import Logo from "../../assets/fullLogo.jpeg";

const About = () => {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  return (
    <div className="about Flex">
      <h1>About us</h1>
      <div className="about_note Flex">
        <p>
          ShutterOn is your ultimate photography companion, offering seamless
          event management and photo-sharing solutions. Our platform enables
          users to organize events, upload galleries, and share memories
          effortlessly. With robust admin controls, secure cloud storage, and
          intuitive user interfaces, ShutterOn is designed to make capturing and
          sharing life's moments easier and more enjoyable.
        </p>
        <p>
          We prioritize user experience and data security, ensuring your photos
          are safely stored and easily accessible. ShutterOn supports dynamic
          photo uploads, event-specific galleries, and responsive customer
          support. Whether you're hosting a wedding, birthday, or corporate
          event, our platform enhances your ability to preserve and celebrate
          memories. Join ShutterOn and transform how you experience and share
          special occasions.
        </p>
      </div>

      <div className="other_details Flex">
        <p>Privacy policy</p>
        <p>Terms & Conditions</p>
      </div>

      <img src={Logo} alt="logo" />
    </div>
  );
};

export default About;
