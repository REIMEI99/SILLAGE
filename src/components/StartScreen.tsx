interface StartScreenProps {
  recordCount: number;
  onStart: () => void;
  onDashboard: () => void;
}

export function StartScreen({ recordCount, onStart, onDashboard }: StartScreenProps) {
  return (
    <main className="app-screen start-screen">
      <section className="screen-card start-card">
        <div className="screen-brand">
          <span className="screen-brand-en">SILLAGE</span>
          <span className="screen-brand-zh">余香</span>
        </div>
        <p className="screen-kicker">SINGLE PERFUMER / V0.12 PLAYABLE PROTOTYPE</p>
        <h1>先履约，再雕琢。</h1>
        <p className="screen-description">
          从八种香气中抽取本回合公共池，为两位顾客各自调香。顾客偏好会影响满意度，交付提供固定订单分，技法决定作品的上限。
        </p>
        <div className="start-actions">
          <button className="screen-button primary" type="button" onClick={onStart}>
            开始游戏
            <small>START GAME</small>
          </button>
          <button className="screen-button secondary" type="button" onClick={onDashboard}>
            数据看板
            <small>已记录 {recordCount} 局</small>
          </button>
        </div>
        <div className="screen-facts">
          <span>8 香气</span>
          <span>16 位顾客</span>
          <span>6 格 FIFO</span>
          <span>3 种技法</span>
        </div>
      </section>
    </main>
  );
}
