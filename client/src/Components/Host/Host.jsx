import { useState, useEffect } from "react";
import "./host.css";
import axios from "../../axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { Cloudinary } from "@cloudinary/url-gen";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader";
import Masonry from "react-masonry-css";
import { toast, ToastContainer } from "react-toastify";

const Host = () => {
  const [functionData, setFunctionData] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [, setCld] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isGalleryTimeoutDone, setIsGalleryTimeoutDone] = useState(false);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  useEffect(() => {
    setCld(new Cloudinary({ cloud: { cloudName: "dqkb2musv" } }));
  }, []);

  const { userId, functionID } = useParams();

  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setIsGalleryTimeoutDone(true);
      setIsLoading(false);
    }, 10000); 

    axios
      .get(`/host/${userId}/${functionID}`)
      .then((response) => {
        clearTimeout(timeoutId); 
        setFunctionData(response.data);
        setGalleryPhotos(response.data.gallery);
        setIsGalleryTimeoutDone(true);
        setIsLoading(false);

        if (response.data.paymentStatus === false) {
          navigate("/", { replace: true });
        }

        if (response.frozen) {
          alert(
            "Your account is currently frozen. You cannot access this content."
          );
          return;
        }
      })
      .catch((error) => {
        console.error("Error fetching function data:", error);
        navigate("/", { replace: true });
        clearTimeout(timeoutId);
        setIsGalleryTimeoutDone(true);
        setIsLoading(false);
      });

    axios
      .get(`/users/${userId}`)
      .then((response) => {
        setUser(response.data);
        if (response.frozen) {
          alert(
            "Your account is currently frozen. You cannot access this content."
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });

    return () => clearTimeout(timeoutId); // cleanup on unmount
  }, [userId, functionID, deleted, navigate]);

  const handleFileChange = (e) => {
    setSelectedPhoto(e.target.files[0]);
    setConfirmed(false);
  };

  const handleConfirmPhoto = () => {
    if (selectedPhoto) {
      setConfirmed(true);
      setIsLoading(true);
      const formData = new FormData();
      formData.append("photo", selectedPhoto);

      // Upload photo to Cloudinary
      axios
        .post("/upload/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const imageUrl = response.data.imageUrl;

          if (response.frozen) {
            alert(
              "Your account is currently frozen. You cannot access this content."
            );
            return;
          }
          //  Update gallery in server with Cloudinary URL
          axios
            .post(`/update-gallery`, {
              userId,
              functionID,
              imageUrl,
            })
            .then(() => {
              const updatedGallery = [...galleryPhotos, imageUrl];
              setGalleryPhotos(updatedGallery);
              setSelectedPhoto(null);
              setConfirmed(false);
              setIsLoading(false);
              toast.success("Image added successfully!");
            })
            .catch((error) => {
              console.error("Error updating gallery:", error);
              setIsLoading(false);
            });
        })
        .catch((error) => {
          console.error("Error uploading photo to Cloudinary:", error);
          setIsLoading(false);
          alert("upload less sized images than 10MB ");
          setConfirmed(false);
          setSelectedPhoto(null);
        });
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
          `/delete-photo/${userId}/${functionID}/${encodeURIComponent(
            photoUrl
          )}`
        )
        .then(() => {
          // Update galleryPhotos state by filtering out the deleted photo
          setGalleryPhotos((prevGalleryPhotos) =>
            prevGalleryPhotos.filter((photo) => photo !== photoUrl)
          );
          setDeleted(true);
          setIsLoading(false);
          toast.success("Image eleted successfully!");
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
      <ToastContainer position="bottom-right" autoClose={2000} />
      <div className="hosting_page_head Flex">
        {functionData && (
          <div className="Flex">
            <h1 className="function_name">{functionData.functionName}</h1>
          </div>
        )}
      </div>

      {/* uploading section  */}

      <div className="host">
        {!user?.frozen && (
          <div
            className={`add_photo_option Flex ${
              user && user.frozen ? "disabled" : ""
            }`}
          >
            <label htmlFor="fileInput" className="custom_file_input">
              Choose a Photo
            </label>
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
        )}

        {isLoading && <Loader message={"Please Wait..."} />}

        {/* showing uploaded photos */}

        <div className="gallery_photos">
          {galleryPhotos.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {galleryPhotos.map((photo, index) => (
                <div key={index} className="added_image">
                  <img
                    className="added_image_img"
                    src={photo}
                    alt={`${functionData?.functionName}_${index}`}
                    placeholder={<div className="image-skeleton"></div>}
                  />
                  {!user?.frozen && (
                    <div
                      className="delete_added_image Flex"
                      onClick={() => handleDeletePhoto(photo)}
                    >
                      <MdDelete size={16} color="white" />
                      <p>Delete</p>
                    </div>
                  )}
                </div>
              ))}
            </Masonry>
          ) :  isGalleryTimeoutDone && galleryPhotos.length === 0 &&(
            <p>Add photos.</p>
          )}
        </div>
      </div>

      {/* Event details */}

      <div className="function_details Flex">
        <div className="hosting_details">
          {user?.frozen && (
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                width: "250px",
                marginBottom: "5px",
                color: "red",
              }}
            >
              You can't add or delete your gallery at the moment because you're
              frozen.
            </p>
          )}
          {functionData && (
            <>
              <div>
                <p>ID:</p>
                <h3>
                  {functionData.functionID}{" "}
                  {functionData.eventPin ? `(${functionData.eventPin})` : ""}
                </h3>
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
