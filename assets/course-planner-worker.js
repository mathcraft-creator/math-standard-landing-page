'use strict';
importScripts('./course-planner-engine.js');
self.onmessage = event => {
  const { requestId, school, catalog, rules, input } = event.data;
  try { self.postMessage({ requestId, result: self.CoursePlanner.recommend(school, catalog, rules, input) }); }
  catch (_) { self.postMessage({ requestId, result: { status: 'error', plans: [], errors: ['계획 계산 중 오류가 발생했습니다. 입력을 다시 확인해 주세요.'] } }); }
};
