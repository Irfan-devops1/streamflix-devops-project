import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [titles, setTitles] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/titles")
      .then(r => { if (!r.ok) throw new Error("API unavailable"); return r.json(); })
      .then(setTitles).catch(() => setError("Could not load catalog. Check that the API service is running."));
  }, []);

  const genres = useMemo(() => ["All", ...new Set(titles.map(t => t.genre))], [titles]);
  const filtered = titles.filter(t =>
    (genre === "All" || t.genre === genre) &&
    (t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
  );

  return <div className="app">
    <header className="nav">
      <a className="brand" href="#">STREAMFLIX</a>
      <nav><a href="#home">Home</a><a href="#catalog">Series & Movies</a><a href="#catalog">My List</a></nav>
      <input aria-label="Search titles" className="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search titles..." />
    </header>
    <main id="home">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">STREAMFLIX ORIGINAL</p>
          <h1>Stories worth<br/>staying in for.</h1>
          <p className="hero-copy">Discover your next adventure. Explore a hand-picked collection of fictional movies and series.</p>
          <a className="primary-btn" href="#catalog">Explore titles</a>
        </div>
      </section>
      <section id="catalog" className="catalog">
        <div className="section-heading"><div><p className="eyebrow">YOUR NEXT WATCH</p><h2>Popular on StreamFlix</h2></div>
          <select aria-label="Filter by genre" value={genre} onChange={e => setGenre(e.target.value)}>{genres.map(g => <option key={g}>{g}</option>)}</select>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="grid">{filtered.map(t => <button className="poster-card" key={t.id} onClick={() => setSelected(t)}>
          <img src={t.poster} alt="" loading="lazy"/><span className="card-overlay"><strong>{t.title}</strong><small>{t.year} · {t.genre} · {t.rating}</small></span>
        </button>)}</div>
        {!error && filtered.length === 0 && <p>No titles match your search.</p>}
      </section>
    </main>
    <footer>© 2026 StreamFlix Demo · Portfolio learning project · No licensed video content included</footer>
    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={selected.title} onClick={e => e.stopPropagation()}>
        <button className="close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
        <img src={selected.poster} alt=""/>
        <div className="modal-copy"><p className="eyebrow">{selected.genre} · {selected.year} · {selected.rating}</p><h2>{selected.title}</h2><p>{selected.description}</p><button className="primary-btn" onClick={() => setSelected(null)}>Back to browsing</button></div>
      </section>
    </div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);
