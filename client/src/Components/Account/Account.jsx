import React, { useState, useEffect } from "react";
import "./account.css";
import { useNavigate } from "react-router-dom";
import axios from "../../axiosInstance";
import Loader from "../Loader/Loader";

const Account = ({ isOpen, closeModal, logout, userId }) => {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`/user/${userId}`);
        setUserData(userResponse.data);
        setEvents(userResponse.data.events);

        // fetching froze status

        const userDetailResponse = await axios.get(`/users/${userId}`);
        console.log(userDetailResponse);
        setUser(userDetailResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
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

  //show only paid events
  const paidEvents = events.filter((item) => item.paymentStatus === true);

  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content Flex">
        <span className="close" onClick={closeModal}>
          &times;
        </span>

        {userData && (
          <>
            <div className="user_account_details">
              <div className="account_name_mail Flex">
                <h3 style={{ textTransform: "capitalize" }}>
                  {userData.name || "Name is not provided"}
                </h3>
                <p> {userData.email || "Email is not provided"}</p>
              </div>
              <div className="account_details Flex">
                <p>Phone : {userData.phone || "Phone number not provided"}</p>
                <p>Id : {userData.userId || "N/A"}</p>
              </div>
            </div>
          </>
        )}

        <div className="account_btns">
          {!userData || !user ? (
            <Loader />
          ) : (
            <div className="btns Flex">
              {!user.frozen && paidEvents.length > 0 && (
                <select onChange={handleEventSelect} className="account_select">
                  <option>Previous Events</option>
                  {!user.frozen &&
                    paidEvents.map((event) => (
                      <option key={event.functionID} value={event.functionID}>
                        {event.functionName} -{" "}
                        {new Date(event.functionDate).toLocaleDateString()}
                      </option>
                    ))}
                </select>
              )}

              {!user.frozen && !window.location.pathname.includes("/host") && (
                <button className="host_btn" onClick={() => handleHost(userId)}>
                  Host a new Function
                </button>
              )}

              {user.frozen && (
                <p className="frozen_message">
                 Sorry , Your account has been frozen, contact us !
                </p>
              )}

              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
