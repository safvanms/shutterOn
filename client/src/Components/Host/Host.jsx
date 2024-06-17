import React, { useState, useEffect } from "react";
import "./host.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Cloudinary } from "@cloudinary/url-gen";
import { MdDelete } from "react-icons/md";

const Host = () => {
  const [functionData, setFunctionData] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [cld, setCld] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    setCld(new Cloudinary({ cloud: { cloudName: "dqkb2musv" } }));
  }, []);

  const { userId, functionID } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch function data and gallery photos
    axios
      .get(`http://localhost:3001/host/${userId}/${functionID}`)
      .then((response) => {
        setFunctionData(response.data);
        setGalleryPhotos(response.data.gallery); // Set gallery photos
      })
      .catch((error) => {
        console.error("Error fetching function data:", error);
      });
  }, [userId, functionID, deleted]);

  const handleFileChange = (e) => {
    setSelectedPhoto(e.target.files[0]);
  };

  const handleConfirmPhoto = () => {
    if (selectedPhoto) {
      setConfirmed(true);
      const formData = new FormData();
      formData.append("photo", selectedPhoto);

      // Upload photo to Cloudinary
      axios
        .post(`http://localhost:3001/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const imageUrl = response.data.imageUrl;

          //  Update gallery in server with Cloudinary URL
          axios
            .post(`http://localhost:3001/update-gallery`, {
              userId,
              functionID,
              imageUrl,
            })
            .then(() => {
              const updatedGallery = [...galleryPhotos, imageUrl];
              setGalleryPhotos(updatedGallery);
              setSelectedPhoto(null);
              setConfirmed(false);
            })
            .catch((error) => {
              console.error("Error updating gallery:", error);
            });
        })
        .catch((error) => {
          console.error("Error uploading photo to Cloudinary:", error);
        });
    }
  };

  const handleDeletePhoto = (photoUrl) => {
    const confirmed = window.confirm(
      "This photo will be deleted permanently from the Server"
    );
    if (confirmed) {
      axios
        .delete(
          `http://localhost:3001/delete-photo/${userId}/${functionID}/${encodeURIComponent(
            photoUrl
          )}`
        )
        .then(() => {
          // Update galleryPhotos state by filtering out the deleted photo
          setGalleryPhotos((prevGalleryPhotos) =>
            prevGalleryPhotos.filter((photo) => photo !== photoUrl)
          );
          setDeleted(true);
        })
        .catch((error) => {
          console.error("Error deleting photo:", error);
        });
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="hosting_page_wrapper">
      <div className="hosting_page_head Flex">
        {functionData && (
          <div className="Flex">
            <h1 className="function_name">{functionData.functionName}</h1>
          </div>
        )}
      </div>

      <div className="host">
        <div className="add_photo_option Flex">
          <input type="file" onChange={handleFileChange} accept="image/*" />
          {selectedPhoto && (
            <div className="photo_preview Flex">
              <img
                src={URL.createObjectURL(selectedPhoto)}
                alt="Selected"
                className="sample_of_image"
              />
              {!confirmed ? (
                <button className="confirm_btn" onClick={handleConfirmPhoto}>
                  Confirm to Add
                </button>
              ) : (
                <p style={{ cursor: "not-allowed" }}>Uploading...</p>
              )}
            </div>
          )}
        </div>

        <div className="gallery_photos Flex">
          {galleryPhotos.length > 0 ? (
            galleryPhotos.map((photo, index) => (
              <div key={index} className="added_image">
                <img
                  className="added_image_img"
                  src={photo}
                  alt={`Gallery ${index}`}
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
            <p>Add photos . </p>
          )}
        </div>
      </div>

      <div className="function_details Flex">
        <div className="hosting_details">
          {functionData && (
            <>
              <div>
                <p>ID:</p>
                <h3>{functionData.functionID}</h3>
              </div>
              <div>
                <p>Owner:</p>
                <h3>{functionData.provider}</h3>
              </div>
              <div>
                <p>Date:</p>
                <h3>{formatDate(functionData.functionDate)}</h3>
              </div>
              <div>
                <p>Host by:</p>
                <h3>{functionData.hostingTeam}</h3>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Host;
