import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'; // Import the Register component
import './styles/index.css';
import Navbar from './components/Navbar'; // Import the Navbar component
import Following from './pages/Following'; // Import the Following component
import Sell from './pages/Sell'; // Import the Sell component
import Profile from './pages/Profile'; // Import the Profile component
import Explore from './pages/Explore'; // Import the Explore component
import Footer from './components/Footer';
import reportWebVitals from './reportWebVitals';
import EditProfile from './pages/EditProfile'; // Adjust the path as needed
import SingleItem from './pages/SingleItem';
import NotLoggedIn from './pages/NotLoggedIn';
import SearchResults from './pages/SearchResults';
import UniqueProfileView from './pages/UniqueProfileView'; // Adjust the path as needed


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
        <Route path="/profile/:id" element={<UniqueProfileView />} /> {/* UniqueProfileView route */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route> */}
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/post/:id" element={<SingleItem />} />
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

//export default App;
