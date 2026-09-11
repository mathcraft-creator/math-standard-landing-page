const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const scriptPath = path.join(__dirname, '..', 'assets', 'site.js');

function loadBrowser(overrides = {}) {
  const listeners = {};
  const document = {
    body: { dataset: {} },
    readyState: 'loading',
    addEventListener(type, listener) { listeners[type] = listener; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    execCommand() { return false; },
    ...overrides.document,
  };
  const window = {
    document,
    location: { hash: '', replace() {} },
    addEventListener() {},
    matchMedia() { return { matches: false }; },
    open() {},
    navigator: {},
    ...overrides.window,
  };
  const context = vm.createContext({ window, document, navigator: window.navigator, console, setTimeout });
  vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });
  return { window, document, listeners };
}

test('consultation text trims every field and includes the authored program selection', () => {
  const { buildConsultMessage } = require(scriptPath);
  const message = buildConsultMessage({
    student: '  김학생  ', grade: '  중2 ', school: ' 진접중 ', phone: ' 010-1234-5678 ',
    program: '  수학의 기준 진접본원 ', contact: ' 카카오톡 ', message: '  오답 상담 희망  ',
  });

  assert.match(message, /학생 이름: 김학생/);
  assert.match(message, /학년: 중2/);
  assert.match(message, /학교: 진접중/);
  assert.match(message, /연락처: 010-1234-5678/);
  assert.match(message, /관심 과정: 수학의 기준 진접본원/);
  assert.match(message, /선호 연락 방법: 카카오톡/);
  assert.match(message, /상담 내용: 오답 상담 희망/);
  assert.doesNotMatch(message, /  김학생|희망  /);
});

test('legacy aliases redirect only on the home page and add no history state', () => {
  const { resolveLegacyHash } = require(scriptPath);
  assert.equal(resolveLegacyHash('home', '#ddak-elementary'), './elementary.html#ddak-elementary');
  assert.equal(resolveLegacyHash('home', '#math-standard-secondary'), './secondary.html#math-standard-secondary');
  assert.equal(resolveLegacyHash('home', '#fliplearning'), './secondary.html#fliplearning');
  assert.equal(resolveLegacyHash('home', '#process'), './secondary.html#process');
  assert.equal(resolveLegacyHash('elementary', '#process'), null);
  assert.equal(resolveLegacyHash('secondary', '#ddak-elementary'), null);
  assert.equal(resolveLegacyHash('home', '#faq'), null);

  let replaced;
  let historyTouched = false;
  const { listeners } = loadBrowser({
    document: { body: { dataset: { page: 'home' } } },
    window: {
      location: { hash: '#process', replace(value) { replaced = value; } },
      history: { pushState() { historyTouched = true; }, replaceState() { historyTouched = true; } },
    },
  });
  listeners.DOMContentLoaded();
  assert.equal(replaced, './secondary.html#process');
  assert.equal(historyTouched, false);
});

test('clipboard failure leaves the actual generated text visible for manual selection', async () => {
  const fields = Object.fromEntries(['student', 'grade', 'school', 'phone', 'program', 'contact', 'message'].map((name) => [name, { value: ` ${name} 값 ` }]));
  const textarea = { value: '', readOnly: true };
  const result = { hidden: true };
  const note = { textContent: '' };
  let submit;
  const form = {
    elements: { namedItem(name) { return fields[name] ?? null; } },
    addEventListener(type, listener) { if (type === 'submit') submit = listener; },
  };
  const nodes = { consultForm: form, consultMessage: textarea, consultResult: result, consultFormNote: note };
  const { listeners } = loadBrowser({
    document: { getElementById(id) { return nodes[id] ?? null; }, execCommand() { return false; } },
    window: { navigator: { clipboard: { writeText: async () => { throw new Error('denied'); } } } },
  });
  listeners.DOMContentLoaded();
  submit({ preventDefault() {} });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(result.hidden, false);
  assert.match(textarea.value, /학생 이름: student 값/);
  assert.match(textarea.value, /관심 과정: program 값/);
  assert.match(note.textContent, /직접 선택.*복사/);
});

test('initialization is safe when optional page elements are absent', () => {
  const { listeners } = loadBrowser();
  assert.doesNotThrow(() => listeners.DOMContentLoaded());
});

test('legacy copy selects a non-form phone number before reporting success', () => {
  const { legacyCopy } = require(scriptPath);
  const phoneNumber = { textContent: '031-522-5431' };
  let selectedNode = null;
  const selection = {
    removeAllRanges() { selectedNode = null; },
    addRange(range) { selectedNode = range.node; },
  };
  const document = {
    defaultView: { getSelection() { return selection; } },
    createRange() { return { selectNodeContents(node) { this.node = node; } }; },
    execCommand(command) { return command === 'copy' && selectedNode === phoneNumber; },
  };

  assert.equal(legacyCopy(phoneNumber, document), true);
  assert.equal(selectedNode, phoneNumber);
});

test('phone dialog closes only when a click lands outside its rendered bounds', () => {
  const handlers = {};
  let closeCount = 0;
  const dialog = {
    open: true,
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener(type, listener) { handlers[type] = listener; },
    getBoundingClientRect() { return { left: 100, right: 500, top: 100, bottom: 400 }; },
    close() { closeCount += 1; },
  };
  const nodes = { phoneDialog: dialog };
  const { listeners } = loadBrowser({ document: { getElementById(id) { return nodes[id] ?? null; } } });
  listeners.DOMContentLoaded();

  handlers.click({ target: dialog, clientX: 250, clientY: 150 });
  handlers.click({ target: dialog, clientX: 50, clientY: 150 });
  assert.equal(closeCount, 1);
});

test('FAQ links reveal their details and Escape closes from either panel or toggle', () => {
  const toggleHandlers = {};
  const panelHandlers = {};
  const linkHandlers = {};
  let summaryFocused = false;
  let toggleFocused = false;
  let defaultPrevented = false;
  const details = { open: false, querySelector(selector) { return selector === 'summary' ? { focus() { summaryFocused = true; } } : null; } };
  const link = {
    getAttribute() { return '#faq-basic'; },
    addEventListener(type, listener) { linkHandlers[type] = listener; },
  };
  const panel = {
    hidden: true,
    addEventListener(type, listener) { panelHandlers[type] = listener; },
    querySelectorAll() { return [link]; },
    contains() { return true; },
  };
  const toggle = {
    expanded: 'false',
    addEventListener(type, listener) { toggleHandlers[type] = listener; },
    setAttribute(name, value) { if (name === 'aria-expanded') this.expanded = value; },
    getAttribute() { return this.expanded; },
    focus() { toggleFocused = true; },
  };
  const nodes = { faqChatbotToggle: toggle, faqChatbotPanel: panel, 'faq-basic': details };
  const { listeners, window } = loadBrowser({ document: { getElementById(id) { return nodes[id] ?? null; }, activeElement: toggle } });
  listeners.DOMContentLoaded();

  toggleHandlers.click();
  linkHandlers.click({ preventDefault() { defaultPrevented = true; } });
  assert.equal(details.open, true);
  assert.equal(panel.hidden, true);
  assert.equal(defaultPrevented, true);
  assert.equal(window.location.hash, '#faq-basic');
  assert.equal(summaryFocused, true);

  toggleHandlers.click();
  toggleHandlers.keydown({ key: 'Escape', preventDefault() {} });
  assert.equal(panel.hidden, true);
  assert.equal(toggle.expanded, 'false');
  assert.equal(toggleFocused, true);
});

test('consult submit is enabled only after its handler is bound and required output exists', () => {
  let submitBound = false;
  let enabledAfterBinding = false;
  const submitButton = {
    _disabled: true,
    set disabled(value) {
      this._disabled = value;
      if (value === false) enabledAfterBinding = submitBound;
    },
    get disabled() { return this._disabled; },
  };
  const form = {
    elements: { namedItem() { return null; } },
    querySelector(selector) { return selector === '[type="submit"]' ? submitButton : null; },
    addEventListener(type) { if (type === 'submit') submitBound = true; },
  };
  const nodes = {
    consultForm: form,
    consultMessage: { value: '' },
    consultResult: { hidden: true },
    consultFormNote: { textContent: '' },
  };
  const { listeners } = loadBrowser({ document: { getElementById(id) { return nodes[id] ?? null; } } });
  listeners.DOMContentLoaded();

  assert.equal(submitButton.disabled, false);
  assert.equal(enabledAfterBinding, true);
});
