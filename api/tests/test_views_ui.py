import json
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory
from api.models import Exam
from api.views_ui import start_exam, poll_status, review
from mock import patch


class ViewsUITestCase(TestCase):
    def setUp(self):
        exam = Exam()
        exam.exam_code = 'examCode'
        exam.organization = 'organization'
        exam.duration = 1
        exam.reviewed_exam = 'reviewedExam'
        exam.reviewer_notes = 'reviewerNotes'
        exam.exam_password = 'examPassword'
        exam.exam_sponsor = 'examSponsor'
        exam.exam_name = 'examName'
        exam.ssi_product = 'ssiProduct'
        exam.first_name = 'firstName'
        exam.last_name = 'lastName'
        exam.exam_id = '1'
        exam.save()
        self.exam = exam

    def test_start_exam(self):
        factory = APIRequestFactory()
        with patch('api.views_ui.start_exam_request') as edx_request,\
            patch('api.views_ui.send_ws_msg') as send_ws:
            edx_request.return_value = MockResponse()
            send_ws.return_value = None
            request = factory.get(
                '/api/start_exam/%s' % self.exam.exam_code)
            response = start_exam(request, attempt_code=self.exam.exam_code)
            response.render()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            data = json.loads(response.content)
            self.assertIn('hash', data)
            self.assertIn('status', data)

    def test_poll_status(self):
        factory = APIRequestFactory()
        with patch('api.views_ui.poll_status_request') as edx_request,\
            patch('api.views_ui.send_ws_msg') as send_ws:
            edx_request.return_value = MockResponse(
                content='{"status": "started"}')
            send_ws.return_value = None
            request = factory.get(
                '/api/poll_status/%s' % self.exam.exam_code)
            response = poll_status(request, attempt_code=self.exam.exam_code)
            response.render()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            data = json.loads(response.content)
            self.assertIn('hash', data)
            self.assertEqual('started', data['status'])

    def test_send_review(self):
        factory = APIRequestFactory()
        with patch('api.views_ui.send_review_request') as edx_request:
            edx_request.return_value = MockResponse()
            request = factory.post(
                '/api/review/', data={'attempt_code': self.exam.exam_code})
            response = review(request)
            response.render()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            data = json.loads(response.content)
            self.assertEqual('review has sent', data['status'])


class MockResponse(object):
    def __init__(self, status_code=200, content={"status": "OK"}):
        self.status_code = status_code
        self.content = content