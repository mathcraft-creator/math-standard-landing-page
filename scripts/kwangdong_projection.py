"""Build an explicitly provisional six-term plan, never fabricated school credits."""
import json
from pathlib import Path


def apply_projection(data, subjects, norm):
    evidence = json.loads((Path(__file__).parent / 'data/kwangdong-neis-evidence-20261123.json').read_text(encoding='utf-8'))
    data.update(status='projected', sourceDate=evidence['collectedDate'],
                expectedTermCredits=[None] * 6,
                notice='나이스 2026 시간표·사용자 캡처를 바탕으로 구성한 2027 입학생 6학기 추정 추천입니다. 학점·학교 필수·선택군은 미확인입니다.')
    data['projection'] = {'basisYear': 2026, 'snapshotSha256': evidence['snapshotSha256'],
                          'methodVersion': 1,
                          'warnings': [data['notice'],
                              '1·2학년은 2026 동일 학년·학기 과목을 2027·2028년에 임시 배치했습니다. 2027 입학생의 확정 편제표가 아닙니다.',
                              '3학년은 2026 재학생의 2015 교육과정 시간표를 참고한 2029년 배치입니다. 과목명을 그대로 보존했으며 2022 개정 과목으로 자동 변환하지 않았습니다. 해당 시점의 개설과 대체 과목을 학교에 확인하세요.',
                              '교과별 추천 개수는 서비스가 정한 탐색 기준이며 학교의 택N 조건이 아닙니다. 학점·졸업요건·시간표 충돌은 검증하지 않습니다.',
                              '같은 과목이 두 학기에 표시되면 재학생 시간표의 학기별 운영 참고입니다. 중복 수강이나 학점 중복 인정을 뜻하지 않습니다.']}
    grouped = {}
    for row in evidence['offerings']:
        term = (row['grade'] - 1) * 2 + row['semester'] - 1
        category = row['category']
        key = (term, category)
        if key not in grouped:
            count = 2 if category in ['수학', '과학', '사회'] else 1
            group_id = f'kwangdong-advisory-{term}-{len(grouped)}'
            grouped[key] = {'id': group_id, 'term': term, 'name': category + ' 추천 구성',
                            'condition': '서비스 추천 개수 · 학교 선택 조건 미확인', 'choose': count,
                            'kind': 'advisory', 'creditsEach': None, 'offerings': []}
        group = grouped[key]
        name = row['name']; subject = subjects.get(norm(name), {})
        offering = {'id': f'kwangdong-neis-{len(data["offerings"])}', 'name': name, 'key': norm(name),
                    'term': term, 'grade': row['grade'], 'semester': row['semester'],
                    'year': 2027 + row['grade'] - 1, 'credits': None,
                    'type': '재학생 시간표 참고' if row['grade'] == 3 else '동일 학년 운영 관측',
                    'category': category, 'kind': 'elective', 'groupId': group['id'],
                    'subjectId': subject.get('id'), 'status': '2027 입학생 개설·학점·선택 조건 미확정',
                    'notes': row['curriculum'], 'evidence': row,
                    'source': {'kind': 'neis-timetable', 'workbook': '나이스 공개 시간표',
                               'sheet': '2026학년도', 'range': f'{row["grade"]}학년 {row["semester"]}학기 / {name}',
                               'document': '2026 시간표 수업내용 원문', 'date': evidence['collectedDate'],
                               'verification': '과목명 관측 · 미래 개설 미확정',
                               'url': evidence['endpoint'] + f'?Type=json&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7530542&AY=2026&SEM={row["semester"]}&GRADE={row["grade"]}'}}
        data['offerings'].append(offering); group['offerings'].append(offering['id'])
    for group in grouped.values():
        group['choose'] = min(group['choose'], len(group['offerings']))
    data['groups'] = list(grouped.values())
    data['observations']['verification'] = '캡처 60과목 모두 2026 동일 학년·학기 나이스 시간표에서 이름 일치'
