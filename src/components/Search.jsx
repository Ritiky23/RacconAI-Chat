import React, { useContext, useEffect, useState, useCallback } from "react";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context API/AuthContext";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";


const Search = () => {
  const [username, setUsername] = useState(""); // Searching the user
  const [users, setUsers] = useState([]); // Matched users
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setUsers([]);
      setErr(false);
      return;
    }

    console.log("Searching for users:", searchTerm);
    setLoading(true);
    setErr(false); // Reset error state

    const q = query(
      collection(db, "users"),
      where("displayName", ">=", searchTerm),
      where("displayName", "<=", searchTerm + "\uf8ff")
    );

    try {
      const querySnapshot = await getDocs(q);
      console.log('Query executed:', querySnapshot);
      if (querySnapshot.empty) {
        console.log("No users found with the display name starting with:", searchTerm);
        setErr(true);
        setUsers([]);
      } else {
        const foundUsers = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().uid !== currentUser.uid) {
            foundUsers.push(doc.data());
          }
        });
        if (foundUsers.length > 0) {
          console.log("Users found:", foundUsers);
          setUsers(foundUsers);
          setErr(false);
        } else {
          setErr(true);
          setUsers([]);
        }
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setErr(true);
      setUsers([]);
    }
    setLoading(false);
  };

  // Wrap the debounced function with useCallback
  const debouncedHandleSearch = useCallback(debounce(handleSearch, 300), []);

  useEffect(() => {
    debouncedHandleSearch(username);
    // Cleanup function to cancel the debounced function on unmount or on next effect
    return () => {
      debouncedHandleSearch.cancel();
    };
  }, [username, debouncedHandleSearch]);

  const handleSelect = async (selectedUser) => {
    console.log("User selected:", selectedUser);

    const combinedId =
      currentUser.uid > selectedUser.uid
        ? currentUser.uid + selectedUser.uid
        : selectedUser.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      console.log('Chat doc check:', res.exists());
      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [`${combinedId}.userInfo`]: {
            uid: selectedUser.uid,
            displayName: selectedUser.displayName,
            photoURL: selectedUser.photoURL,
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", selectedUser.uid), {
          [`${combinedId}.userInfo`]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error selecting user:", error);
    }

    setUsers([]);
    setUsername("");
  };

  return (
    <div className="search">
      <div className="searchForm">
        <FontAwesomeIcon icon={faSearch} className="fa-icon" />
        <input
          type="text"
          placeholder="Search Users."
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>

      {loading && <span>Loading...</span>}
      {err && !loading && <span>No Result!</span>}

      {users.map(user => (
        <div key={user.uid} className="userChat" onClick={() => handleSelect(user)}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Search;
