import { useEffect, useRef, useState } from 'react';
import { getDeadlineInfo } from '../utils/date';

export default function Card({
  card,
  columnId,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDelete,
  onEdit,
  onSetDeadline,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const textareaRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditingDeadline && dateInputRef.current) {
      dateInputRef.current.focus();
      try {
        if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
      } catch {
        /* showPicker недоступен в этом браузере — просто фокус на поле */
      }
    }
  }, [isEditingDeadline]);

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== card.text) onEdit(columnId, card.id, trimmed);
    if (!trimmed) setDraft(card.text);
    setIsEditing(false);
  }

  function commitDeadline(e) {
    onSetDeadline(columnId, card.id, e.target.value || null);
    setIsEditingDeadline(false);
  }

  function handleAddItem(e) {
    e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    onAddChecklistItem(columnId, card.id, trimmed);
    setNewItemText('');
  }

  const checklist = card.checklist || [];
  const doneCount = checklist.filter((item) => item.done).length;
  const deadlineInfo = getDeadlineInfo(card.deadline);

  return (
    <li
      className={'card' + (isDropTarget ? ' card--drop-before' : '')}
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, card, columnId)}
      onDragOver={(e) => onDragOver(e, columnId, card.id)}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="card__edit"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitEdit();
            }
            if (e.key === 'Escape') {
              setDraft(card.text);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <>
          <p className="card__text" onDoubleClick={() => setIsEditing(true)}>
            {card.text}
          </p>
          <button
            type="button"
            className="card__delete"
            aria-label="Удалить карточку"
            onClick={() => onDelete(columnId, card.id)}
          >
            ×
          </button>
        </>
      )}

      <div className="card__meta">
        {isEditingDeadline ? (
          <input
            ref={dateInputRef}
            type="date"
            className="card__date-input"
            defaultValue={card.deadline || ''}
            onBlur={commitDeadline}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDeadline(e);
              if (e.key === 'Escape') setIsEditingDeadline(false);
            }}
          />
        ) : deadlineInfo ? (
          <button
            type="button"
            className={'deadline-badge deadline-badge--' + deadlineInfo.urgency}
            onClick={() => setIsEditingDeadline(true)}
            title="Изменить дедлайн"
          >
            <span aria-hidden="true">📅</span> {deadlineInfo.label}
          </button>
        ) : (
          <button
            type="button"
            className="card__meta-add"
            onClick={() => setIsEditingDeadline(true)}
            aria-label="Добавить дедлайн"
            title="Добавить дедлайн"
          >
            📅
          </button>
        )}

        {checklist.length > 0 ? (
          <button
            type="button"
            className={'checklist-badge' + (doneCount === checklist.length ? ' checklist-badge--done' : '')}
            onClick={() => setIsChecklistOpen((v) => !v)}
          >
            <span aria-hidden="true">☑</span> {doneCount}/{checklist.length}
          </button>
        ) : (
          <button
            type="button"
            className="card__meta-add"
            onClick={() => setIsChecklistOpen(true)}
            aria-label="Добавить чек-лист"
            title="Добавить чек-лист"
          >
            ☑
          </button>
        )}
      </div>

      {isChecklistOpen && (
        <div className="checklist">
          {checklist.length > 0 && (
            <ul className="checklist__list">
              {checklist.map((item) => (
                <li key={item.id} className="checklist__item">
                  <label className="checklist__label">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => onToggleChecklistItem(columnId, card.id, item.id)}
                    />
                    <span className={'checklist__text' + (item.done ? ' checklist__text--done' : '')}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="checklist__delete"
                    aria-label="Удалить пункт"
                    onClick={() => onDeleteChecklistItem(columnId, card.id, item.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="checklist__add-form" onSubmit={handleAddItem}>
            <input
              type="text"
              className="checklist__add-input"
              placeholder="Новый пункт"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
            />
            <button type="submit" className="checklist__add-btn" aria-label="Добавить пункт">
              +
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
