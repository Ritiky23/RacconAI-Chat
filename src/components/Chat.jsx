import React, { useContext } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context API/ChatContext";

const Chat = () => {
  const { data } = useContext(ChatContext);

  // Check if photoURL exists
  const photoURL = data.user?.photoURL;

  return (
    <div className="chat">
      <div className="chatInfo">
        <div className="img">
          {photoURL && (
            <img
              src={photoURL}
              alt="User avatar"
              style={{ height: 35, width: 35,marginLeft:20, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
        </div>
        <span>{data.user?.displayName}</span>
      </div>

      <Messages />
      <Input />
    </div>
  );
};

export default Chat;
