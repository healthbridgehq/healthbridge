from typing import Dict, List, Any, Optional
import time
from datetime import datetime, timedelta
import psutil
import asyncio
import logging
from sqlalchemy import text
from ..database import Database
from ..cache import CacheManager

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """Performance monitoring system for HealthBridge"""
    
    def __init__(
        self,
        db: Database,
        cache_manager: CacheManager
    ):
        self.db = db
        self.cache = cache_manager
        self.metrics_history = []
        
    async def monitor_system_performance(self) -> Dict[str, Any]:
        """Monitor overall system performance"""
        try:
            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "database": await self.monitor_database(),
                "api": await self.monitor_api_performance(),
                "cache": await self.monitor_cache_performance(),
                "system": await self.monitor_system_resources(),
                "query_performance": await self.analyze_query_performance()
            }
            
            # Store metrics history
            self.metrics_history.append(results)
            if len(self.metrics_history) > 1000:  # Keep last 1000 measurements
                self.metrics_history.pop(0)
                
            # Calculate trends
            results["trends"] = self._calculate_performance_trends()
            
            # Generate recommendations
            results["recommendations"] = await self._generate_optimization_recommendations(results)
            
            return results
            
        except Exception as e:
            logger.error(f"Performance monitoring failed: {str(e)}")
            raise
            
    async def monitor_database(self) -> Dict[str, Any]:
        """Monitor database performance metrics"""
        try:
            metrics = {
                "name": "Database Performance",
                "metrics": {},
                "issues": []
            }
            
            # Check connection pool
            pool_stats = await self._check_connection_pool()
            metrics["metrics"]["connection_pool"] = pool_stats
            
            # Check query performance
            query_stats = await self._check_query_performance()
            metrics["metrics"]["query_performance"] = query_stats
            
            # Check index usage
            index_stats = await self._check_index_usage()
            metrics["metrics"]["index_usage"] = index_stats
            
            # Check table statistics
            table_stats = await self._check_table_statistics()
            metrics["metrics"]["table_stats"] = table_stats
            
            # Identify performance issues
            if pool_stats["utilization"] > 80:
                metrics["issues"].append({
                    "severity": "HIGH",
                    "message": "High connection pool utilization"
                })
                
            if query_stats["slow_queries"] > 0:
                metrics["issues"].append({
                    "severity": "MEDIUM",
                    "message": f"Found {query_stats['slow_queries']} slow queries"
                })
                
            return metrics
            
        except Exception as e:
            logger.error(f"Database monitoring failed: {str(e)}")
            raise
            
    async def monitor_api_performance(self) -> Dict[str, Any]:
        """Monitor API endpoint performance"""
        try:
            metrics = {
                "name": "API Performance",
                "metrics": {},
                "issues": []
            }
            
            # Check endpoint response times
            response_times = await self._check_endpoint_response_times()
            metrics["metrics"]["response_times"] = response_times
            
            # Check error rates
            error_rates = await self._check_error_rates()
            metrics["metrics"]["error_rates"] = error_rates
            
            # Check throughput
            throughput = await self._check_api_throughput()
            metrics["metrics"]["throughput"] = throughput
            
            # Identify performance issues
            if response_times["avg_response_time"] > 500:  # 500ms threshold
                metrics["issues"].append({
                    "severity": "HIGH",
                    "message": "High average response time"
                })
                
            if error_rates["error_rate"] > 0.01:  # 1% threshold
                metrics["issues"].append({
                    "severity": "HIGH",
                    "message": "High error rate detected"
                })
                
            return metrics
            
        except Exception as e:
            logger.error(f"API monitoring failed: {str(e)}")
            raise
            
    async def monitor_cache_performance(self) -> Dict[str, Any]:
        """Monitor cache performance metrics"""
        try:
            metrics = {
                "name": "Cache Performance",
                "metrics": {},
                "issues": []
            }
            
            # Check cache hit rate
            hit_rate = await self._check_cache_hit_rate()
            metrics["metrics"]["hit_rate"] = hit_rate
            
            # Check cache size
            cache_size = await self._check_cache_size()
            metrics["metrics"]["cache_size"] = cache_size
            
            # Check cache eviction rate
            eviction_rate = await self._check_cache_eviction_rate()
            metrics["metrics"]["eviction_rate"] = eviction_rate
            
            # Identify performance issues
            if hit_rate["rate"] < 0.8:  # 80% threshold
                metrics["issues"].append({
                    "severity": "MEDIUM",
                    "message": "Low cache hit rate"
                })
                
            if eviction_rate["rate"] > 0.1:  # 10% threshold
                metrics["issues"].append({
                    "severity": "HIGH",
                    "message": "High cache eviction rate"
                })
                
            return metrics
            
        except Exception as e:
            logger.error(f"Cache monitoring failed: {str(e)}")
            raise
            
    async def monitor_system_resources(self) -> Dict[str, Any]:
        """Monitor system resource utilization"""
        try:
            metrics = {
                "name": "System Resources",
                "metrics": {},
                "issues": []
            }
            
            # Check CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)
            metrics["metrics"]["cpu_usage"] = {
                "percentage": cpu_usage,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Check memory usage
            memory = psutil.virtual_memory()
            metrics["metrics"]["memory_usage"] = {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Check disk usage
            disk = psutil.disk_usage('/')
            metrics["metrics"]["disk_usage"] = {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Identify resource issues
            if cpu_usage > 80:
                metrics["issues"].append({
                    "severity": "HIGH",
                    "message": "High CPU usage"
                })
                
            if memory.percent > 85:
                metrics["issues"].append({
                    "severity": "HIGH",
                    "message": "High memory usage"
                })
                
            if disk.percent > 90:
                metrics["issues"].append({
                    "severity": "CRITICAL",
                    "message": "Critical disk usage"
                })
                
            return metrics
            
        except Exception as e:
            logger.error(f"System resource monitoring failed: {str(e)}")
            raise
            
    async def analyze_query_performance(self) -> Dict[str, Any]:
        """Analyze and optimize database query performance"""
        try:
            metrics = {
                "name": "Query Performance",
                "metrics": {},
                "optimizations": []
            }
            
            # Analyze slow queries
            slow_queries = await self._analyze_slow_queries()
            metrics["metrics"]["slow_queries"] = slow_queries
            
            # Check index effectiveness
            index_effectiveness = await self._check_index_effectiveness()
            metrics["metrics"]["index_effectiveness"] = index_effectiveness
            
            # Generate query optimizations
            for query in slow_queries["queries"]:
                optimization = await self._generate_query_optimization(query)
                if optimization:
                    metrics["optimizations"].append(optimization)
                    
            return metrics
            
        except Exception as e:
            logger.error(f"Query performance analysis failed: {str(e)}")
            raise
            
    def _calculate_performance_trends(self) -> Dict[str, Any]:
        """Calculate performance trends from historical data"""
        if len(self.metrics_history) < 2:
            return {}
            
        try:
            trends = {
                "database_performance": self._calculate_metric_trend("database"),
                "api_performance": self._calculate_metric_trend("api"),
                "cache_performance": self._calculate_metric_trend("cache"),
                "system_resources": self._calculate_metric_trend("system")
            }
            
            return trends
            
        except Exception as e:
            logger.error(f"Trend calculation failed: {str(e)}")
            return {}
            
    async def _generate_optimization_recommendations(
        self,
        current_metrics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate performance optimization recommendations"""
        recommendations = []
        
        # Database optimizations
        if "database" in current_metrics:
            db_metrics = current_metrics["database"]
            if "issues" in db_metrics:
                for issue in db_metrics["issues"]:
                    recommendations.append({
                        "category": "database",
                        "severity": issue["severity"],
                        "message": issue["message"],
                        "recommendation": await self._get_db_optimization(issue)
                    })
                    
        # Cache optimizations
        if "cache" in current_metrics:
            cache_metrics = current_metrics["cache"]
            if "issues" in cache_metrics:
                for issue in cache_metrics["issues"]:
                    recommendations.append({
                        "category": "cache",
                        "severity": issue["severity"],
                        "message": issue["message"],
                        "recommendation": await self._get_cache_optimization(issue)
                    })
                    
        return recommendations
        
    # Additional helper methods would be implemented similarly
