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
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/hosts/${id}`);
        const { gallery } = response.data;
        setData(response.data);
        setGalleryImages(gallery);
      } catch (error) {
        setWrongId(true);
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, [id]);

  // download photos for users

  const handleDownload = (imageUrl) => {
    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = imageUrl;

    // Set the download attribute to force download
    anchor.download = `photo_${Date.now()}shutterOn.jpg`;

    // Programmatically trigger a click event on the anchor element
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
          {!wrongId && (
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
          )}
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
            ) : wrongId ? (
              <div>
                <h2>Sorry. This is a wrong ID !</h2>
                <p className="re_enter" onClick={() => navigate("/")}>
                  Re enter id ?
                </p>
              </div>
            ) : (
              <div className="wrong_id Flex">
                <img src={NoIMG} alt="empty" style={{ width: "180px" }} />
                <p onClick={() => navigate("/", { replace: true })}>
                  Sorry. No photos uploaded yet !
                </p>{" "}
              </div>
            )}
          </div>
        </div>
        <p className="gratitude">
          Thanks for using shutterOn, have a nice day.
        </p>
      </div>
    </>
  );
};

export default Gallery;
