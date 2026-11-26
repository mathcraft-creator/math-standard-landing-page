"""Collect public NEIS school data without exporting the authentication key.

Run from the repository: python -X utf8 scripts/collect-kwangdong-neis.py
Raw collections go under work/ (not included in the static deployment).
"""
from pathlib import Path
import os
import re
import json
import csv
from collections import defaultdict
import time
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://open.neis.go.kr/hub/'
TODAY = datetime.now(timezone(timedelta(hours=9))).strftime('%Y-%m-%d')
OUT = ROOT / 'work' / 'neis' / 'kwangdong' / TODAY


def load_key():
    for name in ['NEIS_API_KEY', 'NEIS_KEY']:
        value = os.environ.get(name, '').strip()
        if value:
            return value
    env = ROOT / '.env'
    if not env.exists():
        raise RuntimeError('No NEIS credential file or environment variable configured.')
    text = env.read_text(encoding='utf-8-sig')
    match = re.search(r'^\s*(?:NEIS_API_KEY|NEIS_KEY)\s*=\s*[\"\']?([^\s\"\']+)', text, re.M)
    if match:
        return match.group(1)
    candidates = re.findall(r'(?<![A-Za-z0-9])[a-fA-F0-9]{32}(?![A-Za-z0-9])', text)
    if len(candidates) == 1:
        return candidates[0]
    raise RuntimeError('Cannot identify exactly one NEIS credential. Set NEIS_API_KEY locally.')


class Client:
    def __init__(self, key):
        self.key = key
        self.requests = []

    def request(self, endpoint, parameters, page=1, size=1000):
        public = {'Type': 'json', 'pIndex': page, 'pSize': size, **parameters}
        url = BASE + endpoint + '?' + urllib.parse.urlencode({'KEY': self.key, **public})
        error = None
        for attempt in range(2):
            try:
                request = urllib.request.Request(url)
                with urllib.request.urlopen(request, timeout=25) as response:
                    body = response.read().decode('utf-8-sig')
                result = json.loads(body.replace(self.key, '[REDACTED]'))
                self.requests.append({'endpoint': endpoint, 'parameters': public, 'receivedAt': datetime.now(timezone.utc).isoformat()})
                time.sleep(0.2)
                return result
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                # Never print exceptions: urllib error objects may contain the keyed URL.
                reason = str(getattr(exc, 'reason', '')).replace(self.key, '[REDACTED]')
                reason = re.sub(r'https?://\S+', '[URL omitted]', reason)
                error = type(exc).__name__ + (': ' + reason if reason else '')
                if attempt == 0:
                    time.sleep(0.5)
        self.requests.append({'endpoint': endpoint, 'parameters': public, 'error': error})
        return {'RESULT': {'CODE': 'LOCAL-ERROR', 'MESSAGE': 'Network or response parsing error (' + error + ')'}}

    def collect(self, endpoint, parameters, name=None, max_pages=150):
        rows, responses = [], []
        total = None
        status = 'unknown'
        for page in range(1, max_pages + 1):
            result = self.request(endpoint, parameters, page)
            responses.append(result)
            block = result.get(endpoint)
            if not block:
                status = result.get('RESULT', {}).get('CODE', 'UNKNOWN')
                break
            heads = block[0].get('head', [])
            total = next((h['list_total_count'] for h in heads if 'list_total_count' in h), None)
            code = next((h['RESULT']['CODE'] for h in heads if 'RESULT' in h), 'UNKNOWN')
            if code != 'INFO-000':
                status = code
                break
            batch = next((b['row'] for b in block if 'row' in b), [])
            rows.extend(batch)
            status = 'INFO-000'
            if total is not None and len(rows) >= total:
                break
            if not batch:
                status = 'INCOMPLETE'
                break
            if page % 10 == 0:
                print(f'{name or endpoint}: {len(rows)}/{total} rows', flush=True)
        if total is not None and len(rows) != total:
            status = 'INCOMPLETE'
        record = {'endpoint': BASE + endpoint, 'parameters': parameters, 'collectedDate': TODAY,
                  'status': status, 'reportedTotal': total, 'rowCount': len(rows), 'rows': rows}
        if name:
            OUT.mkdir(parents=True, exist_ok=True)
            (OUT / (name + '.json')).write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            (OUT / (name + '-responses.json')).write_text(json.dumps(responses, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            print(f'{name}: {status}, rows={len(rows)}, reportedTotal={total}', flush=True)
        return record


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--probe', action='store_true', help='Find the school and sample endpoint schemas only')
    parser.add_argument('--summarize-only', action='store_true', help='Rebuild summaries from this date\'s saved files without any API request')
    args = parser.parse_args()
    if args.summarize_only:
        names = ['school-info', 'schulAflcoinfo', 'schoolMajorinfo'] + [e + '-' + y for y in ['2025', '2026', '2027'] for e in ['classInfo', 'SchoolSchedule', 'hisTimetable']]
        summarize({name: json.loads((OUT / (name + '.json')).read_text(encoding='utf-8')) for name in names})
        return
    client = Client(load_key())
    # School code verified through the public schoolInfo search; validate name/address below.
    school = client.collect('schoolInfo', {'ATPT_OFCDC_SC_CODE': 'J10', 'SD_SCHUL_CODE': '7530542'}, 'school-info')
    exact = [r for r in school['rows'] if r.get('SCHUL_NM') == '광동고등학교' and '남양주' in r.get('ORG_RDNMA', '')]
    if len(exact) != 1:
        raise RuntimeError('Cannot uniquely match Gwangdong High School in Namyangju. See the key-free collection file.')
    selected = exact[0]
    common = {'ATPT_OFCDC_SC_CODE': selected['ATPT_OFCDC_SC_CODE'], 'SD_SCHUL_CODE': selected['SD_SCHUL_CODE']}
    print('Matched:', selected['SCHUL_NM'], common, selected.get('ORG_RDNMA'), flush=True)
    if args.probe:
        for endpoint in ['schulAflcoinfo', 'schoolMajorinfo', 'classInfo', 'hisTimetable', 'SchoolSchedule']:
            response = client.request(endpoint, {**common, 'AY': '2026'}, size=3)
            block = response.get(endpoint)
            if block:
                sample = next((b['row'] for b in block if 'row' in b), [])
                print(endpoint, 'sample rows:', len(sample), 'fields:', list(sample[0]) if sample else [], flush=True)
            else:
                print(endpoint, 'status:', response.get('RESULT', {}).get('CODE'), flush=True)
    else:
        records = {'school-info': school}
        for endpoint in ['schulAflcoinfo', 'schoolMajorinfo']:
            records[endpoint] = client.collect(endpoint, common, endpoint)
        for year in ['2025', '2026', '2027']:
            for endpoint in ['classInfo', 'SchoolSchedule', 'hisTimetable']:
                # Schedule uses date range, rather than the timetable/class AY parameter.
                params = ({'AA_FROM_YMD': year + '0301', 'AA_TO_YMD': str(int(year)+1) + '0228'}
                          if endpoint == 'SchoolSchedule' else {'AY': year})
                name = endpoint + '-' + year
                records[name] = client.collect(endpoint, {**common, **params}, name)
        summarize(records)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'request-manifest.json').write_text(json.dumps({'school': common, 'requests': client.requests}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def normalize_subject(name):
    return re.sub(r'\s+', '', name.translate(str.maketrans({'Ⅰ': 'I', 'Ⅱ': 'II', 'Ⅲ': 'III'})))


def summarize(records):
    grouped = defaultdict(list)
    for name, record in records.items():
        if name.startswith('hisTimetable-'):
            for row in record['rows']:
                key = tuple(row.get(field, '') for field in ['AY', 'SEM', 'GRADE', 'ITRT_CNTNT'])
                grouped[key].append(row)
    summary = []
    for (year, semester, grade, content), rows in sorted(grouped.items()):
        dates = sorted({r.get('ALL_TI_YMD', '') for r in rows})
        summary.append({'year': year, 'semester': semester, 'grade': grade, 'content': content,
                        'timetableRows': len(rows), 'classCount': len({r.get('CLASS_NM') for r in rows}),
                        'firstDate': dates[0], 'lastDate': dates[-1]})
    (OUT / 'timetable-content-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    if summary:
        with (OUT / 'timetable-content-summary.csv').open('w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=list(summary[0])); writer.writeheader(); writer.writerows(summary)
    captures = json.loads((ROOT / 'scripts/data/kwangdong-naver-capture-20261123.json').read_text(encoding='utf-8'))
    comparison = []
    for term in captures['terms']:
        for category, names in term['groups'].items():
            for subject in names:
                matches = [r for r in summary if r['grade'] == str(term['grade']) and r['semester'] == str(term['semester'])
                           and normalize_subject(r['content']) == normalize_subject(subject)]
                comparison.append({'grade': term['grade'], 'semester': term['semester'], 'category': category,
                                   'captureSubject': subject, 'matchedYears': sorted({r['year'] for r in matches}),
                                   'matchedTimetableNames': sorted({r['content'] for r in matches}),
                                   'note': '일치 없음은 미개설을 뜻하지 않습니다. 시간표 기록과 캡처의 적용 연도가 다를 수 있습니다.'})
    (OUT / 'capture-comparison.json').write_text(json.dumps(comparison, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    overview = {name: {k: record[k] for k in ['status', 'reportedTotal', 'rowCount']} for name, record in records.items()}
    (OUT / 'collection-summary.json').write_text(json.dumps(overview, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        # Do not expose nested network errors, URLs, file contents or credentials.
        print('Collection stopped:', type(exc).__name__, str(exc) if isinstance(exc, RuntimeError) else 'See local key-free artifacts for details.')
        raise SystemExit(1)
