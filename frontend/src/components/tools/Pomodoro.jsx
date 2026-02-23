import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const Pomodoro = () => {
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const modes = {
    work: { duration: 25, label: 'Travail', color: 'bg-red-500' },
    shortBreak: { duration: 5, label: 'Pause courte', color: 'bg-green-500' },
    longBreak: { duration: 15, label: 'Pause longue', color: 'bg-blue-500' }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            if (mode === 'work') {
              setSessions(prev => prev + 1);
            }
            playSound();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, minutes, seconds, mode]);

  const playSound = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const toggleTimer = async () => {
    if (!isActive) {
      const result = await checkAndUseQuota('pomodoro', 'productivity');
      if (!result.success) return;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(modes[mode].duration);
    setSeconds(0);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(modes[newMode].duration);
    setSeconds(0);
  };

  const formatTime = (mins, secs) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⏱️ Pomodoro Timer</h1>
          <p className="text-gray-600">Technique de gestion du temps</p>
        </div>

        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Limite atteinte</h3>
                <p className="text-sm text-red-800">{quotaError.message}</p>
                <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                  Voir les plans →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex gap-2 mb-8">
            {Object.entries(modes).map(([key, { label, color }]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  mode === key ? `${color} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-gray-900 mb-4">
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-xl text-gray-600">
              Sessions complétées: {sessions}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={toggleTimer}
              disabled={isChecking}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              {isChecking ? 'Vérification...' : isActive ? '⏸️ Pause' : '▶️ Démarrer'}
            </button>
            <button
              onClick={resetTimer}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Technique Pomodoro</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Travaillez pendant 25 minutes</li>
            <li>Prenez une pause de 5 minutes</li>
            <li>Après 4 sessions, prenez une pause de 15 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;

