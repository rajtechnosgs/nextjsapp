"use client";

import { useEffect, useState } from "react";
import './productstyle.css'
export default function FlightSearchPage() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [departureDate, setDepartureDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [flightResults, setFlightResults] = useState([]);

  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length < 2) return;

    setLoading(true);
    try {
      const res = await fetch("https://beta.smileformiles.net/web_service/b2c/flight/SearchAirport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": "e211cdbc6058d4778b51b673fe785726",
        },
        body: JSON.stringify({ SearchString: query }),
      });

      const data = await res.json();
      if (data.Results) {
        setSuggestions(data.Results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("API error:", error);
      setSuggestions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchSuggestions(fromQuery, setFromSuggestions), 300);
    return () => clearTimeout(delay);
  }, [fromQuery]);

  useEffect(() => {
    const delay = setTimeout(() => fetchSuggestions(toQuery, setToSuggestions), 300);
    return () => clearTimeout(delay);
  }, [toQuery]);

  // ✅ Handle SearchFlight API
  const handleSearch = async () => {
  if (!fromQuery || !toQuery || !departureDate) {
    alert("Please fill in all fields.");
    return;
  }

  const extractIATA = (str) => {
    const match = str.match(/\(([^)]+)\)$/);
    return match ? match[1] : "";
  };

  const origin = extractIATA(fromQuery);
  const destination = extractIATA(toQuery);
  const dateTime = `${departureDate}T00:00:00`;

  const requestBody = {
    AdultCount: "1",
    ChildCount: "0",
    InfantCount: "0",
    JourneyType: "1",
    Sources: "",
    FareType: "1",
    DirectFlight: false,
    Segments: [
      {
        Origin: origin,
        Destination: destination,
        FlightCabinClass: "1",
        PreferredDepartureTime: dateTime,
        PreferredArrivalTime: dateTime,
      },
    ],
  };
setLoading(true)
  try {
    const res = await fetch("https://beta.smileformiles.net/web_service/b2c/flight/SearchFlight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": "e211cdbc6058d4778b51b673fe785726",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    const results = data.Results?.[0] || []; // First group of results
    const allOptions = results.flatMap((result) => result.FareDataMultiple || []);
    setFlightResults(allOptions);
  } catch (error) {
    console.error("Flight Search error:", error);
    alert("Something went wrong. Please try again.");
  }
  setLoading(false);
};

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h2>Flight Search</h2>

      {/* From Field */}
      <label>From</label>
      <input
        type="text"
        placeholder="Departure city or airport"
        value={fromQuery}
        onChange={(e) => setFromQuery(e.target.value)}
        style={inputStyle}
      />
      {fromSuggestions.length > 0 && (
        <ul style={suggestionListStyle}>
          {fromSuggestions.map((item) => (
            <li
              key={item.AirportCode + "from"}
              style={suggestionItemStyle}
              onClick={() => {
                setFromQuery(`${item.CityName} (${item.AirportCode})`);
                setFromSuggestions([]);
              }}
            >
              {item.CityName} - {item.AirportName} ({item.AirportCode})
            </li>
          ))}
        </ul>
      )}

      {/* To Field */}
      <label>To</label>
      <input
        type="text"
        placeholder="Destination city or airport"
        value={toQuery}
        onChange={(e) => setToQuery(e.target.value)}
        style={inputStyle}
      />
      {toSuggestions.length > 0 && (
        <ul style={suggestionListStyle}>
          {toSuggestions.map((item) => (
            <li
              key={item.AirportCode + "to"}
              style={suggestionItemStyle}
              onClick={() => {
                setToQuery(`${item.CityName} (${item.AirportCode})`);
                setToSuggestions([]);
              }}
            >
              {item.CityName} - {item.AirportName} ({item.AirportCode})
            </li>
          ))}
        </ul>
      )}

      {/* Departure Date */}
      <label>Departure Date</label>
      <input
        type="date"
        value={departureDate}
        onChange={(e) => setDepartureDate(e.target.value)}
        style={inputStyle}
      />

      {/* Search Button */}
      <button
        onClick={handleSearch}
        style={{
          marginTop: "1rem",
          width: "100%",
          padding: "0.75rem",
          fontSize: "1rem",
          borderRadius: "6px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Search Flights
      </button>
     {flightResults.length > 0 && (
  <div style={{ marginTop: "2rem" }}>
    <h3>Available Flights</h3>
     <div
      style={{
        display: "flex",
        gap: "1rem",
        overflowX: "auto",
        paddingBottom: "1rem",
      }}
    >
      {flightResults.map((flight, index) => {
        const segment = flight.FareSegments[0];
        const fare = flight.Fare;

        return (
          <div
            key={index}
            style={{
              minWidth: "280px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              backgroundColor: "#f9f9f9",
              flexShrink: 0,
            }}
          >
            <strong>
              {segment.AirlineName} ({segment.AirlineCode}
              {segment.FlightNumber})
            </strong>
            <p>
              {segment.FromCity} ({segment.FromAirportCode}) →{" "}
              {segment.ToCity} ({segment.ToAirportCode})
            </p>
            <p>Baggage: {segment.Baggage}</p>
            <p>Cabin: {segment.CabinBaggage}</p>
            <p>Class: {segment.CabinClassName} ({segment.FareClass})</p>
            <p>Fare: ₹{fare.OfferedFare} ({flight.Source} Fare)</p>
          </div>
        );
      })}
    </div>
  </div>
)}



      {loading && <div className="loader-wrapper">
      <div className="loader"></div> </div>}
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  fontSize: "1rem",
  marginBottom: "0.5rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const suggestionListStyle = {
  listStyle: "none",
  padding: 0,
  marginBottom: "1rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  backgroundColor: "#fff",
};

const suggestionItemStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #eee",
  cursor: "pointer",
};
