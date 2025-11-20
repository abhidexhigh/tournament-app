"use client";

import Card from "../Card";
import Badge from "../Badge";

export default function ParticipantsTab({ participants, tournament }) {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gold mb-4">
        Participants ({participants.length}/
        {tournament.max_players ?? tournament.maxPlayers})
      </h2>
      {participants.length === 0 ? (
        <EmptyParticipants />
      ) : (
        <ParticipantsList
          participants={participants}
          hostId={tournament.host_id ?? tournament.hostId}
        />
      )}
    </Card>
  );
}

function EmptyParticipants() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">👥</div>
      <p className="text-gray-400 text-lg">No participants yet</p>
      <p className="text-gray-500 text-sm mt-2">Be the first to join!</p>
    </div>
  );
}

function ParticipantsList({ participants, hostId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {participants
        .filter((participant) => participant && participant.id)
        .map((participant, index) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            index={index}
            isHost={participant.id === hostId}
          />
        ))}
    </div>
  );
}

function ParticipantCard({ participant, index, isHost }) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-dark-secondary rounded-lg border border-gold-dark/20 hover:border-gold/50 transition-colors">
      <span className="text-gray-400 text-sm font-medium min-w-[2rem]">
        #{index + 1}
      </span>
      <img
        src={participant.avatar}
        alt={participant.username}
        width={24}
        height={24}
        className="w-8"
      />
      <div className="flex-1">
        <p className="text-white font-medium">{participant.username}</p>
        {participant.rank && (
          <p className="text-gray-400 text-sm">{participant.rank} Rank</p>
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
