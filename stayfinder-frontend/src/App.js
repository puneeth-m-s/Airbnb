import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // Fetch listings from backend
    axios
      .get("http://127.0.0.1:5000/api/listings")
      .then((response) => {
        setListings(response.data);
      })
      .catch((error) => {
        console.error("Error fetching listings:", error);
      });
  }, []);

  return (
    <div className="App">
      <h1>StayFinder Listings</h1>
      <div className="listings-container">
        {listings.map((listing) => (
          <div className="listing-card" key={listing._id}>
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="listing-image"
            />
            <h2>{listing.title}</h2>
            <p>{listing.location}</p>
            <p>₹{listing.price} / night</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
