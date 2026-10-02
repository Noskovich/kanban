import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage('kanban-board:pomodoro', {
    focusMinutes: 25,
    breakMinutes: 5,
    completedCount: 0,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const audioCtxRef = useRef(null);

  // Тикаем раз в секунду, пока таймер запущен
  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Досчитали до нуля — переключаем режим и подаём звук
  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return;
    setIsRunning(false);
    playBeep();
    if (mode === 'focus') {
      setSettings((s) => ({ ...s, completedCount: s.completedCount + 1 }));
      switchMode('break');
    } else {
      switchMode('focus');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Если поменяли длительность настроек, а таймер не запущен — пересчитываем остаток
  useEffect(() => {
    if (isRunning) return;
    setSecondsLeft((mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMinutes, settings.breakMinutes, mode]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setSecondsLeft((nextMode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60);
  }

  function playBeep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      /* звук недоступен (например, автовоспроизведение заблокировано) — не критично */
    }
  }

  function adjustDuration(field, delta) {
    setSettings((s) => ({ ...s, [field]: Math.max(1, s[field] + delta) }));
  }

  function reset() {
    setIsRunning(false);
    setSecondsLeft((mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60);
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className={'pomodoro' + (isOpen ? ' pomodoro--open' : '')}>
      {isOpen && (
        <div className="pomodoro__panel">
          <div className="pomodoro__mode">
            <button
              type="button"
              className={'pomodoro__mode-btn' + (mode === 'focus' ? ' pomodoro__mode-btn--active' : '')}
              onClick={() => {
                setIsRunning(false);
                switchMode('focus');
              }}
            >
              Фокус
            </button>
            <button
              type="button"
              className={'pomodoro__mode-btn' + (mode === 'break' ? ' pomodoro__mode-btn--active' : '')}
              onClick={() => {
                setIsRunning(false);
                switchMode('break');
              }}
            >
              Перерыв
            </button>
          </div>

          <p className="pomodoro__time">
            {minutes}:{seconds}
          </p>

          <div className="pomodoro__controls">
            <button type="button" className="btn btn--primary" onClick={() => setIsRunning((r) => !r)}>
              {isRunning ? 'Пауза' : 'Старт'}
            </button>
            <button type="button" className="btn btn--small" onClick={reset}>
              Сброс
            </button>
          </div>

          <div className="pomodoro__settings">
            <div className="pomodoro__setting">
              <span>Фокус</span>
              <button type="button" disabled={isRunning} onClick={() => adjustDuration('focusMinutes', -5)}>−</button>
              <span>{settings.focusMinutes} мин</span>
              <button type="button" disabled={isRunning} onClick={() => adjustDuration('focusMinutes', 5)}>+</button>
            </div>
            <div className="pomodoro__setting">
              <span>Перерыв</span>
              <button type="button" disabled={isRunning} onClick={() => adjustDuration('breakMinutes', -1)}>−</button>
              <span>{settings.breakMinutes} мин</span>
              <button type="button" disabled={isRunning} onClick={() => adjustDuration('breakMinutes', 1)}>+</button>
            </div>
          </div>

          <p className="pomodoro__count">Завершено помодоро: {settings.completedCount}</p>
        </div>
      )}

      <button
        type="button"
        className="pomodoro__toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Свернуть таймер' : 'Открыть таймер помодоро'}
      >
        {isOpen ? '×' : `⏱ ${minutes}:${seconds}`}
      </button>
    </div>
  );
}
