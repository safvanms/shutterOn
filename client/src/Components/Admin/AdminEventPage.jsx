import axios from "axios";
import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../Loader/Loader";

const AdminEventPage = () => {
  const [showData, setShowData] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { userId } = useParams();
  const { state } = useLocation();
  const events = state ? state.events : [];

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const loggedIn = localStorage.getItem("logged");

    if (!loggedIn) {
      navigate("/admin");
    }

    if (showData) {
      setIsLoading(true);
      axios
        .get(`http://localhost:3001/hosts/${showData.functionID}`)
        .then((response) => {
          setEventDetails(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching function data:", error);
          setIsLoading(false);
        });
    }
  }, [deleted, showData,navigate]);

  const handleEventSelect = (e) => {
    const selectedEventId = e.target.value;
    if (selectedEventId) {
      const selectedEvent = events.find(
        (event) => event.functionID === selectedEventId
      );
      setShowData(selectedEvent);
    } else {
      setShowData(null);
      setEventDetails(null);
    }
  };

  const handleDeletePhoto = (photoUrl) => {
    const confirmed = window.confirm(
      "This photo will be deleted permanently from the Server"
    );
    if (confirmed) {
      setIsLoading(true);
      axios
        .delete(
          `http://localhost:3001/delete-photo/${userId}/${
            showData.functionID
          }/${encodeURIComponent(photoUrl)}`
        )
        .then(() => {
          // Update eventDetails state by filtering out the deleted photo
          setEventDetails((prevEventDetails) => ({
            ...prevEventDetails,
            gallery: prevEventDetails.gallery.filter(
              (photo) => photo !== photoUrl
            ),
          }));
          setDeleted(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error deleting photo:", error);
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="a_user_events Flex">
      <div className="a_user_events_header Flex">
        <select onChange={handleEventSelect} className=" admin_event_select">
          <option value="">Select Hosted Event</option>
          {events?.map((event) => (
            <option key={event.functionID} value={event.functionID}>
              {event.functionName} -{" "}
              {new Date(event.functionDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <Loader />}

      <div className="event_details">
        {eventDetails ? (
          <>
            <div className="a_event_details_heading Flex">
              <div>
                <h2>{eventDetails.functionName}</h2>
                <p>
                  Date :{" "}
                  {new Date(eventDetails.functionDate).toLocaleDateString()}
                  &nbsp; at {eventDetails.place}
                </p>
              </div>
              <div>
                <p>Event ID : {eventDetails.functionID}</p>
                <p>Hosted : {eventDetails.hostingTeam}</p>
              </div>
            </div>

            <div className="a_users_event_gallery Flex">
              {eventDetails.gallery && eventDetails.gallery.length > 0 ? (
                eventDetails.gallery.map((photo, index) => (
                  <div className="added_image" key={index}>
                    <img
                      src={photo}
                      alt={`Event ${index}`}
                      className="photo"
                      loading="lazy"
                    />
                    <div
                      className="delete_added_image"
                      onClick={() => handleDeletePhoto(photo)}
                    >
                      <MdDelete size={20} color="white" />
                    </div>
                  </div>
                ))
              ) : (
                <p>No photos available for this event.</p>
              )}
            </div>
          </>
        ) : (
          <p>Please select an event to see the details and photos.</p>
        )}
      </div>
    </div>
  );
};

export default AdminEventPage;
