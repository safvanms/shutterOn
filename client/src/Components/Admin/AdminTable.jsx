import React from "react";
import "./admin.css";
import Loader from "../Loader/Loader";
import { PiGreaterThanLight, PiLessThanLight } from "react-icons/pi";

const AdminTable = ({
  loading,
  currentItems,
  firstIndex,
  hasGalleryItems,
  handleOpenEvents,
  handleFreezeToggle,
  handleLogoutAdmin,
  paginate,
  currentPage,
  totalPages,
  lastIndex,
  filteredUsers,
}) => {
  return (
    <>
      <div className="admin_table">
        {loading ? (
          <Loader message={"please wait..."} />
        ) : currentItems?.length === 0 ? (
          <p>No user found !</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Sl no</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Password</th>
                  <th>UserID</th>
                  <th>Uploads</th>
                  <th>Events</th>
                  <th>Controls</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.map((user, index) => (
                  <tr key={user.userId}>
                    <td>{firstIndex + index + 1}</td>
                    <td className="name_row">{user.name}</td>
                    <td className="mail_row">{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <input
                        className="admin_password_input"
                        value={user.password}
                        type="password"
                        onMouseEnter={(e) => {
                          e.target.type = "text";
                        }}
                        onMouseLeave={(e) => {
                          e.target.type = "password";
                        }}
                        readOnly
                      />
                    </td>
                    <td>{user.userId}</td>
                    <td>{hasGalleryItems(user.events)}</td>
                    <td>
                      {user.events.length > 0 ? (
                        <button
                          className="event_show_button"
                          onClick={() => handleOpenEvents(user.userId)}
                        >
                          View{" "}
                          {user.events.length === 1
                            ? user.events.length + " Event "
                            : user.events.length + " Events "}
                        </button>
                      ) : (
                        <p className="no_event">No events</p>
                      )}
                    </td>
                    <td>
                      <button
                        className={`${user.frozen ? "unfreeze" : "freeze"}`}
                        onClick={() =>
                          handleFreezeToggle(user.userId, user.frozen)
                        }
                      >
                        {user.frozen ? "Unfreeze" : "Freeze"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {currentItems?.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              height: "30px",
              marginTop: "30px",
              marginBottom: "10px",
            }}
          >
            <button className="logout_admin" onClick={handleLogoutAdmin}>
              Logout Admin
            </button>
            {/* Pagination */}
            <div className="pagination Flex">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <PiLessThanLight style={{ marginTop: "6px" }} />
              </button>
              &nbsp; {currentPage} of {totalPages}
              &nbsp;
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={lastIndex >= filteredUsers?.length}
              >
                <PiGreaterThanLight style={{ marginTop: "6px" }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTable;
