import os
import smtplib
import secrets

from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


class EmailService:

    # =====================================================
    # SMTP CONFIGURATION
    # =====================================================

    @staticmethod
    def _get_smtp_config():
        """
        Get SMTP configuration from environment variables.
        """

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

        mail_from = os.getenv(
            "MAIL_FROM"
        )

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

        return (
            smtp_host,
            smtp_port,
            smtp_username,
            smtp_password,
            mail_from
        )

    # =====================================================
    # SEND GENERIC EMAIL - INTERNAL
    # =====================================================

    @staticmethod
    def _send_email(
        recipient_email: str,
        subject: str,
        body: str,
    ):
        """
        Send a plain-text email through Brevo SMTP.
        """

        (
            smtp_host,
            smtp_port,
            smtp_username,
            smtp_password,
            mail_from
        ) = EmailService._get_smtp_config()

        message = EmailMessage()

        message["Subject"] = subject
        message["From"] = mail_from
        message["To"] = recipient_email

        message.set_content(body)

        try:

            print("\n========== SCNA EMAIL ==========")
            print("SMTP HOST:", smtp_host)
            print("SMTP PORT:", smtp_port)
            print("RECIPIENT:", recipient_email)
            print("SUBJECT:", subject)

            with smtplib.SMTP(
                smtp_host,
                smtp_port,
                timeout=30
            ) as server:

                server.ehlo()

                server.starttls()

                server.ehlo()

                server.login(
                    smtp_username,
                    smtp_password
                )

                server.send_message(message)

            print("EMAIL SENT SUCCESSFULLY")

        except Exception as e:

            print(
                "EMAIL ERROR:",
                repr(e)
            )

            raise

    # =====================================================
    # PUBLIC EMAIL API
    # =====================================================

    @staticmethod
    def send_email(
        recipient: str,
        subject: str,
        body: str,
    ):
        """
        Public generic email method.

        This method is used by NotificationService for
        sending email notifications.

        Example:

            EmailService.send_email(
                recipient=admin.email,
                subject=title,
                body=message,
            )

        The actual SMTP implementation remains inside
        _send_email().
        """

        if not recipient:
            raise ValueError(
                "Recipient email is required."
            )

        if not subject:
            raise ValueError(
                "Email subject is required."
            )

        if body is None:
            body = ""

        return EmailService._send_email(
            recipient_email=recipient,
            subject=subject,
            body=body,
        )

    # =====================================================
    # EMAIL VERIFICATION TOKEN
    # =====================================================

    @staticmethod
    def generate_verification_token():
        """
        Generate a secure email verification token.
        """

        return secrets.token_urlsafe(32)

    @staticmethod
    def verification_expiry():
        """
        Email verification token expires after 30 minutes.
        """

        return datetime.now(timezone.utc) + timedelta(
            minutes=30
        )

    # =====================================================
    # EMAIL OTP
    # =====================================================

    @staticmethod
    def generate_email_otp():
        """
        Generate a secure 6-digit email OTP.
        """

        return str(
            secrets.randbelow(900000) + 100000
        )

    @staticmethod
    def email_otp_expiry():
        """
        Email OTP expires after 10 minutes.
        """

        return datetime.now(timezone.utc) + timedelta(
            minutes=10
        )

    @staticmethod
    def send_email_otp(
        recipient_email: str,
        otp: str,
    ):
        """
        Send email verification OTP.
        """

        body = f"""
Hello,

Your SCNA email verification OTP is:

{otp}

This OTP will expire in 10 minutes.

If you did not create an SCNA account,
you can safely ignore this email.

Regards,

SCNA
Scientific Collaboration Network Analyzer
"""

        EmailService._send_email(
            recipient_email=recipient_email,
            subject="SCNA - Email Verification OTP",
            body=body
        )

    # =====================================================
    # PASSWORD RESET TOKEN
    # =====================================================

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
        """
        Send password reset email.
        """

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173"
        )

        reset_link = (
            f"{frontend_url}"
            f"/reset-password"
            f"?token={token}"
        )

        body = f"""
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

        EmailService._send_email(
            recipient_email=recipient_email,
            subject="SCNA - Password Reset",
            body=body
        )

    # =====================================================
    # EMAIL VERIFICATION
    # =====================================================

    @staticmethod
    def send_verification_email(
        recipient_email: str,
        token: str,
    ):
        """
        Send account email verification link.
        """

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173"
        )

        verification_link = (
            f"{frontend_url}"
            f"/verify-email"
            f"?token={token}"
        )

        body = f"""
Hello,

Thank you for registering with SCNA.

Please verify your email address by clicking
the link below:

{verification_link}

This verification link will expire in 30 minutes.

If you did not create this account,
you can safely ignore this email.

Regards,

SCNA
Scientific Collaboration Network Analyzer
"""

        EmailService._send_email(
            recipient_email=recipient_email,
            subject="SCNA - Verify Your Email",
            body=body
        )

    # =====================================================
    # CONFERENCE:
    # PRESENTER REGISTRATION PENDING
    # =====================================================

    @staticmethod
    def send_presenter_registration_notification(
        admin_email: str,
        researcher_name: str,
        conference_title: str,
    ):
        """
        Notify the Institution Admin that a researcher
        wants to participate as a presenter.

        This email is sent to the admin who created
        the conference.
        """

        body = f"""
Hello,

A researcher has requested to participate as a
presenter for your conference.

Conference:
{conference_title}

Researcher:
{researcher_name}

The researcher is currently waiting for your approval.

Please log in to SCNA and review the presenter
registration.

Regards,

SCNA
Scientific Collaboration Network Analyzer
"""

        EmailService._send_email(
            recipient_email=admin_email,
            subject=(
                "SCNA - New Presenter Registration "
                f"for {conference_title}"
            ),
            body=body
        )

    # =====================================================
    # CONFERENCE:
    # PRESENTER ACCEPTED
    # =====================================================

    @staticmethod
    def send_presenter_accepted_notification(
        researcher_email: str,
        researcher_name: str,
        conference_title: str,
    ):
        """
        Notify the researcher that their presenter
        registration has been accepted.
        """

        body = f"""
Hello {researcher_name},

Good news!

Your request to participate as a presenter
has been accepted by the Institution Admin.

Conference:
{conference_title}

You are now officially registered as a presenter
for this conference.

Please log in to SCNA to view the conference details.

Regards,

SCNA
Scientific Collaboration Network Analyzer
"""

        EmailService._send_email(
            recipient_email=researcher_email,
            subject=(
                "SCNA - Presenter Registration Accepted"
            ),
            body=body
        )

    # =====================================================
    # CONFERENCE:
    # CONFERENCE REMINDER
    # =====================================================

    @staticmethod
    def send_conference_reminder(
        researcher_email: str,
        researcher_name: str,
        conference_title: str,
        conference_date: str,
        conference_time: str | None = None,
    ):
        """
        Notify a researcher that a conference they
        registered for is about to start.
        """

        if conference_time:
            schedule = (
                f"{conference_date} at "
                f"{conference_time}"
            )
        else:
            schedule = conference_date

        body = f"""
Hello {researcher_name},

This is a reminder that the conference you
registered for is about to start soon.

Conference:
{conference_title}

Date:
{schedule}

Please log in to SCNA for the complete conference
details.

We hope you have a great conference!

Regards,

SCNA
Scientific Collaboration Network Analyzer
"""

        EmailService._send_email(
            recipient_email=researcher_email,
            subject=(
                f"SCNA - Conference Reminder: "
                f"{conference_title}"
            ),
            body=body
        )

    # =====================================================
    # GENERIC CONFERENCE NOTIFICATION
    # =====================================================

    @staticmethod
    def send_conference_notification(
        recipient_email: str,
        subject: str,
        message: str,
    ):
        """
        Generic conference-related email method.

        Useful if we need additional conference
        notifications in the future.
        """

        body = f"""
Hello,

{message}

Regards,

SCNA
Scientific Collaboration Network Analyzer
"""

        EmailService._send_email(
            recipient_email=recipient_email,
            subject=subject,
            body=body
        )