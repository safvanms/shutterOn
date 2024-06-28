import React, { useEffect, useState } from "react";
import "./gallery.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../axiosInstance";
import NoIMG from "../../assets/empty.png";
import { BsDownload } from "react-icons/bs";
import Loader from "../Loader/Loader";
import { LazyLoadImage } from "react-lazy-load-image-component";

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [wrongId, setWrongId] = useState(false);
  const [eventPinInput, setEventPinInput] = useState("");
  const [eventPinVerified, setEventPinVerified] = useState(false);
  const [fetchedEventPin, setFetchedEventPin] = useState("");
  const [requiresEventPin, setRequiresEventPin] = useState(false);
  const [pinError, setPinError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchGalleryData = async () => {
      try {
        setLoading(true);

        // Fetch event data
        const eventResponse = await axios.get(`/hosts/${id}`);
        const { gallery, eventPin } = eventResponse.data;

        // Set data and gallery images
        setData(eventResponse.data);
        setGalleryImages(gallery);

        // Determine if event PIN is required
        if (eventPin) {
          setFetchedEventPin(eventPin);
          setRequiresEventPin(true);
        } else {
          setRequiresEventPin(false);
          setEventPinVerified(true);
        }
      } catch (error) {
        setWrongId(true);
        console.error("Error fetching gallery data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, [id]);

  const handleEventPinSubmit = (e) => {
    e.preventDefault();
    if (eventPinInput === fetchedEventPin) {
      setEventPinVerified(true);
      setWrongId(false);
    } else {
      setPinError("Wrong event Pin , check the pin");
    }
  };

  const handleDownload = (imageUrl) => {
    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = `photo_${Date.now()}shutterOn.jpg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const Day = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <>
      <div className="gallery Flex">
        <div className="gallery_container">
          {!wrongId && eventPinVerified ? (
            <>
              <div className="gallery_head Flex">
                <h2>Gallery</h2>
                <div className="g_function_details">
                  {data && (
                    <>
                      <p>{data.functionName}</p>
                      <p> {Day(data.functionDate)}</p>
                      <p> ID : {data.functionID}</p>
                      <p>Hosted : {data.hostingTeam}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="photos_wrapper Flex">
                {loading ? (
                  <Loader message={"Please wait."} />
                ) : galleryImages.length > 0 ? (
                  galleryImages.map((image, index) => (
                    <div key={index} className="function_image">
                      <LazyLoadImage
                        src={image}
                        alt={`pic-${index}`}
                        className="photo"
                        loading="lazy"
                        effect="blur"
                        placeholderSrc={image}
                      />
                      <div
                        className="download_added_image Flex"
                        onClick={() => handleDownload(image)}
                      >
                        <BsDownload size={15} color="white" />
                        <p>Download</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="wrong_id Flex">
                    <img src={NoIMG} alt="empty" style={{ width: "180px" }} />
                    <p onClick={() => navigate("/", { replace: true })}>
                      Sorry. No photos uploaded yet!
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : wrongId ? (
            <div>
              <h3 style={{ textAlign: "center" }}>
                Sorry. This is a wrong ID or PIN!
              </h3>
              <p className="re_enter" onClick={() => navigate("/")}>
                Re-enter ID?
              </p>
            </div>
          ) : (
            requiresEventPin &&
            fetchedEventPin && (
              <div className="event_pin_container Flex">
                <form
                  onSubmit={handleEventPinSubmit}
                  className="gallery_eventPin_form Flex"
                >
                  <label>Enter 6 digit event PIN </label>
                  <input
                    type="number"
                    placeholder="XXXXXX"
                    value={eventPinInput}
                    onChange={(e) => setEventPinInput(e.target.value)}
                  />
                  {pinError && <p className="error">{pinError}</p>}
                  <button type="submit">Submit</button>
                </form>
              </div>
            )
          )}
        </div>
        <p className="gratitude">
          Thanks for using shutterOn, have a nice day.
        </p>
      </div>
    </>
  );
};

export default Gallery;
