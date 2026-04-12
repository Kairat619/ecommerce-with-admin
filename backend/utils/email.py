"""Email service for sending verification and notification emails."""
import smtplib
import secrets
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from config.settings import settings


def generate_verification_token() -> str:
    """Generate a secure random verification token."""
    return secrets.token_urlsafe(32)


def get_verification_token_expiry() -> datetime:
    """Get expiry time for verification token (24 hours)."""
    return datetime.now(timezone.utc) + timedelta(hours=24)


def send_email_via_resend(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """Send email via Resend API."""
    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": f"{settings.SMTP_FROM_NAME} <{settings.RESEND_FROM_EMAIL}>",
                "to": to_email,
                "subject": subject,
                "html": html_body,
                "text": text_body
            },
            timeout=30
        )
        if response.status_code == 200 or response.status_code == 201:
            return True
        print(f"Resend API error: {response.status_code} - {response.text}")
        return False
    except Exception as e:
        print(f"Resend API error: {e}")
        return False


def send_email(to_email: str, subject: str, html_body: str, text_body: str = None) -> bool:
    """Send an email using SMTP or Resend API."""
    if not settings.SMTP_ENABLED and not settings.RESEND_API_KEY:
        print(f"[EMAIL MOCK] To: {to_email}")
        print(f"[EMAIL MOCK] Subject: {subject}")
        print(f"[EMAIL MOCK] Body: {html_body[:200]}...")
        return True
    
    # Use Resend if API key is set
    if settings.RESEND_API_KEY:
        return send_email_via_resend(to_email, subject, html_body, text_body or html_body)
    
    # Fallback to SMTP
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = to_email
        
        if text_body:
            msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_verification_email(to_email: str, name: str, token: str) -> bool:
    """Send email verification email to user."""
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    
    subject = "Verify your email address"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to {settings.APP_NAME}!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="margin-top: 0;">Hi {name},</p>
            
            <p>Thank you for creating an account. Please verify your email address to get started.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verify_url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #667eea; font-size: 12px; word-break: break-all;">{verify_url}</p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px; margin-bottom: 0;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
    Welcome to {settings.APP_NAME}!

    Hi {name},

    Thank you for creating an account. Please verify your email address to get started.

    Verify your email: {verify_url}

    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
    """
    
    return send_email(to_email, subject, html_body, text_body)
