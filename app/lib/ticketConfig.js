// Centralized Ticket & Tournament Configuration
// All ticket packages and entry prices can be modified here

// Ticket Package Configuration
export const TICKET_CONFIG = {
  // Available ticket packages for purchase
  packages: [
    {
      id: "ticket_010",
      ticket_value: 0.1,
      quantity: 10,
      total_value: 1.0,
      discount_percent: 10,
      price: 0.9, // calculated: total_value - (total_value * discount_percent / 100)
      label: "$0.10 Tickets",
      popular: false,
      currency: "tickets",
    },
    {
      id: "ticket_100",
      ticket_value: 1.0,
      quantity: 10,
      total_value: 10.0,
      discount_percent: 10,
      price: 9.0,
      label: "$1.00 Tickets",
      popular: true,
      currency: "tickets",
    },
    {
      id: "ticket_1000",
      ticket_value: 10.0,
      quantity: 10,
      total_value: 100.0,
      discount_percent: 10,
      price: 90.0,
      label: "$10.00 Tickets",
      popular: false,
      currency: "tickets",
    },
  ],

  // Ticket value mappings for validation
  ticket_values: {
    ticket_010: 0.1,
    ticket_100: 1.0,
    ticket_1000: 10.0,
  },

  // Ticket display names
  ticket_names: {
    ticket_010: "$0.10",
    ticket_100: "$1.00",
    ticket_1000: "$10.00",
  },
};

// Ticket-Based Tournament Configuration
export const TICKET_ENTRY_CONFIG = {
  // Fixed entry price options for ticket-based tournaments
  // These match the ticket values exactly
  entry_price_options: [
    {
      value: 0.1,
      label: "$0.10 Entry",
      description: "Use $0.10 tickets",
      ticket_type: "ticket_010",
      diamonds_equivalent: 10, // Optional: diamond conversion rate
    },
    {
      value: 1.0,
      label: "$1.00 Entry",
      description: "Use $1.00 tickets",
      ticket_type: "ticket_100",
      diamonds_equivalent: 100,
      popular: true,
    },
    {
      value: 10.0,
      label: "$10.00 Entry",
      description: "Use $10.00 tickets",
      ticket_type: "ticket_1000",
      diamonds_equivalent: 1000,
    },
  ],

  // Default settings for ticket-based tournaments
  defaults: {
    accepts_tickets: true,
    min_entry_fee: 0.1,
    max_entry_fee: 10.0,
  },
};

// Helper Functions

/**
 * Get all ticket packages
 */
export const getTicketPackages = () => {
  return TICKET_CONFIG.packages;
};

/**
 * Get ticket package by ID
 */
export const getTicketPackageById = (packageId) => {
  return TICKET_CONFIG.packages.find((pkg) => pkg.id === packageId);
};

/**
 * Get ticket value by ticket type
 */
export const getTicketValue = (ticketType) => {
  return TICKET_CONFIG.ticket_values[ticketType] || 0;
};

/**
 * Get ticket display name
 */
export const getTicketName = (ticketType) => {
  return TICKET_CONFIG.ticket_names[ticketType] || ticketType;
};

/**
 * Get all entry price options for ticket-based tournaments
 */
export const getEntryPriceOptions = () => {
  return TICKET_ENTRY_CONFIG.entry_price_options;
};

/**
 * Get entry price option by value
 */
export const getEntryPriceOption = (value) => {
  return TICKET_ENTRY_CONFIG.entry_price_options.find(
    (opt) => opt.value === value
  );
};

/**
 * Validate if a ticket value matches an entry fee
 */
export const validateTicketMatch = (ticketType, entryFeeUSD) => {
  const ticketValue = getTicketValue(ticketType);
  return ticketValue === entryFeeUSD;
};

/**
 * Get matching ticket type for an entry fee
 */
export const getMatchingTicketType = (entryFeeUSD) => {
  const option = COMPANY_TOURNAMENT_CONFIG.entry_price_options.find(
    (opt) => opt.value === entryFeeUSD
  );
  return option ? option.ticket_type : null;
};

/**
 * Check if a price is a valid ticket-based tournament entry fee
 */
export const isValidTicketEntry = (priceUSD) => {
  return TICKET_ENTRY_CONFIG.entry_price_options.some(
    (opt) => opt.value === priceUSD
  );
};

/**
 * Calculate discount amount for a ticket package
 */
export const calculateDiscount = (packageData) => {
  return packageData.total_value - packageData.price;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercent = (packageData) => {
  return (
    ((packageData.total_value - packageData.price) / packageData.total_value) *
    100
  ).toFixed(0);
};
