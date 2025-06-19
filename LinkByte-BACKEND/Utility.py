import re,smtplib as smtp,random,os,base64
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
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
    if username in reserved_usernames or len(username) > 15:
        return False 
    return bool(re.match(pattern, username))

def is_strong_password(password):
    """
    Checks if a password is strong.
    A strong password should be at least 8 characters long and contain:
    - At least one lowercase letter
    - At least one uppercase letter
    """
    if len(password) < 8:
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[A-Z]", password):
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

def load_key() -> bytes:
    b64_key = os.getenv('ENCRYPTION_KEY')
    if not b64_key:
        raise ValueError("ENCRYPTION_KEY environment variable is not set")
    return base64.b64decode(b64_key)

def encrypt(msg: str) -> bytes:
    key = load_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce
    ciphertext = aesgcm.encrypt(nonce, msg.encode(), None)
    return nonce + ciphertext  # prepend nonce to ciphertext

def decrypt(encrypted_data: bytes) -> str:
    key = load_key()
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    aesgcm = AESGCM(key)
    decrypted = aesgcm.decrypt(nonce, ciphertext, None)
    return decrypted.decode()