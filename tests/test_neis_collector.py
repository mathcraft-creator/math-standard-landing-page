"""Offline tests: never loads a real credential or calls the network."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('neis_collector', Path(__file__).resolve().parents[1] / 'scripts/collect-kwangdong-neis.py')
collector = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(collector)


def response(total, rows):
    return {'test': [{'head': [{'list_total_count': total}, {'RESULT': {'CODE': 'INFO-000'}}]}, {'row': rows}]}


class CollectorTests(unittest.TestCase):
    def test_pagination_stops_at_total_and_saves_without_credential(self):
        client = collector.Client('fake-secret')
        with tempfile.TemporaryDirectory() as directory, patch.object(collector, 'OUT', Path(directory)):
            with patch.object(client, 'request', side_effect=[response(3, [{'n': 1}, {'n': 2}]), response(3, [{'n': 3}])]) as request:
                result = client.collect('test', {}, 'test')
            self.assertEqual(result['rowCount'], 3)
            self.assertEqual(result['status'], 'INFO-000')
            self.assertEqual(request.call_args_list[1].args[2], 2)
            self.assertNotIn('fake-secret', (Path(directory) / 'test.json').read_text())

    def test_partial_download_is_incomplete(self):
        client = collector.Client('fake-secret')
        with patch.object(client, 'request', side_effect=[response(3, [{'n': 1}]), {'RESULT': {'CODE': 'LOCAL-ERROR'}}]):
            self.assertEqual(client.collect('test', {})['status'], 'INCOMPLETE')

    def test_empty_result_is_no_data_not_success(self):
        client = collector.Client('fake-secret')
        with patch.object(client, 'request', return_value={'RESULT': {'CODE': 'INFO-200'}}):
            result = client.collect('test', {})
        self.assertEqual(result['status'], 'INFO-200')
        self.assertEqual(result['rowCount'], 0)

    def test_api_key_is_redacted_from_response_and_manifest(self):
        client = collector.Client('fake-secret')
        class Response:
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def read(self): return b'{"echo":"fake-secret"}'
        with patch.object(collector.urllib.request, 'urlopen', return_value=Response()), patch.object(collector.time, 'sleep'):
            result = client.request('test', {})
        self.assertEqual(result['echo'], '[REDACTED]')
        self.assertNotIn('fake-secret', str(client.requests))
        self.assertNotIn('KEY', client.requests[0]['parameters'])

    def test_network_errors_do_not_export_key_or_url(self):
        client = collector.Client('fake-secret')
        error = collector.urllib.error.URLError('https://example.org/?KEY=fake-secret')
        with patch.object(collector.urllib.request, 'urlopen', side_effect=error), patch.object(collector.time, 'sleep'):
            result = client.request('test', {})
        self.assertNotIn('fake-secret', str(result) + str(client.requests))
        self.assertNotIn('https://example.org', str(result) + str(client.requests))

    def test_name_normalization_is_conservative(self):
        self.assertEqual(collector.normalize_subject('미적분 Ⅰ'), collector.normalize_subject('미적분I'))
        self.assertNotEqual(collector.normalize_subject('프로그래밍 기본 실습'), collector.normalize_subject('프로그래밍 기초 실습'))


if __name__ == '__main__':
    unittest.main()
