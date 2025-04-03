from typing import List, Dict, Any
import asyncio
import aiohttp
import ssl
import cryptography
import jwt
from datetime import datetime
import logging
from ..encryption import HealthDataEncryption
from ..oauth import OAuth2Handler
from ...database import Database

logger = logging.getLogger(__name__)

class SecurityTestSuite:
    """Automated security testing suite for HealthBridge"""
    
    def __init__(
        self,
        db: Database,
        encryption: HealthDataEncryption,
        oauth: OAuth2Handler
    ):
        self.db = db
        self.encryption = encryption
        self.oauth = oauth
        self.test_results = []
        
    async def run_full_security_audit(self) -> Dict[str, Any]:
        """Run all security tests and return comprehensive results"""
        try:
            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "tests_run": 0,
                "tests_passed": 0,
                "tests_failed": 0,
                "critical_issues": 0,
                "results": []
            }
            
            # Run all test suites
            encryption_results = await self.test_encryption()
            auth_results = await self.test_authentication()
            ssl_results = await self.test_ssl_configuration()
            token_results = await self.test_token_security()
            data_results = await self.test_data_security()
            
            # Combine results
            all_results = [
                encryption_results,
                auth_results,
                ssl_results,
                token_results,
                data_results
            ]
            
            # Aggregate statistics
            for suite_result in all_results:
                results["tests_run"] += suite_result["total_tests"]
                results["tests_passed"] += suite_result["passed"]
                results["tests_failed"] += suite_result["failed"]
                results["critical_issues"] += suite_result["critical_issues"]
                results["results"].extend(suite_result["details"])
            
            # Log results
            logger.info(f"Security audit completed: {results['tests_passed']}/{results['tests_run']} tests passed")
            if results["critical_issues"] > 0:
                logger.critical(f"Found {results['critical_issues']} critical security issues!")
            
            return results
            
        except Exception as e:
            logger.error(f"Security audit failed: {str(e)}")
            raise
            
    async def test_encryption(self) -> Dict[str, Any]:
        """Test encryption implementation"""
        results = {
            "name": "Encryption Tests",
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "critical_issues": 0,
            "details": []
        }
        
        # Test AES-256-GCM encryption
        test_data = "sensitive_test_data"
        try:
            encrypted = self.encryption.encrypt_field(test_data)
            decrypted = self.encryption.decrypt_field(encrypted)
            assert decrypted == test_data
            results["passed"] += 1
            results["details"].append({
                "test": "AES-256-GCM Encryption/Decryption",
                "status": "PASSED",
                "severity": "CRITICAL"
            })
        except Exception as e:
            results["failed"] += 1
            results["critical_issues"] += 1
            results["details"].append({
                "test": "AES-256-GCM Encryption/Decryption",
                "status": "FAILED",
                "severity": "CRITICAL",
                "error": str(e)
            })
        
        results["total_tests"] = results["passed"] + results["failed"]
        return results
        
    async def test_authentication(self) -> Dict[str, Any]:
        """Test authentication mechanisms"""
        results = {
            "name": "Authentication Tests",
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "critical_issues": 0,
            "details": []
        }
        
        # Test OAuth flow
        try:
            test_token = self.oauth.create_access_token({"sub": "test_user"})
            decoded = jwt.decode(
                test_token,
                self.oauth.SECRET_KEY,
                algorithms=[self.oauth.ALGORITHM]
            )
            assert decoded["sub"] == "test_user"
            results["passed"] += 1
            results["details"].append({
                "test": "OAuth Token Generation/Validation",
                "status": "PASSED",
                "severity": "CRITICAL"
            })
        except Exception as e:
            results["failed"] += 1
            results["critical_issues"] += 1
            results["details"].append({
                "test": "OAuth Token Generation/Validation",
                "status": "FAILED",
                "severity": "CRITICAL",
                "error": str(e)
            })
        
        results["total_tests"] = results["passed"] + results["failed"]
        return results
        
    async def test_ssl_configuration(self) -> Dict[str, Any]:
        """Test SSL/TLS configuration"""
        results = {
            "name": "SSL/TLS Tests",
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "critical_issues": 0,
            "details": []
        }
        
        # Test TLS 1.3 support
        try:
            context = ssl.create_default_context()
            assert ssl.PROTOCOL_TLS_CLIENT
            assert context.minimum_version >= ssl.TLSVersion.TLSv1_3
            results["passed"] += 1
            results["details"].append({
                "test": "TLS 1.3 Support",
                "status": "PASSED",
                "severity": "CRITICAL"
            })
        except Exception as e:
            results["failed"] += 1
            results["critical_issues"] += 1
            results["details"].append({
                "test": "TLS 1.3 Support",
                "status": "FAILED",
                "severity": "CRITICAL",
                "error": str(e)
            })
        
        results["total_tests"] = results["passed"] + results["failed"]
        return results
        
    async def test_token_security(self) -> Dict[str, Any]:
        """Test token security measures"""
        results = {
            "name": "Token Security Tests",
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "critical_issues": 0,
            "details": []
        }
        
        # Test refresh token mechanism
        try:
            refresh_token = self.oauth.create_refresh_token("test_user")
            new_access = await self.oauth.refresh_access_token(refresh_token)
            assert new_access["token_type"] == "bearer"
            assert "access_token" in new_access
            results["passed"] += 1
            results["details"].append({
                "test": "Refresh Token Mechanism",
                "status": "PASSED",
                "severity": "HIGH"
            })
        except Exception as e:
            results["failed"] += 1
            results["details"].append({
                "test": "Refresh Token Mechanism",
                "status": "FAILED",
                "severity": "HIGH",
                "error": str(e)
            })
        
        results["total_tests"] = results["passed"] + results["failed"]
        return results
        
    async def test_data_security(self) -> Dict[str, Any]:
        """Test data security measures"""
        results = {
            "name": "Data Security Tests",
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "critical_issues": 0,
            "details": []
        }
        
        # Test data anonymization
        try:
            test_record = {
                "id": "test123",
                "name": "John Doe",
                "medical_data": "sensitive info"
            }
            encrypted_record = self.encryption.encrypt_record(test_record)
            assert "name" in encrypted_record
            assert isinstance(encrypted_record["name"], dict)
            assert "ciphertext" in encrypted_record["name"]
            results["passed"] += 1
            results["details"].append({
                "test": "Data Anonymization",
                "status": "PASSED",
                "severity": "CRITICAL"
            })
        except Exception as e:
            results["failed"] += 1
            results["critical_issues"] += 1
            results["details"].append({
                "test": "Data Anonymization",
                "status": "FAILED",
                "severity": "CRITICAL",
                "error": str(e)
            })
        
        results["total_tests"] = results["passed"] + results["failed"]
        return results
