import AddAvatar from "../images/addAvatar.png";
import DefaultAvatar from "../images/avt.png"; // Path to your default avatar
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import bg from "../images/bg2.jpg";


export const Register = () => {
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [displayName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [image, setImage] = useState(null);
  const [avatarURL, setAvatarURL] = useState(null);
  const [loading, setLoading] = useState(false);
  let downloadURL;

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);

    // Set the avatar URL to preview the selected image
    const imageURL = URL.createObjectURL(selectedImage);
    setAvatarURL(imageURL);
  };

  // Upload image function
  const handleImageUpload = async () => {
    if (!image) {
      return DefaultAvatar; // Return default avatar URL if no image is selected
    }

    try {
      const storageReference = ref(storage, `userProfile/${displayName}`);
      await uploadBytes(storageReference, image);
      return await getDownloadURL(storageReference);
    } catch (error) {
      setError(true);
      console.log("Error uploading image");
      return DefaultAvatar; // Fallback to default avatar URL
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!displayName) {
      setError(true);
      return;
    }

    let uploadimageurl = await handleImageUpload();

    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // update currentUser on Authentication on Firebase
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: uploadimageurl,
      });

      // Firestore DB setup
      const userDocRef = doc(db, "users", res.user.uid); // Use UID instead of email as document ID
      await setDoc(userDocRef, {
        uid: res.user.uid,
        displayName: displayName,
        email: email,
        photoURL: uploadimageurl,
      });

      //create empty userChats collection on firestore
      const chatDocRef = doc(db, "userChats", res.user.uid);
      await setDoc(chatDocRef, {});

      // After all successful operations, navigate to home page
      navigate("/");
    } catch (error) {
      setError(true);
      setLoading(false);
      console.log("Registration failed");
    }
  };

  return (
    <div style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover', // Cover the entire background
      backgroundPosition: 'center', // Center the image
      height: '100vh', // Full viewport height
      width: '100vw', // Full viewport width
      display: 'flex',
      alignItems: 'center', // Center content vertically
      justifyContent: 'center', // Center content horizontally
    }}>
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">RACCON CHAT</span>
        <span className="title">Register</span>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPass(e.target.value)}
          />

          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={handleImageChange}
          />

          <label htmlFor="file" className="avatarLabel">
            <div className="avatarContainer">
              <img src={avatarURL || DefaultAvatar} alt="Avatar" />
            </div>
            <span>{avatarURL ? "Change avatar" : "Add an avatar"}</span>
          </label>

          <button type="submit">Sign Up</button>

          {loading && "Uploading and compressing the image please wait..."}

          {error && <h3>Something went wrong!</h3>}
        </form>

        <p>
          Do you have an account? <Link to="/login" style={{color:"white"}}>Login</Link>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Register;
