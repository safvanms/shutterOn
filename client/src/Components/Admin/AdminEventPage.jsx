import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const AdminEventPage = () => {
  const [showData, setShowData] = useState(null);

  const { state } = useLocation();
  const events = state ? state.events : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEventSelect = (e) => {
    const selectedEventId = e.target.value;
    if (selectedEventId) {
      const itemToBeShowed = events.find(
        (item) => item.functionID === selectedEventId
      );
      setShowData(itemToBeShowed);
    } else {
      setShowData(null);
    }
  };

  return (
    <div className="a_user_events Flex">
      <div className="a_user_events_header Flex">
        <select onChange={handleEventSelect} className="account_select">
          <option value="">Select the Function</option>
          {events.map((event) => (
            <option key={event.functionID} value={event.functionID}>
              {event.functionName} -{" "}
              {new Date(event.functionDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div className="event_details">
        {showData ? (
          <>
            <h2>{showData.functionName}</h2>
            <p>Date: {new Date(showData.functionDate).toLocaleDateString()}</p>
            <p>Location: {showData.place}</p>
            <p>ID: {showData.functionID}</p>
            <div className="a_users_event_gallery Flex">
              {showData.photos && showData.photos.length > 0 ? (
                showData.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Event ${index}`}
                    className="photo"
                    loading="lazy"
                  />
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
