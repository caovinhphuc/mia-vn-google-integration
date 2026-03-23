#!/usr/bin/env python3
"""
Email Service
"""

import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional

class EmailService:
    """Service for sending emails (SMTP). Hỗ trợ nhiều tên biến env."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        # Ưu tiên SMTP_* rồi EMAIL_* (tương thích notifier.py)
        self.smtp_user = (
            os.getenv("SMTP_USER")
            or os.getenv("EMAIL_ADDRESS")
            or os.getenv("EMAIL_USERNAME")
            or ""
        )
        self.smtp_password = (
            os.getenv("SMTP_PASSWORD")
            or os.getenv("EMAIL_PASSWORD")
            or os.getenv("EMAIL_APP_PASSWORD")
            or ""
        )
        self._configured = bool(self.smtp_user and self.smtp_password)

    async def send_email(
        self,
        recipient: str,
        subject: str,
        body: str,
        attachment_path: Optional[str] = None
    ) -> bool:
        """Send email"""
        if not self._configured:
            raise RuntimeError("Email service not configured")

        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = recipient
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html'))

            if attachment_path and os.path.exists(attachment_path):
                with open(attachment_path, 'rb') as f:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(f.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename={os.path.basename(attachment_path)}'
                    )
                    msg.attach(part)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            self.logger.info(f"Email sent to {recipient}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to send email: {e}")
            raise

    async def send_report(self, recipient: str) -> bool:
        """Send automation report"""
        subject = "OneAutomation System - Report"
        body = """
        <html>
        <body>
            <h2>OneAutomation System Report</h2>
            <p>Automation system is running successfully.</p>
        </body>
        </html>
        """
        return await self.send_email(recipient, subject, body)

    def is_configured(self) -> bool:
        """Check if email service is configured"""
        return self._configured
