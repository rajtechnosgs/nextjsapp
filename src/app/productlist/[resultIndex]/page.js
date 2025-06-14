"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FlightDetail({ params }) {
  const searchParams = useSearchParams();
  const traceId = searchParams.get("traceId");
  const srdvIndex = searchParams.get("srdvIndex");
  const resultIndex = params.resultIndex;

  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (traceId && resultIndex) {
      fetch("https://beta.smileformiles.net/web_service/b2c/flight/FareQuote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": "e211cdbc6058d4778b51b673fe785726",
        },
        body: JSON.stringify({
          TraceId: parseInt(traceId),
          SrdvIndex: parseInt(srdvIndex),
          ResultIndex: [resultIndex],

        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setFlightData(data.Results || null);
          setLoading(false);
        });
    }
  }, [traceId, srdvIndex, resultIndex]);

  if (loading) return <p className="p-6">Loading flight details...</p>;
  if (!flightData) return <p className="p-6">No flight data available.</p>;

  const { Segments, Fare, IsRefundable, AirlineCode } = flightData;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Flight Details</h1>

      <p className="mb-2"><strong>Refundable:</strong> {IsRefundable ? "Yes" : "No"}</p>
      <p className="mb-2"><strong>Total Fare:</strong> ₹{Fare?.PublishedFare}</p>
      <p className="mb-4"><strong>Base:</strong> ₹{Fare?.BaseFare} | <strong>Tax:</strong> ₹{Fare?.Tax}</p>

      {Segments?.map((segmentGroup, index) => (
        <div key={index} className="border p-4 mb-4 rounded shadow">
          <h2 className="font-semibold text-lg mb-2">Leg {index + 1}</h2>
          {segmentGroup.map((seg, i) => (
            <div key={i} className="mb-3">
              <p><strong>Flight:</strong> {seg.Airline.AirlineName} {seg.Airline.FlightNumber}</p>
              <p><strong>From:</strong> {seg.Origin.CityName} ({seg.Origin.AirportCode})</p>
              <p><strong>To:</strong> {seg.Destination.CityName} ({seg.Destination.AirportCode})</p>
              <p><strong>Departure:</strong> {new Date(seg.DepTime).toLocaleString()}</p>
              <p><strong>Arrival:</strong> {new Date(seg.ArrTime).toLocaleString()}</p>
              <p><strong>Baggage:</strong> {seg.Baggage}, <strong>Cabin:</strong> {seg.CabinBaggage}</p>
              <hr className="my-2" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
