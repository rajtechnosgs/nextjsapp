"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import './hotelstyle.css'

export default function HotelSearch() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [checkIn, setCheckIn] = useState("2025-07-28");
  const [checkOut, setCheckOut] = useState("2025-07-29");
  const [hotels, setHotels] = useState([]);
  const [traceId, setTraceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredHotels, setFilteredHotels] = useState([]);

  // Filter States
  const [filterName, setFilterName] = useState("");
  const [filterStar, setFilterStar] = useState("All");
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceRange, setPriceRange] = useState(0);

  const handleSearchCity = async (e) => {
    const searchValue = e.target.value;
    setCity(searchValue);

    if (searchValue.length >= 3) {
         setLoading(true);
      const res = await fetch("https://beta.smileformiles.net/web_service/b2c/hotel/SearchHotelCity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": "e211cdbc6058d4778b51b673fe785726",
        },
        body: JSON.stringify({ SearchString: searchValue, RequestType: "" }),
      });
      const data = await res.json();
      if (data?.Results) setSuggestions(data.Results);
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (city) => {
    setCity(city.CityName);
    setSelectedCityId(city.CityID);
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    const body = {
      CheckInDate: checkIn,
      CheckOutDate: checkOut,
      CityID: selectedCityId,
      GuestNationality: "IN",
      NoOfRooms: "1",
      RequestType: "IndiaSpecial",
      RoomGuests: [{ NoOfAdults: "1", NoOfChild: "0", ChildAge: [] }],
      MinRating: "0",
      MaxRating: "5",
    };
    setLoading(true)

    const res = await fetch("https://beta.smileformiles.net/web_service/b2c/hotel/Search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": "e211cdbc6058d4778b51b673fe785726",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data?.Results) {
      setHotels(data.Results);
      setTraceId(data.TraceId);
      const max = Math.max(...data.Results.map(h => h?.Price?.OfferedPriceRoundedOff || h.OfferedFare || 0));
      setMaxPrice(max);
      setPriceRange(max);
    }
    setLoading(false)
  };

  // Apply filters
  useEffect(() => {
    let result = [...hotels];

    if (filterName) {
      result = result.filter(h =>
        h.HotelName.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterStar !== "All") {
      result = result.filter(h => String(h.StarRating) === filterStar);
    }

    if (priceRange) {
      result = result.filter(h => (h?.Price?.OfferedPriceRoundedOff || h.OfferedFare || 0) <= priceRange);
    }

    setFilteredHotels(result);
  }, [filterName, filterStar, priceRange, hotels]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Hotel Search</h1>

      {/* Search Form */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Where are you going?</label>
          <input
            type="text"
            value={city}
            onChange={handleSearchCity}
            placeholder="Enter city name"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
          {suggestions.length > 0 && (
            <ul style={{ background: "#f1f1f1", listStyle: "none", padding: "5px", marginTop: "0" }}>
              {suggestions.map((s, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSuggestion(s)}
                  style={{ padding: "5px", cursor: "pointer" }}
                >
                  {s.CityName}, {s.Country}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Check-In</label>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Check-Out</label>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Search Hotels
        </button>
      </div>
      {loading && <div className="loader-wrapper">
      <div className="loader"></div> </div>}

      {/* Filter Controls */}
      {hotels.length > 0 && (
        <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "10px" }}>
          <h3>Filter Results</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <input
              type="text"
              placeholder="Filter by name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={{ flex: "1", padding: "8px" }}
            />
            <select value={filterStar} onChange={(e) => setFilterStar(e.target.value)} style={{ padding: "8px" }}>
              <option value="All">All Stars</option>
              {[1, 2, 3, 4, 5].map(star => (
                <option key={star} value={star}>{star} Star</option>
              ))}
            </select>
            <div style={{ flex: "1" }}>
              <label>Max Price: ₹{priceRange}</label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hotel Cards */}
      {filteredHotels.map((hotel, index) => (
        <div key={index} style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          alignItems: "flex-start"
        }}>
          <img
            src={hotel.HotelPicture}
            alt={hotel.HotelName}
            style={{ width: "120px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 5px" }}>{hotel.HotelName}</h3>
            <p style={{ margin: "2px 0" }}>{hotel.HotelAddress}, {hotel.City}</p>
            <p style={{ margin: "2px 0", color: "#777" }}>⭐ {hotel.StarRating} Star</p>
            <p style={{ margin: "2px 0", fontWeight: "bold" }}>
              ₹ {hotel?.Price?.OfferedPriceRoundedOff || hotel.OfferedFare}
            </p>
            <Link
  href={{
    pathname: `/hotel/${hotel.HotelCode}`,
    query: {
      traceId: traceId,
      srdvIndex: hotel.SrdvIndex,
      resultIndex: hotel.ResultIndex,
    },
  }}
>
  <button className="book-btn">Book</button>
</Link>

          </div>
        </div>
      ))}
    </div>
  );
}
