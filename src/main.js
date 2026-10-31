import './style.css';
import { NecroShell } from './terminal/shell.js';
import { DigitalOfrenda } from './ofrenda/altar.js';
import { SeanceChamber } from './seance/chamber.js';
import { WhyOpenModal } from './components/why-open.js';
import { soundscape } from './audio/soundscape.js';

class App {
  constructor() {
    this.appView = document.getElementById('app-view');
    this.currentMode = 'terminal';
    this.activeInstance = null;

    this.whyOpenModal = new WhyOpenModal(document.body);

    this.initNav();
    this.switchMode('terminal');
  }

  initNav() {
    // Mode switcher buttons
    const modeButtons = document.querySelectorAll('.nav-btn');
    modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetMode = btn.dataset.mode;
        this.switchMode(targetMode);
      });
    });

    // Brand click returns to terminal
    document.getElementById('nav-brand')?.addEventListener('click', () => {
      this.switchMode('terminal');
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn?.addEventListener('click', () => {
      const active = soundscape.toggleMute();
      soundBtn.innerText = active ? '🔊 Sound: On' : '🔇 Sound: Off';
      soundBtn.classList.toggle('active', active);
    });

    // Why Open modal
    document.getElementById('btn-why-open')?.addEventListener('click', () => {
      this.whyOpenModal.show();
    });
  }

  switchMode(mode) {
    if (this.activeInstance && typeof this.activeInstance.destroyCanvas === 'function') {
      this.activeInstance.destroyCanvas();
    }

    this.currentMode = mode;
    this.appView.innerHTML = '';

    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'terminal') {
      this.activeInstance = new NecroShell(this.appView, (target) => this.switchMode(target));
    } else if (mode === 'ofrenda') {
      this.activeInstance = new DigitalOfrenda(this.appView, (target) => this.switchMode(target));
    } else if (mode === 'seance') {
      this.activeInstance = new SeanceChamber(this.appView, (target) => this.switchMode(target));
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.necroApp = new App();
});
