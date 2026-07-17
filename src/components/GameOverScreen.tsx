import { useState } from 'react';
import type { GameState } from '../types/game';

interface GameOverScreenProps {
  state: GameState;
  onSave: (thought: string) => void;
}

export function GameOverScreen({ state, onSave }: GameOverScreenProps) {
  const [thought, setThought] = useState('');
  return (
    <main className="app-screen result-screen">
      <section className="screen-card result-card">
        <div className="screen-kicker">GAME OVER / SESSION {state.sessionId}</div>
        <h1>本局结束</h1>
        <div className="result-score">
          <span>最终分数</span>
          <strong>{state.score}</strong>
        </div>
        <div className="result-metrics">
          <div><b>{state.deliveredOrders.length}</b><span>成功交付</span></div>
          <div><b>{state.roundsCompleted}</b><span>完成回合</span></div>
          <div><b>{state.bag.length}</b><span>剩余香料</span></div>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); onSave(thought); }}>
          <label htmlFor="session-thought">记下你对本局的想法</label>
          <textarea
            id="session-thought"
            value={thought}
            onChange={(event) => setThought(event.target.value)}
            placeholder="例如：哪一回合的选择让你犹豫？哪个顾客偏好最难满足？"
            rows={5}
          />
          <button className="screen-button primary wide" type="submit">
            保存本局并查看数据看板
            <small>SAVE SESSION</small>
          </button>
        </form>
      </section>
    </main>
  );
}
