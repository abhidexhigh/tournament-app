"use client";

import Card from "../Card";
import Button from "../Button";
import Select from "../Select";

export default function WinnerDeclarationModal({
  show,
  winners,
  setWinners,
  errors,
  setErrors,
  prizes,
  participants,
  loading,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const participantOptions = participants
    .filter((p) => p && p.id)
    .map((p) => ({
      value: p.id,
      label: `${p.avatar} ${p.username}`,
    }));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full my-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gold-gradient mb-4 sm:mb-6">
          🏆 Declare Winners
        </h2>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <Select
            label="🥇 1st Place"
            name="first"
            value={winners.first}
            onChange={(e) => setWinners({ ...winners, first: e.target.value })}
            options={participantOptions}
            placeholder="Select winner"
            error={errors.first}
            required
          />
          <Select
            label="🥈 2nd Place"
            name="second"
            value={winners.second}
            onChange={(e) => setWinners({ ...winners, second: e.target.value })}
            options={participantOptions}
            placeholder="Select winner"
            error={errors.second}
            required
          />
          <Select
            label="🥉 3rd Place"
            name="third"
            value={winners.third}
            onChange={(e) => setWinners({ ...winners, third: e.target.value })}
            options={participantOptions}
            placeholder="Select winner"
            error={errors.third}
            required
          />
        </div>

        {errors.duplicate && (
          <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">
            {errors.duplicate}
          </p>
        )}

        <div className="bg-dark-secondary p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <p className="text-gray-400 text-xs sm:text-sm mb-2">
            Prize Distribution:
          </p>
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="text-white">
              🥇 1st: {prizes.first.toLocaleString()} 💎
            </p>
            <p className="text-white">
              🥈 2nd: {prizes.second.toLocaleString()} 💎
            </p>
            <p className="text-white">
              🥉 3rd: {prizes.third.toLocaleString()} 💎
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              onCancel();
              setErrors({});
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Declare Winners"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
