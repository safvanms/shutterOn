import React, { useEffect, useState } from "react";
import "./hostform.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function HostForm() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    functionName: "",
    functionDate: "",
    place: "",
    provider: "",
    functionID: "",
    hostingTeam: "",
    phoneNumber: "",
    gallery: [],
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userData) {
      console.error("User data not available");
      return;
    }

    const newEvent = { ...formData };

    // Check if the entered function ID already exists
    axios
      .get(`http://localhost:3001/events/check-function-id/${newEvent.functionID}`)
      .then((response) => {
        // If function ID is available, proceed to add the event
        axios
          .post(`http://localhost:3001/users/${userId}/events`, newEvent)
          .then((response) => {
            console.log("Event added successfully:", response.data);
            navigate(`/host/${userId}/${response.data.functionID}`);
          })
          .catch((error) => {
            console.error("Error adding event:", error);
            const errorMessage =
              (error.response && error.response.data && error.response.data.error) ||
              "An error occurred while adding the event. Please try again.";
            alert(errorMessage);
          });
      })
      .catch((error) => {
        console.error("Error checking function ID:", error);
        const errorMessage =
          (error.response && error.response.data && error.response.data.error) ||
          "An error occurred while checking the Function ID. Please try again.";
        alert(errorMessage);
      });
  };


  return (
    <div className="host_form_container Flex">
      <h2>Host a function</h2>
      <form className="host_form Flex" onSubmit={handleSubmit}>
        <div className="inputs Flex">
          <label htmlFor="functionName">Function Name *</label>
          <input
            type="text"
            name="functionName"
            value={formData.functionName}
            onChange={handleChange}
            placeholder="Jon weds Tessa"
            required
          />
          <label htmlFor="functionDate">Function Date *</label>
          <input
            type="date"
            name="functionDate"
            value={formData.functionDate}
            onChange={handleChange}
            placeholder="Function Date"
            required
          />
          <label htmlFor="place">Location *</label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            placeholder="Calicut"
            required
          />
          <label htmlFor="provider">Name of Groom / Provider</label>
          <input
            type="text"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            placeholder="Mr. Thomas"
          />
        </div>
        <div className="inputs Flex">
          <label htmlFor="functionID">Enter Function ID *</label>
          <input
            type="text"
            name="functionID"
            value={formData.functionID}
            onChange={handleChange}
            placeholder="jon_weds_tessa0123"
            required
          />
          <label htmlFor="hostingTeam">Hosting Team / Person *</label>
          <input
            type="text"
            name="hostingTeam"
            value={formData.hostingTeam}
            onChange={handleChange}
            placeholder="ABC Photographers"
            required
          />
          <label htmlFor="phoneNumber">Phone Number (Company / Person) *</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="9876543210"
            required
          />
          <button type="submit" className="submit_form">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default HostForm;
