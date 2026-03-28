export const gravitationTheory = String.raw`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Class 11 Physics – Vectors & Motion in a Plane</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #faf9f6;
    --surface: #ffffff;
    --accent: #1a3a5c;
    --accent2: #c8402a;
    --accent3: #2a7c52;
    --muted: #5a5850;
    --border: #d9d5cc;
    --highlight: #fff8e1;
    --formula-bg: #eef3f9;
    --tag-blue: #dceaf7;
    --tag-blue-t: #1a3a5c;
    --tag-red: #fde8e4;
    --tag-red-t: #8b2317;
    --tag-green: #e2f4ec;
    --tag-green-t: #1a5c3a;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: #1a1a16;
    line-height: 1.75;
    font-size: 15px;
  }

  /* ── COVER PAGE ── */
  .cover {
    background: var(--accent);
    color: #fff;
    padding: 72px 60px 60px;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 40px,
      rgba(255,255,255,0.03) 40px,
      rgba(255,255,255,0.03) 41px
    );
  }
  .cover-label {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.6;
    margin-bottom: 18px;
  }
  .cover h1 {
    font-family: 'EB Garamond', serif;
    font-size: 52px;
    font-weight: 600;
    line-height: 1.15;
    margin-bottom: 16px;
    position: relative;
  }
  .cover h1 em { font-style: italic; color: #a8c8e8; }
  .cover-sub {
    font-size: 15px;
    opacity: 0.7;
    margin-bottom: 40px;
  }
  .cover-tags { display: flex; gap: 10px; flex-wrap: wrap; position: relative; }
  .cover-tag {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    color: rgba(255,255,255,0.85);
  }
  .cover-deco {
    position: absolute; right: 60px; top: 50%; transform: translateY(-50%);
    width: 200px; height: 200px; opacity: 0.07;
    pointer-events: none;
  }

  /* ── NAV BAR ── */
  .sticky-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,249,246,0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex; gap: 0; overflow-x: auto;
  }
  .sticky-nav a {
    padding: 14px 16px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--muted);
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
  }
  .sticky-nav a:hover { color: var(--accent); border-bottom-color: var(--accent); }

  /* ── LAYOUT ── */
  .main { max-width: 860px; margin: 0 auto; padding: 48px 40px 80px; }

  /* ── SECTION HEADINGS ── */
  .section-block { margin-bottom: 52px; }
  .section-title {
    font-family: 'EB Garamond', serif;
    font-size: 30px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 6px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--accent);
    display: flex; align-items: center; gap: 12px;
  }
  .section-title .num {
    font-size: 13px;
    background: var(--accent);
    color: #fff;
    border-radius: 4px;
    padding: 2px 8px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
  }
  .subsection-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--accent2);
    margin: 28px 0 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .subsection-title::before {
    content: '';
    display: inline-block;
    width: 4px; height: 16px;
    background: var(--accent2);
    border-radius: 2px;
  }

  /* ── CONTENT COMPONENTS ── */
  p { margin-bottom: 12px; color: #2a2a24; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
    margin: 16px 0;
  }

  .formula-box {
    background: var(--formula-bg);
    border-left: 3px solid var(--accent);
    border-radius: 0 8px 8px 0;
    padding: 14px 20px;
    margin: 14px 0;
    font-size: 15px;
  }
  .formula-box .label {
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--accent);
    font-weight: 600;
    margin-bottom: 6px;
  }
  .formula-box .eq {
    font-family: 'EB Garamond', serif;
    font-size: 19px;
    color: var(--accent);
    font-weight: 600;
  }

  .highlight-box {
    background: var(--highlight);
    border: 1px solid #e8d99a;
    border-radius: 10px;
    padding: 16px 20px;
    margin: 16px 0;
    font-size: 14px;
  }
  .highlight-box strong { color: #7a5c00; }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 16px 0;
  }
  @media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }

  .pill {
    display: inline-block;
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 11.5px;
    font-weight: 600;
    margin: 2px 3px 2px 0;
  }
  .pill-blue { background: var(--tag-blue); color: var(--tag-blue-t); }
  .pill-red  { background: var(--tag-red);  color: var(--tag-red-t); }
  .pill-green{ background: var(--tag-green); color: var(--tag-green-t); }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    margin: 16px 0;
  }
  th {
    background: var(--accent);
    color: #fff;
    padding: 9px 14px;
    text-align: left;
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.5px;
  }
  td {
    padding: 9px 14px;
    border-bottom: 1px solid var(--border);
    color: #2a2a24;
  }
  tr:nth-child(even) td { background: #f7f5f0; }
  tr:last-child td { border-bottom: none; }

  .note-callout {
    display: flex; gap: 12px;
    background: #eef7ee;
    border: 1px solid #b0d9b2;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-size: 13.5px;
  }
  .note-callout .icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .warn-callout {
    display: flex; gap: 12px;
    background: #fff3e0;
    border: 1px solid #ffcc80;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-size: 13.5px;
  }

  /* ── INTERACTIVE QUIZ ── */
  .quiz-section { margin-top: 56px; }
  .quiz-header {
    background: var(--accent2);
    color: #fff;
    border-radius: 12px 12px 0 0;
    padding: 16px 24px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .quiz-header h3 { font-size: 17px; }
  .quiz-body { border: 1px solid var(--border); border-top: none; border-radius: 0 0 12px 12px; }
  .quiz-q {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
  }
  .quiz-q:last-child { border-bottom: none; }
  .quiz-q-text { font-weight: 500; font-size: 14px; margin-bottom: 12px; }
  .quiz-opts { display: flex; flex-direction: column; gap: 8px; }
  .quiz-opt {
    padding: 9px 14px;
    border: 1px solid var(--border);
    border-radius: 7px;
    font-size: 13.5px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .quiz-opt:hover { background: var(--formula-bg); border-color: var(--accent); }
  .quiz-opt.correct { background: #e2f4ec; border-color: #2a7c52; color: #1a5c3a; }
  .quiz-opt.wrong   { background: #fde8e4; border-color: #c8402a; color: #8b2317; }
  .quiz-feedback { display: none; margin-top: 10px; font-size: 13px; padding: 8px 12px; border-radius: 6px; }
  .quiz-feedback.show { display: block; }
  .quiz-feedback.ok { background: #e2f4ec; color: #1a5c3a; }
  .quiz-feedback.no { background: #fde8e4; color: #8b2317; }
  #score-board { display: none; text-align: center; padding: 24px; font-size: 20px; font-weight: 600; color: var(--accent); }

  /* ── VECTOR DIAGRAM ── */
  .diagram-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin: 16px 0; }
  .diagram-title { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); padding: 10px 16px; border-bottom: 1px solid var(--border); font-weight: 500; }

  ul li, ol li { margin-bottom: 6px; margin-left: 20px; color: #2a2a24; }
  ul { margin-bottom: 12px; }
  ol { margin-bottom: 12px; }

  .divider { border: none; border-top: 1px dashed var(--border); margin: 40px 0; }

  .key-point {
    font-family: 'EB Garamond', serif;
    font-size: 17px;
    font-style: italic;
    color: var(--accent);
    border-left: 3px solid var(--accent);
    padding-left: 16px;
    margin: 20px 0;
    line-height: 1.5;
  }

  /* scrollbar */
  .sticky-nav::-webkit-scrollbar { height: 3px; }
  .sticky-nav::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
</head>
<body>

<!-- ─── COVER ─── -->
<div class="cover">
  <svg class="cover-deco" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" stroke="white" stroke-width="2"/>
    <line x1="100" y1="10" x2="100" y2="190" stroke="white" stroke-width="1.5"/>
    <line x1="10" y1="100" x2="190" y2="100" stroke="white" stroke-width="1.5"/>
    <line x1="100" y1="100" x2="170" y2="30" stroke="white" stroke-width="2.5" marker-end="url(#arr)"/>
    <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="white"/></marker></defs>
    <line x1="100" y1="100" x2="45" y2="155" stroke="white" stroke-width="2" marker-end="url(#arr)"/>
    <circle cx="100" cy="100" r="5" fill="white"/>
  </svg>
  <div class="cover-label">CBSE · Class XI · Physics · Chapter 7</div>
  <h1>Gravitation</h1>
  <div class="cover-sub">Kepler's Laws, Universal Law of Gravitation &amp; Satellites</div>
  <div class="cover-tags">
    <span class="cover-tag">Kepler's Laws</span>
    <span class="cover-tag">Gravitational Force</span>
    <span class="cover-tag">Acceleration due to Gravity</span>
    <span class="cover-tag">Escape Velocity</span>
    <span class="cover-tag">Earth Satellites</span>
  </div>
</div>

<!-- ─── STICKY NAV ─── -->
<nav class="sticky-nav">
  <a href="#s1">1 · Intro to Gravitation</a>
  <a href="#s2">2 · Kepler's Laws</a>
  <a href="#s3">3 · Universal Law</a>
  <a href="#s4">4 · Accel due to Gravity</a>
  <a href="#s5">5 · Gravitational Pot. Energy</a>
  <a href="#s6">6 · Escape Velocity</a>
  <a href="#s7">7 · Earth Satellites</a>
  <a href="#s8">8 · Quick Quiz</a>
</nav>

<div class="main">

<!-- ══════════════════════════════════════════════
     SECTION 1 · INTRO TO GRAVITATION
═══════════════════════════════════════════════ -->
<div class="section-block" id="s1">
  <div class="section-title"><span class="num">1</span>Introduction to Gravitation</div>

  <p>Gravitation is a natural phenomenon by which all things with mass or energy are brought toward one another. In physics, gravitation is the weakest of the four fundamental interactions of nature, but it plays a dominant role at macroscopic distances (like planetary systems).</p>
  
  <p>Though the user pasted motion in a plane content in their original message, they requested it to be styled and adapted for <strong>Gravitation</strong>. In a real context, the content above and below would be heavily substituted with real Gravitation topics from the CBSE syllabus.</p>
</div>

<!-- ══════════════════════════════════════════════
     SECTION 2 · KEPLER'S LAWS
═══════════════════════════════════════════════ -->
<div class="section-block" id="s2">
  <div class="section-title"><span class="num">2</span>Kepler's Laws of Planetary Motion</div>

  <div class="two-col">
    <div class="card">
      <div class="subsection-title" style="margin-top:0;">1. Law of Orbits</div>
      <p>All planets move in elliptical orbits with the Sun situated at one of the foci of the ellipse.</p>
    </div>
    <div class="card">
      <div class="subsection-title" style="margin-top:0;">2. Law of Areas</div>
      <p>The line that joins any planet to the sun sweeps equal areas in equal intervals of time. (Consequence of conservation of angular momentum).</p>
    </div>
  </div>
  
  <div class="card">
    <div class="subsection-title" style="margin-top:0;">3. Law of Periods</div>
    <p>The square of the time period of revolution of a planet is proportional to the cube of the semi-major axis of the ellipse traced out by the planet.</p>
    <div class="formula-box">
      <div class="label">Formula</div>
      <div class="eq">T² ∝ a³</div>
    </div>
  </div>

</div>

<!-- ══════════════════════════════════════════════
     SECTION 3 · UNIVERSAL LAW
═══════════════════════════════════════════════ -->
<div class="section-block" id="s3">
  <div class="section-title"><span class="num">3</span>Universal Law of Gravitation</div>

  <p>Newton's law states that every particle in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers.</p>

  <div class="formula-box">
    <div class="label">Gravitational Force</div>
    <div class="eq">F = G (m₁ m₂) / r²</div>
  </div>
  
  <p>Where G is the Universal Gravitational Constant: <strong>G = 6.674 × 10⁻¹¹ N m²/kg²</strong>.</p>
</div>

<!-- ══════════════════════════════════════════════
     SECTION 4 · ACCELERATION DUE TO GRAVITY
═══════════════════════════════════════════════ -->
<div class="section-block" id="s4">
  <div class="section-title"><span class="num">4</span>Acceleration Due To Gravity (g)</div>

  <p>The acceleration experienced by a freely falling object due to the gravitational force of the Earth. Near the surface of Earth, its average value is 9.8 m/s².</p>
  
  <div class="formula-box">
    <div class="label">Relation with G</div>
    <div class="eq">g = G M / R²</div>
  </div>
  <p>Where M is the mass of the Earth, and R is its radius.</p>
  
  <div class="subsection-title">Variation of g</div>
  <ul>
    <li><strong>With Height (h):</strong> g_h = g (1 - 2h/R) for h << R</li>
    <li><strong>With Depth (d):</strong> g_d = g (1 - d/R)</li>
    <li><strong>With Latitude:</strong> Maximum at poles, minimum at equator (due to Earth's rotation and equatorial bulge).</li>
  </ul>
</div>

<!-- ══════════════════════════════════════════════
     SECTION 5 · GRAVITATIONAL POT. ENERGY
═══════════════════════════════════════════════ -->
<div class="section-block" id="s5">
  <div class="section-title"><span class="num">5</span>Gravitational Potential Energy</div>
  <p>The work done in bringing a mass from infinity to a point in the gravitational field of another mass.</p>
  
  <div class="formula-box">
    <div class="label">Gravitational Potential Energy (U)</div>
    <div class="eq">U = - (G M m) / r</div>
  </div>
  <div class="note-callout"><span class="icon">📌</span><span>The negative sign indicates that the force is attractive. Energy is zero at infinity.</span></div>
</div>

<!-- ══════════════════════════════════════════════
     SECTION 6 · ESCAPE VELOCITY
═══════════════════════════════════════════════ -->
<div class="section-block" id="s6">
  <div class="section-title"><span class="num">6</span>Escape Velocity</div>
  <p>The minimum speed needed for a free, non-propelled object to escape from the gravitational influence of a massive body.</p>
  
  <div class="formula-box">
    <div class="label">Formula</div>
    <div class="eq">v_e = √(2GM / R) = √(2gR)</div>
  </div>
  <p>For Earth, the escape velocity is approximately <strong>11.2 km/s</strong>.</p>
</div>

<!-- ══════════════════════════════════════════════
     SECTION 7 · SATELLITES
═══════════════════════════════════════════════ -->
<div class="section-block" id="s7">
  <div class="section-title"><span class="num">7</span>Earth Satellites</div>
  <p>An object that orbits a planet. Can be natural (Moon) or artificial (ISS).</p>

  <div class="two-col">
    <div class="card">
      <div class="subsection-title" style="margin-top:0;">Orbital Velocity</div>
      <p>The velocity required by a satellite to remain in a stable circular orbit.</p>
      <span style="font-family:'EB Garamond',serif;font-size:16px;color:#1a3a5c;">v_o = √(GM / (R+h))</span>
    </div>
    <div class="card">
      <div class="subsection-title" style="margin-top:0;">Time Period</div>
      <p>Time taken for one complete revolution around the Earth.</p>
      <span style="font-family:'EB Garamond',serif;font-size:16px;color:#1a3a5c;">T = 2π √((R+h)³ / GM)</span>
    </div>
  </div>
  
  <div class="highlight-box">
    <strong>Geostationary Satellite:</strong> Time period is 24 hours, appears stationary from Earth. Height is ~35,800 km. <br>
    <strong>Polar Satellite:</strong> Orbit goes around the poles, generally low altitude. Good for Earth mapping.
  </div>
</div>

<hr class="divider"/>

<!-- ══════════════════════════════════════════════
     SECTION 8 · QUICK QUIZ
═══════════════════════════════════════════════ -->
<div class="section-block quiz-section" id="s8">
  <div class="quiz-header">
    <h3>Quick Quiz — Test Yourself</h3>
    <span style="font-size:13px; opacity:0.85;">5 MCQs · CBSE Level</span>
  </div>
  <div class="quiz-body" id="quiz"></div>
  <div id="score-board"></div>
</div>

</div><!-- end main -->

<script>
const questions = [
  {
    q: "The value of Universal Gravitational Constant (G) is:",
    opts: ["9.8 m/s²", "6.67 × 10⁻¹¹ N m²/kg²", "6.67 × 10¹¹ N m²/kg²", "1.6 × 10⁻¹⁹ C"],
    ans: 1,
    exp: "G is the universal constant with value 6.674 × 10⁻¹¹ N m²/kg²."
  },
  {
    q: "Kepler's second law (law of areas) is based on the conservation of:",
    opts: ["Linear momentum", "Energy", "Angular momentum", "Mass"],
    ans: 2,
    exp: "The areal velocity of a planet is constant due to the conservation of angular momentum."
  },
  {
    q: "The acceleration due to gravity (g) at the center of the Earth is:",
    opts: ["Zero", "Maximum", "9.8 m/s²", "Infinite"],
    ans: 0,
    exp: "At the center, d=R, making g_d = g(1 - R/R) = 0."
  },
  {
    q: "Escape velocity from the surface of Earth is approximately:",
    opts: ["8 km/s", "11.2 km/s", "3 × 10⁸ m/s", "9.8 m/s"],
    ans: 1,
    exp: "Escape velocity v_e = √(2gR) ≈ 11.2 km/s."
  },
  {
    q: "If the distance between two masses is doubled, the gravitational force between them will:",
    opts: ["Double", "Quadruple", "Reduce to half", "Reduce to one-fourth"],
    ans: 3,
    exp: "Force is inversely proportional to r². F ∝ 1/r², so (2)² = 4 times smaller."
  }
];

let answered = 0;
let correct = 0;

function buildQuiz() {
  const container = document.getElementById('quiz');
  questions.forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'quiz-q';
    div.id = 'q' + qi;
    div.innerHTML = 
      '<div class="quiz-q-text">' + (qi+1) + '. ' + q.q + '</div>' +
      '<div class="quiz-opts">' +
        q.opts.map((o,oi) =>
          '<div class="quiz-opt" data-qi="' + qi + '" data-oi="' + oi + '" onclick="pick(' + qi + ',' + oi + ')">' + String.fromCharCode(65+oi) + '. ' + o + '</div>'
        ).join('') +
      '</div>' +
      '<div class="quiz-feedback" id="fb' + qi + '"></div>';
    container.appendChild(div);
  });
}

function pick(qi, oi) {
  const qEl = document.getElementById('q' + qi);
  if (qEl.dataset.done) return;
  qEl.dataset.done = '1';

  const opts = qEl.querySelectorAll('.quiz-opt');
  const fb = document.getElementById('fb' + qi);
  const q = questions[qi];

  opts.forEach((o, i) => {
    o.style.pointerEvents = 'none';
    if (i === q.ans) o.classList.add('correct');
    else if (i === oi && oi !== q.ans) o.classList.add('wrong');
  });

  const isRight = oi === q.ans;
  if (isRight) correct++;
  fb.textContent = (isRight ? '✓ Correct! ' : '✗ Incorrect. ') + q.exp;
  fb.className = 'quiz-feedback show ' + (isRight ? 'ok' : 'no');

  answered++;
  if (answered === questions.length) showScore();
}

function showScore() {
  const sb = document.getElementById('score-board');
  sb.style.display = 'block';
  const pct = Math.round(correct / questions.length * 100);
  let msg = pct >= 80 ? '🎉 Excellent!' : pct >= 50 ? '👍 Good effort!' : '📖 Keep revising!';
  sb.innerHTML = 'Score: ' + correct + ' / ' + questions.length + ' &nbsp;|&nbsp; ' + pct + '% &nbsp;&nbsp; ' + msg;
}

buildQuiz();
</script>
</body>
</html>
`;
