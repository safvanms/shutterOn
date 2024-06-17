import React, { useState, useEffect } from "react";
import { useUser } from "../../auth"; // Adjust the import path as necessary
import "./admin.css";
import AdminLogin from "./AdminLogin";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NOUSER from "../../assets/noUser.png";

const userName = "shutterOn@1";
const password = "shutterOn@1";
const EXPIRATION_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const Admin = () => {
  const { user } = useUser();
  const [logged, setLogged] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState(""); // State for filtering the users

  const navigate = useNavigate();

  useEffect(() => {
    const storedLogged = localStorage.getItem("logged");
    const storedExpiration = localStorage.getItem("expiration");

    if (storedLogged && storedExpiration) {
      const expirationTime = parseInt(storedExpiration, 10);
      const currentTime = Date.now();

      if (currentTime < expirationTime) {
        setLogged(true);
      } else {
        localStorage.removeItem("logged");
        localStorage.removeItem("expiration");
      }
    }
  }, []);

  useEffect(() => {
    if (logged) {
      axios
        .get("http://localhost:3001/users")
        .then((response) => setUsers(response.data))
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [logged]);

  const handleLogIn = (e) => {
    e.preventDefault();
    if (inputUsername === userName && inputPassword === password) {
      setLogged(true);
      setError("");
      const expirationTime = Date.now() + EXPIRATION_TIME;
      localStorage.setItem("logged", true);
      localStorage.setItem("expiration", expirationTime.toString());
    } else {
      setError("Invalid username or password");
    }
  };

  const handleLogoutAdmin = () => {
    navigate("/", { replace: true });
    localStorage.removeItem("logged");
    localStorage.removeItem("expiration");
  };

  const handleOpenEvents = (ID) => {
    const userEvents = users.find((user) => user.userId === ID)?.events || [];
    navigate(`/admin/${ID}`, { state: { events: userEvents } });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (!user) {
    return (
      <div className="admin_login_no_user Flex" onClick={navigate("/")}>
        <img src={NOUSER} alt="noUser" />
        <h2>Please log in to the website first.</h2>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.userId.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  const eventHostedUsers = users.filter((user) => user.events.length > 0);

  return (
    <>
      {logged ? (
        <div className="admin Flex">
          <div className="admin_header">
            <h1>shutterOn Admin</h1>
          </div>

          <div className="filter_table">
            <input
              type="text"
              placeholder="UserName/mail/userId"
              value={filter}
              onChange={handleFilterChange}
            />
          </div>

          <div className="admin_table">
            {filteredUsers.length === 0 ? (
              <p style={{ marginTop: "100px" }}>Oops! No user found !</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Sl no</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Password</th>
                    <th>UserID</th>
                    <th>Events</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.userId}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.password}</td>
                      <td>{user.userId}</td>
                      <td>
                        {user.events.length > 0 ? (
                          <button onClick={() => handleOpenEvents(user.userId)}>
                            View {user.events.length} Events
                          </button>
                        ) : (
                          user.events.length + " Events"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="admin_user_details Flex">
              <p>
                Event hosted <strong>{eventHostedUsers.length}</strong> out of{" "}
                <strong>{users.length}</strong> users
              </p>
              <button className="logout" onClick={handleLogoutAdmin}>
                Logout Admin
              </button>
            </div>
          </div>
        </div>
      ) : (
        <AdminLogin
          handleLogIn={handleLogIn}
          inputUsername={inputUsername}
          inputPassword={inputPassword}
          setInputUsername={setInputUsername}
          setInputPassword={setInputPassword}
          error={error}
        />
      )}
    </>
  );
};

export default Admin;
