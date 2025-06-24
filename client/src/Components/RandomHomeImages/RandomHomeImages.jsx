import React from "react";
import "./random.css";
import BG1 from "../../assets/mrg1.jpg";
import BG2 from "../../assets/mrg2.jpg";
import BG3 from "../../assets/mrg3.jpg";
import BG4 from "../../assets/mrg4.jpg";
import BG5 from "../../assets/mrg5.jpg";
import BG6 from "../../assets/mrg6.jpg";
import BG7 from "../../assets/mrg7.jpg";
import BG8 from "../../assets/mrg8.jpg";
import { RiGalleryFill } from "react-icons/ri";

const randomImages = [BG1, BG2, BG3, BG4, BG8, BG5, BG6, BG7];

const RandomHomeImages = () => {
  return (
    <>
      <div className="random_images_heading Flex">
        <p>Explore your gallery</p>
        <RiGalleryFill
          style={{ transform: "rotate(-20deg)" }}
          color="#66e074"
          size={28}
        />
      </div>
      <div className="random_photos Flex">
        {randomImages?.map((item, i) => (
          <div key={i} className="random_photo_container">
            <img src={item} alt="home" loading="lazy" />
          </div>
        ))}
      </div>
    </>
  );
};

export default RandomHomeImages;
