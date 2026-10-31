/**
 * Why Open Innovation Matters Panel
 * Interactive architectural breakdown of why sovereign, local,
 * open-weight AI is necessary for digital memorials and sovereign computing.
 */

export class WhyOpenModal {
  constructor(containerEl) {
    this.container = containerEl;
    this.render();
    this.attachEvents();
  }

  render() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-overlay why-open-modal';
    this.modalEl.id = 'why-open-modal';
    this.modalEl.style.display = 'none';

    this.modalEl.innerHTML = `
      <div class="modal-dialog large-dialog">
        <div class="modal-header">
          <h2>🌐 Why Open Innovation Matters: Ghost in the Machine</h2>
          <button class="modal-close" id="btn-close-why-open">&times;</button>
        </div>
        <div class="modal-body">
          
          <div class="open-pillar-grid">
            <div class="pillar-card">
              <div class="pillar-icon">🔒</div>
              <h3>Sacred Data Sovereignty</h3>
              <p>
                A Día de los Muertos ofrenda holds deeply intimate memories: the names of your ancestors, personal photos, family stories, and final words. With open-source AI running in your browser or local Ollama, <strong>zero bytes ever leave your device</strong>. No closed cloud API trains on your grief or archives your family tree.
              </p>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon">⚡</div>
              <h3>Offline Immortality</h3>
              <p>
                When a stormy Halloween night cuts the power and internet, closed SaaS tools vanish into <code>503 Service Unavailable</code>. Open-weight models (SmolLM, Gemma, Qwen) stored locally in WebAssembly cache or Ollama run forever—even on a laptop in a cabin in the woods without internet.
              </p>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon">🏺</div>
              <h3>Immunity to Sunsetting</h3>
              <p>
                Commercial AI APIs regularly deprecate endpoints, change terms, or shut down entirely. Open-source models and permissive MIT code belong to you for the next 50 years. The remembrance you compose today will still execute in 2076.
              </p>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon">💸</div>
              <h3>Zero Marginal Cost</h3>
              <p>
                Closed models cost tokens for every prompt, every keystroke, and every ghost whisper. Open-weight models allow millions of terminal interactions, calaverita verses, and spirit seances with <strong>$0.00 cloud bills</strong>.
              </p>
            </div>
          </div>

          <div class="comparison-section">
            <h3>⚖️ Architecture Comparison: Closed API vs. Sovereign Open AI</h3>
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Closed Cloud AI (OpenAI / Anthropic)</th>
                  <th>NecroShell Sovereign Open AI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Family Privacy</strong></td>
                  <td>Logged, retained, potentially trained on corporate servers</td>
                  <td><strong>100% on-device</strong> (RAM / LocalStorage)</td>
                </tr>
                <tr>
                  <td><strong>Internet Dependency</strong></td>
                  <td>Requires constant 24/7 internet connection</td>
                  <td><strong>Works 100% offline</strong> with airplane mode on</td>
                </tr>
                <tr>
                  <td><strong>Model Freedom</strong></td>
                  <td>Black-box weights; vendor can change behavior overnight</td>
                  <td>Inspectable open weights (Gemma, Qwen, SmolLM, Llama)</td>
                </tr>
                <tr>
                  <td><strong>Longevity</strong></td>
                  <td>Vulnerable to API deprecations and price hikes</td>
                  <td>Runs in WebAssembly / Native forever</td>
                </tr>
                <tr>
                  <td><strong>Cost</strong></td>
                  <td>Pay per token on every shell command</td>
                  <td><strong>$0.00 forever</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="open-quote-banner">
            <em>"Software freedom is not merely about code—it is about human dignity, agency, and ensuring our memories outlive the corporations of our time."</em>
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn btn-gold" id="btn-done-why-open">Close Manifest</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
  }

  attachEvents() {
    this.modalEl.querySelector('#btn-close-why-open')?.addEventListener('click', () => this.hide());
    this.modalEl.querySelector('#btn-done-why-open')?.addEventListener('click', () => this.hide());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hide();
    });
  }

  show() {
    this.modalEl.style.display = 'flex';
  }

  hide() {
    this.modalEl.style.display = 'none';
  }
}
