import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")
print("KEY LOADED:", repr(resend.api_key))

def send_reset_email(to_email: str, reset_link: str):
    body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2D6A4F;">Reset your password</h2>
        <p>We received a request to reset your FloraShield password. Click the button below:</p>
        <a href="{reset_link}" style="display:inline-block; background:#2D6A4F; color:white; 
           padding:12px 24px; border-radius:8px; text-decoration:none; margin:16px 0;">
           Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
    </div>
    """
    resend.Emails.send({
        "from": "FloraShield <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "FloraShield — Password Reset",
        "html": body,
    })

def send_verification_email(to_email: str, verify_link: str):
    body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2D6A4F;">Verify your email</h2>
        <p>Welcome to FloraShield! Please confirm your email address to activate your account:</p>
        <a href="{verify_link}" style="display:inline-block; background:#2D6A4F; color:white; 
           padding:12px 24px; border-radius:8px; text-decoration:none; margin:16px 0;">
           Verify Email
        </a>
        <p>If you didn't create this account, you can safely ignore this email. This link expires in 24 hours.</p>
    </div>
    """
    resend.Emails.send({
        "from": "FloraShield <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "FloraShield — Verify your email",
        "html": body,
    })