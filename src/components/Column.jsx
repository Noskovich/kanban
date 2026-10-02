import { useState } from 'react';
import Card from './Card';
import AddCardForm from './AddCardForm';

export default function Column({
  column,
  dragOver,
  onDragOverChange,
  onRename,
  onDelete,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onMoveCard,
  onSetDeadline,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);

  function commitTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed) onRename(column.id, trimmed);
    else setTitleDraft(column.title);
    setIsEditingTitle(false);
  }

  function handleDragStart(e, card, fromColumnId) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ cardId: card.id, fromColumnId }));
  }

  function handleCardDragOver(e, columnId, cardId) {
    e.preventDefault();
    e.stopPropagation();
    onDragOverChange({ columnId, beforeCardId: cardId });
  }

  function handleColumnDragOver(e) {
    e.preventDefault();
    onDragOverChange({ columnId: column.id, beforeCardId: null });
  }

  function handleDrop(e) {
    e.preventDefault();
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData('application/json'));
    } catch {
      onDragOverChange(null);
      return;
    }
    if (payload && payload.cardId) {
      const beforeCardId = dragOver && dragOver.columnId === column.id ? dragOver.beforeCardId : null;
      onMoveCard(payload.cardId, payload.fromColumnId, column.id, beforeCardId);
    }
    onDragOverChange(null);
  }

  const isColumnDragTarget = dragOver && dragOver.columnId === column.id && dragOver.beforeCardId === null;

  return (
    <section
      className={'column' + (isColumnDragTarget ? ' column--drop-end' : '')}
      onDragOver={handleColumnDragOver}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onDragOverChange(null);
      }}
      onDrop={handleDrop}
    >
      <header className="column__header">
        {isEditingTitle ? (
          <input
            className="column__title-input"
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') {
                setTitleDraft(column.title);
                setIsEditingTitle(false);
              }
            }}
          />
        ) : (
          <h2 className="column__title" onDoubleClick={() => setIsEditingTitle(true)}>
            {column.title}
          </h2>
        )}
        <span className="column__count">{column.cards.length}</span>
        <button
          type="button"
          className="column__delete"
          aria-label="Удалить колонку"
          onClick={() => onDelete(column.id)}
        >
          ×
        </button>
      </header>

      <ul className="column__cards">
        {column.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
            isDropTarget={dragOver && dragOver.columnId === column.id && dragOver.beforeCardId === card.id}
            onDragStart={handleDragStart}
            onDragOver={handleCardDragOver}
            onDelete={onDeleteCard}
            onEdit={onEditCard}
            onSetDeadline={onSetDeadline}
            onAddChecklistItem={onAddChecklistItem}
            onToggleChecklistItem={onToggleChecklistItem}
            onDeleteChecklistItem={onDeleteChecklistItem}
          />
        ))}
      </ul>

      <AddCardForm onAdd={(text) => onAddCard(column.id, text)} />
    </section>
  );
}
