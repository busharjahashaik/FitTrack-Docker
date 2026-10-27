import { useEffect, useMemo, useRef, useState } from 'react'
import { fitnessApi } from './api'

const emptyForm = { challengeName: '', durationDays: 30, participantCount: 0, active: true }
const pagePaths = {
  dashboard: '/dashboard',
  challenges: '/challenges',
  add: '/add',
  search: '/search',
}

function pageFromPath(pathname) {
  return Object.keys(pagePaths).find(page => pagePaths[page] === pathname) ?? 'welcome'
}

function normalizeItem(item) {
  return {
    id: item.id,
    challengeName: item.challengeName ?? '',
    durationDays: item.durationDays ?? 30,
    participantCount: item.participantCount ?? 0,
    active: item.active ?? true,
  }
}

function Welcome({ onEnter }) {
  return (
    <main className="welcome-screen">
      <div className="welcome-orb welcome-orb-one" />
      <div className="welcome-orb welcome-orb-two" />
      <div className="welcome-grid" />
      <div className="welcome-rings" aria-hidden="true"><span /><span /><span /></div>
      <div className="welcome-float welcome-float-one" aria-hidden="true"><i className="bi bi-heart-pulse-fill" /></div>
      <div className="welcome-float welcome-float-two" aria-hidden="true"><i className="bi bi-lightning-charge-fill" /></div>
      <div className="welcome-float welcome-float-three" aria-hidden="true"><i className="bi bi-trophy-fill" /></div>
      <section className="welcome-content">
        <div className="welcome-brand-mark"><i className="bi bi-activity" /></div>
        <button type="button" className="welcome-title-button" onClick={onEnter} aria-label="FitTrack, enter dashboard">
          FitTrack
        </button>
        <p className="welcome-kicker">YOUR NEXT MILESTONE STARTS HERE</p>
        <h1>Fitness Challenge<br /><span>Manager</span></h1>
        <p className="welcome-tagline">Set a goal. Build a habit. Celebrate every milestone.</p>
        <div className="welcome-pulse" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
        <button type="button" className="welcome-enter" onClick={onEnter}>
          Enter Dashboard <i className="bi bi-arrow-right" />
        </button>
        <div className="welcome-caption"><span /> MAKE MOVEMENT A MOMENTUM <span /></div>
      </section>
    </main>
  )
}

function App() {
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname))
  const [items, setItems] = useState([])
  const [visibleItems, setVisibleItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('')
  const [participantFilter, setParticipantFilter] = useState('')
  const [lookupId, setLookupId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const searchRef = useRef(null)

  async function fetchChallenges() {
    const data = await fitnessApi.getAll()
    const challenges = Array.isArray(data) ? data.map(normalizeItem) : []
    setItems(challenges)
    setVisibleItems(challenges)
    return challenges
  }

  async function loadItems() {
    setLoading(true)
    setError('')
    try {
      await fetchChallenges()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  useEffect(() => {
    function handlePopState() {
      setPage(pageFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigateTo(nextPage) {
    const nextPath = pagePaths[nextPage]
    if (!nextPath) return
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath)
    setPage(nextPage)
    setError('')
    setMessage('')
    if (nextPage === 'challenges' || nextPage === 'search') setVisibleItems(items)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    if (nextPage === 'search') window.setTimeout(() => searchRef.current?.focus(), 250)
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : (name === 'challengeName' ? value : Number(value)),
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function submitForm(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    const challengeName = form.challengeName.trim()
    if (!challengeName) return setError('Please enter a challenge name.')
    if (challengeName.length > 150) return setError('Challenge name must be 150 characters or fewer.')
    if (!Number.isInteger(Number(form.durationDays)) || Number(form.durationDays) < 1) return setError('Duration must be at least 1 day.')
    if (!Number.isInteger(Number(form.participantCount)) || Number(form.participantCount) < 0) return setError('Participants cannot be negative.')

    const payload = {
      challengeName,
      durationDays: Number(form.durationDays),
      participantCount: Number(form.participantCount),
      active: Boolean(form.active),
    }
    setSaving(true)
    try {
      if (editingId !== null) {
        await fitnessApi.update(editingId, payload)
        setMessage('Challenge updated successfully.')
      } else {
        await fitnessApi.add(payload)
        setMessage('Challenge added successfully.')
      }
      resetForm()
      await fetchChallenges()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    setForm(normalizeItem(item))
    setEditingId(item.id)
    setError('')
    setMessage('')
    navigateTo('add')
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete "${item.challengeName}"?`)) return
    setError('')
    setMessage('')
    setDeleting(true)
    try {
      await fitnessApi.remove(item.id)
      if (editingId === item.id) resetForm()
      await fetchChallenges()
      setMessage('Challenge deleted.')
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  async function deleteAll() {
    if (!items.length) return
    if (!window.confirm('Delete ALL fitness challenges? This cannot be undone.')) return
    setError('')
    setMessage('')
    setDeleting(true)
    try {
      await fitnessApi.removeAll()
      resetForm()
      await fetchChallenges()
      setMessage('All challenges deleted.')
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  async function findById(event) {
    event.preventDefault()
    const id = lookupId.trim()
    if (!id) return setError('Enter a challenge ID to search.')
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const result = await fitnessApi.getById(id)
      const match = result ? normalizeItem(result) : null
      setVisibleItems(match ? [match] : [])
      setMessage(match ? `Showing challenge with ID ${id}. Refresh to return to all challenges.` : `No challenge found with ID ${id}.`)
    } catch (e) {
      setVisibleItems([])
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function applyFilters(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const requests = []
      if (search.trim()) requests.push(fitnessApi.search(search.trim()))
      if (statusFilter !== 'all') requests.push(fitnessApi.getActive(statusFilter === 'active'))
      if (durationFilter !== '') requests.push(fitnessApi.getDuration(Number(durationFilter)))
      if (participantFilter !== '') requests.push(fitnessApi.getParticipants(Number(participantFilter)))

      if (!requests.length) {
        setVisibleItems(items)
      } else {
        const results = await Promise.all(requests)
        const matchingIds = results.map(result => {
          return new Set((Array.isArray(result) ? result : []).map(item => String(item.id)))
        }).reduce((ids, nextIds) => {
          return new Set([...ids].filter(id => nextIds.has(id)))
        })
        setVisibleItems(items.filter(item => matchingIds.has(String(item.id))))
      }
      setMessage('Challenge filters applied.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setDurationFilter('')
    setParticipantFilter('')
    setLookupId('')
    setVisibleItems(items)
    setMessage('')
    setError('')
  }

  const totalParticipants = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.participantCount || 0), 0),
    [items],
  )
  const activeCount = useMemo(() => items.filter(item => item.active).length, [items])

  if (page === 'welcome') return <Welcome onEnter={() => navigateTo('dashboard')} />

  const challengeForm = (
    <div className="content-card form-card">
      <div className="card-heading">
        <div><div className="section-kicker">{editingId !== null ? 'UPDATE DETAILS' : 'GET STARTED'}</div><h2>{editingId !== null ? 'Edit challenge' : 'New challenge'}</h2></div>
        <span className="heading-icon"><i className={`bi ${editingId !== null ? 'bi-pencil-square' : 'bi-plus-lg'}`} /></span>
      </div>
      {editingId !== null && <div className="edit-id-note"><i className="bi bi-lock-fill" /> Editing challenge <strong>#{editingId}</strong> · ID cannot be changed</div>}
      <form onSubmit={submitForm}>
        <div className="mb-3">
          <label htmlFor="challengeName" className="form-label">Challenge name <span className="required">*</span></label>
          <input id="challengeName" name="challengeName" className="form-control" placeholder="e.g. 10K Steps a Day" value={form.challengeName} onChange={updateField} maxLength={150} required />
          <div className="form-text">Up to 150 characters</div>
        </div>
        <div className="mb-3">
          <label htmlFor="durationDays" className="form-label">Duration in days <span className="required">*</span></label>
          <input id="durationDays" name="durationDays" type="number" min="1" step="1" className="form-control" value={form.durationDays} onChange={updateField} required />
        </div>
        <div className="mb-3">
          <label htmlFor="participantCount" className="form-label">Participant count <span className="required">*</span></label>
          <input id="participantCount" name="participantCount" type="number" min="0" step="1" className="form-control" value={form.participantCount} onChange={updateField} required />
        </div>
        <div className="form-check form-switch status-switch mb-4">
          <input id="active" name="active" className="form-check-input" type="checkbox" checked={Boolean(form.active)} onChange={updateField} />
          <label className="form-check-label" htmlFor="active">{form.active ? 'Active challenge' : 'Inactive challenge'}</label>
        </div>
        <button className="btn btn-primary w-100 submit-btn" type="submit" disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className={`bi ${editingId !== null ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`} />{editingId !== null ? 'Save changes' : 'Add challenge'}</>}
        </button>
        {editingId !== null && <button type="button" className="btn btn-light w-100 mt-2" onClick={resetForm}>Cancel editing</button>}
      </form>
      <div className="form-note"><i className="bi bi-info-circle me-2" />Challenge ID is generated automatically by the backend.</div>
    </div>
  )

  const challengeTable = (
    <div className="table-responsive">
      <table className="table align-middle challenge-table">
        <thead><tr><th>ID</th><th>Challenge</th><th>Duration</th><th>Participants</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan="6"><div className="empty-state"><span className="spinner-border spinner-border-sm me-2" />Loading challenges...</div></td></tr>
          : visibleItems.length === 0 ? <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon"><i className="bi bi-clipboard2-pulse" /></div><strong>{items.length ? 'No challenges match your filters' : 'No challenges yet'}</strong><span>{items.length ? 'Try adjusting your search or filters.' : 'Create your first challenge to get started.'}</span></div></td></tr>
          : visibleItems.map(item => <tr key={item.id}>
            <td><span className="id-pill">#{item.id}</span></td>
            <td><div className="challenge-name">{item.challengeName}</div><div className="challenge-sub">Fitness program</div></td>
            <td><span className="duration-value">{item.durationDays}</span> <span className="text-secondary small">days</span></td>
            <td><span className="participant-value"><i className="bi bi-people me-1" />{item.participantCount}</span></td>
            <td><span className={`status-pill ${item.active ? 'is-active' : 'is-inactive'}`}><span />{item.active ? 'Active' : 'Inactive'}</span></td>
            <td><div className="action-buttons"><button type="button" className="icon-btn edit-btn" title="Edit challenge" aria-label={`Edit ${item.challengeName}`} onClick={() => startEdit(item)}><i className="bi bi-pencil" /></button><button type="button" className="icon-btn delete-btn" title="Delete challenge" aria-label={`Delete ${item.challengeName}`} onClick={() => deleteItem(item)} disabled={deleting}><i className="bi bi-trash3" /></button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="app-shell">
      <nav className="navbar topbar sticky-top">
        <div className="container navbar-inner">
          <button className="navbar-brand fw-bold d-flex align-items-center gap-2" type="button" onClick={() => navigateTo('dashboard')}>
            <span className="brand-mark"><i className="bi bi-activity" /></span>
            FitTrack
          </button>
          <span className="navbar-title">Fitness Challenge Manager</span>
          <div className="nav-links" aria-label="Main navigation">
            {[
              ['dashboard', 'Dashboard', 'bi-grid-1x2'],
              ['search', 'Search', 'bi-search'],
              ['challenges', 'View Challenges', 'bi-list-check'],
              ['add', 'Add Challenge', 'bi-plus-circle'],
            ].map(([section, label, icon]) => (
              <button key={section} type="button" className={`nav-link ${page === section ? 'active' : ''}`} aria-current={page === section ? 'page' : undefined} onClick={() => navigateTo(section)}>
                <i className={`bi ${icon}`} /> <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container dashboard-main">
        {error && <div className="alert alert-danger d-flex align-items-start gap-2" role="alert"><i className="bi bi-exclamation-triangle-fill mt-1" /><div>{error}</div><button className="btn-close ms-auto" onClick={() => setError('')} aria-label="Close" /></div>}
        {message && <div className="alert alert-success d-flex align-items-center gap-2" role="status"><i className="bi bi-check-circle-fill" /><div>{message}</div><button className="btn-close ms-auto" onClick={() => setMessage('')} aria-label="Close" /></div>}

        {page === 'dashboard' && <>
          <section className="hero-panel mb-4">
            <div>
              <div className="eyebrow"><span className="live-dot" /> YOUR FITNESS, ORGANIZED</div>
              <h1>Make every day <span>count.</span></h1>
              <p className="mb-0">Create challenges, track participation, and keep your community moving.</p>
            </div>
            <div className="hero-icon"><i className="bi bi-trophy" /></div>
          </section>
          <section className="row g-3 mb-4" aria-label="Challenge statistics">
            <div className="col-12 col-sm-4"><div className="stat-card"><div className="stat-icon purple"><i className="bi bi-flag" /></div><div><div className="stat-label">Total challenges</div><div className="stat-value">{items.length}</div></div></div></div>
            <div className="col-12 col-sm-4"><div className="stat-card"><div className="stat-icon green"><i className="bi bi-lightning-charge" /></div><div><div className="stat-label">Active challenges</div><div className="stat-value">{activeCount}</div></div></div></div>
            <div className="col-12 col-sm-4"><div className="stat-card"><div className="stat-icon orange"><i className="bi bi-people" /></div><div><div className="stat-label">Total participants</div><div className="stat-value">{totalParticipants}</div></div></div></div>
          </section>
          <section className="dashboard-welcome content-card">
            <span className="heading-icon"><i className="bi bi-activity" /></span>
            <div><h2>Your fitness community, at a glance</h2><p>Manage challenges, grow participation, and celebrate progress from one place.</p></div>
            <button className="btn btn-primary submit-btn" type="button" onClick={() => navigateTo('challenges')}>View challenges <i className="bi bi-arrow-right ms-2" /></button>
          </section>
        </>}

        {page === 'add' && <section className="page-content">
          <header className="page-heading">
            <div className="section-kicker">CHALLENGE MANAGEMENT</div>
            <h1>{editingId === null ? 'Add a challenge' : 'Edit challenge'}</h1>
            <p>Create a new fitness goal or update the details of an existing challenge.</p>
          </header>
          <div className="row justify-content-center"><div className="col-12 col-lg-8 col-xl-7">{challengeForm}</div></div>
        </section>}

        {(page === 'challenges' || page === 'search') && <section className="page-content">
          <header className="page-heading">
            <div className="section-kicker">{page === 'search' ? 'FIND A CHALLENGE' : 'YOUR PROGRAMS'}</div>
            <h1>{page === 'search' ? 'Search challenges' : 'View challenges'}</h1>
            <p>{page === 'search' ? 'Search by name or ID, or narrow results by challenge details.' : 'Browse, update, and manage all your fitness challenges.'}</p>
          </header>
          <div className="content-card list-card">
            <div className="card-heading list-heading">
              <div><div className="section-kicker">{page === 'search' ? 'SEARCH RESULTS' : 'CHALLENGE LIST'}</div><h2>Fitness challenges</h2><p className="text-secondary small mb-0">Showing {visibleItems.length} of {items.length} challenges.</p></div>
              <button className="btn btn-outline-secondary refresh-btn" type="button" onClick={loadItems} disabled={loading}><i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`} /> Refresh</button>
            </div>

            {page === 'search' && <>
              <form className="filter-panel mb-3" onSubmit={applyFilters}>
                <div className="filter-panel-title"><i className="bi bi-funnel" /> Search and filter challenges</div>
                <div className="filter-grid">
                  <div className="search-box filter-search"><i className="bi bi-search" /><input ref={searchRef} className="form-control" placeholder="Search challenge name..." aria-label="Search challenge name" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <select className="form-select filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status">
                    <option value="all">All statuses</option><option value="active">Active only</option><option value="inactive">Inactive only</option>
                  </select>
                  <input className="form-control" type="number" min="1" step="1" placeholder="Duration (days)" aria-label="Filter by duration in days" value={durationFilter} onChange={e => setDurationFilter(e.target.value)} />
                  <input className="form-control" type="number" min="0" step="1" placeholder="Participants" aria-label="Filter by participant count" value={participantFilter} onChange={e => setParticipantFilter(e.target.value)} />
                </div>
                <div className="filter-actions">
                  <button className="btn btn-primary btn-sm" type="submit" disabled={loading}><i className="bi bi-search me-1" /> Apply filters</button>
                  <button className="btn btn-light btn-sm" type="button" onClick={clearFilters}>Clear</button>
                </div>
              </form>
              <form className="lookup-row mb-3" onSubmit={findById}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-hash" /></span>
                  <input className="form-control" type="number" min="1" step="1" placeholder="Find a challenge by ID..." aria-label="Find challenge by ID" value={lookupId} onChange={e => setLookupId(e.target.value)} />
                  <button className="btn btn-dark" type="submit" disabled={loading}>Find ID</button>
                </div>
              </form>
            </>}

            {challengeTable}
            <div className="table-footer">
              <span>Showing <strong>{visibleItems.length}</strong> of <strong>{items.length}</strong> challenges</span>
              {page === 'challenges' && <button className="btn btn-sm btn-outline-danger" type="button" onClick={deleteAll} disabled={items.length === 0 || deleting}><i className="bi bi-trash3 me-1" /> Delete all</button>}
            </div>
          </div>
        </section>}

        <footer className="app-footer"><span>FitTrack Challenge Manager</span><span>Built with React · Vite · Bootstrap 5</span></footer>
      </main>
    </div>
  )
}

export default App
