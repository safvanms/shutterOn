import React, { useEffect, useState } from "react";
import "./gallery.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NoIMG from "../../assets/empty.png";
import { BsDownload } from "react-icons/bs";

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [wrongId, setWrongId] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/hosts/${id}`);
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
          <div className="gallery_head Flex">
            <h2>Gallery</h2>
            <div className="g_function_details">
              {data && (
                <>
                  <p>{data.functionName}</p>
                  <p>Date : {Day(data.functionDate)}</p>
                  <p>Event ID : {data.functionID}</p>
                  <p>Hosting : {data.hostingTeam}</p>
                </>
              )}
            </div>
          </div>
          <div className="photos_wrapper Flex">
            {loading ? (
              <p>Loading...</p>
            ) : galleryImages.length > 0 ? (
              galleryImages.map((image, index) => (
                <div key={index} className="function_image">
                  <img
                    src={image}
                    alt={`pic-${index}`}
                    className="photo"
                    loading="lazy"
                  />
                  <div
                    className="download_added_image"
                    onClick={() => handleDownload(image)}
                  >
                    <BsDownload size={20} color="white" />
                  </div>
                </div>
              ))
            ) : wrongId ? (
              <h2>This is a wrong functionID</h2>
            ) : (
              <div className="wrong_id Flex">
                <img src={NoIMG} alt="empty" style={{ width: "180px" }} />
                <p onClick={() => navigate("/", { replace: true })}>
                  Sorry. No photos found !
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
