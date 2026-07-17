import type { CSSProperties } from 'react';
import { useEffect, useReducer, useState } from 'react';
import { DashboardScreen } from './components/DashboardScreen';
import { GameBoard } from './components/GameBoard';
import { GameOverScreen } from './components/GameOverScreen';
import { StartScreen } from './components/StartScreen';
import { createGameRecord, loadGameRecords, saveGameRecord } from './data/sessionStorage';
import { gameReducer } from './state/gameReducer';
import type { GameRecord, GameState } from './types/game';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

function getStageMetrics() {
  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  return {
    scale,
    left: Math.max(0, (window.innerWidth - DESIGN_WIDTH * scale) / 2),
    top: Math.max(0, (window.innerHeight - DESIGN_HEIGHT * scale) / 2),
  };
}

function newSessionId(): string {
  return 'session-' + Date.now().toString(36);
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null as GameState | null);
  const [view, setView] = useState<'start' | 'game' | 'result' | 'dashboard'>('start');
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [hoveredPoolIndex, setHoveredPoolIndex] = useState<number | null>(null);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState<number | null>(null);
  const [stage, setStage] = useState(() => getStageMetrics());

  useEffect(() => {
    let active = true;
    loadGameRecords().then((loaded) => {
      if (active) setRecords(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateStage = () => setStage(getStageMetrics());
    window.addEventListener('resize', updateStage, { passive: true });
    window.addEventListener('orientationchange', updateStage, { passive: true });
    return () => {
      window.removeEventListener('resize', updateStage);
      window.removeEventListener('orientationchange', updateStage);
    };
  }, []);

  useEffect(() => {
    if (state?.phase === 'game_over') {
      setView('result');
      setSelectedPoolIndex(null);
      setHoveredPoolIndex(null);
    }
  }, [state?.phase]);

  const startGame = () => {
    const now = new Date();
    dispatch({
      type: 'START_GAME',
      seed: Date.now() >>> 0,
      sessionId: newSessionId(),
      startedAt: now.toISOString(),
    });
    setSelectedPoolIndex(null);
    setHoveredPoolIndex(null);
    setView('game');
  };

  const saveSession = async (thought: string) => {
    if (!state || state.phase !== 'game_over') return;
    const record = createGameRecord(state, thought, new Date().toISOString());
    setRecords(await saveGameRecord(record));
    setView('dashboard');
  };

  if (view === 'dashboard') {
    return <DashboardScreen records={records} onBack={() => setView(state ? 'result' : 'start')} />;
  }
  if (view === 'start' || !state) {
    return <StartScreen recordCount={records.length} onStart={startGame} onDashboard={() => setView('dashboard')} />;
  }
  if (view === 'result' || state.phase === 'game_over') {
    return <GameOverScreen state={state} onSave={saveSession} />;
  }

  return (
    <div
      className="viewport"
      style={{
        '--stage-scale': stage.scale,
        '--stage-left': stage.left + 'px',
        '--stage-top': stage.top + 'px',
      } as CSSProperties}
    >
      <GameBoard
        state={state}
        dispatch={dispatch}
        hoveredPoolIndex={hoveredPoolIndex}
        selectedPoolIndex={selectedPoolIndex}
        onPreviewChange={setHoveredPoolIndex}
        onSelectPool={setSelectedPoolIndex}
      />
    </div>
  );
}
