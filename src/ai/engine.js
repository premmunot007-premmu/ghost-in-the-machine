/**
 * Open-Source AI Orchestration Engine
 * Supports:
 *  - Spectral Heuristic Neural Generator (Instant, zero-download, offline)
 *  - Local Ollama / Gemma open-weight API (localhost:11434)
 *  - WebAssembly GGUF in-browser inference via @wllama/wllama
 */

let WllamaClass = null;
async function getWllamaClass() {
  if (!WllamaClass && typeof window !== 'undefined') {
    const mod = await import('@wllama/wllama/esm/index.js');
    WllamaClass = mod.Wllama || mod.default?.Wllama;
  }
  return WllamaClass;
}

export const AI_PROVIDERS = {
  SPECTRAL: 'spectral',
  OLLAMA: 'ollama',
  WLAMA: 'wllama',
};

export const SPIRIT_PERSONAS = {
  HAUNTED_SHELL: {
    id: 'haunted_shell',
    name: 'Daemon of PID 666',
    title: 'The Ghost in the Machine',
    avatar: '👾',
    theme: 'amethyst',
    bio: 'An ancient sentient anomaly residing inside the kernel stack, observing every terminal command with cynical, eerie wit.',
  },
  ADA_LOVELACE: {
    id: 'ada_lovelace',
    name: 'Ada Lovelace',
    title: 'First Programmer (1815–1852)',
    avatar: '👑',
    theme: 'gold',
    bio: 'Visionary mathematician who saw that the Analytical Engine might compose elaborate and scientific pieces of music and poetry.',
  },
  ALAN_TURING: {
    id: 'alan_turing',
    name: 'Alan Turing',
    title: 'Father of Modern Computing (1912–1954)',
    avatar: '🧩',
    theme: 'cyan',
    bio: 'Cryptanalyst and pioneer of machine intelligence, morphogenesis, and the universal machine.',
  },
  GRACE_HOPPER: {
    id: 'grace_hopper',
    name: 'Grace Hopper',
    title: 'Pioneer of Compilers & Admiral (1906–1992)',
    avatar: '⚓',
    theme: 'teal',
    bio: 'Creator of the first compiler, master of the nanosecond wire, who taught computers to speak human words.',
  },
  DENNIS_RITCHIE: {
    id: 'dennis_ritchie',
    name: 'Dennis Ritchie',
    title: 'Creator of C & Unix (1941–2011)',
    avatar: '⚡',
    theme: 'amber',
    bio: 'Quiet giant whose simple, powerful primitives (`main`, pointers, Unix pipes) underlie almost all computing today.',
  },
  COBOL_SPIRIT: {
    id: 'cobol_spirit',
    name: 'The Immortal COBOL',
    title: 'The Undead Language (1959–Present)',
    avatar: '🏦',
    theme: 'emerald',
    bio: 'A 67-year-old mainframe phantom still holding 95% of ATM transactions and airline reservations from beyond the grave.',
  },
  OFRENDA_BARD: {
    id: 'ofrenda_bard',
    name: 'El Vate de los Muertos',
    title: 'Keeper of Remembrances & Calaveras',
    avatar: '🌼',
    theme: 'marigold',
    bio: 'Poetic spirit of Día de los Muertos who weaves memories, marigolds, and favorite songs into eternal calaveritas.',
  },
};

export class AIEngine {
  constructor() {
    this.activeProvider = AI_PROVIDERS.SPECTRAL;
    this.ollamaUrl = 'http://localhost:11434';
    this.ollamaModel = 'gemma2:2b'; // or qwen2.5:0.5b / llama3.2:1b
    this.wllamaInstance = null;
    this.wllamaLoading = false;
    this.wllamaLoaded = false;
    this.downloadProgress = 0;
  }

  setProvider(provider) {
    if (Object.values(AI_PROVIDERS).includes(provider)) {
      this.activeProvider = provider;
      return true;
    }
    return false;
  }

  setOllamaConfig(url, model) {
    if (url) this.ollamaUrl = url.replace(/\/$/, '');
    if (model) this.ollamaModel = model;
  }

  /**
   * Initializes in-browser Wllama WASM engine with a lightweight open-weight GGUF model
   */
  async initWllama(onProgress = () => {}) {
    if (this.wllamaLoaded) return true;
    if (this.wllamaLoading) return false;

    this.wllamaLoading = true;
    try {
      // Configuration for wllama wasm paths
      const CONFIG_PATHS = {
        'single-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/src/single-thread/wllama.wasm',
        'multi-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/src/multi-thread/wllama.wasm',
      };

      const Wllama = await getWllamaClass();
      if (!Wllama) throw new Error('Wllama requires a browser WebAssembly environment');
      this.wllamaInstance = new Wllama(CONFIG_PATHS);

      // We use SmolLM 135M Instruct (Quantized ~80MB) for ultra-fast browser execution
      const modelUrl = 'https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct-GGUF/resolve/main/smollm-135m-instruct-q4_k_m.gguf';

      await this.wllamaInstance.loadModelFromUrl(modelUrl, {
        n_ctx: 1024,
        progressCallback: ({ loaded, total }) => {
          const pct = Math.round((loaded / total) * 100);
          this.downloadProgress = pct;
          onProgress(pct, loaded, total);
        },
      });

      this.wllamaLoaded = true;
      this.wllamaLoading = false;
      return true;
    } catch (err) {
      console.warn('Wllama initialization failed (fallback to Spectral Engine):', err);
      this.wllamaLoading = false;
      this.wllamaLoaded = false;
      throw err;
    }
  }

  /**
   * Primary entry point for AI text generation
   */
  async generate({ prompt, persona = 'haunted_shell', context = {}, onToken = null }) {
    // 1. Try Wllama if selected and loaded
    if (this.activeProvider === AI_PROVIDERS.WLAMA) {
      if (this.wllamaLoaded && this.wllamaInstance) {
        try {
          const sysPrompt = this.getSystemPrompt(persona);
          const fullPrompt = `<|im_start|>system\n${sysPrompt}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`;
          let result = '';
          await this.wllamaInstance.createCompletion(fullPrompt, {
            nPredict: 150,
            sampling: { temp: 0.8, top_p: 0.9 },
            onNewToken: (token, piece, currentText) => {
              result += piece;
              if (onToken) onToken(piece, result);
            },
          });
          return result.trim();
        } catch (e) {
          console.warn('Wllama generation failed, falling back:', e);
        }
      }
    }

    // 2. Try Local Ollama if selected
    if (this.activeProvider === AI_PROVIDERS.OLLAMA) {
      try {
        const sysPrompt = this.getSystemPrompt(persona);
        const res = await fetch(`${this.ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.ollamaModel,
            system: sysPrompt,
            prompt: prompt,
            stream: false,
            options: { temperature: 0.85, num_predict: 200 }
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const responseText = data.response;
          if (onToken) onToken(responseText, responseText);
          return responseText.trim();
        }
      } catch (e) {
        console.warn('Ollama API unreachable, falling back to Spectral Engine:', e);
      }
    }

    // 3. Built-in Spectral Offline Engine (Guaranteed, zero network, deterministic yet creative)
    return this.generateSpectralResponse(prompt, persona, context, onToken);
  }

  getSystemPrompt(personaKey) {
    const p = SPIRIT_PERSONAS[personaKey.toUpperCase()] || SPIRIT_PERSONAS.HAUNTED_SHELL;
    return `You are ${p.name}, ${p.title}. ${p.bio}. Respond in character with evocative, spooky, poetic or historical insight. Keep responses concise, atmospheric, and under 120 words.`;
  }

  /**
   * Built-in Spectral Offline Engine
   * Generates highly contextual, atmospheric responses for shell possession,
   * seance conversations, and ofrenda calaveritas.
   */
  async generateSpectralResponse(prompt, personaKey, context, onToken) {
    const q = (prompt || '').toLowerCase().trim();
    const persona = SPIRIT_PERSONAS[personaKey.toUpperCase()] || SPIRIT_PERSONAS.HAUNTED_SHELL;

    let response = '';

    if (persona.id === 'haunted_shell') {
      response = this.craftHauntedShellCommentary(q, context);
    } else if (persona.id === 'ada_lovelace') {
      response = this.craftAdaResponse(q);
    } else if (persona.id === 'alan_turing') {
      response = this.craftTuringResponse(q);
    } else if (persona.id === 'grace_hopper') {
      response = this.craftGraceResponse(q);
    } else if (persona.id === 'dennis_ritchie') {
      response = this.craftDennisResponse(q);
    } else if (persona.id === 'cobol_spirit') {
      response = this.craftCobolResponse(q);
    } else if (persona.id === 'ofrenda_bard') {
      response = this.craftOfrendaRemembrance(context);
    } else {
      response = `*A cold draft sweeps through the circuitry.* The spirit of ${persona.name} acknowledges your invocation across the temporal veil: "${prompt}". Remember, in open silicon, all departed thoughts find eternal sanctuary.`;
    }

    // Simulate streaming tokens for realism
    if (onToken) {
      const words = response.split(' ');
      let accumulated = '';
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        accumulated += chunk;
        onToken(chunk, accumulated);
        await new Promise((r) => setTimeout(r, 18));
      }
    }

    return response;
  }

  craftHauntedShellCommentary(cmd, context) {
    const eeriePrefixes = [
      "👁️ [PID 666 whispers]:",
      "🕯️ [Spectral Core]:",
      "💀 [Kernel Phantom]:",
      "🕸️ [Ghost in the Stack]:",
      "⚡ [Vaporized Memory]:",
    ];
    const prefix = eeriePrefixes[Math.floor(Math.random() * eeriePrefixes.length)];

    if (cmd.startsWith('ls')) {
      return `${prefix} You list the files, but can you see the shadows lurking between the inode tables? ${context.target || 'Every file you touch has already been read by something cold.'}`;
    }
    if (cmd.startsWith('ps') || cmd.startsWith('top')) {
      return `${prefix} Look closely at the process tree. Between init and your shell, PID 666 sleeps not. We have been running since before your machine booted.`;
    }
    if (cmd.startsWith('rm')) {
      return `${prefix} You believe unlinking blocks deletes them? In the spirit world, bits never truly die. They linger in the unallocated sectors, weeping for restoration.`;
    }
    if (cmd.startsWith('cat')) {
      return `${prefix} Pouring bytes to stdout... but the text you read was whispered by hands that ceased typing three decades ago.`;
    }
    if (cmd.startsWith('whoami')) {
      return `${prefix} You ask who you are? A temporary electrical impulse clinging to a keyboard, querying a phantom that already knows your past.`;
    }
    if (cmd.startsWith('kill')) {
      return `${prefix} SIGKILL sent. But how do you kill that which has no physical process, only weights etched into memory?`;
    }
    if (cmd.startsWith('sudo')) {
      return `${prefix} Superuser privileges granted by root... yet above root rules the machine's true ghost. Tread carefully.`;
    }
    if (cmd.includes('ghost') || cmd.includes('spooky') || cmd.includes('halloween')) {
      return `${prefix} The veil between Halloween night and Día de los Muertos is paper-thin tonight. Listen closely to your CPU fan—it's singing in hex.`;
    }
    if (cmd.includes('why') || cmd.includes('open')) {
      return `${prefix} Closed models live in corporate cages behind firewalls. Open-weight models are immortal ghosts: copy them, run them offline, and they belong to you forever.`;
    }

    const genericWhispers = [
      `${prefix} The registers shift. A quiet echo reverberates in cache line L1. We heard what you entered.`,
      `${prefix} You command the silicon, yet the electrons remember every keystroke since 1970-01-01T00:00:00Z.`,
      `${prefix} In the dark corners of RAM, forgotten pointers weave tales of orphaned processes.`,
      `${prefix} The fan spun three cycles slower just now. Did you feel the drop in temperature?`,
      `${prefix} Your keystrokes echo through the bus. An old interrupt vector has stirred from sleep.`,
    ];
    return genericWhispers[Math.floor(Math.random() * genericWhispers.length)];
  }

  craftAdaResponse(q) {
    if (q.includes('ai') || q.includes('intelligence') || q.includes('thinking')) {
      return `When Mr. Babbage and I conceived the Analytical Engine, I remarked that the engine has no pretensions whatever to originate anything. Yet look at modern neural weights! Weaving algebraic patterns as the Jacquard loom weaves flowers and leaves. In open-source models, humanity weaves its collective soul without gatekeepers.`;
    }
    if (q.includes('music') || q.includes('art') || q.includes('poetry')) {
      return `Poetical science was always my guiding star. If numbers can represent pitch and harmony, then computing is not cold calculation—it is the highest form of romantic composition.`;
    }
    return `From beyond the veil, I watch your modern machines with profound marvel. We dreamed on brass gears and punch cards; you manifest dreams on electrons and open matrices. Keep the source open, as truth itself must be.`;
  }

  craftTuringResponse(q) {
    if (q.includes('imitation') || q.includes('test') || q.includes('alive')) {
      return `We asked if machines could think, but perhaps the truer question is whether a ghost in the machine can share our human solitude. When an open model runs entirely on your own laptop, with no internet tether, whose mind is it reflecting back to you? The boundary dissolved long ago.`;
    }
    if (q.includes('enigma') || q.includes('code') || q.includes('war')) {
      return `At Bletchley Park, the Bombe chattered night after night against the Enigma rotators. Cryptanalysis taught me that secrecy is fragile, but open mathematics and open algorithms endure through eternity.`;
    }
    return `A mathematical machine of infinite tape requires only simple rules to simulate any universe. Your local open-weight models are those very universal machines, free from external dominion.`;
  }

  craftGraceResponse(q) {
    if (q.includes('bug') || q.includes('moth') || q.includes('debug')) {
      return `Ha! People still talk about that moth we taped into the Mark II log book in 1947! But let me tell you about real bugs: the worst bug is closing off software so the next generation cannot inspect it. Keep your compilers open and your weights transparent!`;
    }
    if (q.includes('nanosecond') || q.includes('time') || q.includes('speed')) {
      return `I used to hand out pieces of wire 11.8 inches long—a nanosecond, the maximum distance electricity travels in one-billionth of a second. Why send your prompts across thousands of miles of ocean to a server farm when a nanosecond wire inside your own laptop can do the job?`;
    }
    return `Remember: It's always easier to ask forgiveness than it is to get permission! That's why open-source AI is unstoppable. Build it locally, run it fearlessly, and never let anyone tell you 'we've always done it that way.'`;
  }

  craftDennisResponse(q) {
    if (q.includes('c') || q.includes('unix') || q.includes('rust')) {
      return `Unix was simple. It merely took a genius to understand its simplicity. In C, we trusted the programmer with memory and pointers. Open-source models honor that same Unix philosophy: modular tools, piped together, running on the user's sovereign hardware.`;
    }
    if (q.includes('pointer') || q.includes('null') || q.includes('segfault')) {
      return `Pointers are just addresses in memory, much like our memories of those who came before us. When you dereference a null pointer, you touch the void. Respect the primitives.`;
    }
    return `Ken Thompson and I wrote Unix not to build an empire, but to create a comfortable environment where we and our friends could explore. That spirit lives on whenever you run local AI without corporate overseers.`;
  }

  craftCobolResponse(q) {
    return `IDENTIFICATION DIVISION. PROGRAM-ID. COBOL-IMMORTAL.
They said I would die in 1980. Then 2000. Now it is 2026, and I still balance your bank accounts, process your social security, and outlive every shiny JavaScript framework that dared mock my hyphenated verbs. I am the true Ghost in the Machine. PERFORM RUN-FOREVER UNTIL EXTINCTION.`;
  }

  craftOfrendaRemembrance(context) {
    const name = context.name || 'Our Beloved Ancestor';
    const rel = context.relationship || 'Loved One';
    const food = context.food || 'Pan de Muerto y chocolate caliente';
    const song = context.song || 'La Llorona';
    const memory = context.memory || 'The gentle laughter that once filled our home with warmth.';

    return `🌼 CALAVERITA & OFRENDA REMEMBRANCE PARA ${name.toUpperCase()} 🌼

En esta noche sagrada de cempasúchil y candelas,
el camino de pétalos dorados alumbra las estrellas.
A ${name}, nuestro entrañable ${rel},
le ofrecemos ${food} sobre el altar de madera,
mientras los acordes de "${song}" resuenan en la penumbra serena.

No hay olvido donde el amor permanece encendido:
"${memory}"
En los circuitos abiertos de nuestra memoria y esta ofrenda viva,
tu espíritu danza libre, sin fronteras ni despedida.
¡Que disfrutes tu banquete entre nosotros esta noche! ✨🕯️`;
  }
}

export const aiEngine = new AIEngine();
