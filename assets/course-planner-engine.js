(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CoursePlanner = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  const norm = text => String(text || '').replace(/[\s·ㆍ･•]/g, '').replace(/Ⅱ/g, '2').replace(/Ⅰ/g, '1').toLowerCase();
  const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  const termLabel = t => `${Math.floor(t / 2) + 1}학년 ${t % 2 + 1}학기`;
  const unique = values => [...new Set(values)];

  function findGoals(query, catalog, mappings) {
    const key = norm(query).slice(0, 100);
    if (!key) return [];
    const alias = Object.entries(mappings.aliases).find(([word]) => norm(word) === key)?.[1] || [];
    return catalog.majors.map(goal => {
      let rank = alias.includes(goal.name) ? 0 : norm(goal.name) === key ? 0 : norm(goal.name).includes(key) ? 1
        : goal.aliases.some(a => norm(a).includes(key)) ? 2 : norm(goal.career).includes(key) ? 3 : 9;
      return { goal, rank };
    }).filter(x => x.rank < 9).sort((a, b) => a.rank - b.rank || compare(a.goal.name, b.goal.name)).slice(0, 8).map(x => x.goal);
  }

  function normalizeInput(school, input) {
    const errors = [];
    if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: ['입력 형식을 확인해 주세요.'] };
    const startTerm = input.startTerm == null ? 0 : input.startTerm;
    if (!Number.isInteger(startTerm) || startTerm < 0 || startTerm > 5) errors.push('계획 시작 학기가 올바르지 않습니다.');
    const locks = Object.create(null);
    if (input.locks != null && (typeof input.locks !== 'object' || Array.isArray(input.locks))) errors.push('고정 과목 입력을 확인해 주세요.');
    else for (const [id, values] of Object.entries(input.locks || {})) {
      const group = school.groups.find(g => g.id === id);
      if (!group || !Array.isArray(values) || values.some(v => typeof v !== 'string' || !group.offerings.includes(v))) {
        errors.push('현재 편성 자료에 없는 고정 과목이 있습니다.'); continue;
      }
      locks[id] = unique(values);
      if (locks[id].length > group.choose) errors.push(`${group.name}: ${group.choose}과목만 선택할 수 있습니다.`);
    }
    const excludes = Array.isArray(input.excludes) ? unique(input.excludes) : [];
    if (input.excludes != null && !Array.isArray(input.excludes)) errors.push('제외 과목 입력을 확인해 주세요.');
    if (excludes.some(id => typeof id !== 'string' || !school.offerings.some(o => o.id === id))) errors.push('현재 편성 자료에 없는 제외 과목이 있습니다.');
    for (const o of school.offerings) if (o.kind === 'required' && excludes.includes(o.id)) errors.push(`${o.name}: 학교지정 과목은 제외할 수 없습니다.`);
    for (const ids of Object.values(locks)) if (ids.some(id => excludes.includes(id))) errors.push('같은 과목을 고정과 제외에 동시에 넣을 수 없습니다.');
    return { errors: unique(errors), value: { startTerm, locks, excludes, mode: input.mode === 'balanced' ? 'balanced' : 'major',
      goalId: typeof input.goalId === 'string' ? input.goalId : '', pastRequiredConfirmed: input.pastRequiredConfirmed === true } };
  }

  function validatePlan(school, selectedIds, input) {
    const errors = [], ids = new Set(selectedIds), seen = new Set();
    const byId = new Map(school.offerings.map(o => [o.id, o]));
    if (ids.size !== selectedIds.length) errors.push('과목 편성 행이 중복되었습니다.');
    for (const id of ids) {
      const o = byId.get(id);
      if (!o) { errors.push('편제표에 없는 과목입니다.'); continue; }
      if (input.excludes.includes(id)) errors.push(`${o.name}: 제외한 과목입니다.`);
      const identity = school.status === 'projected' ? o.key + '@' + o.term : o.key;
      if (seen.has(identity)) errors.push(`${o.name}: 중복 선택되었습니다.`);
      seen.add(identity);
    }
    for (const o of school.offerings) if (o.kind === 'required' && !ids.has(o.id)) errors.push(`${o.name}: 학교지정 과목이 빠졌습니다.`);
    for (const g of school.groups) {
      const count = g.offerings.filter(id => ids.has(id)).length;
      // Missing past selections remain explicitly incomplete, never backfilled.
      const incompletePast = g.term < input.startTerm && (input.locks[g.id] || []).length < g.choose;
      if (!incompletePast && count !== g.choose) errors.push(`${g.name}: ${g.choose}과목이 필요합니다.`);
      for (const id of input.locks[g.id] || []) if (!ids.has(id)) errors.push(`${g.name}: 고정 과목이 빠졌습니다.`);
    }
    const credits = school.status === 'projected' ? Array(6).fill(null) : Array.from({ length: 6 }, (_, t) => [...ids].reduce((n, id) => n + (byId.get(id)?.term === t ? byId.get(id).credits : 0), 0));
    if (school.status !== 'projected') for (let t = input.startTerm; t < 6; t++) if (credits[t] !== school.expectedTermCredits[t]) errors.push(`${termLabel(t)}: 학점이 편성 기준과 다릅니다.`);
    return { errors: unique(errors), credits };
  }

  function combinations(items, count, fixed) {
    const result = [], rest = items.filter(o => !fixed.includes(o.id));
    const need = count - fixed.length;
    if (need < 0) return [];
    function walk(index, current) {
      if (current.length === need) { result.push(fixed.concat(current)); return; }
      for (let i = index; i <= rest.length - (need - current.length); i++) walk(i + 1, current.concat(rest[i].id));
    }
    walk(0, []); return result;
  }

  function recommend(school, catalog, rules, rawInput, settings) {
    if (school.status === 'missing') return { status: 'missing', plans: [], errors: ['이 입학연도의 편제표가 아직 없습니다. 다른 연도 자료로 대신 추천하지 않습니다.'] };
    const checked = normalizeInput(school, rawInput);
    if (checked.errors.length) return { status: 'invalid', plans: [], errors: checked.errors };
    const input = checked.value;
    const projected = school.status === 'projected';
    const identity = o => projected ? o.key + '@' + o.term : o.key;
    const goal = input.goalId === 'explore' ? { id: 'explore', name: '전공 미정', subjects: [] } : catalog.majors.find(m => m.id === input.goalId);
    if (!goal) return { status: 'invalid', plans: [], errors: ['희망학과 후보를 선택하거나 전공 미정을 선택해 주세요.'] };
    const started = Date.now(), maxMs = settings?.maxMs ?? 5000, width = settings?.beamWidth ?? 48;
    const byId = new Map(school.offerings.map(o => [o.id, o]));
    const linked = new Map(goal.subjects.map(s => [s.key, s]));
    // Similar names influence provisional exploration only, never subject equivalence.
    const similar = o => projected && goal.subjects.some(s => o.key.replace(/[12]$/, '') === s.key.replace(/[12]$/, ''));
    const required = school.offerings.filter(o => o.kind === 'required');
    const requiredKeys = new Set(required.map(o => o.key));
    const value = id => {
      const o = byId.get(id), link = linked.get(o.key);
      return link ? (link.type === '진로 선택' ? 12 : 10) : similar(o) ? 6 : 0;
    };
    const missingPast = school.groups.filter(g => g.term < input.startTerm && (input.locks[g.id] || []).length < g.choose);
    let truncated = false, timedOut = false;
    const decisions = [];
    // Candidate sets for each decision are then combined across all six terms.
    for (const group of [...school.groups].sort((a, b) => a.term - b.term || compare(a.id, b.id))) {
      const fixed = input.locks[group.id] || [];
      const candidates = group.offerings.map(id => byId.get(id)).filter(o => !input.excludes.includes(o.id) && !requiredKeys.has(o.key));
      if (fixed.some(id => !candidates.some(o => o.id === id))) return { status: 'invalid', plans: [], errors: [`${group.name}: 학교지정 과목과 중복되거나 제외된 고정 과목입니다.`] };
      let options = missingPast.includes(group) ? [fixed] : combinations(candidates, group.choose, fixed);
      if (!options.length) return { status: 'invalid', plans: [], errors: [`${group.name}: ${group.choose}과목을 선택할 후보가 부족합니다. 고정·제외를 조정해 주세요.`] };
      options.sort((a, b) => b.reduce((n, id) => n + value(id), 0) - a.reduce((n, id) => n + value(id), 0) || compare(a.join('|'), b.join('|')));
      if (options.length > 640) { options = options.slice(0, 640); truncated = true; }
      decisions.push({ group, options });
    }
    let beam = [{ ids: required.map(o => o.id), keys: new Set(requiredKeys), score: required.reduce((n, o) => n + value(o.id), 0) }];
    for (const { group, options } of decisions) {
      // Keep only small candidate descriptors; don't clone a full Set for every
      // discarded combination. Materialize state after pruning the beam.
      let pool = [], threshold = null, count = 0;
      const order = (a, b) => b.score - a.score || compare(a.signature, b.signature);
      const prepared = options.map(ids => ({ ids, keys: ids.map(id => identity(byId.get(id))),
        score: ids.reduce((n, id) => n + value(id), 0) + (input.mode === 'balanced' ? new Set(ids.map(id => byId.get(id).category)).size * 1.5 : 0) }));
      for (const state of beam) for (const option of prepared) {
        if (option.keys.some(key => state.keys.has(key))) continue;
        count++;
        const score = state.score + option.score;
        if (threshold && score < threshold.score) continue;
        const signature = state.ids.join('|') + '|' + option.ids.join('|');
        if (threshold && score === threshold.score && compare(signature, threshold.signature) >= 0) continue;
        pool.push({ state, option, score, signature });
        if (pool.length >= width * 4) { pool.sort(order); pool = pool.slice(0, width); threshold = pool.at(-1); }
      }
      pool.sort(order);
      if (count > width) truncated = true;
      beam = pool.slice(0, width).map(candidate => {
        const keys = new Set(candidate.state.keys); for (const key of candidate.option.keys) keys.add(key);
        return { ids: candidate.state.ids.concat(candidate.option.ids), keys, score: candidate.score };
      });
      if (!beam.length) break;
      if (Date.now() - started > maxMs) { timedOut = true; break; }
    }
    if (timedOut) return { status: 'limited', plans: [], errors: ['조합 탐색 시간이 길어졌습니다. 고정할 과목을 정해 범위를 좁힌 뒤 다시 추천해 주세요.'], elapsedMs: Date.now() - started };
    const plans = [], signatures = new Set();
    for (const state of beam) {
      const validation = validatePlan(school, state.ids, input);
      if (validation.errors.length) continue;
      const warnings = ['본 서비스는 학교 홈페이지에 공개된 교육과정 자료를 바탕으로 제작되었습니다. 실제 개설 과목과 운영 내용은 변경될 수 있으므로, 정확한 내용은 입학 후 해당 학교의 개설 과목과 안내를 반드시 확인해 주세요.'];
      if (projected) warnings.unshift(...school.projection.warnings);
      const selected = state.ids.map(id => byId.get(id));
      const earlierKnown = (o, term) => o.term < term && (o.term >= input.startTerm || o.kind !== 'required' || input.pastRequiredConfirmed);
      for (const rule of rules.sequences) {
        const course = selected.find(o => o.key === norm(rule.course));
        if (!course || course.term < input.startTerm) continue;
        const missing = rule.before.filter(name => !selected.some(o => o.key === norm(name) && earlierKnown(o, course.term)));
        if (missing.length) warnings.push(`${course.name}: 학습 순서 참고 — ${missing.join('·')}의 이전 이수 여부를 확인하세요.`);
      }
      const cross = school.groups.some(g => g.kind === 'cross');
      if (cross) warnings.push('교차 편성 과목의 학기 순서는 예시입니다. 반 배정에 따라 바뀔 수 있습니다.');
      if (missingPast.length || (input.startTerm > 0 && !input.pastRequiredConfirmed)) warnings.push('이전 학기 이수 기록이 완전하지 않아 중복·선이수 확인이 필요합니다. 이전 선택군을 자동으로 채우지 않았습니다.');
      const unmapped = unique(selected.filter(o => o.subjectId == null).map(o => o.name));
      if (unmapped.length) warnings.push(`과목 설명 연결 미확인: ${unmapped.join(', ')}. 학교 원문명과 학점은 그대로 유지했습니다.`);
      const signature = [...state.ids].sort().join('|');
      if (signatures.has(signature)) continue;
      signatures.add(signature);
      const reasons = Object.fromEntries(selected.map(o => [o.id, projected
        ? `2026 ${o.grade}학년 ${o.semester}학기 시간표에서 관측한 과목의 추정 배치입니다. ` + (linked.has(o.key) ? `${goal.name} 안내와 과목명이 연결됩니다.` : similar(o) ? '학과 안내의 유사 과목명을 학습 방향 참고로 활용했습니다. 동등 과목 판정은 아닙니다.' : '교과 균형을 위한 탐색 예시입니다. 고정·제외로 조정할 수 있습니다.')
        : o.kind === 'required' ? '학교 편제표의 지정 과목입니다.' : o.kind === 'cross' ? '연간 교차 편성의 두 과목을 한 번씩 배치한 예시입니다.' : linked.has(o.key) ? `${goal.name} 안내의 ${linked.get(o.key).type} 참고 목록과 연결됩니다.` : '선택군의 개수를 맞추는 대안 예시입니다. 관심에 맞게 바꿀 수 있습니다.']));
      plans.push({ selectedIds: state.ids, credits: validation.credits, warnings, reasons,
        covered: goal.subjects.filter(s => selected.some(o => o.key === s.key)),
        unavailable: goal.subjects.filter(s => !school.offerings.some(o => o.key === s.key)),
        omitted: goal.subjects.filter(s => school.offerings.some(o => o.key === s.key) && !selected.some(o => o.key === s.key)),
        score: state.score, incomplete: missingPast.length > 0 || (input.startTerm > 0 && !input.pastRequiredConfirmed) });
      if (plans.length === 3) break;
    }
    return { status: plans.length ? 'ok' : 'no-plan', plans, goalName: goal.name, input,
      errors: plans.length ? [] : ['현재 탐색 범위에서 조건에 맞는 안을 찾지 못했습니다. 고정·제외 과목을 조정해 주세요.'],
      boundedSearch: truncated, elapsedMs: Date.now() - started };
  }

  function validateSaved(saved, school, catalog) {
    if (!saved || saved.schemaVersion !== 1 || saved.schoolId !== school.id || saved.entryYear !== school.entryYear) return { errors: ['저장된 계획 형식 또는 입학연도가 다릅니다.'] };
    if (saved.version !== school.version) return { errors: ['자료가 갱신되어 저장 계획을 그대로 적용할 수 없습니다. 학교와 목표를 다시 선택해 주세요.'] };
    const checked = normalizeInput(school, saved.input);
    if (!checked.value || (checked.value.goalId !== 'explore' && !catalog.majors.some(m => m.id === checked.value.goalId))) checked.errors.push('저장된 희망학과를 확인해 주세요.');
    return checked;
  }
  return { norm, termLabel, findGoals, normalizeInput, recommend, validatePlan, validateSaved };
});
