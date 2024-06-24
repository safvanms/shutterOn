import React from "react";
import "./contact.css";
import { IoMdCall } from "react-icons/io";
import { IoMail } from "react-icons/io5";
// import Logo from "../../assets/fullLogo.jpeg";

const Contact = () => {
  return (
    <div className="contact Flex">
      <h1>Contact us</h1>
      {/* <img src={Logo} alt="logo" /> */}
      <div className="address Flex">
        <h4>Address</h4>
        <p>ShutterOn.</p>
        <p>Perinthalmanna</p>
        <p>Malappuram dt. Kerala, India .</p>
        <p>Zip code : 679322</p>
      </div>
      <div className="contact_items Flex">
        <div className="contact_items_options Flex">
          <IoMdCall size={15} />
          <p>+91 755 88 642 66</p>
        </div>
        <div className="contact_items_options Flex">
          <IoMail size={15} />
          <p>muhammedsafvan1ms@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
