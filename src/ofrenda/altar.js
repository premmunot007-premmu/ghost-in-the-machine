/**
 * Digital Ofrenda Engine (Día de los Muertos Altar)
 * Interactive 3-tiered altar with flickering candles, cempasúchil petals,
 * traditional offerings, and local Open-Source AI remembrance composition.
 */

import { aiEngine } from '../ai/engine.js';
import { soundscape } from '../audio/soundscape.js';

export class DigitalOfrenda {
  constructor(containerEl, onNavigateMode = () => {}) {
    this.container = containerEl;
    this.onNavigateMode = onNavigateMode;
    this.petalsCanvas = null;
    this.petalsAnimId = null;
    this.petals = [];
    this.candlesLit = true;

    // Default tributes honoring computing pioneers + custom saved ones
    this.remembrances = this.loadRemembrances();

    this.render();
    this.initCanvas();
    this.attachEvents();
  }

  loadRemembrances() {
    const saved = localStorage.getItem('necro_ofrenda_remembrances');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }

    return [
      {
        id: 'ada',
        name: 'Ada Lovelace',
        role: 'Countess of Lovelace (1815–1852)',
        avatar: '👑',
        food: 'Earl Grey tea and lavender biscuits',
        song: 'Beethoven Piano Sonata No. 14',
        memory: 'Foreseeing that computing would leap beyond mere arithmetic to compose sublime poetry and weave mathematics.',
        calaverita: `En el telar de los espíritus la condesa teje flor,\nAda Lovelace calcula el infinito con fervor.\nNi la muerte detiene su algoritmo sin par,\n¡hoy en la ofrenda viene a programar! 🌼`,
      },
      {
        id: 'alan',
        name: 'Alan Turing',
        role: 'Father of Computer Science (1912–1954)',
        avatar: '🧩',
        food: 'English apples and roasted chestnuts',
        song: 'Snow White & the Seven Dwarfs Lullaby',
        memory: 'Cracking Enigma, envisioning universal computation, and asking whether machine minds could possess spirit.',
        calaverita: `La calaca llegó a Bletchley con enigma y compás,\nTuring descifró la muerte y le pidió un poco de paz.\nCon cintas de papel y lógica sin fin,\nhoy brinda en el altar con dulce tintineo de violín. 🕯️`,
      },
      {
        id: 'grace',
        name: 'Grace Hopper',
        role: 'Rear Admiral & Compiler Pioneer (1906–1992)',
        avatar: '⚓',
        food: 'Navy coffee with chicory and apple cobbler',
        song: 'Anchors Aweigh',
        memory: 'Teaching machines to understand plain human language so everyone could create software without gatekeepers.',
        calaverita: `Con su metro de alambre y nanosegundo en mano,\nGrace asustó a la Muerte con acento soberano.\n"¡No me lleves catrina, que falta compilar!",\ny entre risas y bugs se sentó a festejar. ✨`,
      },
      {
        id: 'dennis',
        name: 'Dennis Ritchie',
        role: 'Creator of C & Unix (1941–2011)',
        avatar: '⚡',
        food: 'Filter roast coffee and warm sourdough',
        song: 'Bach Goldberg Variations',
        memory: 'Gifting humanity the foundation of modern operating systems and programming languages with unmatched modesty.',
        calaverita: `main() { printf("Hasta la eternidad"); }\nDennis sonríe al ver a su Unix en la inmensidad.\nPunteros dorados guían su caminar,\nhoy el núcleo y la catrina juntos van a bailar. 🥖`,
      },
    ];
  }

  saveRemembrances() {
    localStorage.setItem('necro_ofrenda_remembrances', JSON.stringify(this.remembrances));
  }

  render() {
    this.container.innerHTML = `
      <div class="ofrenda-wrapper">
        <canvas id="ofrenda-petals-canvas" class="petals-canvas"></canvas>

        <header class="ofrenda-header">
          <div class="papel-picado-banner">
            <span class="flag pink">💀</span>
            <span class="flag orange">🌼</span>
            <span class="flag purple">🕯️</span>
            <span class="flag yellow">✨</span>
            <span class="flag teal">🥖</span>
            <span class="flag pink">💀</span>
            <span class="flag orange">🌼</span>
          </div>
          <h1 class="ofrenda-title">OFRENDA VIVA</h1>
          <p class="ofrenda-subtitle">
            An Open-Source AI Memorial for Día de los Muertos & Halloween<br>
            <em>"No one is truly dead until the last person who remembers them speaks their name."</em>
          </p>
          <div class="ofrenda-actions">
            <button class="btn btn-gold" id="btn-add-memorial">🌼 Place an Offering / Add Loved One</button>
            <button class="btn btn-ghost" id="btn-toggle-candles">🕯️ Toggle Candle Flames</button>
            <button class="btn btn-ghost" id="btn-return-shell">💻 Back to NecroTerminal</button>
          </div>
        </header>

        <!-- 3-TIER ALTAR STRUCTURE -->
        <main class="altar-structure" id="altar-main">
          
          <!-- TOP TIER: SPIRIT ARCH & CELESTIAL GUIDANCE -->
          <div class="altar-tier tier-top">
            <div class="tier-label">NIVEL 1: CIELO Y ALMAS (THE HEAVENS)</div>
            <div class="cempasuchil-arch">
              <span class="arch-flower">🌼</span>
              <span class="arch-flower">🌼</span>
              <span class="arch-flower">🌼</span>
              <span class="arch-flower">🌼</span>
              <span class="arch-flower">🌼</span>
            </div>
            <div class="candle-row">
              <div class="candle candle-tall lit" data-id="c1"><div class="flame"></div></div>
              <div class="candle candle-tall lit" data-id="c2"><div class="flame"></div></div>
            </div>
          </div>

          <!-- MIDDLE TIER: PORTRAITS & CHERISHED SOULS -->
          <div class="altar-tier tier-mid">
            <div class="tier-label">NIVEL 2: RECUERDOS (THE LIVING MEMORY)</div>
            <div class="cards-grid" id="remembrances-grid">
              ${this.renderCards()}
            </div>
          </div>

          <!-- BOTTOM TIER: EARTHLY OFFERINGS -->
          <div class="altar-tier tier-bottom">
            <div class="tier-label">NIVEL 3: TIERRA Y OFRENDAS (EARTHLY BANQUET)</div>
            <div class="offerings-row">
              <div class="offering-item" title="Pan de Muerto - Bread of the Dead">
                <span class="offering-icon">🥖</span>
                <span class="offering-name">Pan de Muerto</span>
              </div>
              <div class="offering-item" title="Calaveras de Azúcar - Sugar Skulls">
                <span class="offering-icon">💀</span>
                <span class="offering-name">Calaveras</span>
              </div>
              <div class="offering-item" title="Copal Incense - Smelling smoke guiding the wandering souls">
                <span class="offering-icon">🏺</span>
                <span class="offering-name">Copal Sagrado</span>
              </div>
              <div class="offering-item" title="Agua Pura - Quenches the soul's journey thirst">
                <span class="offering-icon">🍶</span>
                <span class="offering-name">Agua Pura</span>
              </div>
              <div class="offering-item" title="Flor de Cempasúchil - Marigolds pointing the way home">
                <span class="offering-icon">🌼</span>
                <span class="offering-name">Cempasúchil</span>
              </div>
              <div class="offering-item" title="Sal de Purificación - Prevents spiritual decay">
                <span class="offering-icon">🧂</span>
                <span class="offering-name">Sal Blanca</span>
              </div>
            </div>
            <div class="candle-row bottom-candles">
              <div class="candle lit" data-id="c3"><div class="flame"></div></div>
              <div class="candle lit" data-id="c4"><div class="flame"></div></div>
              <div class="candle lit" data-id="c5"><div class="flame"></div></div>
              <div class="candle lit" data-id="c6"><div class="flame"></div></div>
            </div>
          </div>
        </main>

        <!-- ADD MEMORIAL MODAL -->
        <div class="modal-overlay" id="memorial-modal" style="display: none;">
          <div class="modal-dialog">
            <div class="modal-header">
              <h2>🌼 Add a Soul to the Living Ofrenda</h2>
              <button class="modal-close" id="btn-modal-close">&times;</button>
            </div>
            <div class="modal-body">
              <p class="modal-note">
                🔒 <strong>100% Private & Local:</strong> Your loved one's name, memories, and photos stay entirely inside your browser. No corporate servers, no surveillance.
              </p>
              <div class="form-group">
                <label for="form-name">Name of Loved One / Ancestor *</label>
                <input type="text" id="form-name" placeholder="e.g. Abuelita Elena or Dennis Ritchie" required />
              </div>
              <div class="form-group">
                <label for="form-role">Relationship or Title</label>
                <input type="text" id="form-role" placeholder="e.g. Beloved Grandmother, Tech Mentor, Loyal Companion" />
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label for="form-food">Favorite Food or Treat</label>
                  <input type="text" id="form-food" placeholder="e.g. Homemade Tamales & Hot Chocolate" />
                </div>
                <div class="form-group half">
                  <label for="form-song">Favorite Song / Melody</label>
                  <input type="text" id="form-song" placeholder="e.g. Cielito Lindo or Bohemian Rhapsody" />
                </div>
              </div>
              <div class="form-group">
                <label for="form-memory">Cherished Memory or Story *</label>
                <textarea id="form-memory" rows="3" placeholder="Share a sweet memory, habit, or words they used to say..." required></textarea>
              </div>
              <div class="form-group">
                <label>Avatar / Symbolic Icon</label>
                <div class="avatar-picker" id="avatar-picker">
                  <span class="avatar-opt selected">🌼</span>
                  <span class="avatar-opt">🕯️</span>
                  <span class="avatar-opt">👑</span>
                  <span class="avatar-opt">👵</span>
                  <span class="avatar-opt">👴</span>
                  <span class="avatar-opt">🐾</span>
                  <span class="avatar-opt">⚓</span>
                  <span class="avatar-opt">✨</span>
                  <span class="avatar-opt">⚡</span>
                </div>
              </div>
              <div class="ai-compose-box">
                <button type="button" class="btn btn-gold" id="btn-generate-calaverita">
                  🔮 Compose Calaverita with Open-Source AI
                </button>
                <div id="ai-poem-status" class="ai-status"></div>
                <textarea id="form-calaverita" rows="4" placeholder="AI-generated remembrance poem will appear here (or write your own)..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" id="btn-cancel-modal">Cancel</button>
              <button class="btn btn-gold" id="btn-save-memorial">Light Candle & Place on Altar</button>
            </div>
          </div>
        </div>

      </div>
    `;

    this.petalsCanvas = this.container.querySelector('#ofrenda-petals-canvas');
  }

  renderCards() {
    return this.remembrances.map(r => `
      <div class="remembrance-card" data-id="${r.id}">
        <div class="card-photo-frame">
          <div class="photo-avatar">${r.avatar || '🌼'}</div>
          <div class="card-candle lit"><div class="flame"></div></div>
        </div>
        <div class="card-details">
          <h3 class="card-name">${this.escapeHtml(r.name)}</h3>
          <div class="card-role">${this.escapeHtml(r.role || '')}</div>
          
          <div class="card-offerings">
            ${r.food ? `<div class="card-item"><span class="item-label">🍲 Ofrenda:</span> ${this.escapeHtml(r.food)}</div>` : ''}
            ${r.song ? `<div class="card-item"><span class="item-label">🎵 Canción:</span> ${this.escapeHtml(r.song)}</div>` : ''}
          </div>

          <div class="card-memory">
            "${this.escapeHtml(r.memory)}"
          </div>

          ${r.calaverita ? `
            <div class="card-calaverita">
              <div class="calaverita-label">📜 Calaverita Literaria:</div>
              <pre class="calaverita-text">${this.escapeHtml(r.calaverita)}</pre>
            </div>
          ` : ''}

          <div class="card-actions">
            <button class="btn-sm btn-ghost btn-recite" data-id="${r.id}">✨ Recite Aloud</button>
            <button class="btn-sm btn-danger btn-remove" data-id="${r.id}">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  attachEvents() {
    // Navigation
    this.container.querySelector('#btn-return-shell')?.addEventListener('click', () => {
      this.destroyCanvas();
      this.onNavigateMode('terminal');
    });

    // Candles toggle
    this.container.querySelector('#btn-toggle-candles')?.addEventListener('click', () => {
      this.candlesLit = !this.candlesLit;
      soundscape.playCandleFlame();
      const candles = this.container.querySelectorAll('.candle, .card-candle');
      candles.forEach(c => {
        if (this.candlesLit) c.classList.add('lit');
        else c.classList.remove('lit');
      });
    });

    // Individual candle click
    this.container.querySelectorAll('.candle, .card-candle').forEach(c => {
      c.addEventListener('click', () => {
        c.classList.toggle('lit');
        soundscape.playCandleFlame();
      });
    });

    // Modal open/close
    const modal = this.container.querySelector('#memorial-modal');
    this.container.querySelector('#btn-add-memorial')?.addEventListener('click', () => {
      modal.style.display = 'flex';
      soundscape.playChime(440, 'sine', 0.5);
    });

    this.container.querySelector('#btn-modal-close')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    this.container.querySelector('#btn-cancel-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Avatar picker
    let selectedAvatar = '🌼';
    const avatarOpts = this.container.querySelectorAll('.avatar-opt');
    avatarOpts.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOpts.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedAvatar = opt.innerText;
      });
    });

    // AI Calaverita generation
    const btnGen = this.container.querySelector('#btn-generate-calaverita');
    const statusDiv = this.container.querySelector('#ai-poem-status');
    const poemTextarea = this.container.querySelector('#form-calaverita');

    btnGen?.addEventListener('click', async () => {
      const name = this.container.querySelector('#form-name').value.trim() || 'Nuestro Ser Querido';
      const role = this.container.querySelector('#form-role').value.trim() || 'Familiar';
      const food = this.container.querySelector('#form-food').value.trim() || 'Pan de Muerto y chocolate';
      const song = this.container.querySelector('#form-song').value.trim() || 'Música del corazón';
      const memory = this.container.querySelector('#form-memory').value.trim() || 'Su hermosa sonrisa y bondad.';

      statusDiv.innerHTML = `<span class="spinner">🔮</span> Channelling Día de los Muertos bard with open-source AI...`;
      soundscape.playChime(520, 'sine', 1.0);

      try {
        const calaverita = await aiEngine.generate({
          prompt: `Compose a heartfelt, poetic, humorous Día de los Muertos calaverita literaria for ${name} (${role}).`,
          persona: 'ofrenda_bard',
          context: { name, relationship: role, food, song, memory }
        });

        poemTextarea.value = calaverita;
        statusDiv.innerHTML = `<span class="gold-text">✨ Calaverita crafted locally by sovereign AI!</span>`;
        soundscape.playChime(660, 'sine', 1.2);
      } catch (err) {
        statusDiv.innerHTML = `<span class="error-text">Failed to channel poetry: ${err.message}</span>`;
      }
    });

    // Save memorial
    this.container.querySelector('#btn-save-memorial')?.addEventListener('click', () => {
      const name = this.container.querySelector('#form-name').value.trim();
      const memory = this.container.querySelector('#form-memory').value.trim();

      if (!name || !memory) {
        alert('Please provide at least a name and a cherished memory for the altar.');
        return;
      }

      const newMemorial = {
        id: 'mem_' + Date.now(),
        name,
        role: this.container.querySelector('#form-role').value.trim(),
        food: this.container.querySelector('#form-food').value.trim(),
        song: this.container.querySelector('#form-song').value.trim(),
        memory,
        avatar: selectedAvatar,
        calaverita: poemTextarea.value.trim(),
      };

      this.remembrances.unshift(newMemorial);
      this.saveRemembrances();
      soundscape.playCandleFlame();
      soundscape.playChime(700, 'triangle', 2.0);

      // Re-render grid
      this.container.querySelector('#remembrances-grid').innerHTML = this.renderCards();
      modal.style.display = 'none';

      // Reattach dynamic card listeners
      this.attachCardActions();
    });

    this.attachCardActions();
  }

  attachCardActions() {
    // Remove memorial
    this.container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Remove this memorial offering from the altar?')) {
          this.remembrances = this.remembrances.filter(r => r.id !== id);
          this.saveRemembrances();
          this.container.querySelector('#remembrances-grid').innerHTML = this.renderCards();
          this.attachCardActions();
        }
      });
    });

    // Recite aloud (Web Speech API)
    this.container.querySelectorAll('.btn-recite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const item = this.remembrances.find(r => r.id === id);
        if (!item) return;

        soundscape.playChime(440, 'sine', 1.0);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(
            `In eternal loving memory of ${item.name}, ${item.role}. ${item.memory}. ${item.calaverita || ''}`
          );
          utterance.rate = 0.9;
          utterance.pitch = 0.95;
          window.speechSynthesis.speak(utterance);
        } else {
          alert(`In loving memory of ${item.name}:\n${item.memory}`);
        }
      });
    });
  }

  // --- Falling Cempasúchil Petals Particle Engine ---
  initCanvas() {
    if (!this.petalsCanvas) return;
    const canvas = this.petalsCanvas;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const petalColors = ['#ff9e00', '#ffaa00', '#ff7b00', '#ff5400', '#ffd000'];
    const petalCount = 45;

    this.petals = [];
    for (let i = 0; i < petalCount; i++) {
      this.petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 5 + Math.random() * 8,
        speedY: 0.6 + Math.random() * 1.4,
        speedX: (Math.random() - 0.5) * 0.8,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.04,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        opacity: 0.4 + Math.random() * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of this.petals) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Draw petal shape (oval with tapered ends)
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Update positions
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.5 + p.speedX;
        p.angle += p.angleSpeed;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;
      }

      this.petalsAnimId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroyCanvas() {
    if (this.petalsAnimId) {
      cancelAnimationFrame(this.petalsAnimId);
      this.petalsAnimId = null;
    }
  }

  escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
