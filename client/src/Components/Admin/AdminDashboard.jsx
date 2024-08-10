import React from "react";
import "./admin.css";
import { FaImages, FaUsers } from "react-icons/fa";

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
        {currentItems.length > 0 && (
          <div className="admin_user_details Flex">
            <div className="user_details Flex">
              <div className=" Flex" style={{ gap: "5px" }}>
                <FaUsers size={25} color="white" />
                <p>Total Users </p>
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
                <p>Total uploads </p>
                <FaImages size={25} color="white" />
              </div>
              <strong>{getTotalUploads(users)}</strong>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default AdminDashboard;
