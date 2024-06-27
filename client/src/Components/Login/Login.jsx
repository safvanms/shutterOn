import React, { useEffect, useState } from "react";
import "./login.css";
import Logo from "../../assets/logo.png";
import { BiHide, BiShowAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth";
import axios from "../../axiosInstance";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [verify, setVerify] = useState(false);

  const navigate = useNavigate();
  const { login, user } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleShowPassword = () => {
    setShow(!show);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerify(true);
    try {
      const response = await axios.post("/login", {
        email,
        password,
      });

      if (response.data.success) {
        const userData = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
        };

        login(userData);
        navigate("/", { replace: true });
      } else {
        setErrors(response.data);
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        // Handle error response from server
        if (error.response.status === 401) {
          setErrors("The Password is incorrect");
          setVerify(false);
        } else if (error.response.status === 404) {
          setErrors("Oops! No Account exists with this email");
          setVerify(false);
        } else {
          setErrors("An error occurred. Please try again.");
          setVerify(false);
        }
      } else {
        setErrors("An error occurred. Please try again.");
        setVerify(false);
      }
    }
  };

  return (
    <div className="signin Flex">
      <img src={Logo} alt="logo" className="logo" />
      <div className="signin_form_container Flex">
        <h2> Login </h2>
        <form className="signin_form Flex" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter email "
              value={email}
              onChange={handleChange}
              required
            />
          </div>

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

          {errors ? <span className="error">{errors}</span> : ""}

          <button type="submit">{verify ? "Verifying" : "Submit"}</button>
          <p className="sign_btn">
            Don't have an Account ?{" "}
            <span onClick={() => navigate("/signup")}> Sign Up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
