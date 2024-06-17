import React, { useState, useEffect } from "react";
import "./account.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Account = ({ isOpen, closeModal, logout, userId }) => {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        setUserData(response.data);
        setEvents(response.data.events);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    closeModal();
  };

  const handleHost = (ID) => {
    navigate(`/host/${ID}`);
    closeModal();
  };

  const handleEventSelect = (e) => {
    const selectedEventId = e.target.value;
    if (selectedEventId) {
      navigate(`/host/${userId}/${selectedEventId}`);
      closeModal();
    }
  };

  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        {userData && (
          <>
            <h2 style={{ textTransform: "capitalize" }}>{userData.name}</h2>
            <div className="account_details Flex">
              <p>Email: {userData.email || "Email not provided"}</p>
              <p>Phone: {userData.phone || "Phone number not provided"}</p>
            </div>
          </>
        )}

        {!userData && <p>Loading...</p>}

        <div className="btns Flex">
          <select onChange={handleEventSelect} className="account_select">
            <option value="">Go to Previous Events</option>
            {events.map((event) => (
              <option key={event.functionID} value={event.functionID}>
                {event.functionName} -{" "}
                {new Date(event.functionDate).toLocaleDateString()}
              </option>
            ))}
          </select>

          {!window.location.pathname.includes("/host") && (
            <button className="host_btn" onClick={() => handleHost(userId)}>
              Host a new Function
            </button>
          )}
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
