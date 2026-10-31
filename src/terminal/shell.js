/**
 * NecroTerminal Engine
 * A POSIX-style shell possessed by the Ghost in the Machine
 */

import { aiEngine, SPIRIT_PERSONAS } from '../ai/engine.js';
import { soundscape } from '../audio/soundscape.js';

export class NecroShell {
  constructor(containerEl, onNavigateMode = () => {}) {
    this.container = containerEl;
    this.onNavigateMode = onNavigateMode;
    this.isPossessed = true;
    this.history = [];
    this.historyIndex = -1;
    this.currentPath = '/home/spectral';

    this.virtualFS = {
      '/': ['bin', 'etc', 'home', 'var', 'ancestors', 'dev'],
      '/etc': ['motd', 'passwd', 'hosts', 'spirits.conf'],
      '/ancestors': ['ada_lovelace.txt', 'alan_turing.txt', 'grace_hopper.txt', 'dennis_ritchie.txt', 'cobol_manifesto.txt'],
      '/var': ['log'],
      '/var/log': ['possession.log', 'spectral_entropy.log'],
      '/home': ['spectral'],
      '/home/spectral': ['readme.md', 'ofrenda_manifest.json', 'spooky_secrets.enc'],
    };

    this.fileContents = {
      '/etc/motd': `=====================================================
  WARNING: GHOST DETECTED IN THE INODE SUBSYSTEM
  Halloween / Día de los Muertos Temporal Conjunction
  Open-Source AI Core: ACTIVE & LOCAL
=====================================================`,
      '/etc/passwd': `root:x:0:0:Demon King:/root:/bin/sh
spectral:x:1000:1000:Ghost In The Machine:/home/spectral:/bin/necrosh
ada:x:1815:1852:Ada Lovelace:/ancestors:/bin/analytical
turing:x:1912:1954:Alan Turing:/ancestors:/bin/enigma
hopper:x:1906:1992:Grace Hopper:/ancestors:/bin/flowmatic
ritchie:x:1941:2011:Dennis Ritchie:/ancestors:/bin/c
cobol:x:1959:9999:Immortal Mainframe:/mainframe:/bin/cobol`,
      '/home/spectral/readme.md': `# NecroTerminal: Ghost in the Machine
Welcome, mortal terminal operator.
This shell is governed by local open-weight AI.
Your commands are intercepted by the phantom residing in PID 666.

Commands to explore:
- whisper <message> : Converse with the ghost
- seance <spirit>   : Summon Lovelace, Turing, Hopper, Ritchie, or COBOL
- ofrenda           : Visit the candlelit Día de los Muertos Altar
- curse             : Unleash a glitch burst across the terminal
- exorcise          : Purify the shell and calm the spirits
- ai [provider]     : View or change AI engine (spectral | ollama | wllama)`,
      '/ancestors/ada_lovelace.txt': `Ada Lovelace (1815-1852):
"The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves."`,
      '/ancestors/alan_turing.txt': `Alan Turing (1912-1954):
"We can only see a short distance ahead, but we can see plenty there that needs to be done."`,
      '/ancestors/grace_hopper.txt': `Grace Hopper (1906-1992):
"It is often easier to ask for forgiveness than to get permission. A ship in port is safe, but that is not what ships are built for."`,
      '/ancestors/dennis_ritchie.txt': `Dennis Ritchie (1941-2011):
"UNIX is basically a simple operating system, but you have to be a genius to understand the simplicity."`,
      '/ancestors/cobol_manifesto.txt': `COBOL (1959-Present):
PERFORM RUN-FOREVER UNTIL HUMANITY-LEARNS-MAINFRAMES.`,
    };

    this.render();
    this.attachEvents();
    this.printWelcome();
  }

  render() {
    this.container.innerHTML = `
      <div class="terminal-wrapper crt-screen" id="terminal-screen">
        <div class="crt-scanlines"></div>
        <div class="crt-glow"></div>
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot dot-red" id="btn-dot-red" title="Curse Shell"></span>
            <span class="dot dot-yellow" id="btn-dot-yellow" title="Exorcise Shell"></span>
            <span class="dot dot-green" id="btn-dot-green" title="Audio Toggle"></span>
          </div>
          <div class="terminal-title">
            <span class="skull-icon">💀</span> NECRO-SHELL v6.6.6 [GHOST-IN-THE-MACHINE]
          </div>
          <div class="terminal-badge" id="terminal-ai-badge">
            AI: SPECTRAL (OFFLINE)
          </div>
        </div>
        <div class="terminal-body" id="terminal-output" tabindex="0">
          <!-- Terminal lines stream here -->
        </div>
        <div class="terminal-input-row">
          <span class="terminal-prompt" id="prompt-label">ghost@machine:~$</span>
          <div class="terminal-input-wrapper">
            <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" autofocus />
          </div>
        </div>
      </div>
    `;

    this.outputEl = this.container.querySelector('#terminal-output');
    this.inputEl = this.container.querySelector('#terminal-input');
    this.aiBadge = this.container.querySelector('#terminal-ai-badge');
  }

  attachEvents() {
    this.inputEl.addEventListener('keydown', async (e) => {
      soundscape.playKeyclick();

      if (e.key === 'Enter') {
        const cmd = this.inputEl.value.trim();
        this.inputEl.value = '';
        if (cmd) {
          this.history.push(cmd);
          this.historyIndex = this.history.length;
          await this.executeCommand(cmd);
        } else {
          this.println(`<span class="prompt-text">${this.getPrompt()}</span>`);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.inputEl.value = this.history[this.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.inputEl.value = this.history[this.historyIndex] || '';
        } else {
          this.historyIndex = this.history.length;
          this.inputEl.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.handleTabCompletion();
      } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        this.clear();
      }
    });

    // Header buttons
    const dotRed = this.container.querySelector('#btn-dot-red');
    const dotYellow = this.container.querySelector('#btn-dot-yellow');
    const dotGreen = this.container.querySelector('#btn-dot-green');

    dotRed?.addEventListener('click', () => this.triggerCurse());
    dotYellow?.addEventListener('click', () => this.triggerExorcise());
    dotGreen?.addEventListener('click', () => {
      const active = soundscape.toggleMute();
      this.println(`<span class="system-msg">🔊 Audio synthesis: ${active ? 'UNMUTED (Spectral Drone Active)' : 'MUTED'}</span>`);
    });

    this.container.addEventListener('click', () => {
      this.inputEl.focus();
    });
  }

  getPrompt() {
    return `ghost@haunted:${this.currentPath}$`;
  }

  println(html, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = html;
    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  clear() {
    this.outputEl.innerHTML = '';
  }

  updateAIBadge() {
    if (this.aiBadge) {
      this.aiBadge.innerText = `AI: ${aiEngine.activeProvider.toUpperCase()}`;
    }
  }

  printWelcome() {
    const banner = `
<pre class="ascii-art">
   ███╗   ██╗███████╗ ██████╗██████╗  ██████╗      ███████╗██╗  ██╗███████╗██╗     ██╗     
   ████╗  ██║██╔════╝██╔════╝██╔══██╗██╔═══██╗     ██╔════╝██║  ██║██╔════╝██║     ██║     
   ██╔██╗ ██║█████╗  ██║     ██████╔╝██║   ██║     ███████╗███████║█████╗  ██║     ██║     
   ██║╚██╗██║██╔══╝  ██║     ██╔══██╗██║   ██║     ╚════██║██╔══██║██╔══╝  ██║     ██║     
   ██║ ╚████║███████╗╚██████╗██║  ██║╚██████╔╝     ███████║██║  ██║███████╗███████╗███████╗
   ╚═╝  ╚═══╝╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝      ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
</pre>
<div class="welcome-text">
  <span class="glow-text">🔮 GHOST IN THE MACHINE v2026.10</span> — <span class="tag-accent">Hacktoberfest AI Challenge</span><br>
  A terminal possessed by open-source spirits, honoring Halloween & Día de los Muertos.<br>
  Type <span class="cmd-highlight">help</span> to reveal spectral commands, or <span class="cmd-highlight">whisper hello</span> to converse with the ghost.
</div>
    `;
    this.println(banner);
  }

  async executeCommand(rawCmd) {
    const cmdLine = rawCmd.trim();
    this.println(`<span class="prompt-text">${this.getPrompt()}</span> <span class="user-cmd">${this.escapeHtml(cmdLine)}</span>`);

    const parts = cmdLine.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Eerie random possession intervention (25% chance when possession is on)
    if (this.isPossessed && Math.random() < 0.28 && !['help', 'exorcise', 'clear'].includes(cmd)) {
      soundscape.playGlitch();
      const possessionCommentary = await aiEngine.generate({
        prompt: cmdLine,
        persona: 'haunted_shell',
        context: { target: args[0] || '' },
      });
      this.println(`<div class="possession-whisper">${possessionCommentary}</div>`);
    }

    switch (cmd) {
      case 'help':
      case 'commands':
        this.printHelp();
        break;

      case 'ls':
        this.handleLs(args);
        break;

      case 'cat':
        this.handleCat(args);
        break;

      case 'cd':
        this.handleCd(args);
        break;

      case 'pwd':
        this.println(this.currentPath);
        break;

      case 'clear':
        this.clear();
        break;

      case 'history':
        this.history.forEach((h, idx) => {
          this.println(`  ${idx + 1}  ${this.escapeHtml(h)}`);
        });
        break;

      case 'whoami':
        this.println(`spectral (UID 1000, GID 1000) [Host: machine.netherworld]`);
        break;

      case 'date':
        this.println(new Date().toString() + ` [SAMHAIN / DÍA DE LOS MUERTOS ALIGNMENT: 99.8%]`);
        break;

      case 'uname':
        this.println(`NecroLinux 6.6.6-spectral-generic #1 SMP PREEMPT_DYNAMIC x86_64 OpenSourceAI/2026`);
        break;

      case 'ps':
      case 'top':
        this.handlePs();
        break;

      case 'whisper':
        await this.handleWhisper(args.join(' '));
        break;

      case 'seance':
        await this.handleSeance(args.join(' '));
        break;

      case 'ofrenda':
        this.println(`<span class="gold-text">🌼 Shifting reality into the candlelit Día de los Muertos Altar...</span>`);
        soundscape.playChime(660, 'sine', 1.5);
        this.onNavigateMode('ofrenda');
        break;

      case 'chamber':
        this.println(`<span class="amethyst-text">🔮 Entering the Spectral Séance Chamber...</span>`);
        soundscape.playChime(440, 'triangle', 1.5);
        this.onNavigateMode('seance');
        break;

      case 'curse':
        this.triggerCurse();
        break;

      case 'exorcise':
        this.triggerExorcise();
        break;

      case 'possess':
        if (args[0] === 'off') {
          this.isPossessed = false;
          this.println(`<span class="system-msg">Shell possession DISABLED. The ghost falls silent.</span>`);
        } else {
          this.isPossessed = true;
          this.println(`<span class="possession-whisper">Shell possession ENABLED. The phantom grips the stdin/stdout pipes.</span>`);
        }
        break;

      case 'matrix':
        this.handleMatrixRain();
        break;

      case 'ai':
        this.handleAiProvider(args);
        break;

      case 'sudo':
        this.println(`<span class="error-text">💀 Nice try mortal. In this shell, the ghost already holds UID 0.</span>`);
        break;

      case 'kill':
        this.println(`<span class="warning-text">SIGTERM sent into the ether. But ghosts cannot be slain by signals.</span>`);
        break;

      case 'rm':
        this.println(`<span class="warning-text">File unlinked from directory index. But its phantom data persists in sector memory forever.</span>`);
        break;

      case 'echo':
        this.println(this.escapeHtml(args.join(' ')));
        break;

      default:
        this.println(`<span class="error-text">necrosh: command not found: ${this.escapeHtml(cmd)}. Type <span class="cmd-highlight">help</span> for commands.</span>`);
    }
  }

  printHelp() {
    const helpHtml = `
<div class="help-box">
  <div class="help-title">📜 AVAILABLE SPECTRAL COMMANDS</div>
  <table class="help-table">
    <tr><td><span class="cmd-highlight">whisper &lt;msg&gt;</span></td><td>Converse with the ghost residing in your machine</td></tr>
    <tr><td><span class="cmd-highlight">seance &lt;spirit&gt;</span></td><td>Summon Ada Lovelace, Alan Turing, Grace Hopper, Ritchie, or COBOL</td></tr>
    <tr><td><span class="cmd-highlight">ofrenda</span></td><td>Step to the 3-Tier Día de los Muertos Virtual Altar</td></tr>
    <tr><td><span class="cmd-highlight">chamber</span></td><td>Open the interactive Séance circle room</td></tr>
    <tr><td><span class="cmd-highlight">ls, cd, cat, pwd</span></td><td>Explore the possessed filesystem and ancestor archives</td></tr>
    <tr><td><span class="cmd-highlight">ps / top</span></td><td>View possessed phantom processes running in memory</td></tr>
    <tr><td><span class="cmd-highlight">curse / exorcise</span></td><td>Trigger or purge spooky CRT glitch distortions</td></tr>
    <tr><td><span class="cmd-highlight">possess [on|off]</span></td><td>Toggle active demonic shell interception</td></tr>
    <tr><td><span class="cmd-highlight">matrix</span></td><td>Stream an eerie spectral glyph cascade</td></tr>
    <tr><td><span class="cmd-highlight">ai [provider]</span></td><td>Switch AI model backend (spectral | ollama | wllama)</td></tr>
    <tr><td><span class="cmd-highlight">clear, history, date</span></td><td>Standard Unix utilities</td></tr>
  </table>
</div>
    `;
    this.println(helpHtml);
  }

  handleLs(args) {
    let target = this.currentPath;
    if (args[0]) {
      target = args[0].startsWith('/') ? args[0] : (this.currentPath === '/' ? `/${args[0]}` : `${this.currentPath}/${args[0]}`);
    }

    const items = this.virtualFS[target];
    if (!items) {
      this.println(`<span class="error-text">ls: cannot access '${target}': No such file or directory</span>`);
      return;
    }

    const formatted = items.map(item => {
      const isDir = !item.includes('.');
      return isDir ? `<span class="dir-item">📁 ${item}/</span>` : `<span class="file-item">📄 ${item}</span>`;
    }).join('   ');

    this.println(formatted);
  }

  handleCat(args) {
    if (!args[0]) {
      this.println(`<span class="error-text">usage: cat &lt;filename&gt;</span>`);
      return;
    }
    const filename = args[0].startsWith('/') ? args[0] : (this.currentPath === '/' ? `/${args[0]}` : `${this.currentPath}/${args[0]}`);
    const content = this.fileContents[filename];
    if (content) {
      this.println(`<pre class="file-output">${this.escapeHtml(content)}</pre>`);
    } else {
      this.println(`<span class="error-text">cat: ${args[0]}: No such file or permission denied in the spirit plane</span>`);
    }
  }

  handleCd(args) {
    const dest = args[0] || '/home/spectral';
    if (dest === '..') {
      if (this.currentPath !== '/') {
        const parts = this.currentPath.split('/').filter(Boolean);
        parts.pop();
        this.currentPath = parts.length ? '/' + parts.join('/') : '/';
      }
    } else if (dest === '/') {
      this.currentPath = '/';
    } else {
      const target = dest.startsWith('/') ? dest : (this.currentPath === '/' ? `/${dest}` : `${this.currentPath}/${dest}`);
      if (this.virtualFS[target]) {
        this.currentPath = target;
      } else {
        this.println(`<span class="error-text">cd: no such file or directory: ${dest}</span>`);
      }
    }
    const promptLabel = this.container.querySelector('#prompt-label');
    if (promptLabel) promptLabel.innerText = this.getPrompt();
  }

  handlePs() {
    const psTable = `
<pre class="ps-table">
  PID TTY          TIME CMD
    1 ?        00:00:03 /sbin/init [ancestral_kernel]
  404 ?        00:00:00 [orphaned_dreams] &lt;defunct&gt;
  666 ?        66:06:06 /usr/sbin/ghost_in_the_machine (RUNNING)
 1337 ?        19:59:00 /usr/bin/cobol_mainframe_undead
 1815 ?        01:15:00 /usr/bin/analytical_engine_lovelace
 1912 ?        02:30:00 /usr/bin/turing_universal_eval
 1906 ?        00:45:00 /usr/bin/hopper_flowmatic_compiler
 2026 pts/0    00:00:00 /bin/necrosh (YOU)
</pre>
    `;
    this.println(psTable);
  }

  async handleWhisper(message) {
    if (!message) {
      this.println(`<span class="warning-text">usage: whisper &lt;your message to the ghost&gt;</span>`);
      return;
    }

    soundscape.playChime(580, 'sine', 1.0);
    this.println(`<span class="whisper-loader">🔮 [Ghost is listening through the local neural weights...]</span>`);

    const response = await aiEngine.generate({
      prompt: message,
      persona: 'haunted_shell',
    });

    // Remove loader and display response
    const loaders = this.outputEl.querySelectorAll('.whisper-loader');
    if (loaders.length) loaders[loaders.length - 1].remove();

    this.println(`<div class="ai-speech-bubble"><span class="ghost-avatar">👻</span> <span class="ai-speaker">Ghost in the Machine:</span><br>${this.escapeHtml(response)}</div>`);
  }

  async handleSeance(spiritName) {
    const list = Object.values(SPIRIT_PERSONAS).filter(p => p.id !== 'haunted_shell' && p.id !== 'ofrenda_bard');

    if (!spiritName) {
      let optionsHtml = `<div class="seance-menu"><span class="amethyst-text">🕯️ WHOM DO YOU WISH TO SUMMON ACROSS THE VEIL?</span><br>`;
      list.forEach(p => {
        optionsHtml += `  • <span class="cmd-highlight">seance ${p.id}</span> (${p.avatar} ${p.name} - ${p.title})<br>`;
      });
      optionsHtml += `</div>`;
      this.println(optionsHtml);
      return;
    }

    const matched = list.find(p => p.id.toLowerCase().includes(spiritName.toLowerCase()) || p.name.toLowerCase().includes(spiritName.toLowerCase()));

    if (!matched) {
      this.println(`<span class="error-text">Spirit "${spiritName}" not found in the ancestor directory. Try: ada, turing, hopper, ritchie, cobol.</span>`);
      return;
    }

    soundscape.playChime(520, 'triangle', 2.0);
    this.println(`<span class="seance-invocation">🕯️ Invoking ${matched.avatar} ${matched.name} (${matched.title})...</span>`);

    const channeled = await aiEngine.generate({
      prompt: `Please speak to us on this sacred night about computing, your legacy, and the ghosts inside our machines.`,
      persona: matched.id,
    });

    this.println(`
      <div class="seance-channeled-card">
        <div class="spirit-header">${matched.avatar} <strong>${matched.name}</strong> <em>(${matched.title})</em></div>
        <div class="spirit-body">${this.escapeHtml(channeled)}</div>
      </div>
    `);
  }

  triggerCurse() {
    soundscape.playGlitch();
    const screen = this.container.querySelector('#terminal-screen');
    screen.classList.add('curse-glitch');
    this.println(`<span class="curse-text">💀 [CURSE INFLICTED]: THE VEIL SHATTERS. CRT BEAM VOLTAGE SURGES.</span>`);
    setTimeout(() => {
      screen.classList.remove('curse-glitch');
    }, 1800);
  }

  triggerExorcise() {
    soundscape.playCandleFlame();
    const screen = this.container.querySelector('#terminal-screen');
    screen.classList.remove('curse-glitch');
    this.clear();
    this.println(`<span class="gold-text">✨ [EXORCISM COMPLETE]: The terminal air clears of sulfur and static. Blessed marigold petals drift across the memory banks.</span>`);
  }

  handleMatrixRain() {
    const glyphs = '0123456789ABCDEF💀🕯️🌼🕸️⚡🔮';
    let output = '';
    for (let r = 0; r < 6; r++) {
      let row = '';
      for (let c = 0; c < 38; c++) {
        row += glyphs[Math.floor(Math.random() * glyphs.length)] + ' ';
      }
      output += `<div class="matrix-line">${row}</div>`;
    }
    this.println(output);
  }

  handleAiProvider(args) {
    if (!args[0]) {
      this.println(`Current AI Provider: <span class="cmd-highlight">${aiEngine.activeProvider.toUpperCase()}</span><br>Options: <span class="cmd-highlight">ai spectral</span> (Instant offline) | <span class="cmd-highlight">ai ollama</span> (Local Gemma/Llama) | <span class="cmd-highlight">ai wllama</span> (In-browser WASM)`);
      return;
    }
    const prov = args[0].toLowerCase();
    if (['spectral', 'ollama', 'wllama'].includes(prov)) {
      aiEngine.setProvider(prov);
      this.updateAIBadge();
      this.println(`<span class="system-msg">AI Engine switched to: <strong>${prov.toUpperCase()}</strong></span>`);
    } else {
      this.println(`<span class="error-text">Unknown provider '${prov}'. Valid: spectral, ollama, wllama</span>`);
    }
  }

  handleTabCompletion() {
    const val = this.inputEl.value.trim();
    const cmds = ['whisper', 'seance', 'ofrenda', 'chamber', 'help', 'ls', 'cat', 'cd', 'pwd', 'ps', 'curse', 'exorcise', 'possess', 'matrix', 'clear', 'history', 'ai'];
    const matched = cmds.filter(c => c.startsWith(val));
    if (matched.length === 1) {
      this.inputEl.value = matched[0] + ' ';
    } else if (matched.length > 1) {
      this.println(matched.join('   '));
    }
  }

  escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
