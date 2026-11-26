"""Read the supplied workbooks without saving them; emit versioned public data."""
from pathlib import Path
from collections import defaultdict
import hashlib
import json
import re
import openpyxl
from kwangdong_projection import apply_projection

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'curriculum'
SCHOOL_IDS = {'진접고': 'jinjeop', '오남고': 'onam', '진건고': 'jingeon', '광동고': 'kwangdong'}
EXPECTED = {'진접고': 122, '오남고': 111, '진건고': 112, '광동고': 0}


def norm(value):
    return re.sub(r'[\s·ㆍ･•]', '', str(value)).replace('Ⅱ', '2').replace('Ⅰ', '1').lower()


def write(name, data):
    target = OUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    html = (ROOT / 'curriculum/index.html').read_text(encoding='utf-8')
    raw = re.search(r'<script id="data" type="application/json">(.*?)</script>', html, re.S).group(1)
    original = json.loads(raw)
    subjects = {norm(s['n']): s for s in original['S']}
    catalog = {'sourceHash': sha(raw.encode()), 'subjects': [
        {'id': s['id'], 'name': s['n'], 'key': norm(s['n']), 'group': s['g'], 'summary': s.get('one') or s.get('slogan') or s.get('intro', '')[:260]}
        for s in original['S']], 'majors': [
        {'id': 'major-' + str(i), 'name': m['n'], 'series': m['ser'], 'aliases': m['kw'],
         'description': m['desc'], 'career': m['career'], 'reference': '기존 탐색관 학과 안내(서울교육연구정보원·서울 고교학점제지원센터 자료)',
         'subjects': [{'key': norm(original['S'][sid]['n']), 'name': original['S'][sid]['n'], 'type': label}
                      for key, label in [('genS', '일반 선택'), ('carS', '진로 선택'), ('fusS', '융합 선택')]
                      for sid in m[key]]}
        for i, m in enumerate(original['M'])]}
    aliases = {'개발자': ['컴퓨터공학과', '소프트웨어학과'], '프로그래머': ['컴퓨터공학과', '소프트웨어학과'],
               '반도체': ['전자공학과', '신소재공학과', '재료공학과'], '의료': ['의예과', '간호학과', '보건행정학과'],
               '의사': ['의예과'], '간호사': ['간호학과'], '교사': ['초등교육과', '교육학과', '수학교육과'],
               '자연공학': ['기계공학과', '전자공학과'], '정보AI': ['인공지능학과', '컴퓨터공학과'],
               '상경': ['경영학과', '경제학과'], '의약생명': ['의예과', '간호학과', '생명과학과']}
    write('subjects.json', catalog)
    write('career-mappings.json', {'aliases': aliases, 'notice': '진로 표현으로 제안한 학과 후보입니다. 학생이 목표 학과를 선택해야 합니다.'})
    # These are educational reference sequences, not enforced school requirements.
    sequences = [
        {'course': '미적분Ⅱ', 'before': ['대수', '미적분Ⅰ'], 'kind': 'reference', 'note': '국가 안내상 선이수 권장: 대수·미적분Ⅰ'},
        {'course': '기하', 'before': ['공통수학2'], 'kind': 'reference', 'note': '공통수학2(도형) 이후'},
        {'course': '미적분Ⅰ', 'before': ['대수'], 'kind': 'reference', 'note': '대수 이후 편성'}]
    write('rules.json', {'sequences': sequences, 'notice': '엑셀 수학교과_분석의 이수 순서 메모에 따른 학습 참고이며 학교의 필수 선이수 규칙이 아닙니다.'})
    report = {'catalogHash': catalog['sourceHash'], 'schools': [], 'workbooks': []}
    index = {'schemaVersion': 1, 'schools': [], 'notice': '편제표의 개설 후보·편성 계획입니다. 실제 개설과 반별 학기 배정은 학교에서 확인하세요.'}
    for name, school_id in SCHOOL_IDS.items():
        source = next((ROOT / 'curriculum').glob('2027 ' + name + ' 교육과정 GPT용.xlsx'))
        digest = sha(source.read_bytes())
        workbook = openpyxl.load_workbook(source, data_only=True)
        sheet = workbook['2027입학생_3개년']
        data = {'schemaVersion': 1, 'id': school_id, 'name': name, 'entryYear': 2027, 'admissionYear': 2030,
                'version': digest[:16] + '-' + catalog['sourceHash'][:12], 'sourceDate': '2026-10-30',
                'sourceWorkbook': source.name, 'sourceHash': digest, 'sourceSheet': sheet.title,
                'status': 'missing' if name == '광동고' else 'planned',
                'notice': '원본 엑셀의 확인 기록을 사용했습니다. 학교 공식 원문 최신성·실제 강좌 개설은 재확인해야 합니다.',
                'offerings': [], 'groups': [], 'mathNotes': []}
        groups = {}
        for row_no, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), 2):
            if not row[0] or not row[3] or str(row[3]).startswith('('):
                continue
            assert row[0] == name and row[9] == 2027
            assert row[8] == 2027 + int(row[1]) - 1
            kind = 'required' if row[10] == '학교지정(필수 이수)' else 'cross' if row[10] == '교차 편성(택1)' else 'elective'
            term = (int(row[1]) - 1) * 2 + int(row[2]) - 1
            key = norm(row[3])
            assert isinstance(row[4], (int, float)) and row[4] > 0
            assert row[18] == '공식 원문 확인'
            offering = {'id': school_id + '-r' + str(row_no), 'name': row[3], 'key': key, 'term': term,
                        'grade': int(row[1]), 'semester': int(row[2]), 'year': row[8], 'credits': row[4],
                        'type': row[5], 'category': row[6], 'kind': kind, 'status': row[11],
                        'notes': row[7] or '', 'subjectId': subjects.get(key, {}).get('id'),
                        'source': {'workbook': source.name, 'sheet': sheet.title, 'range': f'A{row_no}:S{row_no}',
                                   'url': row[12], 'document': row[17], 'date': str(row[13]), 'verification': row[18]}}
            if kind != 'required':
                assert row[14] and row[15]
                group_key = (term, row[14])
                if group_key not in groups:
                    match = re.search(r'택(\d+)', row[15])
                    assert match, row[15]
                    groups[group_key] = {'id': school_id + '-g' + str(len(groups)), 'term': term,
                                         'name': row[14], 'condition': row[15], 'choose': int(match[1]),
                                         'kind': kind, 'offerings': [], 'creditsEach': row[4]}
                group = groups[group_key]
                assert group['creditsEach'] == row[4]
                offering['groupId'] = group['id']
                group['offerings'].append(offering['id'])
            data['offerings'].append(offering)
        assert len(data['offerings']) == EXPECTED[name]
        by_id = {o['id']: o for o in data['offerings']}
        pairs = defaultdict(list)
        for group in groups.values():
            assert 0 < group['choose'] <= len(group['offerings'])
            match = re.search(r'후보 (\d+)과목', group['condition'])
            if match:
                assert int(match[1]) == len(group['offerings']), group['name']
            if group['kind'] == 'cross':
                keys = sorted(by_id[i]['key'] for i in group['offerings'])
                pair = str(group['term'] // 2) + '-' + '|'.join(keys)
                group['annualPair'] = pair
                pairs[pair].append(group)
        for pair, pair_groups in pairs.items():
            assert len(pair_groups) == 2 and {g['term'] % 2 for g in pair_groups} == {0, 1}
            assert all(len(g['offerings']) == 2 and g['choose'] == 1 for g in pair_groups)
        data['groups'] = list(groups.values())
        data['expectedTermCredits'] = [30, 29, 30, 29, 30, 29] if name == '진접고' else [29] * 6
        if data['status'] == 'missing':
            data['expectedTermCredits'] = []
        else:
            for t in range(6):
                total = sum(o['credits'] for o in data['offerings'] if o['term'] == t and o['kind'] == 'required')
                total += sum(g['choose'] * g['creditsEach'] for g in data['groups'] if g['term'] == t)
                assert total == data['expectedTermCredits'][t], (name, t, total)
        for row_no, row in enumerate(workbook['수학교과_분석'].iter_rows(min_row=2, values_only=True), 2):
            if row[1] == 2027 and row[12]:
                data['mathNotes'].append({'course': row[5], 'note': row[12], 'range': f'수학교과_분석!F{row_no}:M{row_no}'})
        capture_sheet = '네이버캡처_20261123'
        if capture_sheet in workbook.sheetnames:
            evidence = json.loads((ROOT / 'scripts/data/kwangdong-naver-capture-20261123.json').read_text(encoding='utf-8'))
            observed = []
            for row_no, row in enumerate(workbook[capture_sheet].iter_rows(min_row=2, values_only=True), 2):
                if not row[0]:
                    continue
                assert row[0] == name and row[1] in [1, 2] and row[2] in [1, 2]
                assert all(row[i] is None for i in [4, 8, 9, 14, 15]), 'Capture-only unknown fields must stay blank'
                evidence_term = next(t for t in evidence['terms'] if t['grade'] == row[1] and t['semester'] == row[2])
                assert row[3] in evidence_term['groups'][row[6]]
                observed.append({'name': row[3], 'key': norm(row[3]), 'grade': row[1], 'semester': row[2],
                                 'category': row[6], 'credits': None, 'entryYear': None, 'year': None,
                                 'selectionGroup': None, 'subjectId': subjects.get(norm(row[3]), {}).get('id'),
                                 'mutedInCapture': row[3] in evidence_term['mutedNames'],
                                 'image': evidence_term['image'], 'notes': row[7],
                                 'source': {'workbook': source.name, 'sheet': capture_sheet, 'range': f'A{row_no}:S{row_no}',
                                            'kind': 'user-screenshot', 'provider': evidence['provider'], 'receivedDate': row[13], 'url': None}})
            assert len(observed) == 60
            assert len({(o['grade'], o['semester'], o['name']) for o in observed}) == 60
            data['observations'] = {'status': 'capture-only', 'receivedDate': evidence['receivedDate'],
                                    'yearNotice': evidence['yearNotice'], 'provider': evidence['provider'],
                                    'notice': '캡처의 과목명 확인용입니다. 2027 입학생의 확정 6학기 수강 계획 근거로 사용하지 않습니다.',
                                    'offerings': observed}
        if school_id == 'kwangdong':
            apply_projection(data, subjects, norm)
        data['version'] = sha((json.dumps(data, ensure_ascii=False, sort_keys=True) + catalog['sourceHash']
                               + json.dumps(sequences, ensure_ascii=False) + json.dumps(aliases, ensure_ascii=False)
                               + Path(__file__).read_text(encoding='utf-8')).encode())[:24]
        write(f'schools/{school_id}/2027.json', data)
        index['schools'].append({'id': school_id, 'name': name, 'cohorts': [{'entryYear': 2027, 'status': data['status'],
                                    'path': f'schools/{school_id}/2027.json', 'version': data['version']}]})
        report['schools'].append({'school': name, 'courseRows': len(data['offerings']), 'groups': len(data['groups']),
                                  'captureRows': len(data.get('observations', {}).get('offerings', [])),
                                  'termCredits': data['expectedTermCredits'],
                                  'unmappedNames': sorted({o['name'] for o in data['offerings'] if o['subjectId'] is None})})
        report['workbooks'].append({'file': source.name, 'sha256': digest})
        assert sha(source.read_bytes()) == digest
    comparison = next((ROOT / 'curriculum').glob('*4개*.xlsx'))
    report['workbooks'].append({'file': comparison.name, 'sha256': sha(comparison.read_bytes())})
    write('schools.json', index)
    (ROOT / 'docs/course-planner-data-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report['schools'], ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
