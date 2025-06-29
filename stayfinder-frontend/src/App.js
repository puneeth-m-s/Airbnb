import "./App.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// ListingDetail component
function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(response.data);
      } catch (err) {
        console.error("Error fetching listing:", err);
      }
    };
    fetchListing();
  }, [id]);

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to book.");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/bookings",
        {
          listingId: listing._id,
          user: "placeholder@example.com" // You can replace this later with decoded email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("Booking successful!");
    } catch (err) {
      console.error("Error booking:", err);
      alert("Booking failed.");
    }
  };

  if (!listing) return <p>Loading...</p>;

  return (
    <div>
      <h2>{listing.title}</h2>
      <img
        src={listing.images[0]}
        alt={listing.title}
        style={{ width: "400px" }}
      />
      <p>{listing.description}</p>
      <p><strong>Location:</strong> {listing.location}</p>
      <p><strong>Price:</strong> ₹{listing.price}</p>
      <button onClick={handleBooking}>Book Now</button>
    </div>
  );
}

// Login component
function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");
      window.location.href = "/";
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Login failed.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Register component
function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData);
      localStorage.setItem("token", response.data.token);
      alert("Registration successful!");
      window.location.href = "/";
    } catch (err) {
      console.error("Error registering:", err);
      alert("Registration failed.");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <br />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

// Home component
function Home() {
  const [listings, setListings] = useState([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchListings = async (filters = {}) => {
    try {
      const response = await axios.get("http://localhost:5000/api/listings", {
        params: filters,
      });
      setListings(response.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  };

  useEffect(() => {
    // Load all listings initially
    fetchListings();
  }, []);

  const token = localStorage.getItem("token");
  let userEmail = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userEmail = decoded.email;
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings({
      location: searchLocation,
      maxPrice: maxPrice,
    });
  };

  return (
    <div>
      <h1>StayFinder Listings</h1>
      <div>
        {userEmail ? (
          <>
            <p>Welcome, {userEmail}</p>
            <Link to="/my-bookings">My Bookings</Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <div>
            <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </div>
        )}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search by location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Search</button>
      </form>

      <div className="listings">
        {listings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          listings.map((listing) => (
            <div key={listing._id} className="listing-card">
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="listing-image"
                  style={{ width: "300px", height: "200px" }}
                />
                <h3>{listing.title}</h3>
                <p>{listing.location}</p>
                <p>₹{listing.price}</p>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// MyBookings component
function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!token) {
          alert("Please login to view your bookings.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/bookings/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setBookings(response.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        alert("Failed to load bookings.");
      }
    };

    fetchBookings();
  }, [token]);

  if (!token) {
    return <p>Please login to view your bookings.</p>;
  }

  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking._id}>
              <h3>{booking.listingId?.title}</h3>
              <p><strong>Location:</strong> {booking.listingId?.location}</p>
              <p><strong>Price:</strong> ₹{booking.listingId?.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </Router>
  );
}

export default App;
