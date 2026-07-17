import { getDashboardStats } from '../data/sessionStorage';
import type { GameRecord } from '../types/game';

interface DashboardScreenProps {
  records: GameRecord[];
  onBack: () => void;
}

function number(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function DashboardScreen({ records, onBack }: DashboardScreenProps) {
  const stats = getDashboardStats(records);
  return (
    <main className="app-screen dashboard-screen">
      <section className="dashboard-wrap">
        <header className="dashboard-header">
          <div>
            <div className="screen-brand compact">
              <span className="screen-brand-en">SILLAGE</span>
              <span className="screen-brand-zh">余香</span>
            </div>
            <p className="screen-kicker">PLAYTEST DATA / V0.12</p>
          </div>
          <button className="text-button" type="button" onClick={onBack}>返回首页</button>
        </header>
        <div className="dashboard-heading">
          <h1>数据看板</h1>
          <p>每局原始事件、最终状态与玩家反馈都保存在本地 JSON 中。</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><span>游戏局数</span><b>{stats.gamesPlayed}</b></div>
          <div className="stat-card"><span>平均分数</span><b>{number(stats.averageScore)}</b></div>
          <div className="stat-card"><span>最高分数</span><b>{stats.highScore}</b></div>
          <div className="stat-card"><span>总交付订单</span><b>{stats.totalOrders}</b></div>
          <div className="stat-card"><span>平均交付</span><b>{number(stats.averageOrders)}</b></div>
          <div className="stat-card"><span>完成回合</span><b>{number(stats.averageRounds)}</b></div>
        </div>
        <section className="technique-summary">
          <div><span>INTENSE / 浓烈</span><b>{stats.techniqueCounts.INTENSE}</b></div>
          <div><span>PURE / 纯粹</span><b>{stats.techniqueCounts.PURE}</b></div>
          <div><span>LAYERED / 层叠</span><b>{stats.techniqueCounts.LAYERED}</b></div>
        </section>
        <section className="records-section">
          <div className="section-label">SESSION ARCHIVE / 原始数据</div>
          {records.length === 0 ? (
            <div className="empty-records">还没有完成的游戏，先去调一瓶香水。</div>
          ) : (
            <div className="records-list">
              {records.map((record, index) => (
                <details className="record-card" key={record.id}>
                  <summary>
                    <span>#{records.length - index} · {record.endedAt.slice(0, 16).replace('T', ' ')}</span>
                    <b>{record.finalScore} 分 / {record.deliveredOrders.length} 单</b>
                  </summary>
                  <div className="record-body">
                    <p><strong>本局想法：</strong> {record.thought || '（未填写）'}</p>
                    <p><strong>种子：</strong> {record.seed} <strong>事件数：</strong> {record.events.length}</p>
                    <pre>{JSON.stringify(record, null, 2)}</pre>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
