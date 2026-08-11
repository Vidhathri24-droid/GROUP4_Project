import os
import smtplib

from email.message import EmailMessage
from datetime import datetime, timedelta, timezone
import secrets

from dotenv import load_dotenv


# Load .env
load_dotenv()


class EmailService:

    @staticmethod
    def generate_reset_token():
        """
        Generate a secure password reset token.
        """
        return secrets.token_urlsafe(32)

    @staticmethod
    def reset_token_expiry():
        """
        Password reset token expires after 30 minutes.
        """
        return datetime.now(timezone.utc) + timedelta(
            minutes=30
        )

    @staticmethod
    def send_reset_password_email(
        recipient_email: str,
        token: str,
    ):

        # ==========================================
        # SMTP CONFIGURATION
        # ==========================================

        smtp_host = os.getenv(
            "SMTP_HOST",
            "smtp-relay.brevo.com"
        )

        smtp_port = int(
            os.getenv(
                "SMTP_PORT",
                "587"
            )
        )

        smtp_username = os.getenv(
            "SMTP_USERNAME"
        )

        smtp_password = os.getenv(
            "SMTP_PASSWORD"
        )

        # ==========================================
        # SENDER CONFIGURATION
        # ==========================================

        mail_from = os.getenv(
            "MAIL_FROM"
        )

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173"
        )

        # ==========================================
        # VALIDATE CONFIGURATION
        # ==========================================

        if not smtp_username:
            raise RuntimeError(
                "SMTP_USERNAME is not configured."
            )

        if not smtp_password:
            raise RuntimeError(
                "SMTP_PASSWORD is not configured."
            )

        if not mail_from:
            raise RuntimeError(
                "MAIL_FROM is not configured."
            )

        # ==========================================
        # RESET LINK
        # ==========================================

        reset_link = (
            f"{frontend_url}"
            f"/reset-password"
            f"?token={token}"
        )

        # ==========================================
        # CREATE EMAIL
        # ==========================================

        message = EmailMessage()

        message["Subject"] = (
            "SCNA - Password Reset"
        )

        # IMPORTANT:
        # MAIL_FROM is the verified Brevo sender.
        message["From"] = mail_from

        message["To"] = recipient_email

        message.set_content(
            f"""
Hello,

We received a request to reset your SCNA
account password.

Click the link below to reset your password:

{reset_link}

This password reset link will expire in
30 minutes.

If you did not request a password reset,
you can safely ignore this email.

Regards,

SCNA
Scientific Collaboration Network Analyzer
"""
        )

        # ==========================================
        # SEND THROUGH BREVO SMTP
        # ==========================================

        try:

            print("\n========== BREVO SMTP ==========")

            print(
                "SMTP HOST:",
                smtp_host
            )

            print(
                "SMTP PORT:",
                smtp_port
            )

            print(
                "SMTP USERNAME:",
                smtp_username
            )

            print(
                "MAIL FROM:",
                mail_from
            )

            print(
                "RECIPIENT:",
                recipient_email
            )

            print(
                "SMTP PASSWORD SET:",
                bool(smtp_password)
            )

            print(
                "Connecting to Brevo..."
            )

            with smtplib.SMTP(
                smtp_host,
                smtp_port,
                timeout=30
            ) as server:

                server.ehlo()

                print(
                    "Starting TLS..."
                )

                server.starttls()

                server.ehlo()

                print(
                    "Logging into Brevo..."
                )

                server.login(
                    smtp_username,
                    smtp_password
                )

                print(
                    "Brevo SMTP login successful."
                )

                print(
                    "Sending email..."
                )

                server.send_message(
                    message
                )

                print(
                    "PASSWORD RESET EMAIL SENT!"
                )

        except Exception as e:

            print(
                "BREVO EMAIL ERROR:",
                repr(e)
            )

            raise