# Technical Context: GetParked

## 1. Core Technologies

-   **Frontend Framework:** Next.js (with React)
    -   Utilizing the App Router for routing and server components.
    -   TypeScript for static typing.
-   **Backend-as-a-Service (BaaS):** Supabase
    -   **Authentication:** Supabase Auth (Email/Password, OAuth planned).
    -   **Database:** PostgreSQL provided by Supabase.
    -   **Storage:** Supabase Storage (for potential future use like image uploads).
-   **Mapping Library:** Leaflet.js
    -   Integrated into React using `react-leaflet`.
    -   Tiles from OpenStreetMap (OSM).
-   **Styling:** Tailwind CSS
    -   Utility-first CSS framework for rapid UI development.
-   **UI Components:** Shadcn/UI or Radix UI (planned/preferred)
    -   For accessible and customizable UI primitives like modals, buttons, inputs.

## 2. Development Environment & Tooling

-   **Package Manager:** npm (implied by `package-lock.json`).
-   **Containerization:** Docker and Docker Compose
    -   Ensures consistent development and production environments.
    -   `Dockerfile` defines the application image.
    -   `docker-compose.yml` orchestrates services (e.g., the Next.js app, potentially a local Supabase instance if not using cloud).
-   **Build/Task Automation:** Makefile
    -   Provides simplified commands for common development tasks (e.g., `make dev`, `make build`).
-   **Version Control:** Git (implied by `.gitignore`).
-   **Language:** TypeScript throughout the Next.js application.
-   **Linters/Formatters:** (Not explicitly detailed, but common in Next.js/TS projects, e.g., ESLint, Prettier). Auto-formatting is active in the IDE.

## 3. Key Libraries in Use (Relevant to Current Task & General Map Functionality)

-   **`leaflet`:** Core mapping library.
    -   `L.Map`: The main map object.
    -   `L.Marker`: For displaying pins on the map.
    -   `L.Circle`: Used by `SelectionArea` to display the radius.
    -   `L.divIcon`: Used in `map-utils.ts` to create custom HTML markers.
    -   `L.Routing.control`: For displaying routes (from `RouteManager`).
    -   Event handling (`on`, `off`).
-   **`react-hot-toast`:** For displaying toast notifications (success, error, loading).
    -   Used via `showToast` wrapper in `src/lib/toast.ts`.
-   **`clsx`, `tailwind-merge`:** Utilities for constructing Tailwind CSS class names conditionally and merging them.
    -   Used via `cn` function in `src/lib/utils.ts`.

## 4. Supabase Integration (`src/lib/supabase.ts`)

-   The Supabase client is initialized using environment variables:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   This client (`supabase`) is used for all interactions with Supabase services (Auth, DB).
-   Example usage in `src/lib/map-markers.ts` to fetch marker data from `public_spot_markers` and `private_parking_markers` tables.

## 5. Map Interaction Logic (Key Files for Current Task)

-   **`src/lib/public-spot-creator.ts` (Class: `PublicSpotCreator`)**
    -   Manages the UI/UX for a user creating a new public spot.
    -   Handles map clicks to place a temporary, draggable marker.
    -   Interacts with `SelectionArea` to ensure the spot is within the allowed radius.
    -   Communicates marker position changes via `onPositionChange` callback.
-   **`src/lib/map-functions/selection-area.ts` (Class: `SelectionArea`)**
    -   Displays a visual circle (radius) on the map around the user's current position.
    -   Checks if a given `L.LatLng` (clicked point) is within this radius.
    -   The radius value is a key parameter for the current task (needs to be 1km = 1000m).
-   **`src/lib/map-utils.ts`**
    -   Provides factory functions (`createPublicSpotMarker`, `createPrivateParkingMarker`) to generate `L.Marker` instances with custom HTML icons and popups.
    -   These define the appearance of *existing* spots. The *newly created* spot in `PublicSpotCreator` currently uses a default Leaflet marker.
-   **`src/app/dashboard/components/MapComponent.tsx`**
    -   This is likely where the Leaflet map is initialized and where instances of `PublicSpotCreator` and `SelectionArea` would be created and managed in response to user actions (e.g., clicking a "Create Spot" button).
    -   The `userPosition` required by `SelectionArea` and potentially `PublicSpotCreator` would originate from or be passed through this component.

## 6. Data Structures (Relevant Types from `src/types/map.ts`)

-   `PublicSpotMarker`: Defines the structure for public spot data (name, latitude, longitude, available_spots, total_spots).
-   `PrivateParkingMarker`: Defines the structure for private parking data (name, latitude, longitude, price_per_hour, is_open).
-   `MapMarker`: A union type `PublicSpotMarker | PrivateParkingMarker`.

These types are used when fetching data from Supabase and when creating markers with popups in `map-utils.ts`.

## 7. API and External Services (Planned/In Use)

-   **Supabase API:** For database and auth.
-   **OpenStreetMap (OSM):** Provides map tiles.
-   **Geocoding API (e.g., Nominatim, Mapbox Geocoding):** For converting addresses to coordinates.
-   **Routing API (e.g., OpenRouteService, Mapbox Directions):** For calculating routes.
-   **Payment Gateway (e.g., Stripe):** For (simulated) payments (future: real payments).

## 8. Code Conventions & Patterns

-   **TypeScript Classes:** Used for encapsulating complex map-related logic (e.g., `PublicSpotCreator`, `SelectionArea`, `RouteManager`).
-   **Utility Functions:** Grouped in `lib/*.ts` files (e.g., `map-utils.ts`, `toast.ts`).
-   **Environment Variables:** For Supabase configuration and other sensitive keys, prefixed with `NEXT_PUBLIC_` for client-side accessibility where needed.
-   **Custom Event Dispatching:** `map-utils.ts` uses `window.dispatchEvent(new CustomEvent('calculate-route', ...))` to trigger actions from within marker popups. This suggests a pattern of decoupling UI elements (popups) from direct function calls to services/managers.
