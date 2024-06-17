import React, { useState } from "react";
import "./signin.css";
import { BiShowAlt, BiHide } from "react-icons/bi";
import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../auth";

const Signin = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useUser();

  const handleShowPassword = () => {
    setShow(!show);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") setName(value);
    if (name === "phone") setPhone(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[0-9]).{8,}$/; // At least one number and at least 8 characters long
    return re.test(password);
  };

  const validatePhone = (phone) => {
    const re = /^\d{10}$/; // Exactly 10 digits
    return re.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formErrors = {};

    // Validate email
    if (!validateEmail(email)) {
      formErrors.email = "Invalid email address";
    }

    // Validate phone number
    if (!validatePhone(phone)) {
      formErrors.phone = "Phone number must be 10 digits";
    }

    // Validate password
    if (!validatePassword(password)) {
      formErrors.password =
        "Password must contain a number and be at least 8 characters long";
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    const userId = new Date().getTime();

    try {
      const response = await axios.post("http://localhost:3001/users", {
        userId,
        name,
        phone,
        email,
        password,
      });

      const userData = {
        userId:response.data.userId,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
      };

      login(userData);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Signin Error:", error);
      if (error.response && error.response.data.error) {
        setErrors({ server: error.response.data.error });
      } else {
        setErrors({ server: "An error occurred. Please try again." });
      }
    }
  };

  return (
    <div className="signin Flex">
      <img src={Logo} alt="logo" className="logo" />
      <div className="signin_form_container Flex">
        <h2>Sign In</h2>
        <form className="signin_form Flex" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Enter your Name"
              value={name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={phone}
              onChange={handleChange}
              required
            />
          </div>
          {errors.phone && <span className="error">{errors.phone}</span>}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>
          {errors.email && <span className="error">{errors.email}</span>}
          <div className="Flex">
            <input
              type={show ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              value={password}
              onChange={handleChange}
              required
            />
            <span onClick={handleShowPassword} className="show">
              {show ? <BiShowAlt /> : <BiHide />}
            </span>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
          {errors.server && <span className="error">{errors.server}</span>}
          <button type="submit">Submit</button>

          <p className="sign_btn">
            Already have an Account ?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signin;
