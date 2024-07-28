import React from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import bg from "../images/bg2.jpg";

const Home = () => {
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
      <div className="home">
        <div className="container">
          <Sidebar />
          <div style={{width:3}}> </div>
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Home;
