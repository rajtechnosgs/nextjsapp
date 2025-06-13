// app/flight-detail/page.jsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FlightDetail() {
  const params = useSearchParams();
  const traceId = params.get("traceId");
  const srdvIndex = params.get("srdvIndex");
  const resultIndex = params.get("resultIndex");

  const [fareRule, setFareRule] = useState(null);

  useEffect(() => {
    if (traceId && resultIndex) {
      fetch("https://beta.smileformiles.net/web_service/b2c/flight/FareRule", {
        method: "POST",
        headers: { "Content-Type": "application/json", ApiKey: "YOUR_API_KEY" },
        body: JSON.stringify({
          TraceId: Number(traceId),
          SrdvIndex: Number(srdvIndex),
          ResultIndex: resultIndex,
        }),
      })
        .then(res => res.json())
        .then(data => setFareRule(data.Results?.[0]?.FareRuleDetail || "No rules found"));
    }
  }, [traceId, resultIndex, srdvIndex]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Flight Fare Rules</h2>
      <div
        className="mt-4 border p-4"
        dangerouslySetInnerHTML={{ __html: fareRule }}
      />
    </div>
  );
}
