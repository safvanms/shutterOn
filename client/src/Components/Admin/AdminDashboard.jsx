import React from "react";
import "./admin.css";
import { FaImages, FaUsers } from "react-icons/fa";
import Loader from "../Loader/Loader";

const AdminDashboard = ({
  currentItems,
  getTotalUploads,
  eventHostedUsers,
  users,
}) => {
  return (
    <div className="dashboard_container Flex">
      <>
        <div className="dashboard">Dashboard </div>
        {currentItems.length > 0 ? (
          <div className="admin_user_details Flex">
            <div className="user_details Flex">
              <div className=" Flex" style={{ gap: "5px" }}>
                <FaUsers size={25} color="white" />
                <p>Users </p>
              </div>
              <strong>{users.length}</strong>
            </div>
            <div className="user_details Flex">
              <div className=" Flex" style={{ gap: "5px" }}>
                <p>Hosted users </p>
              </div>
              <strong>{eventHostedUsers.length}</strong>
            </div>
            <div className="user_details Flex">
              <div className=" Flex" style={{ gap: "5px" }}>
                <p>Uploads </p>
                <FaImages size={25} color="white" />
              </div>
              <strong>{getTotalUploads(users)}</strong>
            </div>
          </div>
        ) : (
          <Loader message="Please wait..." />
        )}
      </>
    </div>
  );
};

export default AdminDashboard;
