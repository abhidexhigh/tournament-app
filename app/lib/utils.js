// Shared utility functions

/**
 * Get the total ticket count from user tickets
 * Handles both old format (object with ticket_010, ticket_100, ticket_1000)
 * and new format (single number)
 * @param {number|object|null} tickets - User's tickets
 * @returns {number} - Total ticket count
 */
export const getTicketCount = (tickets) => {
  if (!tickets) return 0;
  // New format: tickets is a number
  if (typeof tickets === "number") return tickets;
  // Old format: tickets is an object
  if (typeof tickets === "object") {
    return (
      (tickets.ticket_010 || 0) +
      (tickets.ticket_100 || 0) +
      (tickets.ticket_1000 || 0)
    );
  }
  return 0;
};
