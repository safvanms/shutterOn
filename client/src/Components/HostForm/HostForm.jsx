import React, { useEffect, useState } from "react";
import "./hostform.css";
import axios from "../../axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../Loader/Loader";
import LOGO from "../../assets/logo.svg";

function HostForm() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [functionIdError, setFunctionIdError] = useState(null);
  const [pinError, setPinError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [formData, setFormData] = useState({
    functionName: "",
    functionDate: "",
    place: "",
    provider: "",
    functionID: "",
    hostingTeam: "",
    phoneNumber: "",
    gallery: [],
    eventPin: "",
  });
  const amount = 1999;

  useEffect(() => {
    axios
      .get(`/user/${userId}`)
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [userId]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "functionID") {
      const sanitizedValue = value.toLowerCase().replace(/[\s']/g, "");

      if (sanitizedValue !== value) {
        setFunctionIdError(
          "Function ID must not include spaces or apostrophes and should be lowercase."
        );
      } else {
        setFunctionIdError("");
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: sanitizedValue,
      }));
    } else if (type === "checkbox" && name === "private") {
      setIsPrivate(checked);
      setFormData((prevData) => ({
        ...prevData,
        eventPin: checked ? prevData.eventPin : "",
      }));
    } else if (name === "eventPin") {
      if (!/^\d{6}$/.test(value)) {
        // Ensure exactly 6 digits
        setPinError("Event PIN must be exactly 6 digits.");
      }  else {
        setPinError(null);
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };


  const navigate = useNavigate();

  const handlePayment = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (!userData) {
      console.error("User data not available");
      setLoading(false);
      return;
    }

    const newEvent = {
      ...formData,
      eventPin: isPrivate ? formData.eventPin : "",
    };

    console.log(formData);

    try {
      // Check if the function ID is available
      const checkResponse = await axios.get(
        `/events/check-function-id/${newEvent.functionID}`
      );

      if (checkResponse.data.message === "Function ID is available.") {
        // Initiate payment
        const paymentResponse = await axios.post(
          `${process.env.REACT_APP_BACKEND_HOST_URL}/api/payment/pay`,
          { amount },
          { headers: { "Content-Type": "application/json" } }
        );

        const data = paymentResponse.data;

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "shutterOn",
          description: "Transaction",
          order_id: data.id,
          image: LOGO,
          handler: async function (response) {
            try {
              const verifyResponse = await axios.post(
                `${process.env.REACT_APP_BACKEND_HOST_URL}/api/payment/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: userId,
                  newEvent: newEvent,
                }
              );

              if (verifyResponse.data.message === "Payment Succeeded") {
                setLoading(true);
                navigate(`/host/${userId}/${formData.functionID}`, {
                  replace: true,
                });
              } else {
                alert("Payment verification failed. Please try again.");
              }
            } catch (verifyError) {
              console.error("Error verifying payment:", verifyError);
              alert("Error verifying payment. Please try again.");
            }
          },
          prefill: {
            name: userData.name,
            email: userData.email,
            contact: formData.phoneNumber,
          },
          notes: {
            address: formData.hostingTeam,
          },
          theme: {
            color: "#092635",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          console.error("Payment failed:", response.error);
          alert("Payment failed. Please try again.");
        });
        setLoading(false);
        rzp.open();
      } else {
        alert("Function ID is not available.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      if (
        error.response &&
        error.response.data.error === "Function ID already exists."
      ) {
        alert("Function ID already exists.");
      } else {
        alert(
          "An error occurred during the payment process. Please try again."
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="host_form_container Flex">
      {loading && <Loader message={"please wait for a moment"} />}
      <h2>Host a function</h2>
      <form className="host_form Flex" onSubmit={handlePayment}>
        <div className="inputs Flex">
          <label htmlFor="functionName">Function Name *</label>
          <input
            type="text"
            name="functionName"
            value={formData.functionName}
            onChange={handleChange}
            placeholder="Jon weds Tessa"
            required
          />
          <label htmlFor="functionDate">Function Date *</label>
          <input
            type="date"
            name="functionDate"
            value={formData.functionDate}
            onChange={handleChange}
            placeholder="Function Date"
            required
          />
          <label htmlFor="place">Location *</label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            placeholder="Calicut"
            required
          />
          <label htmlFor="provider">Name of Groom / Provider *</label>
          <input
            type="text"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            placeholder="Mr. Thomas"
          />
          <label htmlFor="functionName">
            Private function / event &nbsp;
            <input
              type="checkbox"
              name="private"
              checked={isPrivate}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="inputs Flex">
          {isPrivate && (
            <>
              <label htmlFor="eventPin">Set an Event Pin * </label>
              <input
                type="number"
                name="eventPin"
                value={formData.eventPin}
                onChange={handleChange}
                placeholder="Enter 6 digit event pin"
                required={isPrivate}
              />
               {pinError && <p className="error">{pinError}</p>}
            </>
          )}
          <label htmlFor="functionID">Enter Function ID *</label>
          <input
            type="text"
            name="functionID"
            value={formData.functionID}
            onChange={handleChange}
            placeholder="jon_weds_tessa0123"
            required
          />
          {functionIdError && <p className="error">{functionIdError}</p>}
          <label htmlFor="hostingTeam">Hosting Team / Person *</label>
          <input
            type="text"
            name="hostingTeam"
            value={formData.hostingTeam}
            onChange={handleChange}
            placeholder="ABC Photographers"
            required
          />
          <label htmlFor="phoneNumber">Phone Number (Company / Person) *</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="9876543210"
            required
          />
          {!pinError && <button type="submit" className="submit_form">
            Pay now
          </button>}
        </div>
      </form>
    </div>
  );
}

export default HostForm;
