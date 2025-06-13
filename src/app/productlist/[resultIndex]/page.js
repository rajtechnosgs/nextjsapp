// app/flight-detail/[resultIndex]/page.jsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FlightDetail({ params }) {
  const searchParams = useSearchParams();
  const traceId = searchParams.get("traceId");
  const srdvIndex = searchParams.get("srdvIndex");
  const resultIndex = params.resultIndex;

  const [fareDetail, setFareDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(resultIndex);
  useEffect(() => {
    if (traceId && resultIndex) {
      fetch("https://beta.smileformiles.net/web_service/b2c/flight/FareRule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
         "Api-Token": "e211cdbc6058d4778b51b673fe785726",
        },
        body: JSON.stringify({
          TraceId: parseInt(traceId),
          SrdvIndex: parseInt(srdvIndex),
          ResultIndex: resultIndex,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setFareDetail(data.Results?.[0]?.FareRuleDetail || "No Fare Detail Found");
          setLoading(false);
        });
    }
  }, [traceId, srdvIndex, resultIndex]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Flight Fare Rules</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: fareDetail }} />
      )}
    </div>
  );
}
