import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import { ChatContext } from "../context API/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Logo from "../images/logo.png";
import Lock from "../images/lock.png";
import DefaultAvatar from "../images/avt.png";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  // Fetching the chats collection data here
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages);
      } else {
        setMessages([]); // Clear messages if chat document doesn't exist
      }
    });
    return () => {
      unsub();
    };
  }, [data.chatId]);

  return (
    <div className="messages">
      {data.user.uid ? ( // Check if there's a user
        messages.map((m) => <Message message={m} key={m.id} />)
      ) : (
        <div className="messages welcome-message">
          <h3>
            <i>Hi, welcome to Raccon CHAT!</i>
          </h3>
          <div className="lock">
            <img src={DefaultAvatar}  alt="" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
