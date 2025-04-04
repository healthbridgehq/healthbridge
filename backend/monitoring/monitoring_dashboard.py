from typing import Dict, List, Any
from datetime import datetime
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from .performance_monitor import PerformanceMonitor
from ..security.testing.security_test_suite import SecurityTestSuite
from ..compliance.compliance_monitor import ComplianceMonitor
from ..ai.ethics_monitor import AIEthicsMonitor
from ..database import Database
from ..cache import CacheManager
from ..security.encryption import HealthDataEncryption
from ..security.oauth import OAuth2Handler
from ..security.audit_service import AuditService

logger = logging.getLogger(__name__)

class MonitoringDashboard:
    """Central monitoring dashboard for HealthBridge"""
    
    def __init__(
        self,
        db: Database,
        cache_manager: CacheManager,
        encryption: HealthDataEncryption,
        oauth: OAuth2Handler,
        audit_service: AuditService
    ):
        self.db = db
        self.cache = cache_manager
        self.encryption = encryption
        self.oauth = oauth
        self.audit_service = audit_service
        
        # Initialize monitoring systems
        self.performance_monitor = PerformanceMonitor(db, cache_manager)
        self.security_suite = SecurityTestSuite(db, encryption, oauth)
        self.compliance_monitor = ComplianceMonitor(db, encryption)
        self.ai_ethics_monitor = AIEthicsMonitor(db, audit_service)
        
        # Store historical data
        self.monitoring_history = []
        
    async def run_comprehensive_monitoring(self) -> Dict[str, Any]:
        """Run all monitoring systems and generate comprehensive report"""
        try:
            # Run all monitoring systems concurrently
            performance_task = asyncio.create_task(
                self.performance_monitor.monitor_system_performance()
            )
            security_task = asyncio.create_task(
                self.security_suite.run_full_security_audit()
            )
            compliance_task = asyncio.create_task(
                self.compliance_monitor.run_compliance_audit()
            )
            ethics_task = asyncio.create_task(
                self.ai_ethics_monitor.run_ethics_audit()
            )
            
            # Wait for all tasks to complete
            results = await asyncio.gather(
                performance_task,
                security_task,
                compliance_task,
                ethics_task
            )
            
            # Compile comprehensive report
            report = {
                "timestamp": datetime.utcnow().isoformat(),
                "performance": results[0],
                "security": results[1],
                "compliance": results[2],
                "ai_ethics": results[3],
                "overall_health": self._calculate_overall_health(results),
                "critical_issues": self._identify_critical_issues(results),
                "recommendations": await self._generate_recommendations(results)
            }
            
            # Store in history
            self.monitoring_history.append(report)
            if len(self.monitoring_history) > 100:  # Keep last 100 reports
                self.monitoring_history.pop(0)
                
            return report
            
        except Exception as e:
            logger.error(f"Comprehensive monitoring failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Monitoring system failure"
            )
            
    def _calculate_overall_health(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate overall system health score"""
        try:
            scores = {
                "performance": self._extract_score(results[0]),
                "security": self._extract_score(results[1]),
                "compliance": self._extract_score(results[2]),
                "ai_ethics": self._extract_score(results[3])
            }
            
            # Calculate weighted average
            weights = {
                "performance": 0.25,
                "security": 0.3,
                "compliance": 0.25,
                "ai_ethics": 0.2
            }
            
            overall_score = sum(
                scores[key] * weights[key]
                for key in scores
                if scores[key] is not None
            )
            
            return {
                "score": overall_score,
                "status": self._get_health_status(overall_score),
                "component_scores": scores
            }
            
        except Exception as e:
            logger.error(f"Health score calculation failed: {str(e)}")
            return {
                "score": 0,
                "status": "ERROR",
                "component_scores": {}
            }
            
    def _identify_critical_issues(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify critical issues from all monitoring systems"""
        critical_issues = []
        
        try:
            # Check performance issues
            if "issues" in results[0]:
                for issue in results[0]["issues"]:
                    if issue["severity"] in ["HIGH", "CRITICAL"]:
                        critical_issues.append({
                            "system": "Performance",
                            "issue": issue
                        })
                        
            # Check security issues
            if "critical_issues" in results[1]:
                critical_issues.extend([
                    {"system": "Security", "issue": issue}
                    for issue in results[1]["results"]
                    if issue["severity"] == "CRITICAL"
                ])
                
            # Check compliance issues
            if "critical_issues" in results[2]:
                critical_issues.extend([
                    {"system": "Compliance", "issue": issue}
                    for issue in results[2]["checks"]
                    if issue["severity"] == "CRITICAL"
                ])
                
            # Check AI ethics issues
            if "critical_issues" in results[3]:
                critical_issues.extend([
                    {"system": "AI Ethics", "issue": issue}
                    for issue in results[3]["checks"]
                    if issue["severity"] == "CRITICAL"
                ])
                
            return critical_issues
            
        except Exception as e:
            logger.error(f"Critical issues identification failed: {str(e)}")
            return []
            
    async def _generate_recommendations(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on monitoring results"""
        recommendations = []
        
        try:
            # Performance recommendations
            if "recommendations" in results[0]:
                recommendations.extend([
                    {
                        "category": "Performance",
                        "priority": rec["severity"],
                        "recommendation": rec["recommendation"],
                        "impact": "System performance and user experience"
                    }
                    for rec in results[0]["recommendations"]
                ])
                
            # Security recommendations
            if "recommendations" in results[1]:
                recommendations.extend([
                    {
                        "category": "Security",
                        "priority": rec["severity"],
                        "recommendation": rec["action"],
                        "impact": "System security and data protection"
                    }
                    for rec in results[1]["recommendations"]
                ])
                
            # Compliance recommendations
            if "recommendations" in results[2]:
                recommendations.extend([
                    {
                        "category": "Compliance",
                        "priority": rec["severity"],
                        "recommendation": rec["action"],
                        "impact": "Regulatory compliance and legal requirements"
                    }
                    for rec in results[2]["recommendations"]
                ])
                
            # AI ethics recommendations
            if "recommendations" in results[3]:
                recommendations.extend([
                    {
                        "category": "AI Ethics",
                        "priority": rec["severity"],
                        "recommendation": rec["action"],
                        "impact": "AI fairness and ethical considerations"
                    }
                    for rec in results[3]["recommendations"]
                ])
                
            return sorted(
                recommendations,
                key=lambda x: self._get_priority_score(x["priority"]),
                reverse=True
            )
            
        except Exception as e:
            logger.error(f"Recommendations generation failed: {str(e)}")
            return []
            
    def _extract_score(self, result: Dict[str, Any]) -> float:
        """Extract normalized score from monitoring result"""
        try:
            if "score" in result:
                return float(result["score"])
            elif "overall_score" in result:
                return float(result["overall_score"])
            return None
        except (TypeError, ValueError):
            return None
            
    def _get_health_status(self, score: float) -> str:
        """Convert health score to status"""
        if score >= 0.9:
            return "EXCELLENT"
        elif score >= 0.8:
            return "GOOD"
        elif score >= 0.7:
            return "FAIR"
        elif score >= 0.6:
            return "NEEDS_ATTENTION"
        else:
            return "CRITICAL"
            
    def _get_priority_score(self, severity: str) -> int:
        """Convert severity to numeric priority"""
        priorities = {
            "CRITICAL": 4,
            "HIGH": 3,
            "MEDIUM": 2,
            "LOW": 1
        }
        return priorities.get(severity.upper(), 0)
        
    # Additional helper methods would be implemented similarly
