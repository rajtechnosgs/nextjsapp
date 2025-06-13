"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const navigateToBooking = () => {
    router.push("/productlist");
  };

  return (
    <div className={styles.landing}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>✈️ Raj's First Next.js Project</h1>
        <p className={styles.subtitle}>Book flights instantly — Fast. Easy. Affordable.</p>
        <button className={styles.button} onClick={navigateToBooking}>
          Start Flight Booking
        </button>

        <div className={styles.features}>
          <div className={styles.card}>
            <h3>🔎 Search Flights</h3>
            <p>Find the best flight deals in seconds.</p>
          </div>
          <div className={styles.card}>
            <h3>💸 View Offers</h3>
            <p>Get access to exclusive discounts and promo codes.</p>
          </div>
          <div className={styles.card}>
            <h3>📞 24x7 Support</h3>
            <p>We’re always here to help, day or night.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
