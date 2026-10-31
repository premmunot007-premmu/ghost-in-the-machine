import test from 'node:test';
import assert from 'node:assert';
import { aiEngine, SPIRIT_PERSONAS, AI_PROVIDERS } from '../src/ai/engine.js';

test('AI Engine has correct default provider and available providers', () => {
  assert.strictEqual(aiEngine.activeProvider, AI_PROVIDERS.SPECTRAL);
  assert.strictEqual(Object.keys(AI_PROVIDERS).length, 3);
});

test('Spirit personas are loaded with biographical metadata', () => {
  assert.ok(SPIRIT_PERSONAS.ADA_LOVELACE);
  assert.ok(SPIRIT_PERSONAS.ALAN_TURING);
  assert.ok(SPIRIT_PERSONAS.GRACE_HOPPER);
  assert.ok(SPIRIT_PERSONAS.DENNIS_RITCHIE);
  assert.ok(SPIRIT_PERSONAS.COBOL_SPIRIT);
  assert.ok(SPIRIT_PERSONAS.OFRENDA_BARD);

  assert.strictEqual(SPIRIT_PERSONAS.ADA_LOVELACE.name, 'Ada Lovelace');
  assert.match(SPIRIT_PERSONAS.ADA_LOVELACE.title, /1815–1852/);
  assert.match(SPIRIT_PERSONAS.GRACE_HOPPER.name, /Grace Hopper/);
});

test('Spectral engine generates context-aware haunted shell response', async () => {
  const resLs = await aiEngine.generate({
    prompt: 'ls -la',
    persona: 'haunted_shell',
    context: { target: '/ancestors' },
  });
  assert.ok(resLs && resLs.length > 10);
  assert.match(resLs, /inode|whispers|shadows|PID 666|files/i);
});

test('Spectral engine channels Ada Lovelace regarding poetry and computing', async () => {
  const reply = await aiEngine.generate({
    prompt: 'What do you think of computing and poetry?',
    persona: 'ada_lovelace',
  });
  assert.ok(reply);
  assert.match(reply, /Analytical Engine|algebraic|Jacquard|poet/i);
});

test('Spectral engine channels Grace Hopper regarding compilers and bugs', async () => {
  const reply = await aiEngine.generate({
    prompt: 'Tell us about finding that moth in the computer!',
    persona: 'grace_hopper',
  });
  assert.ok(reply);
  assert.match(reply, /Mark II|moth|compiler|weights/i);
});

test('Spectral engine composes Día de los Muertos calaverita with custom offerings', async () => {
  const calaverita = await aiEngine.generate({
    prompt: 'Compose remembrance',
    persona: 'ofrenda_bard',
    context: {
      name: 'Abuela Rosa',
      relationship: 'Beloved Grandmother',
      food: 'Tamales de dulce y atole',
      song: 'Amor Eterno',
      memory: 'Singing softly in the morning kitchen.',
    },
  });
  assert.ok(calaverita);
  assert.match(calaverita, /CALAVERITA/);
  assert.match(calaverita, /ABUELA ROSA/);
  assert.match(calaverita, /Tamales de dulce/);
});
