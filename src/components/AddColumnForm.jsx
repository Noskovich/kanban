import { useState } from 'react';

export default function AddColumnForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle('');
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button type="button" className="add-column" onClick={() => setIsOpen(true)}>
        <span className="add-column__plus" aria-hidden="true">+</span>
        Добавить колонку
      </button>
    );
  }

  return (
    <form className="add-column add-column--open" onSubmit={handleSubmit}>
      <input
        className="add-column__input"
        type="text"
        autoFocus
        placeholder="Название колонки"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
            setTitle('');
          }
        }}
      />
      <div className="add-column__actions">
        <button type="submit" className="btn btn--primary">Добавить</button>
        <button type="button" className="btn" onClick={() => { setIsOpen(false); setTitle(''); }}>
          Отмена
        </button>
      </div>
    </form>
  );
}
