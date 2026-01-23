interface CharacterCounterProps {
  current: number;
  max: number;
}

const CharacterCounter = ({ current, max }: CharacterCounterProps) => {
  const percentage = (current / max) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={isError ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-gray-400'}>
          {current} / {max} characters
        </span>
        {isError && <span className="text-red-500 font-medium">Limit exceeded!</span>}
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isError
              ? 'bg-red-500'
              : isWarning
              ? 'bg-yellow-500'
              : 'bg-primary'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default CharacterCounter;
