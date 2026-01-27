import { tournamentsDb } from "./lib/database";
import TournamentList from "./components/TournamentList";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

// Revalidate every 30 seconds for ISR-like behavior
export const revalidate = 30;

/**
 * Format tournament dates from database format
 * PostgreSQL returns DATE columns as Date objects
 */
function formatTournamentDates(tournament) {
  if (!tournament) return tournament;

  if (tournament.date) {
    if (tournament.date instanceof Date) {
      const year = tournament.date.getUTCFullYear();
      const month = String(tournament.date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(tournament.date.getUTCDate()).padStart(2, "0");
      tournament.date = `${year}-${month}-${day}`;
    } else if (
      typeof tournament.date === "string" &&
      tournament.date.includes("T")
    ) {
      tournament.date = tournament.date.split("T")[0];
    }
  }

  return tournament;
}

/**
 * Fetch tournaments on the server
 * This runs at request time for SSR
 */
async function getTournaments() {
  try {
    const tournaments = await tournamentsDb.getAll();
    return tournaments.map(formatTournamentDates);
  } catch (error) {
    console.error("Failed to fetch tournaments:", error);
    return [];
  }
}

/**
 * Home Page - Server Component
 * Fetches tournament data on the server for faster LCP
 */
export default async function Home() {
  // Fetch tournaments on the server - no client-side loading delay
  const tournaments = await getTournaments();

  return (
    <div className="min-h-screen">
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto mt-4">
          {/* Pass server-fetched data to client component */}
          <TournamentList initialTournaments={tournaments} />
        </div>
      </div>
    </div>
  );
}
