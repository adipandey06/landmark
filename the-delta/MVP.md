# Minimum Viable Product (MVP) - Landmark

## 1. MVP Scope & Goals

The objective of the Landmark MVP is to demonstrate the feasibility of fusing satellite and IoT data to provide a holistic view of agricultural health in one pilot region (e.g., Sub-Saharan Africa).

## 2. Core Functional Requirements

### 2.1. Interactive Data Map

- Display at least 50 mock sensors in the target region.
- Coloring sensors by status (Online, Warning, Offline, Critical).
- Detailed side panel for individual sensor metrics (pH, moisture, turbidity).
- Toggable satellite layer for "Soil Moisture".

### 2.2. Basic Satellite Intelligence

- Global fusion scores dashboard.
- 30-day historical soil moisture trend chart.
- Coverage analysis for the pilot region.

### 2.3. Initial Risk Assessment

- AI-generated risk scores for 4 categories (Drought, Salinity, Nutrients, Contamination).
- Basic 7-day forecast visualization.

### 2.4. Blockchain Proof-of-Concept

- Mocked audit trail showing event logs with "verified" hashes.
- Verification badge on critical data points.

## 3. User Experience (UX)

- Mobile-first, responsive design (Next.js & Tailwind).
- Monospace aesthetic for a high-tech/intelligence feel.
- Glassmorphic panels for a modern, premium look.

## 4. Technical Stack for MVP

- **Framework:** Next.js 16 (App Router).
- **Visualization:** Mapbox GL (Map), Recharts (Charts).
- **Styling:** Tailwind CSS 4 + Radix UI.
- **Data Handling:** Deterministic mock data generators for rapid demonstration.

## 5. Success Metrics

- Successful rendering of 50+ sensors with zero performance lag.
- Seamless toggling between satellite and sensor layers.
- Positive feedback from stakeholders on data clarity and visual appeal.
- Successful simulation of a data "audit" to demonstrate trust.
