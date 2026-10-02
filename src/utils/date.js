export function getDeadlineInfo(deadline) {
  if (!deadline) return null;

  const due = new Date(deadline + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);

  let urgency = 'normal';
  if (diffDays < 0) urgency = 'overdue';
  else if (diffDays <= 2) urgency = 'soon';

  const label = due.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  return { label, urgency, diffDays };
}
