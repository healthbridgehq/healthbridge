from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import jwt
import ssl
import requests
import socket
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

from ..database import engine
from ..models import User, AuditLog
from ..security import create_access_token

logger = logging.getLogger(__name__)

class SecurityTester:
    def __init__(self, app, db: Session):
        self.client = TestClient(app)
        self.db = db
        
    def test_ssl_configuration(self) -> Dict[str, bool]:
        """Test SSL/TLS configuration for security vulnerabilities."""
        results = {
            "tls_1_3_supported": False,
            "weak_ciphers_disabled": True,
            "perfect_forward_secrecy": False
        }
        
        try:
            context = ssl.create_default_context()
            with socket.create_connection(("localhost", 8000)) as sock:
                with context.wrap_socket(sock, server_hostname="localhost") as ssock:
                    cipher = ssock.cipher()
                    version = ssock.version()
                    
                    results["tls_1_3_supported"] = version == "TLSv1.3"
                    results["perfect_forward_secrecy"] = "ECDHE" in cipher[0]
                    
                    # Check for weak ciphers
                    weak_ciphers = ["RC4", "DES", "MD5"]
                    results["weak_ciphers_disabled"] = not any(
                        weak in cipher[0] for weak in weak_ciphers
                    )
        except Exception as e:
            logger.error(f"SSL test failed: {e}")
            
        return results
    
    def test_jwt_security(self) -> Dict[str, bool]:
        """Test JWT token security configuration."""
        results = {
            "proper_expiration": False,
            "secure_algorithm": False,
            "token_validation": False
        }
        
        try:
            # Test token expiration
            token = create_access_token(
                data={"sub": "test@example.com"},
                expires_delta=timedelta(minutes=30)
            )
            decoded = jwt.decode(token, options={"verify_signature": False})
            exp = decoded.get("exp")
            results["proper_expiration"] = exp is not None and \
                datetime.fromtimestamp(exp) > datetime.utcnow()
            
            # Test algorithm
            header = jwt.get_unverified_header(token)
            results["secure_algorithm"] = header["alg"] in ["HS256", "RS256"]
            
            # Test token validation
            response = self.client.get(
                "/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            results["token_validation"] = response.status_code == 401  # Should fail without valid signature
            
        except Exception as e:
            logger.error(f"JWT test failed: {e}")
            
        return results
    
    def test_rate_limiting(self) -> Dict[str, bool]:
        """Test rate limiting functionality."""
        results = {
            "rate_limit_working": False,
            "rate_limit_headers": False
        }
        
        try:
            # Make multiple rapid requests
            responses = []
            for _ in range(105):  # Over the 100 request limit
                responses.append(
                    self.client.get("/health")
                )
            
            # Check if rate limiting is working
            results["rate_limit_working"] = any(
                r.status_code == 429 for r in responses
            )
            
            # Check for rate limit headers
            results["rate_limit_headers"] = all(
                "X-RateLimit-Remaining" in r.headers for r in responses[:100]
            )
            
        except Exception as e:
            logger.error(f"Rate limit test failed: {e}")
            
        return results
    
    def test_security_headers(self) -> Dict[str, bool]:
        """Test security headers configuration."""
        response = self.client.get("/health")
        headers = response.headers
        
        return {
            "hsts": "Strict-Transport-Security" in headers,
            "csp": "Content-Security-Policy" in headers,
            "xframe": "X-Frame-Options" in headers,
            "xss_protection": "X-XSS-Protection" in headers,
            "content_type_options": "X-Content-Type-Options" in headers
        }
    
    def test_audit_logging(self) -> Dict[str, bool]:
        """Test audit logging functionality."""
        results = {
            "audit_created": False,
            "audit_details_correct": False
        }
        
        try:
            # Make a test request
            response = self.client.get(
                "/health",
                headers={"X-Test-Header": "test"}
            )
            
            # Check audit log
            audit = self.db.query(AuditLog).order_by(
                AuditLog.timestamp.desc()
            ).first()
            
            results["audit_created"] = audit is not None
            if audit:
                results["audit_details_correct"] = all([
                    audit.action_type == "GET",
                    audit.resource_type == "/health",
                    audit.success == (response.status_code == 200),
                    "X-Test-Header" in audit.request_details["headers"]
                ])
                
        except Exception as e:
            logger.error(f"Audit logging test failed: {e}")
            
        return results
    
    def run_all_tests(self) -> Dict[str, Dict[str, bool]]:
        """Run all security tests and return results."""
        return {
            "ssl_config": self.test_ssl_configuration(),
            "jwt_security": self.test_jwt_security(),
            "rate_limiting": self.test_rate_limiting(),
            "security_headers": self.test_security_headers(),
            "audit_logging": self.test_audit_logging()
        }
