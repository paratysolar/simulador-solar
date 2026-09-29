'use client';
import { useState, useEffect } from 'react';
import { DEFAULT_EQUIP } from './prop-helpers';

const META_DEFAULT = [
  { title: 'Residencial', place: 'Paraty – RJ' },
  { title: 'Residencial', place: 'Costa Verde – RJ' },
  { title: 'Comercial', place: 'Paraty – RJ' },
  { title: 'Residencial', place: 'Angra dos Reis – RJ' },
  { title: 'Comercial', place: 'Paraty – RJ' },
  { title: 'Residencial', place: 'Costa Verde – RJ' },
  { title: 'Residencial', place: 'Paraty – RJ' },
  { title: 'Comercial', place: 'Paraty – RJ' },
  { title: 'Residencial', place: 'Costa Verde – RJ' },
];

export default function SettingsPanel({ auth }) {
  const [tab, setTab] = useState('fotos');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [editMao, setEditMao] = useState(1320);
  const [editEquip, setEditEquip] = useState(DEFAULT_EQUIP);
  const [products, setProducts] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [editProd, setEditProd] = useState(null);

  useEffect(() => { if (auth) loadAll(); }, [auth]);

  async function loadAll() {
    setBusy(true);
    try {
      const [sRes, pRes] = await Promise.all([
        fetch('/api/prop/settings', { headers: { 'x-prop-auth': auth } }),
        fetch('/api/pricing', { headers: { 'x-prop-auth': auth } }),
      ]);
      const sData = await sRes.json();
      if (sRes.ok) {
        setPhotos(sData.photos);
        setLocalFiles(sData.local_files || []);
        setProducts(sData.products || []);
      }
      const pData = await pRes.json();
      if (pRes.ok && pData.config) {
        setEditMao(Number(pData.config.mao_obra_kwp) || 1320);
        const eq = pData.config.equip || DEFAULT_EQUIP;
        setEditEquip({
          ongrid: { ...DEFAULT_EQUIP.ongrid, ...(eq.ongrid || {}) },
          hibrido: { ...DEFAULT_EQUIP.hibrido, ...(eq.hibrido || {}) },
          offgrid: { ...DEFAULT_EQUIP.offgrid, ...(eq.offgrid || {}) },
        });
      }
    } catch (e) {
      setMsg(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  function flash(text) {
    setMsg(text);
    setTimeout(() => setMsg(''), 4000);
  }

  async function savePhotos() {
    if (!photos) return;
    setBusy(true);
    try {
      const res = await fetch('/api/prop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({ photos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      flash(data.message || 'Fotos salvas.');
      try { sessionStorage.setItem('ps_proposal_photos', JSON.stringify(photos)); } catch (_) {}
    } catch (e) {
      flash(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function resetPhotos() {
    setBusy(true);
    try {
      const res = await fetch('/api/prop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({ reset_photos: true }),
      });
      const data = await res.json();
      if (res.ok && data.photos) {
        setPhotos(data.photos);
        sessionStorage.setItem('ps_proposal_photos', JSON.stringify(data.photos));
        flash('Fotos restauradas ao padrão (instalações reais).');
      }
    } catch (e) {
      flash(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function savePricing(e) {
    e?.preventDefault?.();
    setBusy(true);
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({
          mao_obra_kwp: Number(editMao) || 1320,
          equip: editEquip,
          notes: `Mão de obra R$ ${editMao}/kWp em kits homologados.`,
          updated_by: 'settings-ui',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      flash(data.message || 'Preços salvos.');
    } catch (e) {
      flash(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function saveProduct(e) {
    e?.preventDefault?.();
    if (!editProd) return;
    setBusy(true);
    try {
      const res = await fetch('/api/prop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({ product: editProd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      flash(data.message || 'Produto salvo.');
      setEditProd(null);
      await loadAll();
    } catch (e) {
      flash(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(sku) {
    if (!confirm(`Desativar produto ${sku}?`)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/prop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({ delete_sku: sku }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      flash(data.message || 'Produto desativado.');
      await loadAll();
    } catch (e) {
      flash(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  function setCover(key, url) { setPhotos((p) => ({ ...p, [key]: url })); }
  function setPortfolioSrc(i, url) {
    setPhotos((p) => {
      const portfolio = [...(p.portfolio || [])];
      portfolio[i] = { ...(portfolio[i] || {}), src: url };
      return { ...p, portfolio };
    });
  }
  function setPortfolioMeta(i, field, value) {
    setPhotos((p) => {
      const portfolio = [...(p.portfolio || [])];
      portfolio[i] = { ...(portfolio[i] || {}), [field]: value };
      return { ...p, portfolio };
    });
  }
  function setTeamSrc(i, url) {
    setPhotos((p) => {
      const team = [...(p.team || [])];
      team[i] = url;
      return { ...p, team };
    });
  }
  function addPortfolioSlot() {
    setPhotos((p) => ({
      ...p,
      portfolio: [...(p.portfolio || []), { src: localFiles[0] || '', title: 'Residencial', place: 'Paraty – RJ' }],
    }));
  }

  const filtered = filterCat ? products.filter((x) => (x.categoria || '') === filterCat) : products;
  const cats = [...new Set(products.map((p) => p.categoria).filter(Boolean))];

  if (!photos) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <p style={{ color: 'var(--m)' }}>{busy ? 'Carregando configurações…' : 'Sem dados.'}</p>
      </div>
    );
  }

  return (
    <div>
      {msg && (
        <div style={{ background: '#e8f8ef', color: '#009558', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '.9rem' }}>{msg}</div>
      )}

      <div className="cfg-tabs no-print">
        {[['fotos', 'Fotos das instalações'], ['precos', 'Preços padrão'], ['produtos', 'Produtos / catálogo']].map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'cfg-tab on' : 'cfg-tab'} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'fotos' && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 6 }}>Fotos da proposta</h3>
          <p style={{ color: 'var(--m)', fontSize: '.88rem', marginBottom: 18 }}>
            Escolha imagens de <code>/prop-photos/</code> (instalações reais) ou cole uma URL externa.
          </p>
          <h4 style={{ margin: '16px 0 10px', color: 'var(--navy)' }}>Capa (3 fotos)</h4>
          <div className="photo-grid">
            {['cover1', 'cover2', 'cover3'].map((key, i) => (
              <div key={key} className="photo-slot">
                <div className="photo-prev"><img src={photos[key]} alt={key} onError={(e) => { e.target.style.opacity = 0.3; }} /></div>
                <label>{key === 'cover2' ? 'Principal' : `Lateral ${i + 1}`}</label>
                <select value={photos[key] || ''} onChange={(e) => setCover(key, e.target.value)}>
                  {localFiles.map((f) => (<option key={f} value={f}>{f.replace('/prop-photos/', '')}</option>))}
                </select>
                <input type="url" placeholder="Ou cole URL…" value={photos[key] || ''} onChange={(e) => setCover(key, e.target.value)} />
              </div>
            ))}
          </div>
          <h4 style={{ margin: '24px 0 10px', color: 'var(--navy)' }}>Portfólio</h4>
          <div className="photo-grid">
            {(photos.portfolio || []).map((item, i) => (
              <div key={i} className="photo-slot">
                <div className="photo-prev"><img src={item.src} alt={`p${i}`} onError={(e) => { e.target.style.opacity = 0.3; }} /></div>
                <input placeholder="Título" value={item.title || ''} onChange={(e) => setPortfolioMeta(i, 'title', e.target.value)} />
                <input placeholder="Local" value={item.place || ''} onChange={(e) => setPortfolioMeta(i, 'place', e.target.value)} />
                <select value={item.src || ''} onChange={(e) => setPortfolioSrc(i, e.target.value)}>
                  {localFiles.map((f) => (<option key={f} value={f}>{f.replace('/prop-photos/', '')}</option>))}
                </select>
                <input type="url" placeholder="URL" value={item.src || ''} onChange={(e) => setPortfolioSrc(i, e.target.value)} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-out" onClick={addPortfolioSlot} style={{ marginTop: 8 }}>+ Adicionar foto</button>
          <h4 style={{ margin: '24px 0 10px', color: 'var(--navy)' }}>Equipe / obra (3)</h4>
          <div className="photo-grid">
            {(photos.team || []).map((src, i) => (
              <div key={i} className="photo-slot">
                <div className="photo-prev"><img src={src} alt={`team${i}`} onError={(e) => { e.target.style.opacity = 0.3; }} /></div>
                <select value={src || ''} onChange={(e) => setTeamSrc(i, e.target.value)}>
                  {localFiles.map((f) => (<option key={f} value={f}>{f.replace('/prop-photos/', '')}</option>))}
                </select>
                <input type="url" placeholder="URL" value={src || ''} onChange={(e) => setTeamSrc(i, e.target.value)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn" disabled={busy} onClick={savePhotos}>{busy ? 'Salvando…' : 'Salvar fotos'}</button>
            <button type="button" className="btn-out" disabled={busy} onClick={resetPhotos}>Restaurar padrão</button>
          </div>
        </div>
      )}

      {tab === 'precos' && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 6 }}>Preços padrão (R$/kWp)</h3>
          <form onSubmit={savePricing}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: '.85rem' }}>Mão de obra (R$/kWp)</label>
              <input type="number" value={editMao} onChange={(e) => setEditMao(e.target.value)} style={{ maxWidth: 160, display: 'block', marginTop: 6 }} />
            </div>
            {['ongrid', 'hibrido', 'offgrid'].map((mode) => (
              <div key={mode} style={{ marginBottom: 18 }}>
                <h4 style={{ color: 'var(--navy)', marginBottom: 8, textTransform: 'capitalize' }}>{mode}</h4>
                <div className="price-edit-grid">
                  {['base', 'mid', 'large', 'xl'].map((faixa) => (
                    <div key={faixa}>
                      <label style={{ fontSize: '.75rem', color: 'var(--m)' }}>{faixa === 'base' ? '≤4 kWp' : faixa === 'mid' ? '4–8' : faixa === 'large' ? '8–15' : '≥15'}</label>
                      <input type="number" value={editEquip[mode]?.[faixa] ?? ''} onChange={(e) => setEditEquip((eq) => ({ ...eq, [mode]: { ...eq[mode], [faixa]: Number(e.target.value) || 0 } }))} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" className="btn" disabled={busy}>{busy ? 'Salvando…' : 'Salvar preços'}</button>
          </form>
        </div>
      )}

      {tab === 'produtos' && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>Catálogo de produtos</h3>
              <p style={{ color: 'var(--m)', fontSize: '.88rem' }}>{products.length} itens · ICMS embutido · kits −15%</p>
            </div>
            <button type="button" className="btn" onClick={() => setEditProd({ sku: '', nome: '', categoria: 'modulos', marca: 'Intelbras', preco: 0, unidade: 'un' })}>+ Novo</button>
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ marginBottom: 12 }}>
            <option value="">Todas categorias</option>
            {cats.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          {editProd && (
            <form onSubmit={saveProduct} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 10 }}>{editProd._existing ? 'Editar' : 'Novo'} produto</h4>
              <div className="price-edit-grid">
                <div><label style={{ fontSize: '.75rem' }}>SKU *</label><input required value={editProd.sku} onChange={(e) => setEditProd({ ...editProd, sku: e.target.value })} /></div>
                <div><label style={{ fontSize: '.75rem' }}>Nome *</label><input required value={editProd.nome} onChange={(e) => setEditProd({ ...editProd, nome: e.target.value })} /></div>
                <div><label style={{ fontSize: '.75rem' }}>Categoria</label>
                  <select value={editProd.categoria} onChange={(e) => setEditProd({ ...editProd, categoria: e.target.value })}>
                    {['modulos', 'inversores', 'baterias', 'estrutura', 'acessorios'].map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div><label style={{ fontSize: '.75rem' }}>Marca</label><input value={editProd.marca || ''} onChange={(e) => setEditProd({ ...editProd, marca: e.target.value })} /></div>
                <div><label style={{ fontSize: '.75rem' }}>Preço (R$) *</label><input type="number" step="0.01" required value={editProd.preco} onChange={(e) => setEditProd({ ...editProd, preco: Number(e.target.value) })} /></div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button type="submit" className="btn" disabled={busy}>Salvar</button>
                <button type="button" className="btn-out" onClick={() => setEditProd(null)}>Cancelar</button>
              </div>
            </form>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table className="cfg-table">
              <thead><tr><th>SKU</th><th>Nome</th><th>Cat.</th><th>Marca</th><th>Preço</th><th></th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.sku}>
                    <td><code>{p.sku}</code></td>
                    <td>{p.nome}</td>
                    <td>{p.categoria}</td>
                    <td>{p.marca}</td>
                    <td>R$ {Number(p.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <button type="button" className="btn-out" style={{ padding: '4px 10px', fontSize: '.8rem' }} onClick={() => setEditProd({ ...p, _existing: true })}>Editar</button>{' '}
                      <button type="button" className="btn-out" style={{ padding: '4px 10px', fontSize: '.8rem', color: '#c0392b' }} onClick={() => deleteProduct(p.sku)}>Off</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
