import { signOut } from "firebase/auth";
import React, { useContext } from "react";
import { auth } from "../firebase";
import { AuthContext } from "../context API/AuthContext";
import Logout from "../images/logout.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSignOut } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="navbar">
      <span className="logo">RACCON CHAT</span>
      <div className="user">
        <div className="userInfo">
          <img src={currentUser.photoURL} alt="Profile" />
          <span>{currentUser.displayName}</span>
        </div>
        <button onClick={() => signOut(auth)}>
        <FontAwesomeIcon icon={faSignOut} style={{ fontSize: '20px', color:'white' }} className="fa-icon" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
