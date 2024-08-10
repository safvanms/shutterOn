import React, { useState, useEffect } from "react";
import "./admin.css";
import AdminLogin from "./AdminLogin";
import axios from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import AdminTabs from "./AdminTabs";
import AdminDashboard from "./AdminDashboard";
import AdminTable from "./AdminTable";

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
  const [tab, setTab] = useState("dashboard");

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

  const eventHostedUsers = users.filter((user) => user.events.length > 0);

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
    <div className="admin Flex">
      {/* {logged && (
        <div className="admin_header">
          <h1>shutterOn Admin</h1>
        </div>
      )} */}
      {logged ? (
        <>
          <div className="tabs_container Flex">
            <AdminTabs tab={tab} setTab={setTab} />
          </div>

          {tab === "dashboard" && (
            <AdminDashboard
              currentItems={currentItems}
              getTotalUploads={getTotalUploads}
              eventHostedUsers={eventHostedUsers}
              users={users}
            />
          )}

          {tab === "table" && (
            <>
              <div className="filter_table">
                <input
                  type="text"
                  placeholder="Filter by name/mail/userId"
                  value={filter}
                  onChange={handleFilterChange}
                />
              </div>

              <AdminTable
                loading={loading}
                currentItems={currentItems}
                firstIndex={firstIndex}
                hasGalleryItems={hasGalleryItems}
                handleOpenEvents={handleOpenEvents}
                handleFreezeToggle={handleFreezeToggle}
                handleLogoutAdmin={handleLogoutAdmin}
                paginate={paginate}
                currentPage={currentPage}
                totalPages={totalPages}
                lastIndex={firstIndex}
                filteredUsers={filteredUsers}
              />
            </>
          )}
        </>
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
    </div>
  );
};

export default Admin;
