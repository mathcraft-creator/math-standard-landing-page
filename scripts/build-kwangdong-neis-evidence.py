"""Curate subject evidence from the local NEIS snapshot, excluding events/holidays.

Run explicitly after reviewing a new snapshot. The importer only needs the compact,
credential-free evidence file, so public data can be rebuilt without local raw files.
"""
from pathlib import Path
import json
import hashlib

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / 'work/neis/kwangdong/2026-11-23/hisTimetable-2026.json'
CAPTURE = ROOT / 'scripts/data/kwangdong-naver-capture-20261123.json'
THIRD = {
    '국어': ['화법과 작문', '언어와 매체', '현대문학 감상', '고전문학 감상'],
    '수학': ['확률과 통계', '미적분', '기하', '경제 수학', '인공지능 수학'],
    '영어': ['영어Ⅱ', '영어 독해와 작문', '영어권 문화', '진로 영어'],
    '사회': ['한국지리', '세계사', '여행지리', '정치와 법', '윤리와 사상', '사회문제 탐구', '한국 사회의 이해'],
    '과학': ['물리학Ⅱ', '화학Ⅱ', '생명과학Ⅱ', '지구과학Ⅱ', '생활과 과학', '생태와 환경'],
    '체육': ['스포츠 생활'],
    '교양': ['교육학', '심리학', '지식 재산 일반', '고전의 지혜'],
    '기타': ['프로그래밍', '인공지능 기초', '영화의 이해', '팀프로젝트'],
}


def main():
    raw = SNAPSHOT.read_bytes()
    data = json.loads(raw)
    assert data['status'] == 'INFO-000' and data['rowCount'] == 46432
    rows = data['rows']
    assert all(r['SD_SCHUL_CODE'] == '7530542' and r['AY'] == '2026' for r in rows)
    terms = json.loads(CAPTURE.read_text(encoding='utf-8'))['terms']
    candidates = []
    for term in terms:
        for category, names in term['groups'].items():
            candidates.extend((term['grade'], term['semester'], category, name) for name in names)
    # Additional subject names present across classes, beyond the supplied capture.
    candidates += [(1, 1, '예술', '미술'), (1, 1, '기타', '고전으로 만나는 학문의 처음'),
                   (1, 2, '예술', '음악'), (1, 2, '기타', '프로그래밍 기본 실습')]
    for semester in [1, 2]:
        for category, names in THIRD.items():
            candidates.extend((3, semester, category, name) for name in names)
    evidence = []
    for grade, semester, category, name in candidates:
        matches = [r for r in rows if r['GRADE'] == str(grade) and r['SEM'] == str(semester) and r['ITRT_CNTNT'] == name]
        assert matches, (grade, semester, name)
        dates = sorted({r['ALL_TI_YMD'] for r in matches})
        evidence.append({'name': name, 'grade': grade, 'semester': semester, 'category': category,
                         'observedYear': 2026, 'rowCount': len(matches),
                         'firstDate': dates[0], 'lastDate': dates[-1],
                         'classCount': len({r['CLASS_NM'] for r in matches}),
                         'curriculum': '2015-reference' if grade == 3 else '2022-observed'})
    result = {'collectedDate': '2026-11-23', 'schoolCode': '7530542', 'officeCode': 'J10',
              'endpoint': 'https://open.neis.go.kr/hub/hisTimetable',
              'snapshotSha256': hashlib.sha256(raw).hexdigest(), 'snapshotRows': len(rows),
              'method': '캡처 과목과 추가 수업내용을 명시적으로 선별. 휴일·평가·창체 기록 제외. 원본 과목명 보존.',
              'offerings': evidence}
    target = ROOT / 'scripts/data/kwangdong-neis-evidence-20261123.json'
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Curated evidence:', len(evidence), 'rows')


if __name__ == '__main__':
    main()
