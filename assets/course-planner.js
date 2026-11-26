(function () {
  'use strict';
  const scriptURL = document.currentScript.src;
  const dataURL = new URL('../data/curriculum/', scriptURL);
  const engine = window.CoursePlanner;
  const $ = selector => document.querySelector(selector);
  const isProjected = () => school?.status === 'projected';
  const creditLabel = value => value == null ? '학점 미확인' : value + '학점';
  const storageKey = 'som-course-planner-v1';
  let schoolIndex, catalog, mappings, rules, school, goalId = '', locks = {}, excludes = [], result = null, activePlan = 0;
  let worker = null, requestId = 0, schoolRequest = 0, autoTimer = null;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(text, action) {
    const node = element('button', text); node.type = 'button';
    if (action) node.addEventListener('click', action);
    return node;
  }
  function message(text, error) {
    $('#message').textContent = text;
    $('#message').classList.toggle('error', !!error);
  }
  async function readJSON(path) {
    const response = await fetch(new URL(path, dataURL));
    if (!response.ok) throw new Error('자료를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.');
    return response.json();
  }
  function input() {
    return { goalId, startTerm: Number($('#startTerm').value), mode: $('#mode').value,
      pastRequiredConfirmed: $('#pastConfirmed').checked, locks, excludes };
  }
  function stopWorker() { if (worker) worker.terminate(); worker = null; }
  function invalidate(note) {
    requestId++; stopWorker(); clearTimeout(autoTimer); autoTimer = null;
    result = null; $('#resultSection').hidden = true;
    $('#generate').disabled = !school || school.status === 'missing';
    $('#savePlan').disabled = !school || school.status === 'missing' || !goalId;
    if (note) message(note);
  }
  function targetName() { return goalId === 'explore' ? '전공 미정' : catalog.majors.find(m => m.id === goalId)?.name || ''; }
  function chooseGoal(id) {
    goalId = id;
    $('#chosenGoal').textContent = '선택한 목표 · ' + targetName();
    $('#goalOptions').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.goal === id)));
    invalidate('목표를 선택했습니다. 고정할 과목이 있다면 설정한 뒤 추천받기를 눌러 주세요.');
    renderCapture();
    if (isProjected()) message('목표를 선택했습니다. 수집 자료 기반 6학기 추정 추천을 만들 수 있습니다.');
  }
  function showGoalOptions() {
    const container = $('#goalOptions'); container.replaceChildren();
    const query = $('#goalQuery').value.trim();
    const matches = engine.findGoals(query, catalog, mappings);
    for (const goal of matches) {
      const b = button(goal.name, () => chooseGoal(goal.id)); b.dataset.goal = goal.id;
      b.setAttribute('aria-pressed', String(goal.id === goalId));
      b.append(element('small', goal.series + ' 계열')); container.append(b);
    }
    if (query && !matches.length) container.append(element('p', '연결할 학과를 찾지 못했습니다. 학과명으로 바꾸거나 전공 미정을 선택해 주세요.', 'field-note'));
  }
  function sourceDetails(offering) {
    const d = element('details', null, 'source'); d.append(element('summary', '근거 · 과목 설명'));
    const src = offering.source;
    d.append(element('p', src.workbook + ' / ' + src.sheet + '!' + src.range));
    d.append(element('p', (src.document || '') + ' · 확인 기록 ' + src.date));
    d.append(element('p', offering.status));
    if (offering.evidence) {
      const e = offering.evidence;
      d.append(element('p', `관측: ${e.observedYear}년 ${e.grade}학년 ${e.semester}학기 · ${e.firstDate}~${e.lastDate} · ${e.classCount}개 반. 추천 배치: ${offering.year}년(추정).`));
      if (e.curriculum === '2015-reference') d.append(element('p', '2015 교육과정 재학생 과목명 참고 · 2029년 개설·2022 개정 대체 과목 확인 필요', 'field-note'));
    }
    try {
      const url = new URL(src.url);
      if (url.protocol === 'https:' && (url.hostname.endsWith('.goegn.kr') || url.hostname === 'open.neis.go.kr')) {
        const a = element('a', offering.evidence ? '나이스 원본 조회 ↗' : '학교 원문 게시물 ↗'); a.href = url.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; d.append(a);
      }
    } catch (_) { /* Missing source remains visible as text, never a fabricated URL. */ }
    if (Number.isInteger(offering.subjectId)) {
      const subject = catalog.subjects.find(s => s.id === offering.subjectId);
      if (subject?.summary) d.append(element('p', subject.summary));
      const a = element('a', '탐색관에서 과목 자세히 보기 →');
      a.href = new URL('../index.html#s-' + offering.subjectId, location.href).href; d.append(element('br'), a);
    } else d.append(element('p', '기존 탐색관의 과목 설명과 연결되지 않았습니다. 학교의 원문 과목명은 그대로 표시합니다.'));
    const note = school.mathNotes.find(n => n.course === offering.name);
    if (note) d.append(element('p', '학습 순서 참고(해석): ' + note.note + ' · ' + note.range));
    return d;
  }

  async function loadSchool(id) {
    const current = ++schoolRequest;
    invalidate('학교 편성 자료를 불러오고 있습니다.');
    school = null;
    $('#schoolOverview').replaceChildren(element('div', '학교 편성 자료를 불러오고 있습니다.', 'skeleton'));
    $('#catalog').replaceChildren(); $('#catalogSection').hidden = true; $('#captureSection').hidden = true;
    $('#generate').disabled = true; $('#savePlan').disabled = true;
    const entry = schoolIndex.schools.find(s => s.id === id);
    if (!entry) throw new Error('지원되는 학교를 선택해 주세요.');
    let data;
    try { data = await readJSON(entry.cohorts[0].path); }
    catch (error) {
      if (current !== schoolRequest) return;
      $('#schoolOverview').replaceChildren(element('div', '학교 자료를 불러오지 못했습니다. 학교를 다시 선택하거나 페이지를 새로고침해 주세요.', 'notice'));
      throw error;
    }
    if (current !== schoolRequest) return;
    school = data; locks = {}; excludes = [];
    $('#startTerm').disabled = data.status === 'missing';
    $('#mode').disabled = data.status === 'missing';
    $('#pastOptions').hidden = data.status === 'missing' || $('#startTerm').value === '0';
    renderSchool(); renderCatalog(); renderCapture(); invalidate();
    message(isProjected() ? '광동고 수집 자료를 바탕으로 2027 입학생의 6학기 추정 추천을 제공합니다. 희망학과·진로를 선택해 주세요.' : data.status === 'missing' ? '이 입학연도의 편제표가 아직 없습니다.' : '학교 자료를 확인했습니다. 희망학과 또는 진로를 입력해 주세요.', data.status === 'missing');
  }
  function renderSchool() {
    const container = $('#schoolOverview'); container.replaceChildren();
    const card = element('div', null, 'school-summary');
    card.append(element('p', 'SCHOOL CURRICULUM · ' + school.entryYear, 'eyebrow'));
    const row = element('div', null, 'school-title-row');
    const title = element('h2', school.name + ' · 2027 입학생'); title.id = 'schoolTitle'; row.append(title);
    row.append(element('span', isProjected() ? '수집 자료 기반 · 6학기 추정 추천' : school.status === 'missing' ? '자료 미확보' : '6학기 편성 자료', 'badge' + (school.status !== 'planned' ? ' warn' : ''))); card.append(row);
    card.append(element('p', isProjected() ? school.notice + ' 3학년은 2015 교육과정 재학생 과목명 참고이며 2029년 개설·대체 과목 확인이 필요합니다.' : school.status === 'missing' ? '2027 입학생 편제표를 확보한 뒤 추천을 제공합니다.' : '우리 학교에서 선택할 수 있는 과목을 먼저 확인하고, 희망학과로 이어지는 조합을 살펴보세요.', 'section-copy'));
    const meta = element('div', null, 'school-meta');
    for (const text of ['자료 확인 기록 · ' + school.sourceDate, '대입 대상 · 일반적 진학 기준 2030학년도', '과목 개설 · 수강신청 결과에 따라 변동']) meta.append(element('span', text));
    card.append(meta); container.append(card);
    $('#catalogIntro').textContent = isProjected() ? '교과별 추천 구성은 서비스의 탐색 기준입니다. 학교의 필수·택N 조건이 아니며, 고정·제외로 관심 과목을 조정할 수 있습니다. 학점은 미확인입니다.' : '학교지정 과목은 자동 포함합니다. 선택 과목은 고정하거나 제외할 수 있습니다. 미확인된 반별 교차 배정은 학교에서 확인하세요.';
    $('#catalogSection').hidden = school.status === 'missing';
  }
  function renderCapture() {
    const section = $('#captureSection'); section.replaceChildren();
    const observations = school?.observations;
    section.hidden = !observations;
    if (!observations) return;
    const heading = element('div', null, 'section-heading');
    const titleBlock = element('div'); titleBlock.append(element('p', 'KWANGDONG · CAPTURE RECORD', 'eyebrow'));
    const title = element('h2', '광동고 캡처에서 확인한 과목'); title.id = 'captureTitle'; titleBlock.append(title); heading.append(titleBlock); section.append(heading);
    const note = element('div', null, 'notice');
    note.append(element('p', `네이버 개설 과목 · ${observations.provider} · 사용자 제공 캡처 수령 ${observations.receivedDate}`));
    note.append(element('p', observations.yearNotice));
    if (observations.verification) note.append(element('p', observations.verification));
    note.append(element('p', '학점·필수/선택·선택군은 화면에 표시되지 않았습니다. 연한 글씨로 보인 과목도 제외하지 않았으며, 그 표시만으로 미개설을 뜻한다고 해석하지 않습니다.'));
    note.append(element('p', '정확한 내용은 입학 후 학교에 개설된 과목과 안내를 반드시 확인해 주세요.'));
    section.append(note);
    const major = catalog.majors.find(m => m.id === goalId);
    const related = new Set(major?.subjects.map(s => s.key) || []);
    section.append(element('p', major ? `${major.name} 안내와 연결되는 과목을 ‘학과 연계 참고’로 표시했습니다. 대학 권장과목·우선 수강 판정은 아닙니다.` : '왼쪽에서 희망학과를 선택하면 캡처 과목 중 학과 안내와 연결되는 항목을 확인할 수 있습니다.', 'section-copy'));
    const grid = element('div', null, 'capture-grid');
    for (let term = 0; term < 4; term++) {
      const rows = observations.offerings.filter(o => (o.grade - 1) * 2 + o.semester - 1 === term);
      const card = element('article', null, 'term-card capture-card');
      const head = element('div', null, 'term-header'); head.append(element('h3', engine.termLabel(term)), element('span', rows.length + '개 표시')); card.append(head);
      const body = element('div', null, 'term-body');
      for (const category of new Set(rows.map(o => o.category))) {
        const row = element('div', null, 'capture-category'); row.append(element('h4', category));
        const chips = element('div', null, 'capture-chips');
        for (const o of rows.filter(o => o.category === category)) {
          const item = element('span', null, 'capture-chip' + (related.has(o.key) ? ' is-related' : ''));
          item.append(element('b', o.name));
          if (related.has(o.key)) item.append(element('small', '학과 연계 참고'));
          if (o.mutedInCapture) item.append(element('small', '캡처에서 연한 표시'));
          chips.append(item);
        }
        row.append(chips); body.append(row);
      }
      const source = rows[0]?.source;
      if (source) body.append(element('p', `캡처 ${rows[0].image}번 · 엑셀 ${source.sheet}!${source.range.split(':')[0]}부터 · 학점/선택 조건 미확인`, 'field-note'));
      card.append(body); grid.append(card);
    }
    section.append(grid);
  }
  function renderCatalog() {
    const container = $('#catalog'); container.replaceChildren();
    if (!school || school.status === 'missing') return;
    const start = Number($('#startTerm').value);
    for (let t = 0; t < 6; t++) {
      const term = element('details', null, 'catalog-term'); term.open = t === start;
      const summary = element('summary', engine.termLabel(t));
      summary.append(element('small', `${2027 + Math.floor(t / 2)}년 · ${isProjected() ? '추정 배치 · 학점 미확인' : creditLabel(school.expectedTermCredits[t]) + ' 기준'}`)); term.append(summary);
      const body = element('div', null, 'catalog-content');
      if (t < start) body.append(element('p', '이전 학기입니다. 실제로 이수한 선택 과목만 고정하세요. 미입력 선택 과목은 추천으로 채우지 않습니다.', 'field-note'));
      const required = school.offerings.filter(o => o.term === t && o.kind === 'required');
      if (required.length) body.append(element('h3', '학교지정 과목', 'group-title'));
      for (const o of required) body.append(catalogCourse(o));
      for (const group of school.groups.filter(g => g.term === t)) {
        const groupBox = element('div', null, 'group-box'); groupBox.id = 'catalog-' + group.id;
        groupBox.append(element('h3', group.name, 'group-title'));
        groupBox.append(element('p', group.condition + ' · 고정 ' + (locks[group.id] || []).length + '/' + group.choose, 'group-condition'));
        if (group.kind === 'cross') groupBox.append(element('p', '반별 교차 편성 추정: 두 과목을 한 번씩 배치합니다. 실제 학기 배정은 학교에서 확인하세요.', 'field-note'));
        for (const id of group.offerings) groupBox.append(catalogCourse(school.offerings.find(o => o.id === id)));
        body.append(groupBox);
      }
      term.append(body); container.append(term);
    }
  }
  function catalogCourse(o) {
    const fixed = (locks[o.groupId] || []).includes(o.id), excluded = excludes.includes(o.id);
    const node = element('div', null, 'catalog-course' + (fixed ? ' is-fixed' : '') + (excluded ? ' is-excluded' : ''));
    const header = element('div', null, 'catalog-course-head'); header.append(element('b', o.name), element('span', creditLabel(o.credits), 'course-meta')); node.append(header);
    node.append(element('p', o.category + ' · ' + o.type + ' · ' + (isProjected() ? '추정 추천 후보' : o.kind === 'required' ? '학교지정' : o.kind === 'cross' ? '교차 편성' : '학생 선택'), 'course-meta'));
    if (o.kind !== 'required') {
      const controls = element('div', null, 'course-options');
      for (const [kind, text, checked] of [['lock', '고정', fixed], ['exclude', '제외', excluded]]) {
        const label = element('label'), box = element('input'); box.type = 'checkbox'; box.checked = checked;
        box.dataset.option = kind; box.dataset.course = o.id; box.setAttribute('aria-label', `${engine.termLabel(o.term)} ${o.name} ${text}`);
        label.append(box, document.createTextNode(text)); controls.append(label);
      }
      node.append(controls);
    }
    node.append(sourceDetails(o)); return node;
  }
  function updateCourse(event) {
    const field = event.target;
    if (!field.dataset.course) return;
    const offering = school.offerings.find(o => o.id === field.dataset.course);
    if (!offering || offering.kind === 'required') return;
    const hadResult = result?.status === 'ok' || autoTimer != null;
    let ids = locks[offering.groupId] || [];
    if (field.dataset.option === 'lock') {
      ids = field.checked ? [...new Set(ids.concat(offering.id))] : ids.filter(id => id !== offering.id);
      if (field.checked) excludes = excludes.filter(id => id !== offering.id);
    } else {
      excludes = field.checked ? [...new Set(excludes.concat(offering.id))] : excludes.filter(id => id !== offering.id);
      if (field.checked) ids = ids.filter(id => id !== offering.id);
    }
    locks[offering.groupId] = ids;
    // Keep the open term and focus after updating status without replacing checkboxes.
    const row = field.closest('.catalog-course');
    row.classList.toggle('is-fixed', ids.includes(offering.id)); row.classList.toggle('is-excluded', excludes.includes(offering.id));
    row.querySelector('[data-option=lock]').checked = ids.includes(offering.id);
    row.querySelector('[data-option=exclude]').checked = excludes.includes(offering.id);
    const group = school.groups.find(g => g.id === offering.groupId);
    row.closest('.group-box').querySelector('.group-condition').textContent = group.condition + ' · 고정 ' + ids.length + '/' + group.choose;
    invalidate('과목 선택을 반영했습니다. 추천받기를 누르면 전체 학기 조건을 다시 확인합니다.');
    if (hadResult) autoTimer = setTimeout(() => generate(false), 350);
  }

  function generate(scroll) {
    if (!school || school.status === 'missing') return;
    clearTimeout(autoTimer); autoTimer = null;
    const checked = engine.normalizeInput(school, input());
    if (checked.errors.length) { invalidate(); message(checked.errors.join(' '), true); return; }
    if (!goalId) { message('희망학과 후보를 선택하거나 전공 미정을 선택해 주세요.', true); $('#goalQuery').focus(); return; }
    stopWorker(); const current = ++requestId;
    $('#resultSection').hidden = true; $('#generate').disabled = true; message(isProjected() ? '수집 과목과 목표를 연결해 6학기 추정 추천을 구성하고 있습니다…' : '선택군과 전체 학기 조건을 확인하고 있습니다…');
    const finish = output => {
      if (current !== requestId) return;
      stopWorker(); $('#generate').disabled = false;
      result = output; activePlan = 0;
      if (output.status !== 'ok') { message(output.errors.join(' '), true); return; }
      renderResult();
      message('추천안을 만들었습니다. 과목별 추천 이유와 확인 사항을 함께 살펴보세요.');
      if (scroll) { $('#resultSection').focus({ preventScroll: true }); $('#resultSection').scrollIntoView({ behavior: 'auto', block: 'start' }); }
    };
    try {
      if (!window.Worker) throw new Error('worker unavailable');
      worker = new Worker(new URL('./course-planner-worker.js', scriptURL));
      worker.onmessage = event => { if (event.data.requestId === current) finish(event.data.result); };
      worker.onerror = () => { if (current === requestId) { stopWorker(); $('#generate').disabled = false; message('계산 도구를 불러오지 못했습니다. 페이지를 다시 열어 주세요.', true); } };
      worker.postMessage({ requestId: current, school, catalog, rules, input: input() });
    } catch (_) { setTimeout(() => { try { finish(engine.recommend(school, catalog, rules, input(), { maxMs: 1000 })); } catch (_) { $('#generate').disabled = false; message('계획 계산을 완료하지 못했습니다. 페이지를 다시 열어 주세요.', true); } }, 0); }
  }
  function renderResult() {
    const plan = result.plans[activePlan]; if (!plan) return;
    $('#resultSection').hidden = false; $('#manualCopy').hidden = true;
    $('#resultSummary').textContent = `${school.name} · 2027 입학생 · ${result.goalName} · ${isProjected() ? '수집 자료 기반 6학기 추정 추천 · 학점·학교 선택 조건 미확인' : plan.incomplete ? '이전 이수 기록 추가 확인 필요' : '입력한 선택 조건을 확인한 참고안'} · 학교 최종 수강신청 결과는 아닙니다.`;
    const alternatives = $('#alternatives'); alternatives.replaceChildren();
    result.plans.forEach((p, i) => {
      const b = button((i + 1) + '안' + (i === 0 ? ' · 먼저 살펴보기' : ' · 다른 조합'), () => { activePlan = i; renderResult(); });
      b.setAttribute('aria-pressed', String(i === activePlan)); alternatives.append(b);
    });
    const warnings = $('#planWarnings'); warnings.replaceChildren();
    warnings.append(element('b', '이 계획과 함께 확인해 주세요'));
    const list = element('ul'); for (const text of plan.warnings) list.append(element('li', text));
    list.append(element('li', '제한된 조합 탐색의 참고안입니다. 최적 조합·졸업요건·합격 가능성을 판정하지 않습니다.')); warnings.append(list);
    const terms = $('#planTerms'); terms.replaceChildren();
    for (let t = 0; t < 6; t++) {
      const card = element('article', null, 'term-card'), head = element('div', null, 'term-header');
      head.append(element('h3', engine.termLabel(t)), element('span', creditLabel(plan.credits[t]))); card.append(head);
      const body = element('div', null, 'term-body');
      if (isProjected()) body.append(element('p', t >= 4 ? '2029년 추정 · 2015 교육과정 재학생 과목명 참고 · 대체 과목 확인 필요' : `${2027 + Math.floor(t / 2)}년 추정 · 2026 동일 학년·학기 관측 근거`, 'field-note'));
      if (t < result.input.startTerm) body.append(element('p', '이전 학기: 편성상 지정 과목과 입력된 이수 과목을 표시합니다. 실제 이수 확인은 별도입니다.', 'field-note'));
      if (!isProjected()) body.append(element('h4', '학교지정 과목'));
      const tags = element('div', null, 'required-tags');
      for (const o of school.offerings.filter(o => o.term === t && o.kind === 'required')) tags.append(element('span', o.name + ' ' + o.credits)); body.append(tags);
      for (const group of school.groups.filter(g => g.term === t)) {
        body.append(element('h4', group.name + ' · ' + group.choose + (isProjected() ? '과목 추천' : '과목 선택')));
        const chosen = group.offerings.filter(id => plan.selectedIds.includes(id));
        if (chosen.length < group.choose) body.append(element('p', '이전 이수 기록 미입력 · 나머지 ' + (group.choose - chosen.length) + '과목 확인 필요', 'field-note'));
        for (const id of chosen) {
          const o = school.offerings.find(o => o.id === id), node = element('div', null, 'plan-course');
          node.append(element('b', o.name + ' · ' + creditLabel(o.credits)), element('p', plan.reasons[id]), sourceDetails(o)); body.append(node);
        }
        if (t >= result.input.startTerm) {
          const change = button(isProjected() ? '이 추천 구성 조정하기' : '이 선택군 조정하기', () => {
            const target = document.getElementById('catalog-' + group.id); target.closest('details').open = true;
            target.scrollIntoView({ behavior: 'auto', block: 'start' }); target.querySelector('input')?.focus({ preventScroll: true });
          }); change.className = 'text-button'; body.append(change);
        }
      }
      card.append(body); terms.append(card);
    }
    const coverage = $('#coverage'); coverage.replaceChildren();
    if (goalId !== 'explore') {
      const box = element('div', null, 'coverage-box'); box.append(element('h3', '희망학과 관련 과목 살펴보기'));
      box.append(element('p', '계획에 담긴 관련 과목 · ' + (plan.covered.map(s => s.name).join(', ') || '해당 없음')));
      box.append(element('p', '학교 후보에 있으나 이번 안에 없는 과목 · ' + (plan.omitted.map(s => s.name).join(', ') || '해당 없음')));
      box.append(element('p', (isProjected() ? '이번 수집 후보에서 확인되지 않은 과목 · ' : '이 학교·입학연도 자료에 없는 과목 · ') + (plan.unavailable.map(s => s.name).join(', ') || '해당 없음')));
      box.append(element('p', '마지막 항목은 이 편제표에서 찾지 못했다는 뜻입니다. 공동교육과정 개설 여부나 과목의 동등성을 판정하지 않습니다.', 'field-note')); coverage.append(box);
    }
  }
  function planText() {
    const plan = result?.plans[activePlan]; if (!plan) return '';
    return [`[수학의 기준 · 6학기 과목 선택 참고안]`, `${school.name} / 2027 입학생 / 목표: ${result.goalName}`,
      `자료 확인 기록 ${school.sourceDate} · ${isProjected() ? '수집 자료 기반 추정 추천 · 학교 선택 조건 미확인' : '편성 계획이며 실제 개설·반별 배정 확인 필요'}`,
      ...Array.from({ length: 6 }, (_, t) => engine.termLabel(t) + ': ' + plan.selectedIds.map(id => school.offerings.find(o => o.id === id)).filter(o => o.term === t).map(o => o.name + '(' + creditLabel(o.credits) + ')').join(', ') + ' / ' + creditLabel(plan.credits[t])),
      ...plan.warnings, '2030학년도 대학 요건·졸업요건·합격 가능성을 판정하지 않습니다.'].join('\n');
  }
  async function copyPlan() {
    const text = planText(); if (!text) return;
    try { await navigator.clipboard.writeText(text); message('계획 문장을 복사했습니다. 자동 접수나 전송은 하지 않습니다.'); }
    catch (_) { $('#manualCopy').hidden = false; $('#copyText').value = text; $('#copyText').focus(); $('#copyText').select(); message('자동 복사가 되지 않았습니다. 표시된 문장을 직접 복사해 주세요.'); }
  }
  function savePlan() {
    const checked = engine.normalizeInput(school, input());
    if (checked.errors.length || !goalId) { message('입력 조건을 먼저 확인해 주세요.', true); return; }
    try {
      localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 1, schoolId: school.id, entryYear: school.entryYear, version: school.version, input: checked.value }));
      message('학교·목표·고정/제외 입력을 이 브라우저에 저장했습니다. 추천 결과는 불러올 때 다시 계산합니다.');
    } catch (_) { message('브라우저 저장을 사용할 수 없습니다. 추천안은 인쇄하거나 복사할 수 있습니다.', true); }
  }
  async function restorePlan() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) { message('이 브라우저에 저장된 입력이 없습니다.'); return; }
      if (raw.length > 100000) throw new Error('저장 데이터가 너무 큽니다.');
      const saved = JSON.parse(raw);
      if (!saved || !schoolIndex.schools.some(s => s.id === saved.schoolId)) throw new Error('저장된 학교 정보를 확인할 수 없습니다.');
      $('#school').value = saved.schoolId; await loadSchool(saved.schoolId);
      const checked = engine.validateSaved(saved, school, catalog);
      if (checked.errors.length) { message(checked.errors.join(' '), true); return; }
      const state = checked.value; locks = state.locks; excludes = state.excludes; goalId = state.goalId;
      $('#startTerm').value = state.startTerm; $('#mode').value = state.mode; $('#pastConfirmed').checked = state.pastRequiredConfirmed;
      $('#pastOptions').hidden = state.startTerm === 0; $('#goalQuery').value = goalId === 'explore' ? '' : targetName();
      showGoalOptions(); $('#chosenGoal').textContent = '선택한 목표 · ' + targetName(); renderCatalog(); invalidate(); generate(false);
    } catch (_) { message('저장된 입력을 읽지 못했습니다. 현재 자료로 다시 선택해 주세요.', true); }
  }
  async function init() {
    if (location.protocol === 'file:') { message('이 도구는 로컬 HTTP 서버에서 열어 주세요. README의 실행 방법을 확인할 수 있습니다.', true); return; }
    try {
      [schoolIndex, catalog, mappings, rules] = await Promise.all(['schools.json', 'subjects.json', 'career-mappings.json', 'rules.json'].map(readJSON));
      $('#school').replaceChildren();
      for (const entry of schoolIndex.schools) { const o = element('option', entry.name); o.value = entry.id; $('#school').append(o); }
      $('#school').disabled = false;
      await loadSchool($('#school').value);
      $('#school').addEventListener('change', () => loadSchool($('#school').value).catch(() => message('학교 편성 자료를 불러오지 못했습니다. 학교를 다시 선택하거나 새로고침해 주세요.', true)));
      $('#planForm').addEventListener('submit', event => { event.preventDefault(); generate(true); });
      $('#goalQuery').addEventListener('input', () => { goalId = ''; $('#chosenGoal').textContent = '후보에서 목표 학과를 선택해 주세요.'; invalidate(); showGoalOptions(); renderCapture(); });
      $('#exploreGoal').addEventListener('click', () => chooseGoal('explore'));
      $('#mode').addEventListener('change', () => invalidate('추천 방식이 바뀌었습니다. 다시 추천받기를 눌러 주세요.'));
      $('#startTerm').addEventListener('change', () => { $('#pastOptions').hidden = $('#startTerm').value === '0'; invalidate('시작 학기가 바뀌었습니다. 이전 이수 기록을 확인해 주세요.'); renderCatalog(); });
      $('#pastConfirmed').addEventListener('change', () => invalidate('이수 확인 입력이 바뀌었습니다. 다시 추천받기를 눌러 주세요.'));
      $('#catalog').addEventListener('change', updateCourse);
      $('#savePlan').addEventListener('click', savePlan); $('#restorePlan').addEventListener('click', restorePlan);
      $('#resetPlan').addEventListener('click', () => { locks = {}; excludes = []; invalidate('고정·제외 과목을 초기화했습니다.'); renderCatalog(); });
      $('#copyPlan').addEventListener('click', copyPlan); $('#printPlan').addEventListener('click', () => window.print());
      window.addEventListener('beforeunload', stopWorker);
    } catch (error) { message(error.message, true); $('#schoolOverview').replaceChildren(element('div', '자료를 불러오지 못했습니다. 페이지를 새로고침해 주세요.', 'notice')); }
  }
  init();
})();
