import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faVideo, faLink, faImage, faPaperclip, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import {
  Timestamp,
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { CircularProgress } from '@mui/material';
import { AuthContext } from "../context API/AuthContext";
import { ChatContext } from "../context API/ChatContext";
import { grey } from "@mui/material/colors";

const Input = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [error, setError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileSelectedMessage, setFileSelectedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    if (!data.chatId) return;

    const unsubscribe = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      const docData = doc.data();
      if (docData?.typing && docData.typing !== currentUser.uid) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [data.chatId, currentUser.uid]);

  const handleFileUpload = async () => {
    setIsLoading(true);
    try {
      const storageReference = ref(storage, `chats/${uuid()}`);
      await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(storageReference);
      return downloadURL;
    } catch (error) {
      setError(true);
      console.log("Error uploading file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (text.trim() === "" && !file) {
      return; // Do nothing if there is no text or file
    }
  
    if (file && !["image", "video", "document"].includes(fileType)) {
      alert("Invalid file type selected.");
      return;
    }
  
    let fileUrl = null;
    if (file) {
      fileUrl = await handleFileUpload();
    }
  
    const message = {
      id: uuid(),
      senderId: currentUser.uid,
      date: Timestamp.now(),
      ...(text && fileType === "link" ? { link: text } : { text }),
    };
  
    if (fileUrl) {
      message[fileType] = fileUrl;
    }
  
    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion(message),
      typing: "",
    });
  
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [`${data.chatId}.lastMessage`]: { text },
      [`${data.chatId}.date`]: serverTimestamp(),
    });
  
    await updateDoc(doc(db, "userChats", data.user.uid), {
      [`${data.chatId}.lastMessage`]: { text },
      [`${data.chatId}.date`]: serverTimestamp(),
    });
  
    setText("");
    setFile(null);
    setFileType("");
    setFileSelectedMessage("");
    setShowMenu(false);
  };
  
  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type based on the selected option
      const validFileTypes = {
        image: ["image/jpeg", "image/png", "image/gif"],
        video: ["video/mp4", "video/avi", "video/mov"],
      };

      // Only validate file type for image and video
      if (type !== "document" && !validFileTypes[type].includes(selectedFile.type)) {
        alert("Invalid file type. Please select a valid file.");
        setFile(null);
        return;
      }

      setFileType(type);
      setFile(selectedFile);
      setFileSelectedMessage("File selected, Click send.");
      setShowMenu(false);
    } else {
      alert("Please select a valid file.");
    }
  };

  const handleLinkInput = () => {
    const url = prompt("Enter the URL");
    if (url) {
      const formattedUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `http://${url}`;
      setText(formattedUrl);
      setFileType("link");
      handleSend();
    }
  };

  const handleTyping = async (e) => {
    setText(e.target.value);

    if (e.target.value) {
      await updateDoc(doc(db, "chats", data.chatId), {
        typing: currentUser.uid,
      });
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        typing: "",
      });
    }
  };

  return data?.user?.uid ? (
    <div className="inputContainer">
      {isLoading && (
        <div className="progressOverlay">
          <CircularProgress style={{ color: '#2c3e50' }} />
        </div>
      )}

      {showMenu && (
        <div className="fileMenu">
          <input
            type="file"
            style={{ display: "none" }}
            id="imageFile"
            onChange={(e) => handleFileChange(e, "image")}
          />
          <label htmlFor="imageFile" className={`fileMenuItem ${fileType === "image" ? "active" : ""}`}>
            <FontAwesomeIcon icon={faImage} className="fa-icon" /> Image
          </label>

          <input
            type="file"
            style={{ display: "none" }}
            id="videoFile"
            onChange={(e) => handleFileChange(e, "video")}
          />
          <label htmlFor="videoFile" className={`fileMenuItem ${fileType === "video" ? "active" : ""}`}>
            <FontAwesomeIcon icon={faVideo} className="fa-icon" /> Video
          </label>

          <input
            type="file"
            style={{ display: "none" }}
            id="docFile"
            onChange={(e) => handleFileChange(e, "document")}
          />
          <label htmlFor="docFile" className={`fileMenuItem ${fileType === "document" ? "active" : ""}`}>
            <FontAwesomeIcon icon={faFile} className="fa-icon" /> Document
          </label>

          <div className="fileMenuItem" onClick={handleLinkInput}>
            <FontAwesomeIcon icon={faLink} className="fa-icon" /> Link
          </div>
        </div>
      )}
      <div className="input">
        <input
          type="text"
          placeholder="Type here..."
          onChange={handleTyping}
          value={text}
        />
        <div className="inputOptions">
          <div className="fileInputContainer" onClick={() => setShowMenu(!showMenu)}>
            <FontAwesomeIcon icon={faPaperclip} color="#2c3e50" style={{ fontSize: '24px' }} />
          </div>
          {fileSelectedMessage && <p style={{ color: 'black' }}>{fileSelectedMessage}</p>}

          <div onClick={handleSend} disabled={isLoading}>
          <FontAwesomeIcon icon={faArrowAltCircleRight} color="#2c3e50" style={{ fontSize: '35px' }} />
          
        </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="input">
      <p style={{color:"#616161"}}>Please select your friend to start the chat.</p>
    </div>
  );
};

export default Input;
