import React from "react";
import "./admin.css";

const AdminLogin = ({
  handleLogIn,
  inputUsername,
  inputPassword,
  setInputUsername,
  setInputPassword,
  error,
}) => {
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
