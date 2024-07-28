import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import bg from "../images/bg2.jpg";


const Login = () => {
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //Create user
      await signInWithEmailAndPassword(auth, email, password);

      // After all successfull login, navigate to home page
      navigate("/");
    } catch (error) {
      setError(true);
      console.log("uploading failed");
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
        <span className="title">Login</span>

        <form onSubmit={handleSubmit}>
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

          <button>Sign In</button>

          {error && <h3>Something went wrong!</h3>}
        </form>

        <p>
          You don't have an account? <Link to="/register" style={{color:"white"}}>Register</Link>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Login;
