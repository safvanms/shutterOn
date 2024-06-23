import React, { useEffect, useState } from "react";
import "./hostform.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function HostForm() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [functionIdError, setFunctionIdError] = useState(null);
  const [amount, setAmount] = useState(1999);
  const [formData, setFormData] = useState({
    functionName: "",
    functionDate: "",
    place: "",
    provider: "",
    functionID: "",
    hostingTeam: "",
    phoneNumber: "",
    gallery: [],
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
  
    if (!userData) {
      console.error("User data not available");
      return;
    }
  
    const newEvent = { ...formData };
  
    try {
      // Check if the function ID is available
      const checkResponse = await axios.get(
        `http://localhost:3001/events/check-function-id/${newEvent.functionID}`
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
          image: "../../assets/logo.png",
          handler: async function (response) {
            const verifyResponse = await axios.post(
              `${process.env.REACT_APP_BACKEND_HOST_URL}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: userId,
                newEvent: newEvent
              }
            );
  
            if (verifyResponse.data.message === "Payment Succeeded") {
              navigate(`/host/${userId}/${formData.functionID}`);
            } else {
              alert("Payment verification failed. Please try again.");
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
        rzp.on('payment.failed', function (response) {
          alert("Payment failed. Please try again.");
        });
  
        rzp.open();
      } else {
        console.error("Function ID is not available");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data.error === "Function ID already exists."
      ) {
        alert("Function ID already exists.");
      } else {
        console.error("Error during payment process:", error);
        alert(
          "An error occurred during the payment process. Please try again."
        );
      }
    }
  };
  

  // useEffect(() => {
  //   const checkResponse = axios
  //     .get(`http://localhost:3001/user/${userId}`)
  //     .then((response) => {
  //       console.log(
  //         response.data.events.filter((item) => item.paymentStatus === true)
  //       );
  //     });
  // }, [userId]);

  return (
    <div className="host_form_container Flex">
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
        </div>
        <div className="inputs Flex">
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
          <button type="submit" className="submit_form">
            Pay now
          </button>
        </div>
      </form>
    </div>
  );
}

export default HostForm;
