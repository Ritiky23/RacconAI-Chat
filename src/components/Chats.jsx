import React, { useContext, useEffect, useState, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context API/AuthContext";
import { ChatContext } from "../context API/ChatContext";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingChats, setPendingChats] = useState([]); // Store pending chats to be updated

  const { currentUser } = useContext(AuthContext);
  const { data, dispatch } = useContext(ChatContext);

  // Function to get a display text for non-text messages
  const getLastMessageText = (message) => {
    if (!message) {
      return "No messages";
    }

    if (message.text) {
      return message.text;
    } else if (message.image) {
      return "Image";
    } else if (message.video) {
      return "Video";
    } else if (message.document) {
      return "Document";
    } else if (message.link) {
      return "Link";
    } else {
      return "Media";
    }
  };

  // Function to update chats
  const updateChats = useCallback((chatsData) => {
    const chatEntries = Object.entries(chatsData);

    // Sort chats by the latest message date
    const sortedChats = chatEntries.sort((a, b) => {
      const dateA = a[1].date?.toDate() || new Date(0);
      const dateB = b[1].date?.toDate() || new Date(0);
      return dateB - dateA; // Latest chat first
    });

    // Find and move selected user to the top
    const selectedChatIndex = sortedChats.findIndex(([id]) => id === selectedUser?.uid);
    if (selectedChatIndex > -1) {
      const [selectedChat] = sortedChats.splice(selectedChatIndex, 1);
      sortedChats.unshift(selectedChat);
    }

    setPendingChats(sortedChats); // Store sorted chats in pending state
  }, [selectedUser]);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        const chatsData = doc.data() || {};
        updateChats(chatsData);
      });

      return () => {
        unsub();
      };
    };

    if (currentUser.uid) {
      getChats();
    }
  }, [currentUser.uid, updateChats]);

  // Update UI with a delay
  useEffect(() => {
    if (pendingChats.length === 0) return;

    const timer = setTimeout(() => {
      setChats(pendingChats);
    }, 1000); // Delay for 1 second

    return () => clearTimeout(timer); // Clean up the timer if the component unmounts or pendingChats changes
  }, [pendingChats]);

  useEffect(() => {
    if (!data.chatId) return;

    const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      const docData = doc.data();
      if (docData?.typing && docData.typing !== currentUser.uid) {
        setTypingUser(docData.typing);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      unsub();
    };
  }, [data.chatId, currentUser.uid]);

  const handleSelect = (u) => {
    setSelectedUser(u); // Update selected user
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {chats.map(([id, chat]) => (
        <div
          className="userChat"
          key={id}
          onClick={() => handleSelect(chat.userInfo)}
        >
          <img src={chat.userInfo?.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{chat.userInfo?.displayName}</span>
            {typingUser === chat.userInfo?.uid ? (
              <p style={{ color: 'black' }}>Typing...</p>
            ) : (
              <p>{getLastMessageText(chat.lastMessage)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
