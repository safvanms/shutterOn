import React, { useRef, useState, useEffect } from "react";
import "./privatePin.css";
import { TfiReload } from "react-icons/tfi";

const PrivatePin = ({
  handleEventPinSubmit,
  setEventPinInput,
  pinError,
  setPinError,
}) => {
  const [pin, setPin] = useState(Array(6).fill(""));
  const inputRef = useRef([]);

  useEffect(() => {
    inputRef.current[0]?.focus();
  }, []);

  const handleChange = (e, inputIndex) => {
    const { key: value } = e;
    if (isNaN(value) && value !== "Backspace") {
      return;
    }
    setPinError(false);
    const newPin = [...pin];
    newPin[inputIndex] = value === "Backspace" ? "" : value;

    
    setPin(newPin);


    let focusChange = value === "Backspace" && inputIndex > 0 ? -1 : +1;
    inputRef.current[inputIndex + focusChange]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pinValue = pin.join("");
    setEventPinInput(pinValue);
    handleEventPinSubmit(e, pinValue);
  };

  return (
    <div className="event_pin_container Flex">
      <h3 className="title">Enter 6 digit Private PIN</h3>
      <form onSubmit={handleSubmit}>
        <div className="pin-inputs">
          {pin.map((otpValue, index) => {
            return (
              <input
                type="tel"
                key={index}
                value={otpValue}
                ref={(input) => (inputRef.current[index] = input)}
                onKeyUp={(e) => handleChange(e, index)}
                maxLength="1"
              />
            );
          })}
        </div>
        {pinError && <p className="pin-error">{pinError}</p>}
        <div className="pin_buttons Flex">
          <button
            type="submit"
            disabled={!(pin.join("").length === pin.length)}
            className="submit-button"
          >
            Submit
          </button>
          {pinError && (
            <TfiReload
              color="gray"
              size={20}
              onClick={() => setPin(Array(6).fill(""))}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default PrivatePin;
