import { useCallback, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { createId } from './utils/id';
import Column from './components/Column';
import AddColumnForm from './components/AddColumnForm';
import ThemeToggle from './components/ThemeToggle';
import PomodoroTimer from './components/PomodoroTimer';

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const INITIAL_COLUMNS = [
  {
    id: createId(),
    title: 'Нужно сделать',
    cards: [
      {
        id: createId(),
        text: 'Собрать скриншоты для портфолио',
        deadline: todayPlus(3),
        checklist: [
          { id: createId(), text: 'Мебельный проект', done: true },
          { id: createId(), text: 'Kanban-доска', done: false },
        ],
      },
      { id: createId(), text: 'Настроить домен для сайта', deadline: null, checklist: [] },
    ],
  },
  {
    id: createId(),
    title: 'В работе',
    cards: [{ id: createId(), text: 'Вёрстка секции «Контакты»', deadline: todayPlus(-1), checklist: [] }],
  },
  {
    id: createId(),
    title: 'Готово',
    cards: [{ id: createId(), text: 'Задеплоить портфолио на GitHub Pages', deadline: null, checklist: [] }],
  },
];

export default function App() {
  const [columns, setColumns] = useLocalStorage('kanban-board:columns', INITIAL_COLUMNS);
  const [theme, toggleTheme] = useTheme();
  const [dragOver, setDragOver] = useState(null); // { columnId, beforeCardId | null }

  const addColumn = useCallback(
    (title) => {
      setColumns((cols) => [...cols, { id: createId(), title, cards: [] }]);
    },
    [setColumns]
  );

  const renameColumn = useCallback(
    (columnId, title) => {
      setColumns((cols) => cols.map((c) => (c.id === columnId ? { ...c, title } : c)));
    },
    [setColumns]
  );

  const deleteColumn = useCallback(
    (columnId) => {
      setColumns((cols) => cols.filter((c) => c.id !== columnId));
    },
    [setColumns]
  );

  const addCard = useCallback(
    (columnId, text) => {
      setColumns((cols) =>
        cols.map((c) =>
          c.id === columnId
            ? { ...c, cards: [...c.cards, { id: createId(), text, deadline: null, checklist: [] }] }
            : c
        )
      );
    },
    [setColumns]
  );

  const deleteCard = useCallback(
    (columnId, cardId) => {
      setColumns((cols) =>
        cols.map((c) => (c.id === columnId ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) } : c))
      );
    },
    [setColumns]
  );

  const updateCard = useCallback(
    (columnId, cardId, updater) => {
      setColumns((cols) =>
        cols.map((c) =>
          c.id === columnId
            ? { ...c, cards: c.cards.map((card) => (card.id === cardId ? updater(card) : card)) }
            : c
        )
      );
    },
    [setColumns]
  );

  const editCard = useCallback(
    (columnId, cardId, text) => updateCard(columnId, cardId, (card) => ({ ...card, text })),
    [updateCard]
  );

  const setCardDeadline = useCallback(
    (columnId, cardId, deadline) => updateCard(columnId, cardId, (card) => ({ ...card, deadline })),
    [updateCard]
  );

  const addChecklistItem = useCallback(
    (columnId, cardId, text) =>
      updateCard(columnId, cardId, (card) => ({
        ...card,
        checklist: [...(card.checklist || []), { id: createId(), text, done: false }],
      })),
    [updateCard]
  );

  const toggleChecklistItem = useCallback(
    (columnId, cardId, itemId) =>
      updateCard(columnId, cardId, (card) => ({
        ...card,
        checklist: (card.checklist || []).map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item
        ),
      })),
    [updateCard]
  );

  const deleteChecklistItem = useCallback(
    (columnId, cardId, itemId) =>
      updateCard(columnId, cardId, (card) => ({
        ...card,
        checklist: (card.checklist || []).filter((item) => item.id !== itemId),
      })),
    [updateCard]
  );

  const moveCard = useCallback(
    (cardId, fromColumnId, toColumnId, beforeCardId) => {
      setColumns((cols) => {
        let movedCard = null;
        const withoutCard = cols.map((c) => {
          if (c.id !== fromColumnId) return c;
          const found = c.cards.find((card) => card.id === cardId);
          if (found) movedCard = found;
          return { ...c, cards: c.cards.filter((card) => card.id !== cardId) };
        });

        if (!movedCard) return cols;

        return withoutCard.map((c) => {
          if (c.id !== toColumnId) return c;
          const insertIndex = beforeCardId ? c.cards.findIndex((card) => card.id === beforeCardId) : c.cards.length;
          const at = insertIndex === -1 ? c.cards.length : insertIndex;
          const next = [...c.cards];
          next.splice(at, 0, movedCard);
          return { ...c, cards: next };
        });
      });
    },
    [setColumns]
  );

  return (
    <div className="kanban">
      <header className="kanban__header">
        <div className="kanban__brand">
          <span className="kanban__brand-mark" aria-hidden="true"></span>
          <h1 className="kanban__title">Доска задач</h1>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="kanban__board">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            dragOver={dragOver}
            onDragOverChange={setDragOver}
            onRename={renameColumn}
            onDelete={deleteColumn}
            onAddCard={addCard}
            onEditCard={editCard}
            onDeleteCard={deleteCard}
            onMoveCard={moveCard}
            onSetDeadline={setCardDeadline}
            onAddChecklistItem={addChecklistItem}
            onToggleChecklistItem={toggleChecklistItem}
            onDeleteChecklistItem={deleteChecklistItem}
          />
        ))}
        <AddColumnForm onAdd={addColumn} />
      </main>

      <PomodoroTimer />
    </div>
  );
}
