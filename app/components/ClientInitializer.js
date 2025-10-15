"use client";

import { useEffect } from "react";
import { initializeMockData } from "../lib/auth";
import { initializeMockTournaments } from "../lib/mockData";

export default function ClientInitializer() {
  useEffect(() => {
    // Initialize mock data on client side
    initializeMockData();
    initializeMockTournaments();
  }, []);

  return null;
}
