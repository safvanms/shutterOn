import React, { useState, useEffect } from "react";
import "./home.css";

import BG1 from "../../assets/mrg1.jpg";
import BG2 from "../../assets/mrg2.jpg";
import BG3 from "../../assets/mrg3.jpg";
import BG4 from "../../assets/mrg4.jpg";
import BG5 from "../../assets/mrg5.jpg";
import BG6 from "../../assets/mrg6.jpg";
import BG7 from "../../assets/mrg7.jpg";
import BG8 from "../../assets/mrg8.jpg";
import { useNavigate } from "react-router-dom";

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
    const { value } = e.target;

    setFunctionId(value);
    const sanitizedValue = value.toLowerCase().replace(/[\s']/g, "");

    if (sanitizedValue !== value) {
      setFunctionIdError("Not accept Uppercase letter,space and apostrophe");
    } else {
      setFunctionIdError(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('object')
    navigate(`/gallery/${functionId}`);
  };

  return (
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
        <h1>Welcome to shutterOn</h1>
        <p>Enjoy the gallery of your favorite's photos.</p>
        <form className="function_id_form Flex" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Function / Event ID"
            className="function_id"
            value={functionId}
            onChange={handleChange}
            name="function_id"
            style={{ outline: functionIdError && "2px solid red" }}
            // onKeyDown={handleKeyDown}
          />
          {!functionIdError && functionId && (
            <button type="button" className="function_btn">
              View
            </button>
          )}
        </form>
        {functionIdError && <p className="home_error">{functionIdError}</p>}
      </div>
    </div>
  );
};

export default Home;
