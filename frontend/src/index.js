import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register';
import './styles/index.css';
import Navbar from './components/Navbar';
import Following from './pages/Following'; 
import Sell from './pages/Sell';
import Profile from './pages/Profile';
import Explore from './pages/Explore'; 
import Footer from './components/Footer';
import reportWebVitals from './reportWebVitals';
import EditProfile from './pages/EditProfile'; 
import SingleItem from './pages/SingleItem';
import NotLoggedIn from './pages/NotLoggedIn';
import SearchResults from './pages/SearchResults';
import UniqueProfileView from './pages/UniqueProfileView'; 


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
        <Route path="/profile/:id" element={<UniqueProfileView />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/posts/:id" element={<SingleItem />} />
        <Route path="/not-logged-in" element={<NotLoggedIn />} />
        <Route path="/search" element={<SearchResults />} />
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