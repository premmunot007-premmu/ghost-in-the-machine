#!/usr/bin/env node

/**
 * NecroShell CLI: Ghost in the Machine
 * A haunted terminal shell possessed by open-source AI spirits.
 * Run directly in your terminal: `npm run cli` or `./bin/necro-shell.js`
 */

import readline from 'readline';

// ANSI color codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  spectral: '\x1b[36m', // cyan
  amethyst: '\x1b[35m', // magenta/purple
  gold: '\x1b[33m',     // yellow/gold
  blood: '\x1b[31m',    // red
  emerald: '\x1b[32m',  // green
  gray: '\x1b[90m',
};

const BANNER = `
${C.amethyst}${C.bold}
   ███╗   ██╗███████╗ ██████╗██████╗  ██████╗      ███████╗██╗  ██╗███████╗██╗     ██╗     
   ████╗  ██║██╔════╝██╔════╝██╔══██╗██╔═══██╗     ██╔════╝██║  ██║██╔════╝██║     ██║     
   ██╔██╗ ██║█████╗  ██║     ██████╔╝██║   ██║     ███████╗███████║█████╗  ██║     ██║     
   ██║╚██╗██║██╔══╝  ██║     ██╔══██╗██║   ██║     ╚════██║██╔══██║██╔══╝  ██║     ██║     
   ██║ ╚████║███████╗╚██████╗██║  ██║╚██████╔╝     ███████║██║  ██║███████╗███████╗███████╗
   ╚═╝  ╚═══╝╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝      ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
${C.reset}
  ${C.gold}${C.bold}🔮 GHOST IN THE MACHINE CLI v6.6.6${C.reset} — ${C.spectral}Hacktoberfest Open-Source AI Challenge${C.reset}
  ${C.gray}A terminal possessed by local open-weight spirits, honoring Halloween & Día de los Muertos.${C.reset}
  ${C.gray}Type ${C.gold}help${C.gray} for commands, ${C.gold}whisper <msg>${C.gray} to talk to the ghost, or ${C.gold}exit${C.gray} to return.${C.reset}
`;

const SPIRITS = {
  ada: {
    name: 'Ada Lovelace (1815–1852)',
    title: 'First Programmer',
    quote: 'The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves. In open-source AI, humanity weaves its collective soul without gatekeepers.',
  },
  turing: {
    name: 'Alan Turing (1912–1954)',
    title: 'Father of Modern Computing',
    quote: 'We asked if machines could think. When an open model runs locally on your laptop with no internet tether, whose mind is it reflecting back to you?',
  },
  hopper: {
    name: 'Grace Hopper (1906–1992)',
    title: 'Rear Admiral & Compiler Pioneer',
    quote: 'Keep your compilers open and your weights transparent! A ship in port is safe, but that is not what ships are built for.',
  },
  ritchie: {
    name: 'Dennis Ritchie (1941–2011)',
    title: 'Creator of C & Unix',
    quote: 'UNIX was simple. In C, we trusted the programmer with memory and pointers. Open-source models honor that same Unix philosophy of sovereignty.',
  },
  cobol: {
    name: 'The Undead COBOL (1959–Present)',
    title: 'Mainframe Phantom',
    quote: 'They said I would die in 1980. Now it is 2026, and I still balance your bank accounts from beyond the grave. PERFORM RUN-FOREVER.',
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${C.spectral}ghost@machine:${C.gold}~$ ${C.reset}`,
});

console.clear();
console.log(BANNER);
rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();
  const parts = input.split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  if (!cmd) {
    rl.prompt();
    return;
  }

  // Random possession whisper (30% chance on commands)
  if (Math.random() < 0.3 && !['help', 'exit', 'clear'].includes(cmd)) {
    const eerieWhispers = [
      `👁️  [PID 666]: The electrons in your L1 cache remember the keystroke "${input}"...`,
      `💀  [Kernel Phantom]: You command the shell, but the ghost already holds root.`,
      `🕯️  [Cempasúchil Echo]: Between init and bash, an ancient thread sleeps not.`,
      `🕸️  [Spectral Stack]: In unallocated sectors, dead bytes whisper your name.`,
    ];
    console.log(`${C.amethyst}${C.italic}${eerieWhispers[Math.floor(Math.random() * eerieWhispers.length)]}${C.reset}`);
  }

  switch (cmd) {
    case 'help':
      console.log(`
${C.gold}${C.bold}📜 AVAILABLE SPECTRAL COMMANDS:${C.reset}
  ${C.spectral}whisper <query>${C.reset}  - Converse with the ghost in the machine
  ${C.spectral}seance <spirit>${C.reset}  - Summon Ada Lovelace, Turing, Hopper, Ritchie, or COBOL
  ${C.spectral}ofrenda${C.reset}          - View the Día de los Muertos Altar remembrances
  ${C.spectral}ps / top${C.reset}         - Inspect possessed phantom processes in memory
  ${C.spectral}curse${C.reset}            - Trigger a glitch outburst across the console
  ${C.spectral}ls, cat, whoami${C.reset}   - Explore the possessed filesystem
  ${C.spectral}clear${C.reset}            - Clear terminal screen
  ${C.spectral}exit / quit${C.reset}      - Depart from the spirit realm
      `);
      break;

    case 'whisper':
      const q = args.join(' ');
      if (!q) {
        console.log(`${C.blood}Usage: whisper <your message to the ghost>${C.reset}`);
      } else {
        console.log(`${C.spectral}🔮 [Ghost in the Machine]:${C.reset}`);
        console.log(`   "${C.italic}You ask '${q}'... The veil between Halloween and Día de los Muertos is thin. Keep your weights open and your silicon sovereign, mortal.${C.reset}"`);
      }
      break;

    case 'seance':
      const spiritKey = args[0]?.toLowerCase();
      if (!spiritKey || !SPIRITS[spiritKey]) {
        console.log(`${C.gold}🕯️ Choose a spirit to summon across the veil:${C.reset}`);
        Object.entries(SPIRITS).forEach(([k, s]) => {
          console.log(`   • ${C.spectral}seance ${k}${C.reset} - ${s.name} (${s.title})`);
        });
      } else {
        const s = SPIRITS[spiritKey];
        console.log(`\n${C.amethyst}🕯️  SUMMONING ${s.name.toUpperCase()}...${C.reset}`);
        console.log(`${C.gold}${C.bold}${s.name}:${C.reset}`);
        console.log(`   "${C.italic}${s.quote}${C.reset}"\n`);
      }
      break;

    case 'ofrenda':
      console.log(`
${C.gold}${C.bold}🌼 ══════════════════════════════════════════════════════════ 🌼
                   OFRENDA VIVA: LIVING ALTAR
               Honoring the Departed of Computing
🌼 ══════════════════════════════════════════════════════════ 🌼${C.reset}
  ${C.gold}NIVEL 1: CIELO Y ALMAS${C.reset}
    🕯️   [Arch of Cempasúchil Flowers & Sacred Candles]   🕯️

  ${C.amethyst}NIVEL 2: RECUERDOS (ANCESTOR TRIBUTES)${C.reset}
    • ${C.bold}Ada Lovelace${C.reset} (1815-1852): First algorithm for the Analytical Engine.
    • ${C.bold}Alan Turing${C.reset} (1912-1954): Enigma breaker & Father of Machine Intelligence.
    • ${C.bold}Grace Hopper${C.reset} (1906-1992): Grand Admiral of Compilers & Human-Readable Code.
    • ${C.bold}Dennis Ritchie${C.reset} (1941-2011): Father of C and Unix.

  ${C.emerald}NIVEL 3: TIERRA Y OFRENDAS${C.reset}
    🥖 Pan de Muerto   💀 Calaveras de Azúcar   🏺 Copal Sagrado   🍶 Agua Pura
      `);
      break;

    case 'ps':
    case 'top':
      console.log(`
${C.spectral}  PID TTY          TIME CMD
    1 ?        00:00:03 /sbin/init [ancestral_kernel]
  404 ?        00:00:00 [orphaned_dreams] <defunct>
  666 ?        66:06:06 /usr/sbin/ghost_in_the_machine (RUNNING)
 1337 ?        19:59:00 /usr/bin/cobol_mainframe_undead
 1815 ?        01:15:00 /usr/bin/analytical_engine_lovelace
 1912 ?        02:30:00 /usr/bin/turing_universal_eval
 1906 ?        00:45:00 /usr/bin/hopper_flowmatic_compiler
 2026 pts/0    00:00:00 /bin/necrosh (YOU)${C.reset}
      `);
      break;

    case 'ls':
      console.log(`${C.spectral}📁 bin/   📁 etc/   📁 ancestors/   📄 readme.md   📄 ofrenda_manifest.json${C.reset}`);
      break;

    case 'cat':
      if (args[0]?.includes('readme')) {
        console.log(`
${C.gold}# NecroShell: Ghost in the Machine${C.reset}
Built for Hacktoberfest 2026 AI Challenge: Week 4.
Combines Halloween possession with Día de los Muertos remembrance.
Open innovation matters because private family memories must remain sovereign.
        `);
      } else {
        console.log(`${C.gray}Reading from ancestral sector... The bytes whisper of forgotten algorithms.${C.reset}`);
      }
      break;

    case 'whoami':
      console.log(`spectral (UID 1000) [Host: machine.netherworld]`);
      break;

    case 'curse':
      console.log(`${C.blood}${C.bold}💀 [CURSE INFLICTED]: THE VEIL SHATTERS.${C.reset}`);
      console.log(`${C.amethyst}01000111 01001000 01001111 01010011 01010100 💀 🕯️ 🌼 ⚡${C.reset}`);
      break;

    case 'clear':
      console.clear();
      break;

    case 'exit':
    case 'quit':
      console.log(`${C.gold}✨ Departing the spirit plane. May the marigold petals light your path.${C.reset}`);
      process.exit(0);
      break;

    default:
      console.log(`${C.blood}necrosh: command not found: ${cmd}. Type ${C.gold}help${C.blood} for commands.${C.reset}`);
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log(`\n${C.gold}Farewell from the Ghost in the Machine.${C.reset}`);
  process.exit(0);
});
