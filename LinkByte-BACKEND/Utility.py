import re,smtplib as smtp,random,os
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
EMAIL_ADDRESS=os.getenv('GMAIL')
EMAIL_PASSWORD=os.getenv('GMAIL_PASSWORD')
reserved_usernames = {"admin", "support", "abuse", "root", "administrator"}

def is_valid_username(username):
    """
    Checks if a username is valid.
    Valid usernames can only contain lowercase letters, numbers, periods, hyphens, and underscores.
    """
    pattern = r"^[a-z0-9\.\-_]+$"
    if username in reserved_usernames:
        return False
    return bool(re.match(pattern, username))

def is_strong_password(password):
    """
    Checks if a password is strong.
    A strong password should be at least 8 characters long and contain:
    - At least one lowercase letter
    - At least one uppercase letter
    - At least one special character
    """
    if len(password) < 8:
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True

def genrate_otp(email,purpose):
    try:
        otp = random.randint(100000,999999)
        body =f"Your OTP for {purpose} is: {otp}\nPlease use this code to complete your verification. Do not share this OTP with anyone."
        msg = MIMEText(body, "plain")
        msg['From'] = os.getenv("GMAIL")
        msg['To'] = email
        msg['Subject'] = purpose
        msg.set_payload(body)
        with smtp.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, email, msg.as_string())
            return otp
    except Exception as e:
        print(e)
        return 404