"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import './productstyle.css'
export default function FlightSearchPage() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [departureDate, setDepartureDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [flightResults, setFlightResults] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [showModifySearch, setShowModifySearch] = useState(false);
  const [traceId, setTraceId] = useState("");
  const [fareTypes, setFareTypes] = useState({
  refundable: false,
  nonRefundable: false,
});
const [stopsFilter, setStopsFilter] = useState({
  nonstop: false,
  oneStop: false,
  twoPlusStops: false,
});
const [priceRange, setPriceRange] = useState([0, 100000]); // Default min-max
const [priceLimits, setPriceLimits] = useState([0, 100000]); // Actual limits from data





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
    setTraceId(data.TraceId);
    const results = data.Results?.[0] || []; // First group of results
    const allOptions = results.flatMap((result) => result.FareDataMultiple || []);
    setFlightResults(allOptions);
    if (allOptions.length > 0) {
  const prices = allOptions.map((f) => f.Fare.OfferedFare);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  setPriceLimits([minPrice, maxPrice]);
  setPriceRange([minPrice, maxPrice]);
}
  } catch (error) {
    console.error("Flight Search error:", error);
    alert("Something went wrong. Please try again.");
  }
  setLoading(false);
};
const getUniqueAirlines = () => {
  const names = flightResults.map(f => f.FareSegments[0]?.AirlineName || "Unknown");
  return Array.from(new Set(names));
};

const router = useRouter();






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

      <button
  onClick={() => setShowModifySearch(true)}
  style={{
    padding: "0.5rem 1rem",
    backgroundColor: "#f5b000",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "1rem"
  }}
>
  Modify Search
</button>


      {showModifySearch && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }}>
    <div style={{
      background: "white",
      borderRadius: "10px",
      padding: "2rem",
      width: "650px",
      maxWidth: "95%",
      position: "relative"
    }}>
      <button onClick={() => setShowModifySearch(false)} style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "transparent",
        border: "none",
        fontSize: "1.2rem",
        cursor: "pointer"
      }}>✖</button>

      <h3 style={{ background: "#ffc107", padding: "10px", borderRadius: "5px" }}>Modify Search</h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
        {/* From Field with suggestions */}
        <div style={{ flex: "1 1 45%" }}>
          <label>From</label>
          <input
            type="text"
            value={fromQuery}
            onChange={(e) => setFromQuery(e.target.value)}
            style={inputStyle}
            placeholder="From airport or city"
          />
          {fromSuggestions.length > 0 && (
            <ul style={suggestionListStyle}>
              {fromSuggestions.map((item) => (
                <li
                  key={item.AirportCode + "from-popup"}
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
        </div>

        {/* To Field with suggestions */}
        <div style={{ flex: "1 1 45%" }}>
          <label>To</label>
          <input
            type="text"
            value={toQuery}
            onChange={(e) => setToQuery(e.target.value)}
            style={inputStyle}
            placeholder="To airport or city"
          />
          {toSuggestions.length > 0 && (
            <ul style={suggestionListStyle}>
              {toSuggestions.map((item) => (
                <li
                  key={item.AirportCode + "to-popup"}
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
        </div>

        {/* Date */}
        <div style={{ flex: "1 1 45%" }}>
          <label>Departure Date</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Search Button */}
        <div style={{ flex: "1 1 100%", textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={() => {
              handleSearch();
              setShowModifySearch(false);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#ffc107",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem"
            }}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {flightResults.length > 0 && (
  <>
    <h3>Filters</h3>
    <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {getUniqueAirlines().map((airline) => (
        <label key={airline} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={selectedAirlines.includes(airline)}
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedAirlines(prev =>
                checked ? [...prev, airline] : prev.filter(a => a !== airline)
              );
            }}
          />
          {airline}
        </label>
      ))}
    </div>
    <h4>Fare Type</h4>
<div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <input
      type="checkbox"
      checked={fareTypes.refundable}
      onChange={(e) =>
        setFareTypes((prev) => ({ ...prev, refundable: e.target.checked }))
      }
    />
    Refundable
  </label>
  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <input
      type="checkbox"
      checked={fareTypes.nonRefundable}
      onChange={(e) =>
        setFareTypes((prev) => ({ ...prev, nonRefundable: e.target.checked }))
      }
    />
    Non-Refundable
  </label>
</div>
<h4>Stops</h4>
<div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <input
      type="checkbox"
      checked={stopsFilter.nonstop}
      onChange={(e) =>
        setStopsFilter((prev) => ({ ...prev, nonstop: e.target.checked }))
      }
    />
    Non-stop
  </label>
  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <input
      type="checkbox"
      checked={stopsFilter.oneStop}
      onChange={(e) =>
        setStopsFilter((prev) => ({ ...prev, oneStop: e.target.checked }))
      }
    />
    1 Stop
  </label>
  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <input
      type="checkbox"
      checked={stopsFilter.twoPlusStops}
      onChange={(e) =>
        setStopsFilter((prev) => ({ ...prev, twoPlusStops: e.target.checked }))
      }
    />
    2+ Stops
  </label>
</div>
<h4>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</h4>
<div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
  <input
    type="range"
    min={priceLimits[0]}
    max={priceLimits[1]}
    value={priceRange[0]}
    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
  />
  <input
    type="range"
    min={priceLimits[0]}
    max={priceLimits[1]}
    value={priceRange[1]}
    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
  />
</div>



  </>
)}

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
    {flightResults
  .filter((flight) => {
  const airlineName = flight.FareSegments[0]?.AirlineName;
  const isRefundable = flight.IsRefundable;
  const segmentCount = flight.FareSegments.length;
  const price = flight.Fare.OfferedFare;
const priceMatch = price >= priceRange[0] && price <= priceRange[1];


  // Airline Filter
  const airlineMatch =
    selectedAirlines.length === 0 || selectedAirlines.includes(airlineName);

  // Fare Type Filter
  const refundableMatch =
    (!fareTypes.refundable && !fareTypes.nonRefundable) ||
    (fareTypes.refundable && isRefundable) ||
    (fareTypes.nonRefundable && !isRefundable);

  // Stops Filter
  const stopsSelected =
    stopsFilter.nonstop || stopsFilter.oneStop || stopsFilter.twoPlusStops;
    

  let stopsMatch = true; // show all if nothing is selected
  if (stopsSelected) {
    stopsMatch =
      (stopsFilter.nonstop && segmentCount === 1) ||
      (stopsFilter.oneStop && segmentCount === 2) ||
      (stopsFilter.twoPlusStops && segmentCount >= 3);
  }

  //return airlineMatch && refundableMatch && stopsMatch;
  return airlineMatch && refundableMatch && stopsMatch && priceMatch;

})

  .map((flight, index) => {

   console.log(flight);
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
            <button
  onClick={() =>
    router.push(
      `/productlist/${flight.ResultIndex}?traceId=${traceId}&srdvIndex=${flight.SrdvIndex}`
    )
  }
  style={{
    marginTop: "10px",
    padding: "8px 16px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Book
</button>

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
