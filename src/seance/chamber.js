/**
 * Séance Chamber Engine
 * Channels departed computing pioneers and ancient programming languages
 * via local Open-Source AI.
 */

import { aiEngine, SPIRIT_PERSONAS } from '../ai/engine.js';
import { soundscape } from '../audio/soundscape.js';

export class SeanceChamber {
  constructor(containerEl, onNavigateMode = () => {}) {
    this.container = containerEl;
    this.onNavigateMode = onNavigateMode;
    this.currentSpirit = SPIRIT_PERSONAS.ADA_LOVELACE;
    this.messages = [];
    this.isSummoning = false;

    this.render();
    this.attachEvents();
    this.sendInitialGreeting();
  }

  render() {
    const spirits = Object.values(SPIRIT_PERSONAS).filter(
      s => s.id !== 'haunted_shell' && s.id !== 'ofrenda_bard'
    );

    this.container.innerHTML = `
      <div class="seance-wrapper">
        <header class="seance-header">
          <div class="seance-banner-badge">🕯️ THE OFFLINE SÉANCE CIRCLE</div>
          <h1 class="seance-title">Channeling the Ancestors of Silicon</h1>
          <p class="seance-subtitle">
            Converse across the temporal veil with the pioneers and long-dead languages that birthed the digital age.<br>
            Powered 100% locally by Open-Source AI weights.
          </p>
          <div class="seance-nav-bar">
            <button class="btn btn-ghost" id="btn-seance-to-shell">💻 Haunted Terminal</button>
            <button class="btn btn-gold" id="btn-seance-to-ofrenda">🌼 Día de los Muertos Altar</button>
          </div>
        </header>

        <div class="seance-grid">
          <!-- SPIRIT SELECTOR COLUMN -->
          <aside class="spirits-sidebar">
            <div class="sidebar-title">🕯️ SUMMON A DEPARTED SPIRIT</div>
            <div class="spirits-list" id="spirits-list">
              ${spirits.map(s => `
                <div class="spirit-card ${s.id === this.currentSpirit.id ? 'active' : ''}" data-id="${s.id}">
                  <span class="spirit-avatar">${s.avatar}</span>
                  <div class="spirit-info">
                    <div class="spirit-name">${s.name}</div>
                    <div class="spirit-role">${s.title}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="spirit-bio-card" id="spirit-bio-card">
              <div class="bio-header">
                <span id="bio-avatar">${this.currentSpirit.avatar}</span>
                <span id="bio-name">${this.currentSpirit.name}</span>
              </div>
              <p id="bio-text">${this.currentSpirit.bio}</p>
            </div>
          </aside>

          <!-- CHAT DIALOGUE CHAMBER -->
          <main class="chamber-chat-panel">
            <div class="chamber-circle-status">
              <span class="pulsing-orb">🔮</span>
              <span id="chamber-status-text">Circle active: communion established with <strong>${this.currentSpirit.name}</strong></span>
            </div>

            <div class="chat-history" id="chamber-chat-history">
              <!-- Chat turns appear here -->
            </div>

            <div class="suggested-prompts" id="suggested-prompts">
              <span class="prompt-chip" data-prompt="What do you think of modern generative AI?">🔮 Modern AI</span>
              <span class="prompt-chip" data-prompt="Why is open-source code and open weights essential?">🌐 Open Innovation</span>
              <span class="prompt-chip" data-prompt="What was your greatest breakthrough or memory?">⚡ Greatest Memory</span>
              <span class="prompt-chip" data-prompt="Are you happy with the future computing created?">⏳ Reflection</span>
            </div>

            <div class="chamber-input-area">
              <textarea id="chamber-input" rows="2" placeholder="Whisper your question into the dark circuit..."></textarea>
              <button class="btn btn-purple" id="btn-send-seance">Summon Voice</button>
            </div>
          </main>
        </div>
      </div>
    `;

    this.chatHistoryEl = this.container.querySelector('#chamber-chat-history');
    this.inputEl = this.container.querySelector('#chamber-input');
    this.statusTextEl = this.container.querySelector('#chamber-status-text');
  }

  attachEvents() {
    // Navigation
    this.container.querySelector('#btn-seance-to-shell')?.addEventListener('click', () => {
      this.onNavigateMode('terminal');
    });
    this.container.querySelector('#btn-seance-to-ofrenda')?.addEventListener('click', () => {
      this.onNavigateMode('ofrenda');
    });

    // Spirit selection
    this.container.querySelectorAll('.spirit-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const matched = Object.values(SPIRIT_PERSONAS).find(s => s.id === id);
        if (matched) {
          this.switchSpirit(matched);
        }
      });
    });

    // Send button
    this.container.querySelector('#btn-send-seance')?.addEventListener('click', () => {
      this.handleUserSend();
    });

    // Input Enter key (Shift+Enter for newline)
    this.inputEl.addEventListener('keydown', (e) => {
      soundscape.playKeyclick();
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserSend();
      }
    });

    // Suggested prompts
    this.container.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.inputEl.value = chip.dataset.prompt;
        this.handleUserSend();
      });
    });
  }

  switchSpirit(spirit) {
    if (this.currentSpirit.id === spirit.id) return;
    this.currentSpirit = spirit;

    soundscape.playChime(380, 'triangle', 1.4);

    // Update sidebar UI
    this.container.querySelectorAll('.spirit-card').forEach(c => {
      c.classList.toggle('active', c.dataset.id === spirit.id);
    });

    this.container.querySelector('#bio-avatar').innerText = spirit.avatar;
    this.container.querySelector('#bio-name').innerText = spirit.name;
    this.container.querySelector('#bio-text').innerText = spirit.bio;
    this.statusTextEl.innerHTML = `Circle active: communion established with <strong>${spirit.name}</strong>`;

    this.messages = [];
    this.chatHistoryEl.innerHTML = '';
    this.sendInitialGreeting();
  }

  async sendInitialGreeting() {
    const greetingPrompt = `You have just been summoned across the temporal veil on Halloween / Día de los Muertos night. Greet the mortal who invoked you in your authentic persona and voice, in 2 concise, atmospheric sentences.`;

    this.appendMessage('system', `🕯️ Incense burns. The spirit circle converges on ${this.currentSpirit.name}...`);
    
    const reply = await aiEngine.generate({
      prompt: greetingPrompt,
      persona: this.currentSpirit.id,
    });

    this.appendMessage('spirit', reply, this.currentSpirit);
  }

  async handleUserSend() {
    const text = this.inputEl.value.trim();
    if (!text || this.isSummoning) return;

    this.inputEl.value = '';
    this.isSummoning = true;
    soundscape.playChime(480, 'sine', 0.6);

    this.appendMessage('user', text);

    const loaderId = 'loader_' + Date.now();
    this.appendMessage('loader', `Transmuting query through local open-weight neural matrices...`, null, loaderId);

    try {
      const response = await aiEngine.generate({
        prompt: text,
        persona: this.currentSpirit.id,
      });

      const loaderEl = document.getElementById(loaderId);
      if (loaderEl) loaderEl.remove();

      soundscape.playChime(620, 'sine', 1.0);
      this.appendMessage('spirit', response, this.currentSpirit);
    } catch (err) {
      const loaderEl = document.getElementById(loaderId);
      if (loaderEl) loaderEl.remove();
      this.appendMessage('system', `⚠️ Spiritual communion severed: ${err.message}`);
    } finally {
      this.isSummoning = false;
    }
  }

  appendMessage(type, content, spiritObj = null, customId = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg msg-${type}`;
    if (customId) msgDiv.id = customId;

    if (type === 'user') {
      msgDiv.innerHTML = `
        <div class="msg-author">You (Mortal Operator):</div>
        <div class="msg-content">${this.escapeHtml(content)}</div>
      `;
    } else if (type === 'spirit') {
      const s = spiritObj || this.currentSpirit;
      msgDiv.innerHTML = `
        <div class="msg-author"><span class="spirit-bubble-avatar">${s.avatar}</span> ${s.name} <em>(${s.title})</em>:</div>
        <div class="msg-content">${this.escapeHtml(content)}</div>
      `;
    } else if (type === 'loader') {
      msgDiv.innerHTML = `<span class="spinner">🔮</span> <em>${content}</em>`;
    } else {
      msgDiv.innerHTML = `<em>${content}</em>`;
    }

    this.chatHistoryEl.appendChild(msgDiv);
    this.chatHistoryEl.scrollTop = this.chatHistoryEl.scrollHeight;
  }

  escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
