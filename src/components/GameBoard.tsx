import { useMemo, useState } from 'react';
import { getWorktableSatisfaction } from '../rules/compatibilityRules';
import { getPendingDeliverySides } from '../rules/deliveryRules';
import { MAX_OVERTIME_ROUND, MAX_ROUNDS } from '../rules/gameRules';
import { previewAddScent } from '../rules/previewRules';
import { canTransferCustomer } from '../rules/transferRules';
import type { GameAction, GameState, Side } from '../types/game';
import { CustomerPanel } from './CustomerPanel';
import { FormulaBottle } from './FormulaBottle';
import { ImpactPreview } from './ImpactPreview';
import { ScentWheel } from './ScentWheel';
import { WaitingArea } from './WaitingArea';

interface GameBoardProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  hoveredPoolIndex: number | null;
  selectedPoolIndex: number | null;
  onPreviewChange: (index: number | null) => void;
  onSelectPool: (index: number | null) => void;
}

function PoolPreview({
  state,
  previewPoolIndex,
  selectedPoolIndex,
  onAddToSide,
}: {
  state: GameState;
  previewPoolIndex: number | null;
  selectedPoolIndex: number | null;
  onAddToSide: (side: Side) => void;
}) {
  const scent = previewPoolIndex === null ? null : state.pool[previewPoolIndex];
  const previews = useMemo(() => scent ? {
    left: previewAddScent(state.left, scent),
    right: previewAddScent(state.right, scent),
  } : null, [scent, state.left, state.right]);
  if (!scent || !previews) return null;
  return (
    <ImpactPreview
      scent={scent}
      left={previews.left}
      right={previews.right}
      leftCustomer={state.left.customer}
      rightCustomer={state.right.customer}
      actionable={selectedPoolIndex !== null && state.phase === 'mixing'}
      onAddToSide={onAddToSide}
    />
  );
}

function PhasePanel({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  if (state.phase === 'delivery' && state.round < MAX_ROUNDS) {
    const pending = getPendingDeliverySides(state.left, state.right, state.deliveryDecisions);
    if (pending.length === 0) return null;
    return (
      <div className="phase-panel">
        <small>DELIVERY / 回合末决策</small>
        <b>为达到满意线的瓶子选择交付或保留。</b>
        <span className="decision-status">所有选项完成后自动进入下一阶段</span>
      </div>
    );
  }
  if (state.phase === 'customer_selection') {
    const hasWaiting = state.waitingCustomers.length > 0;
    return (
      <div className="phase-panel">
        <small>CUSTOMER SELECTION / 补客</small>
        <b>{hasWaiting ? '工作台空出，从公开等候区选择一位顾客。' : '等候区已空，进入下一回合。'}</b>
        {!hasWaiting && <button type="button" onClick={() => dispatch({ type: 'ADVANCE_ROUND' })}>进入下一回合</button>}
      </div>
    );
  }
  if (state.phase === 'mixing' && state.round === MAX_ROUNDS) {
    return (
      <div className="phase-panel closing-panel">
        <small>CLOSING ROUND / 打烊回合</small>
        <b>本回合达到交付线的瓶子将自动交付。</b>
        <span className="decision-status">至少3枚的未完成委托可进入加班</span>
      </div>
    );
  }
  if (state.phase === 'mixing' && state.round > MAX_ROUNDS) {
    return (
      <div className="phase-panel overtime-panel">
        <small>AFTER HOURS / 加班 {state.round - MAX_ROUNDS} / {MAX_OVERTIME_ROUND - MAX_ROUNDS}</small>
        <b>只处理打烊时留下的未完成委托。</b>
        <span className="decision-status">达到满意线后自动交付，不再补客或转单</span>
      </div>
    );
  }
  return null;
}

export function GameBoard({
  state,
  dispatch,
  hoveredPoolIndex,
  selectedPoolIndex,
  onPreviewChange,
  onSelectPool,
}: GameBoardProps) {
  const [transferSide, setTransferSide] = useState<Side | null>(null);
  const previewPoolIndex = selectedPoolIndex ?? hoveredPoolIndex;
  const leftSatisfaction = getWorktableSatisfaction(state.left.customer, state.left.formula);
  const rightSatisfaction = getWorktableSatisfaction(state.right.customer, state.right.formula);
  const selectionSide: Side | null = state.phase === 'customer_selection'
    ? (!state.left.customer ? 'left' : !state.right.customer ? 'right' : null)
    : null;
  const activeTransferSide = transferSide && canTransferCustomer(state, transferSide)
    ? transferSide
    : null;
  const waitingMode = selectionSide ? 'customer' : activeTransferSide ? 'transfer' : null;
  const waitingSide = selectionSide ?? activeTransferSide;

  const addScentToSide = (side: Side) => {
    if (selectedPoolIndex === null) return;
    dispatch({ type: 'ADD_SCENT', poolIndex: selectedPoolIndex, side });
    setTransferSide(null);
    onSelectPool(null);
    onPreviewChange(null);
  };

  const toggleTransfer = (side: Side) => {
    setTransferSide((current) => current === side ? null : side);
    onSelectPool(null);
    onPreviewChange(null);
  };

  const selectWaitingCustomer = (customerId: string) => {
    if (selectionSide) {
      dispatch({ type: 'SELECT_CUSTOMER', side: selectionSide, customerId });
      return;
    }
    if (activeTransferSide) {
      dispatch({ type: 'TRANSFER_CUSTOMER', side: activeTransferSide, customerId });
      setTransferSide(null);
      onSelectPool(null);
      onPreviewChange(null);
    }
  };

  const roundLimit = state.round > MAX_ROUNDS ? MAX_OVERTIME_ROUND : MAX_ROUNDS;

  return (
    <div className="shell">
      <header>
        <div>
          <div className="brand"><h1>SILLAGE</h1><span>余香</span></div>
          <div className="sub">UI STUDY B2.10 · 1920×1080 BASE STAGE / UNIFIED VIEWPORT SCALING</div>
        </div>
        <div className="meta">
          <span>ROUND <b>{String(state.round).padStart(2, '0')} / {roundLimit}{state.round > MAX_ROUNDS ? ' 加班' : ''}</b></span>
          <span>ACTIONS <b>{2 - state.actionsLeft} / 2</b></span>
          <span>IN BAG <b>{state.bag.length}</b></span>
          <span>SCORE <b>{state.score}</b></span>
        </div>
      </header>
      <section className="stage">
        <aside className="side">
          <CustomerPanel
            side="left"
            worktable={state.left}
            transferAvailable={canTransferCustomer(state, 'left')}
            transferActive={activeTransferSide === 'left'}
            transferUsed={state.transferUsed}
            onToggleTransfer={() => toggleTransfer('left')}
          />
          <FormulaBottle side="left" phase={state.phase} worktable={state.left} decision={state.deliveryDecisions.left} onDecision={(deliver) => dispatch({ type: 'SET_DELIVERY_DECISION', side: 'left', deliver })} />
        </aside>
        <main className="center-wrap">
          <ScentWheel state={state} selectedPoolIndex={selectedPoolIndex} onPreviewChange={onPreviewChange} onSelectPool={(index) => onSelectPool(index)} />
          <PoolPreview state={state} previewPoolIndex={previewPoolIndex} selectedPoolIndex={selectedPoolIndex} onAddToSide={addScentToSide} />
          <PhasePanel state={state} dispatch={dispatch} />
        </main>
        <aside className="side">
          <CustomerPanel
            side="right"
            worktable={state.right}
            transferAvailable={canTransferCustomer(state, 'right')}
            transferActive={activeTransferSide === 'right'}
            transferUsed={state.transferUsed}
            onToggleTransfer={() => toggleTransfer('right')}
          />
          <FormulaBottle side="right" phase={state.phase} worktable={state.right} decision={state.deliveryDecisions.right} onDecision={(deliver) => dispatch({ type: 'SET_DELIVERY_DECISION', side: 'right', deliver })} />
        </aside>
        <WaitingArea
          customers={state.waitingCustomers}
          selectionMode={waitingMode}
          targetSide={waitingSide}
          transferFormula={activeTransferSide ? state[activeTransferSide].formula : undefined}
          onSelect={selectWaitingCustomer}
        />
      </section>
      <footer>
        <span>HTML PROTOTYPE · <b>B2.10 1920 RESPONSIVE STAGE</b></span>
        <span>当前满意度：左 {leftSatisfaction >= 0 ? '+' : ''}{leftSatisfaction} · 右 {rightSatisfaction >= 0 ? '+' : ''}{rightSatisfaction}；转单 {state.transferUsed ? '已使用' : '可用一次'}</span>
      </footer>
    </div>
  );
}