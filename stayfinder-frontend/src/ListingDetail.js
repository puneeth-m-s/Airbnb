//import "./ListingDetail.css"
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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

      const decoded = jwtDecode(token);
      const userEmail = decoded.email;

      await axios.post(
        "http://localhost:5000/api/bookings",
        {
          listingId: listing._id,
          user: userEmail
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

export default ListingDetail;
