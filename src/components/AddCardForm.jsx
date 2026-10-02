import { useState } from 'react';

export default function AddCardForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  }

  if (!isOpen) {
    return (
      <button type="button" className="add-card-trigger" onClick={() => setIsOpen(true)}>
        + Добавить карточку
      </button>
    );
  }

  return (
    <form
      className="add-card-form"
      onSubmit={handleSubmit}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget) && !text.trim()) setIsOpen(false);
      }}
    >
      <textarea
        className="add-card-form__input"
        autoFocus
        rows={2}
        placeholder="Текст карточки"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
          if (e.key === 'Escape') {
            setIsOpen(false);
            setText('');
          }
        }}
      />
      <div className="add-card-form__actions">
        <button type="submit" className="btn btn--primary btn--small">Добавить</button>
        <button type="button" className="btn btn--small" onClick={() => { setIsOpen(false); setText(''); }}>
          Отмена
        </button>
      </div>
    </form>
  );
}
