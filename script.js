const languageData = [
  { name:"isiZulu", code:"zu", speakers:"11.5M", status:"Active", color:"#22c55e", url:"https://zu.wikipedia.org" },
  { name:"isiXhosa", code:"xh", speakers:"8.1M", status:"Growing", color:"#f59e0b", url:"https://xh.wikipedia.org" },
  { name:"Afrikaans", code:"af", speakers:"6.8M", status:"Popular", color:"#38bdf8", url:"https://af.wikipedia.org" },
  { name:"Sesotho", code:"st", speakers:"3.8M", status:"Active", color:"#ef4444", url:"https://st.wikipedia.org" },
  { name:"Setswana", code:"tn", speakers:"4M", status:"Growing", color:"#14b8a6", url:"https://tn.wikipedia.org" },
  { name:"Xitsonga", code:"ts", speakers:"2.2M", status:"Emerging", color:"#f97316", url:"https://ts.wikipedia.org" },
  { name:"siSwathi", code:"ss", speakers:"1.3M", status:"Emerging", color:"#f97316", url:"https://ts.wikipedia.org" },
  { name:"Tshivenda", code:"ve", speakers:"1.2M", status:"Emerging", color:"#f97316", url:"https://ve.wikipedia.org"},
  { name:"Sesotho sa Leboa", code:"nso", speakers:"4.6M", status:"Emerging", color:"#f97316", url:"https://nso.wikipedia.org"},
  { name:"isiNdebele", code:"nr", speakers:"1M", status:"Emerging", color:"#f97316", url:"https://ve.wikipedia.org"}
];

const container = document.getElementById("languages");
const searchInput = document.getElementById("searchInput");

/* FETCH LIVE WIKIPEDIA STATS */
async function fetchStats(code) {
  try {
    const res = await fetch(
      `https://${code}.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=statistics&format=json&origin=*`
    );

    const data = await res.json();
    const s = data.query.statistics;

    return {
      articles: Number(s.articles) || 0,
      pages: s.pages,
      edits: s.edits
    };

  } catch {
    return { articles: 0, pages: "N/A", edits: "N/A" };
  }
}

/* LOAD + SORT + RANK */
async function render(data) {

  container.innerHTML = `<div style="opacity:0.6">Loading live leaderboard...</div>`;

  const enriched = await Promise.all(
    data.map(async lang => {
      const stats = await fetchStats(lang.code);
      return { ...lang, stats };
    })
  );

  /* 🔥 AUTO-RANK (HIGHEST ARTICLES FIRST) */
  enriched.sort((a, b) => b.stats.articles - a.stats.articles);

  container.innerHTML = "";

  enriched.forEach((lang, index) => {

    const rankEmoji =
      index === 0 ? "🥇" :
      index === 1 ? "🥈" :
      index === 2 ? "🥉" : `#${index + 1}`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      
      <div class="rank">${rankEmoji}</div>

      <div class="top">
        <div>
          <div class="language">${lang.name}</div>
          <div class="code">${lang.code.toUpperCase()}</div>
        </div>

        <div class="badge" style="background:${lang.color}">
          ${lang.status}
        </div>
      </div>

      <div class="metrics">
        <div class="metric">
          <h4>Articles</h4>
          <span>${lang.stats.articles.toLocaleString()}</span>
        </div>

        <div class="metric">
          <h4>L1 Speakers</h4>
          <span>${lang.speakers}</span>
        </div>
      </div>

      <div class="metrics">
        <div class="metric">
          <h4>Pages</h4>
          <span>${lang.stats.pages}</span>
        </div>

        <div class="metric">
          <h4>Edits</h4>
          <span>${lang.stats.edits}</span>
        </div>
      </div>

      <button class="btn" onclick="window.open('${lang.url}','_blank')">
        Open Wikipedia
      </button>
    `;

    container.appendChild(card);
  });
}

/* SEARCH FILTER (keeps ranking live) */
searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();

  const filtered = languageData.filter(lang =>
    lang.name.toLowerCase().includes(value) ||
    lang.code.toLowerCase().includes(value)
  );

  render(filtered);
});

/* INIT */
render(languageData);
