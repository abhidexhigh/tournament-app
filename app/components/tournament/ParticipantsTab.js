"use client";

import Card from "../Card";
import Badge from "../Badge";
import Image from "next/image";

export default function ParticipantsTab({
  participants,
  tournament,
  clan1,
  clan2,
}) {
  const isClanBattle = tournament.tournament_type === "clan_battle";
  const isClanSelection = tournament.clan_battle_mode === "clan_selection";
  const isAutoDivision = tournament.clan_battle_mode === "auto_division";

  const maxPlayers = tournament.max_players ?? tournament.maxPlayers;

  return (
    <Card className="bg-dark-gray-card/90">
      <h2 className="text-gold mb-4 text-xl font-bold">
        Participants ({participants.length}/{maxPlayers})
      </h2>
      {participants.length === 0 && !isClanBattle ? (
        <EmptyParticipants />
      ) : isClanBattle && (isClanSelection || isAutoDivision) ? (
        <ClanBattleParticipantsList
          participants={participants}
          tournament={tournament}
          maxPlayers={maxPlayers}
          clan1={clan1}
          clan2={clan2}
        />
      ) : (
        <RegularParticipantsList
          participants={participants}
          hostId={tournament.host_id ?? tournament.hostId}
          maxPlayers={maxPlayers}
        />
      )}
    </Card>
  );
}

function EmptyParticipants() {
  return (
    <div className="py-12 text-center">
      <div className="mb-4 text-6xl">👥</div>
      <p className="text-lg text-gray-400">No participants yet</p>
      <p className="mt-2 text-sm text-gray-500">Be the first to join!</p>
    </div>
  );
}

function ClanBattleParticipantsList({
  participants,
  tournament,
  maxPlayers,
  clan1,
  clan2,
}) {
  const isClanSelection = tournament.clan_battle_mode === "clan_selection";
  const isAutoDivision = tournament.clan_battle_mode === "auto_division";

  // For clan selection, split by actual clan membership
  // For auto division, split evenly or randomly (for now, split by join order)
  let team1Participants = [];
  let team2Participants = [];

  if (isClanSelection) {
    const clan1Id = tournament.clan1_id;
    const clan2Id = tournament.clan2_id;

    team1Participants = participants.filter((p) =>
      p.clans?.some((c) => c.clan_id === clan1Id),
    );
    team2Participants = participants.filter((p) =>
      p.clans?.some((c) => c.clan_id === clan2Id),
    );
  } else if (isAutoDivision) {
    // Auto division - split participants evenly
    const midPoint = Math.ceil(participants.length / 2);
    team1Participants = participants.slice(0, midPoint);
    team2Participants = participants.slice(midPoint);
  }

  const teamSize = Math.ceil(maxPlayers / 2);

  // Get clan names
  const team1Name = clan1?.name || (isClanSelection ? "Team 1" : "Team Alpha");
  const team2Name = clan2?.name || (isClanSelection ? "Team 2" : "Team Bravo");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Team 1 */}
      <div>
        <div className="border-gold-dark/30 mb-4 flex items-center justify-between border-b pb-2">
          <h3 className="text-gold text-lg font-semibold">{team1Name}</h3>
          <span className="text-sm text-gray-400">
            {team1Participants.length}/{teamSize}
          </span>
        </div>
        <div className="space-y-1">
          {team1Participants.map((participant, index) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              index={index}
              isHost={
                participant.id === (tournament.host_id ?? tournament.hostId)
              }
              teamColor="blue"
            />
          ))}
          {Array.from({
            length: Math.max(0, teamSize - team1Participants.length),
          }).map((_, index) => (
            <EmptySlot
              key={`empty-team1-${index}`}
              index={team1Participants.length + index}
            />
          ))}
        </div>
      </div>

      {/* Team 2 */}
      <div>
        <div className="border-gold-dark/30 mb-4 flex items-center justify-between border-b pb-2">
          <h3 className="text-gold text-lg font-semibold">{team2Name}</h3>
          <span className="text-sm text-gray-400">
            {team2Participants.length}/{teamSize}
          </span>
        </div>
        <div className="space-y-3">
          {team2Participants.map((participant, index) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              index={index}
              isHost={
                participant.id === (tournament.host_id ?? tournament.hostId)
              }
              teamColor="red"
            />
          ))}
          {Array.from({
            length: Math.max(0, teamSize - team2Participants.length),
          }).map((_, index) => (
            <EmptySlot
              key={`empty-team2-${index}`}
              index={team2Participants.length + index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RegularParticipantsList({ participants, hostId, maxPlayers }) {
  const validParticipants = participants.filter(
    (participant) => participant && participant.id,
  );
  const emptySlots = Math.max(0, maxPlayers - validParticipants.length);

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-2">
      {validParticipants.map((participant, index) => (
        <ParticipantCard
          key={participant.id}
          participant={participant}
          index={index}
          isHost={participant.id === hostId}
        />
      ))}
      {Array.from({ length: emptySlots }).map((_, index) => (
        <EmptySlot
          key={`empty-${index}`}
          index={validParticipants.length + index}
        />
      ))}
    </div>
  );
}

function ParticipantCard({ participant, index, isHost, teamColor }) {
  const borderColor = teamColor
    ? teamColor === "blue"
      ? "border-blue-500/30 hover:border-blue-500/60"
      : "border-red-500/30 hover:border-red-500/60"
    : "border-gold-dark/20 hover:border-gold/50";

  return (
    <div
      className={`bg-gold-card-bg flex items-center space-x-3 rounded-lg border px-4 py-2 ${borderColor} transition-colors`}
    >
      <span className="min-w-[2rem] text-sm font-medium text-gray-400">
        #{index + 1}
      </span>
      <Image
        src={participant.avatar}
        alt={participant.username}
        width={24}
        height={24}
        className="w-8"
      />
      <div className="flex-1">
        <p className="font-medium text-white">{participant.username}</p>
        {participant.rank && (
          <p className="text-xs text-gray-400">{participant.rank} Rank</p>
        )}
      </div>
      {isHost && (
        <Badge variant="primary" size="sm">
          Host
        </Badge>
      )}
    </div>
  );
}

function EmptySlot({ index }) {
  return (
    <div className="flex min-h-[62px] items-center space-x-3 rounded-lg bg-[#48484b]/10 px-4 py-2 shadow-sm transition-colors">
      <span className="min-w-[2rem] text-sm font-medium text-gray-600">
        #{index + 1}
      </span>
    </div>
  );
}
