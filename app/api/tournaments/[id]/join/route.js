// API route: /api/tournaments/[id]/join
import { NextResponse } from "next/server";
import {
  tournamentsDb,
  usersDb,
  transactionsDb,
} from "../../../../lib/database";
import { CONVERSION_RATE } from "../../../../lib/currencyConfig";

// POST /api/tournaments/[id]/join - Join tournament
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id, payment_method = "diamonds" } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const tournament = await tournamentsDb.getById(id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 },
      );
    }

    if (tournament.status !== "upcoming") {
      return NextResponse.json(
        { success: false, error: "Tournament is not accepting participants" },
        { status: 400 },
      );
    }

    const user = await usersDb.getById(user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Check if user meets minimum rank requirement
    if (tournament.min_rank) {
      const rankOrder = {
        Silver: 1,
        Gold: 2,
        Platinum: 3,
        Diamond: 4,
        Master: 5,
      };

      const userRankLevel = rankOrder[user.rank] || 0;
      const requiredRankLevel = rankOrder[tournament.min_rank] || 0;

      if (userRankLevel < requiredRankLevel) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient rank! This tournament requires ${
              tournament.min_rank
            } rank or higher. Your current rank: ${user.rank || "No rank set"}`,
          },
          { status: 400 },
        );
      }
    }

    // Check payment method validity
    const entryFee = tournament.entry_fee || 0;
    const entryFeeUSD = tournament.entry_fee_usd || 0;
    const requiresPayment = entryFee > 0 || entryFeeUSD > 0;
    
    // Calculate diamond amount (use entry_fee if set, otherwise convert from USD)
    const diamondAmount = Number(entryFee) > 0 
      ? Number(entryFee) 
      : Number(entryFeeUSD * CONVERSION_RATE.USD_TO_DIAMOND);

    if (payment_method === "diamonds") {
      // Check if user has enough diamonds for entry fee
      if (requiresPayment && user.diamonds < diamondAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient diamonds! You need ${diamondAmount} diamonds to join this tournament. You have ${user.diamonds || 0}.`,
          },
          { status: 400 },
        );
      }
    } else if (payment_method === "usd") {
      // Check if user has enough USD for entry fee
      const userBalance = Number(user.balance || user.usd_balance || 0);
      const requiredAmount = Number(entryFeeUSD || (entryFee * CONVERSION_RATE.DIAMOND_TO_USD));
      
      if (requiresPayment && userBalance < requiredAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient USD! You need $${requiredAmount.toFixed(2)} to join this tournament. You have $${userBalance.toFixed(2)}.`,
          },
          { status: 400 },
        );
      }
    }

    try {
      // Add participant to tournament
      const updatedTournament = await tournamentsDb.addParticipant(id, user_id);

      // Deduct entry fee based on payment method
      if (payment_method === "usd" && requiresPayment) {
        // Deduct USD
        const currentBalance = Number(user.balance || user.usd_balance || 0);
        const requiredAmount = Number(entryFeeUSD || (entryFee * CONVERSION_RATE.DIAMOND_TO_USD));
        
        await usersDb.update(user_id, {
          usd_balance: currentBalance - requiredAmount,
        });

        // Add transaction record
        await transactionsDb.create({
          user_id: user_id,
          type: "tournament_entry",
          amount: -requiredAmount,
          description: `Entry fee for ${tournament.title}`,
          tournament_id: id,
          currency: "usd",
        });
      } else if (payment_method === "diamonds" && requiresPayment && diamondAmount > 0) {
        // Deduct diamonds (use calculated diamondAmount which handles USD conversion)
        await usersDb.updateDiamonds(user_id, -diamondAmount);

        // Add transaction record
        await transactionsDb.create({
          user_id: user_id,
          type: "tournament_entry",
          amount: -diamondAmount,
          description: `Entry fee for ${tournament.title}`,
          tournament_id: id,
          currency: "diamonds",
        });
      }

      return NextResponse.json({ success: true, data: updatedTournament });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
