import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context API/AuthContext";
import { ChatContext } from "../context API/ChatContext";

// Utility function to parse and format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return ""; // Return an empty string if no timestamp is provided
  }

  // Log timestamp to debug
  console.log("Timestamp:", timestamp);

  // Convert Firestore timestamp to JavaScript Date object
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

  // Check if the parsing resulted in a valid date
  if (isNaN(date.getTime())) {
    console.error("Invalid date format");
    return ""; // Return an empty string if there's an error
  }

  const options = { hour: '2-digit', minute: '2-digit' };
  return date.toLocaleTimeString([], options);
};

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const renderContent = () => {
    if (message.text) {
      return <p style={{color:'white'}}>{message.text}</p>;
    } else if (message.image) {
      return <img src={message.image} alt="Sent" className="messageImage" />;
    } else if (message.video) {
      return (
        <video controls className="messageVideo">
          <source src={message.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (message.document) {
      return (
        <p>
          <a href={message.document} target="_blank" rel="noopener noreferrer" className="messageDocument">
            <span className="file-icon"></span>
            <span className="file-name">Document</span>
          </a>
        </p>
      );
    } else if (message.link) {
      return (
        <p>
          <a href={message.link} target="_blank" rel="noopener noreferrer" className="messageLink">
            {message.link}
          </a>
        </p>
      );
    } else {
      return null;
    }
  };

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid ? "owner" : ""}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user.photoURL
          }
          alt=""
          className="messageAvatar"
        />
        {/* Display timestamp */}
        <span className="messageTimestamp">
          {formatTimestamp(message.date)}
        </span>
      </div>
      <div className="messageContent">
        {renderContent()}
      </div>
    </div>
  );
};

export default Message;
