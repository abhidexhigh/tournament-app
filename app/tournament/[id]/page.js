import { tournamentsDb, usersDb } from "../../lib/database";
import TournamentDetailsContent from "../../components/TournamentDetailsContent";
import TournamentDetailsSkeleton from "../../components/skeletons/TournamentDetailsSkeleton";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Revalidate every 30 seconds
export const revalidate = 30;

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  try {
    const tournament = await tournamentsDb.getById(params.id);
    
    if (!tournament) {
      return {
        title: "Tournament Not Found | Force of Rune",
        description: "The tournament you're looking for doesn't exist.",
      };
    }

    return {
      title: `${tournament.title} | Force of Rune Tournament`,
      description: `Join ${tournament.title} - Prize Pool: ${tournament.prize_pool} diamonds. ${tournament.max_players} players max. ${tournament.status === 'upcoming' ? 'Register now!' : ''}`,
      openGraph: {
        title: tournament.title,
        description: `Prize Pool: ${tournament.prize_pool} diamonds | ${tournament.max_players} players`,
        type: "website",
      },
    };
  } catch (error) {
    return {
      title: "Tournament | Force of Rune",
      description: "Join competitive Force of Rune tournaments",
    };
  }
}

/**
 * Format tournament dates from database format
 */
function formatTournamentDates(tournament) {
  if (!tournament) return tournament;

  if (tournament.date) {
    if (tournament.date instanceof Date) {
      const year = tournament.date.getUTCFullYear();
      const month = String(tournament.date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(tournament.date.getUTCDate()).padStart(2, "0");
      tournament.date = `${year}-${month}-${day}`;
    } else if (typeof tournament.date === "string" && tournament.date.includes("T")) {
      tournament.date = tournament.date.split("T")[0];
    }
  }

  return tournament;
}

/**
 * Fetch tournament and host data on the server
 */
async function getTournamentData(id) {
  try {
    const tournament = await tournamentsDb.getById(id);
    
    if (!tournament) {
      return { tournament: null, host: null };
    }

    const formattedTournament = formatTournamentDates(tournament);

    // Load host information for non-automated tournaments
    let host = null;
    if (!tournament.is_automated) {
      const hostId = tournament.host_id ?? tournament.hostId;
      if (hostId) {
        host = await usersDb.getById(hostId);
      }
    }

    return { tournament: formattedTournament, host };
  } catch (error) {
    console.error("Failed to fetch tournament:", error);
    return { tournament: null, host: null };
  }
}

/**
 * Tournament Details Page - Server Component
 * Fetches tournament data on the server for faster LCP and better SEO
 */
export default async function TournamentDetailsPage({ params }) {
  const { tournament, host } = await getTournamentData(params.id);

  return (
    <TournamentDetailsContent 
      initialTournament={tournament} 
      initialHost={host} 
    />
  );
}
