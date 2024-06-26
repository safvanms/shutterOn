import React, { useState, useEffect } from "react";
import "./admin.css";
import AdminLogin from "./AdminLogin";
import axios from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

const userName = "shutterOn@1";
const password = "shutterOn@1";
const EXPIRATION_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const ITEMS_PER_PAGE = 8;

const Admin = () => {
  const [logged, setLogged] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // window.scrollTo(0, 0);
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
  }, [users]);

  useEffect(() => {
    if (logged) {
      setLoading(true);
      axios
        .get("/users")
        .then((response) => setUsers(response.data))
        .catch((error) => console.error("Error fetching users:", error))
        .finally(() => setLoading(false));
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
    setCurrentPage(1);
  };

  // filter users

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.userId.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  const eventHostedUsers = users.filter((user) => user.events.length > 0);

  // Calculate pagination variables
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const lastIndex = currentPage * ITEMS_PER_PAGE;
  const firstIndex = lastIndex - ITEMS_PER_PAGE;
  const currentItems = filteredUsers.slice(firstIndex, lastIndex);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const hasGalleryItems = (events) => {
    return events.reduce(
      (count, event) => count + (event.gallery ? event.gallery.length : 0),
      0
    );
  };

  // to get total uploads

  const getTotalUploads = (users) => {
    return users.reduce((total, user) => {
      return (
        total +
        user.events.reduce((count, event) => {
          return count + (event.gallery ? event.gallery.length : 0);
        }, 0)
      );
    }, 0);
  };

  const handleFreezeToggle = (userId, currentFrozenState) => {
    const confirmationMessage = currentFrozenState
      ? "Are you sure you want to unfreeze this user?"
      : "Are you sure you want to freeze this user?";

    const confirmed = window.confirm(confirmationMessage);
    if (confirmed) {
      axios
        .post(`/users/${userId}/toggleFreeze`)
        .then((response) => {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.userId === userId
                ? { ...user, frozen: response.data.frozen }
                : user
            )
          );
        })
        .catch((error) => {
          console.error("Error toggling freeze state:", error);
        });
    }
  };

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
              placeholder="Filter by name/mail/userId"
              value={filter}
              onChange={handleFilterChange}
            />
          </div>

          {currentItems.length > 0 && (
            <div className="admin_user_details Flex">
              <div>
                <p>Total Users </p>
                <strong>{users.length}</strong>
              </div>
              <div>
                {" "}
                <p>Hosted users </p>
                <strong>{eventHostedUsers.length}</strong>
              </div>
              <div>
                <p>Total uploads </p>
                <strong>{getTotalUploads(users)}</strong>
              </div>
            </div>
          )}

          <div className="admin_table">
            {loading ? (
              <Loader message={"please wait..."} />
            ) : currentItems.length === 0 ? (
              <p>No user found !</p>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Sl no</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Password</th>
                      <th>UserID</th>
                      <th>Uploads</th>
                      <th>Events</th>
                      <th>Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((user, index) => (
                      <tr key={user.userId}>
                        <td>{firstIndex + index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <input
                            className="admin_password_input"
                            value={user.password}
                            type="password"
                            onMouseEnter={(e) => {
                              e.target.type = "text";
                            }}
                            onMouseLeave={(e) => {
                              e.target.type = "password";
                            }}
                            readOnly
                          />
                        </td>
                        <td>{user.userId}</td>
                        <td>{hasGalleryItems(user.events)}</td>
                        <td>
                          {user.events.length > 0 ? (
                            <button
                              className="event_show_button"
                              onClick={() => handleOpenEvents(user.userId)}
                            >
                              View{" "}
                              {user.events.length === 1
                                ? user.events.length + " Event "
                                : user.events.length + " Events "}
                            </button>
                          ) : (
                            <p className="no_event">No events</p>
                          )}
                        </td>
                        <td>
                          <button
                            className={`${user.frozen ? "unfreeze" : "freeze"}`}
                            onClick={() =>
                              handleFreezeToggle(user.userId, user.frozen)
                            }
                          >
                            {user.frozen ? "Unfreeze" : "Freeze"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination Flex">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  &nbsp; {currentPage} of {totalPages}
                  &nbsp;
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={lastIndex >= filteredUsers.length}
                  >
                    Next
                  </button>
                </div>

                <button className="logout_admin" onClick={handleLogoutAdmin}>
                  Logout Admin
                </button>
              </>
            )}
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
