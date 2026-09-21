'use client';

/**
 * Aba Contatos — lista + importação CSV Google Contatos
 */
export default function ContatosTab({
  filtered,
  q,
  setQ,
  importing,
  importResult,
  importGoogleCsv,
  loadLeads,
  setShowOpp,
  setSelected,
  stageLabel,
  stageColor,
  activePipe,
  fmtMoney,
}) {
  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ margin: '0 0 8px' }}>Importar contatos do Google</h3>
        <p style={{ margin: '0 0 12px', fontSize: '.85rem', color: 'var(--muted)' }}>
          No Google Contatos → Exportar → escolha <strong>Google CSV</strong> → baixe o arquivo e selecione abaixo.
          Contatos com o mesmo telefone já existentes são ignorados (até 500 por vez).
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label className="btn btn-primary" style={{ cursor: importing ? 'wait' : 'pointer', margin: 0 }}>
            {importing ? 'Importando…' : 'Escolher CSV do Google'}
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              style={{ display: 'none' }}
              disabled={importing}
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) importGoogleCsv(f);
                e.target.value = '';
              }}
            />
          </label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => loadLeads()}>
            Atualizar lista
          </button>
          <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
            {filtered.length} contato(s)
          </span>
        </div>
        {importResult && (
          <div className="ok" style={{ marginTop: 10 }}>
            {importResult.message}
            {importResult.created != null && (
              <span>
                {' '}
                · criados: {importResult.created} · ignorados:{' '}
                {importResult.skipped != null ? importResult.skipped : 0}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="filters">
        <input
          className="input"
          style={{ margin: 0, flex: 1 }}
          placeholder="Buscar por nome, telefone ou origem…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowOpp(true)}>
          + Novo contato
        </button>
      </div>

      {!filtered.length ? (
        <div className="empty">
          Nenhum contato ainda. Importe um CSV do Google Contatos ou adicione manualmente.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Etapa</th>
              <th>Valor</th>
              <th>Origem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(l)}>
                <td>{l.nome}</td>
                <td>{l.telefone || l.contato}</td>
                <td>
                  <span className="tag" style={{ background: stageColor(l.stage, activePipe) + '33' }}>
                    {stageLabel(l.stage, activePipe)}
                  </span>
                </td>
                <td>{fmtMoney(l.value)}</td>
                <td>{l.source === 'google_csv' ? 'Google CSV' : l.source || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
