import React from "react";
import "./admin.css";
import NOUSER from "../../assets/noUser.png";
import { useUser } from "../../auth";
import { useNavigate } from "react-router-dom";

const AdminLogin = ({
  handleLogIn,
  inputUsername,
  inputPassword,
  setInputUsername,
  setInputPassword,
  error,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="admin_login_no_user Flex" onClick={() => navigate("/login")}>
        <img src={NOUSER} alt="noUser" />
        <p>Please log in to the website first.</p>
      </div>
    );
  }

  return (
    <div className="admin_login Flex">
      <div className="admin_login_form Flex">
        <h2>Login</h2>
        <form className="Flex" onSubmit={handleLogIn}>
          <input
            type="text"
            placeholder="Username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            autoComplete="off"
          />
          <button type="submit">Submit</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
