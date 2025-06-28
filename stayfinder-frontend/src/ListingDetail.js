import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ListingDetail() {
  const { id } = useParams(); // ✅ gets the id from URL
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

  // ✅ Add your handleBooking function HERE
  const handleBooking = async () => {
    try {
      await axios.post("http://localhost:5000/api/bookings", {
        listingId: listing._id,
        user: "testuser@example.com" // for now, a placeholder user
      });
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
      {/* ✅ Attach handleBooking to the button */}
      <button onClick={handleBooking}>Book Now</button>
    </div>
  );
}

export default ListingDetail;
