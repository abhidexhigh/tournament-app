import { matchesDb } from "../../lib/database";
import MatchDetailsContent from "../../components/MatchDetailsContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Revalidate every 30 seconds
export const revalidate = 30;

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const match = await matchesDb.getById(id);
    
    if (!match) {
      return {
        title: "Match Not Found | Force of Rune",
        description: "The match you're looking for doesn't exist.",
      };
    }

    return {
      title: `Match ${match.id} | Force of Rune`,
      description: `View match details and leaderboard for match ${match.id}`,
    };
  } catch (error) {
    return {
      title: "Match | Force of Rune",
      description: "View match details",
    };
  }
}

/**
 * Fetch match data on the server
 */
async function getMatchData(id) {
  try {
    const match = await matchesDb.getById(id);
    return match;
  } catch (error) {
    console.error("Failed to fetch match:", error);
    return null;
  }
}

/**
 * Match Details Page - Server Component
 * Fetches match data on the server for faster LCP
 */
export default async function MatchDetailsPage({ params }) {
  const { id } = await params;
  const match = await getMatchData(id);

  return <MatchDetailsContent initialMatch={match} />;
}
