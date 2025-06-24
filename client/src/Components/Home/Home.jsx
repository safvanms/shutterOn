import React, { useState, useEffect } from "react";
import "./home.css";
import { FaSearch } from "react-icons/fa";

import BG1 from "../../assets/mrg1.jpg";
import BG2 from "../../assets/mrg2.jpg";
import BG3 from "../../assets/mrg3.jpg";
import BG4 from "../../assets/mrg4.jpg";
import BG5 from "../../assets/mrg5.jpg";
import BG6 from "../../assets/mrg6.jpg";
import BG7 from "../../assets/mrg7.jpg";
import BG8 from "../../assets/mrg8.jpg";
import { useNavigate } from "react-router-dom";
import RandomHomeImgaes from "../RandomHomeImages/RandomHomeImages";

const Home = () => {
  const images = [BG1, BG2, BG3, BG4, BG5, BG6, BG7, BG8];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [functionId, setFunctionId] = useState("");
  const [functionIdError, setFunctionIdError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleChange = (e) => {
    let { value } = e.target;
    // Remove spaces and apostrophes, and convert to lowercase
    const sanitizedValue = value.toLowerCase().replace(/[\s']/g, "");

    setFunctionId(sanitizedValue);

    // Set error only if user tried to input invalid characters
    if (sanitizedValue !== value) {
      setFunctionIdError(
        "Only lowercase letters and numbers allowed. No spaces or apostrophes."
      );
    } else {
      setFunctionIdError(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/gallery/${functionId}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "return") {
      e.preventDefault();
    }
  };

  return (
    <>
      <div className="home Flex">
        <div className="image-wrapper">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`bg-${index}`}
              className={`home_bg ${
                index === currentImageIndex ? "visible" : "hidden"
              }`}
            />
          ))}
        </div>
        <div className="function_inputs Flex">
          <p>Welcome to shutterOn</p>
          <p>Enjoy the gallery of your favorite's photos.</p>
          <form className="function_id_form " onSubmit={handleSubmit}>
            <div className="function_id_input_container Flex">
              <input
                type="text"
                placeholder="Enter Function / Event ID"
                className="function_id"
                value={functionId}
                onChange={handleChange}
                name="function_id"
                onKeyDown={handleKeyDown}
                style={{ outline: functionIdError && "2px solid red" }}
                pattern="[a-z0-9]*"
                inputMode="lowercase"
              />
              {!functionIdError && functionId !== " " && functionId && (
                <button type="submit" className="function_btn">
                  <FaSearch color="gray" size={18} />
                </button>
              )}
            </div>
          </form>
          {functionIdError && <p className="home_error">{functionIdError}</p>}
        </div>
      </div>
      <RandomHomeImgaes />
    </>
  );
};

export default Home;
