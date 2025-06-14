// app/hotels/[hotelId]/page.js
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function HotelDetailPage({ params }) {
  const searchParams = useSearchParams();
  const traceId = searchParams.get("traceId");
  const srdvIndex = searchParams.get("srdvIndex");
  const resultIndex = searchParams.get("resultIndex");

  const [hotelInfo, setHotelInfo] = useState(null);
   console.log(traceId);
  useEffect(() => {
    const fetchHotelDetails = async () => {
      const res = await fetch("https://beta.smileformiles.net/web_service/b2c/hotel/GetHotelInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": "e211cdbc6058d4778b51b673fe785726",
        },
        body: JSON.stringify({
          TraceId: Number(traceId),
          SrdvIndex: srdvIndex,
          ResultIndex: resultIndex,
        }),
      });

      const data = await res.json();
      setHotelInfo(data.HotelDetails);
    };

    if (traceId && srdvIndex && resultIndex) {
      fetchHotelDetails();
    }
  }, [traceId, srdvIndex, resultIndex]);

  if (!hotelInfo) return <p>Loading...</p>;

  return (
    <div className="hotel-detail">
      <h1>{hotelInfo.HotelName}</h1>
      <p>{hotelInfo.City}, {hotelInfo.CountryName}</p>
      <p>{hotelInfo.StarRating} Stars</p>

      <div className="images">
        {hotelInfo.Images?.map((img, i) => (
          <img key={i} src={img} alt={`Image ${i}`} width={150} />
        ))}
      </div>

      <div className="description">
        {hotelInfo.Description?.map((section, i) => (
          <div key={i}>
            <h3>{section.Name}</h3>
            <ul>
              {section.Detail.map((d, j) => (
                <li key={j}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
