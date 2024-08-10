import React from "react";
import "./admin.css";
import { MdDashboard } from "react-icons/md";
import { SlDocs } from "react-icons/sl";

const AdminTabs = ({ tab, setTab }) => {
  const handleTableTab = () => {
    setTab("table");
  };

  const handleDetailsTab = () => {
    setTab("dashboard");
  };

  return (
    <div className="tabs Flex">
      <div
        className="details_tab Flex"
        style={{
          backgroundColor: tab === "dashboard" && "#092635",
          color: tab === "dashboard" && "#ffff",
        }}
        onClick={handleDetailsTab}
      >
        <MdDashboard size={18}/>
        <span>Dashboard</span>
      </div>
      <div
        style={{
          backgroundColor: tab === "table" && "#092635",
          color: tab === "table" && "#ffff",
        }}
        className="table_tab Flex"
        onClick={handleTableTab}
      >
        <SlDocs size={15}/>
        <span>Users Details</span>
      </div>
    </div>
  );
};

export default AdminTabs;
