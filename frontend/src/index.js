import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'; // Import the Register component
import './styles/index.css';
import Navbar from './components/Navbar'; // Import the Navbar component
import Following from './pages/Following'; // Import your Following component
import Sell from './pages/Sell'; // Import your Sell component
import Profile from './pages/Profile'; // Import your Profile component
import Explore from './pages/Explore'; // Import your Explore component
import Footer from './components/Footer';

// import App from './App';
// import App from './App'; 
import reportWebVitals from './reportWebVitals';
import EditProfile from './pages/EditProfile'; // Adjust the path as needed

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/following" element={<Following />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route> */}
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
      <Footer />
    </div>
  )
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();

//export default App;
