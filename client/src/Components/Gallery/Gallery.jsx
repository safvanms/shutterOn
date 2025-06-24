import React, { useEffect, useState } from "react";
import "./gallery.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../axiosInstance";
import NoIMG from "../../assets/empty.png";
import Loader from "../Loader/Loader";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PrivatePin from "../PrivatePin/PrivatePin";
import Masonry from "react-masonry-css";
import { MdOutlineFileDownload } from "react-icons/md";

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

  console.log(eventPinInput);

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

  const handleEventPinSubmit = (e, pinValue) => {
    e.preventDefault();
    if (pinValue === fetchedEventPin) {
      setEventPinVerified(true);
      setWrongId(false);
    } else {
      setPinError("Wrong event Pin , Retry !");
    }
  };

  const handleView = (imageUrl) => {
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

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };


  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `photo_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Optional: Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    }
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
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="masonry-grid"
                    columnClassName="masonry-grid_column"
                  >
                    {galleryImages.map((image, index) => (
                      <div key={index} className="function_image">
                        <LazyLoadImage
                          src={image}
                          alt={`pic-${index}`}
                          className="photo"
                          loading="lazy"
                          effect="blur"
                          placeholder={<div className="image-skeleton"></div>}
                          onClick={() => {
                            if (window.innerWidth >= 768) {
                              handleView(image);
                            }
                          }}
                        />
                        <button
                          className="download_added_image"
                          onClick={() => handleDownload(image)}
                        >
                          <MdOutlineFileDownload size={22} color="white" />
                        </button>
                      </div>
                    ))}
                  </Masonry>
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
              <PrivatePin
                handleEventPinSubmit={handleEventPinSubmit}
                setPinError={setPinError}
                setEventPinInput={setEventPinInput}
                pinError={pinError}
              />
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
