'use client';

/**
 * Funil kanban com drag-and-drop efetivo (atualização otimista).
 */
export default function FunnelKanban({
  columns,
  byStage,
  onMove,
  onOpen,
  fmtMoney,
}) {
  function onCardDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    try { e.currentTarget.classList.add('dragging'); } catch (_) {}
  }

  function onCardDragEnd(e) {
    try { e.currentTarget.classList.remove('dragging'); } catch (_) {}
    document.querySelectorAll('.col.drag-over').forEach((el) => el.classList.remove('drag-over'));
  }

  function onColDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.currentTarget;
    if (col && !col.classList.contains('drag-over')) {
      document.querySelectorAll('.col.drag-over').forEach((el) => el.classList.remove('drag-over'));
      col.classList.add('drag-over');
    }
  }

  function onColDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('drag-over');
    }
  }

  function onColDrop(e, stageId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const id = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('id');
    if (id) onMove(id, stageId);
  }

  return (
    <div className="kanban">
      {columns.map((s) => (
        <div
          className="col"
          key={s.id}
          onDragOver={onColDragOver}
          onDragLeave={onColDragLeave}
          onDrop={(e) => onColDrop(e, s.id)}
        >
          <div className="col-h" style={{ borderTop: '3px solid ' + (s.color || '#0d9488') }}>
            <span>{s.label}</span>
            <span>{(byStage[s.id] || []).length}</span>
          </div>
          <div className="col-b">
            {(byStage[s.id] || []).map((l) => (
              <div
                className="lead-card"
                key={l.id}
                draggable
                onDragStart={(e) => onCardDragStart(e, l.id)}
                onDragEnd={onCardDragEnd}
                onClick={() => onOpen(l)}
              >
                <strong>{l.nome || 'Sem nome'}</strong>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                  {l.telefone || l.contato || l.cidade || '—'}
                </div>
                {l.value ? (
                  <div style={{ fontSize: '.85rem', marginTop: 4 }}>{fmtMoney(l.value)}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
