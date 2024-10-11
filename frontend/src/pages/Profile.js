import "./Editprofile.css";

const Profile = () => {
  return (
    <div className="wrapperClass">
      <h2>Edit Profile</h2>
      <div className="profile-section">
        <img
          src="https://www.citypng.com/public/uploads/preview/transparent-hd-white-male-user-profile-icon-701751695035030pj3izxn7kh.png"
          alt="Profile Icon"
          className="profile-icon"
        />
        <div className="contact-info">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" placeholder="Enter username" className="custom-input" />
          
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" placeholder="Enter email" className="custom-input" />
          
          <label htmlFor="phone">Phone Number:</label>
          <input type="tel" id="phone" placeholder="Enter phone number" className="custom-input" />
          
          <label htmlFor="bio">Bio:</label>
          <textarea id="bio" placeholder="Write something about yourself..." className="custom-input"></textarea>
          
          <button className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
