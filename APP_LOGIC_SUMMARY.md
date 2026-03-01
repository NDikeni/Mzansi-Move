# Mzansi Move: Application Logic & Unique Solutions

## 1. The "Taxi Problem" Context
The South African minibus taxi industry often faces challenges with inefficient routing, inconsistent pricing, and a lack of transparency. Mzansi Move addresses these by digitizing the "queue" and "fare" systems using AI-driven logic tailored to the local context.

## 2. AI-Powered Dynamic Queueing (The Core Innovation)
Unlike traditional ride-sharing apps that follow a simple "first-in, first-out" model, Mzansi Move uses a specialized AI Dispatcher logic:
*   **Proximity Matching:** The AI analyzes the destinations of all boarded passengers. If a new passenger's destination is geographically close to an existing one (e.g., Hannah going near Lucy at Cloud Gate), the AI automatically groups them together in the drop-off sequence.
*   **Descending Order Efficiency:** The queue is strictly organized so that the person with the furthest destination from the driver's starting point is always at the bottom. This ensures the driver follows a linear path without backtracking.
*   **Delay Protection (The "Twice Delayed" Rule):** To prevent passengers from being pushed back indefinitely as new people join, the system tracks a `delay_count`. If a passenger is pushed back twice, the AI is restricted from delaying them a third time, granting them "Priority Status."

## 3. Advanced Occupancy-Based Pricing
Pricing is no longer a flat rate or a mystery. It is calculated dynamically to benefit both the driver and the commuter:
*   **Price per KM Tiers:** Drivers set three rates: **Empty Taxi** (1 person), **Half-Full**, and **Full**.
*   **Real-Time Recalculation:** As passengers join or leave, the system automatically recalculates the fare for *everyone* in the taxi based on the current occupancy. If the taxi fills up mid-trip, everyone pays the lower "Full" rate.
*   **Distance-Based Accuracy:** Fares are calculated using precise GPS distance data, eliminating disputes over "standard" rates.

## 4. Driver Performance & Accountability
*   **Driving Score:** Every driver has a live "Driving Score" (0-100%). This updates in real-time based on passenger ratings.
*   **Incentivized Service:** High scores are rewarded with better visibility to passengers, encouraging safety and courtesy.
*   **Trip History:** Drivers have full access to their past earnings, passenger counts, and scores, allowing them to manage their business with professional-grade data.

## 5. Transparency & Trust
*   **Live Queue Visibility:** Passengers see their exact position in the drop-off queue (#1, #2, etc.) and are alerted if they have "Priority Status" due to previous delays.
*   **Identity-Based Login:** Users access the app via a secure Username/Password system, ensuring their trip history and preferences are saved.
