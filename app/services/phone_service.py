import os

from twilio.rest import Client


class PhoneService:

    @staticmethod
    def _get_client():
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")

        if not account_sid or not auth_token:
            raise ValueError(
                "Twilio credentials are not configured."
            )

        return Client(
            account_sid,
            auth_token,
        )

    @staticmethod
    def _get_service_sid():
        service_sid = os.getenv(
            "TWILIO_VERIFY_SERVICE_SID"
        )

        if not service_sid:
            raise ValueError(
                "TWILIO_VERIFY_SERVICE_SID is not configured."
            )

        return service_sid

    @staticmethod
    def send_otp(phone_number: str):

        client = PhoneService._get_client()
        service_sid = PhoneService._get_service_sid()

        verification = (
            client.verify
            .v2
            .services(service_sid)
            .verifications
            .create(
                to=phone_number,
                channel="sms",
            )
        )

        return verification.status

    @staticmethod
    def verify_otp(
        phone_number: str,
        code: str,
    ):

        client = PhoneService._get_client()
        service_sid = PhoneService._get_service_sid()

        verification_check = (
            client.verify
            .v2
            .services(service_sid)
            .verification_checks
            .create(
                to=phone_number,
                code=code,
            )
        )

        return verification_check.status