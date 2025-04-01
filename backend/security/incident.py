from enum import Enum
from datetime import datetime
from typing import Dict, List, Optional
import logging
import json
import os
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class IncidentSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentType(Enum):
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DATA_BREACH = "data_breach"
    DDOS = "ddos_attack"
    MALWARE = "malware"
    API_ABUSE = "api_abuse"
    COMPLIANCE_VIOLATION = "compliance_violation"

class IncidentStatus(Enum):
    NEW = "new"
    INVESTIGATING = "investigating"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    CLOSED = "closed"

class SecurityIncident:
    def __init__(
        self,
        incident_type: IncidentType,
        severity: IncidentSeverity,
        description: str,
        affected_resources: List[str],
        ip_addresses: Optional[List[str]] = None,
        user_ids: Optional[List[str]] = None
    ):
        self.id = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        self.type = incident_type
        self.severity = severity
        self.description = description
        self.affected_resources = affected_resources
        self.ip_addresses = ip_addresses or []
        self.user_ids = user_ids or []
        self.status = IncidentStatus.NEW
        self.created_at = datetime.utcnow()
        self.updated_at = self.created_at
        self.resolution = None
        self.timeline = [{
            "timestamp": self.created_at,
            "status": self.status.value,
            "note": "Incident created"
        }]

class IncidentResponseHandler:
    def __init__(self):
        self.incidents_dir = Path("incidents")
        self.incidents_dir.mkdir(exist_ok=True)
        
        # Load configuration
        self.notify_email = os.getenv("SECURITY_NOTIFY_EMAIL")
        self.smtp_host = os.getenv("SMTP_HOST", "localhost")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
    
    def create_incident(self, **kwargs) -> SecurityIncident:
        """Create a new security incident."""
        incident = SecurityIncident(**kwargs)
        self._save_incident(incident)
        self._notify_team(incident)
        return incident
    
    def update_incident(
        self,
        incident_id: str,
        status: Optional[IncidentStatus] = None,
        resolution: Optional[str] = None,
        note: Optional[str] = None
    ) -> SecurityIncident:
        """Update an existing security incident."""
        incident = self._load_incident(incident_id)
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")
        
        if status:
            incident.status = status
        if resolution:
            incident.resolution = resolution
        
        incident.updated_at = datetime.utcnow()
        incident.timeline.append({
            "timestamp": incident.updated_at,
            "status": incident.status.value,
            "note": note or "Status updated"
        })
        
        self._save_incident(incident)
        self._notify_team(incident, is_update=True)
        return incident
    
    def _save_incident(self, incident: SecurityIncident):
        """Save incident to file system."""
        incident_path = self.incidents_dir / f"{incident.id}.json"
        with open(incident_path, "w") as f:
            json.dump({
                "id": incident.id,
                "type": incident.type.value,
                "severity": incident.severity.value,
                "description": incident.description,
                "affected_resources": incident.affected_resources,
                "ip_addresses": incident.ip_addresses,
                "user_ids": incident.user_ids,
                "status": incident.status.value,
                "created_at": incident.created_at.isoformat(),
                "updated_at": incident.updated_at.isoformat(),
                "resolution": incident.resolution,
                "timeline": [{
                    "timestamp": entry["timestamp"].isoformat(),
                    "status": entry["status"],
                    "note": entry["note"]
                } for entry in incident.timeline]
            }, f, indent=2)
    
    def _load_incident(self, incident_id: str) -> Optional[SecurityIncident]:
        """Load incident from file system."""
        incident_path = self.incidents_dir / f"{incident_id}.json"
        if not incident_path.exists():
            return None
            
        with open(incident_path) as f:
            data = json.load(f)
            incident = SecurityIncident(
                incident_type=IncidentType(data["type"]),
                severity=IncidentSeverity(data["severity"]),
                description=data["description"],
                affected_resources=data["affected_resources"],
                ip_addresses=data["ip_addresses"],
                user_ids=data["user_ids"]
            )
            incident.id = data["id"]
            incident.status = IncidentStatus(data["status"])
            incident.created_at = datetime.fromisoformat(data["created_at"])
            incident.updated_at = datetime.fromisoformat(data["updated_at"])
            incident.resolution = data["resolution"]
            incident.timeline = [{
                "timestamp": datetime.fromisoformat(entry["timestamp"]),
                "status": entry["status"],
                "note": entry["note"]
            } for entry in data["timeline"]]
            return incident
    
    def _notify_team(self, incident: SecurityIncident, is_update: bool = False):
        """Notify security team about incident."""
        if not self.notify_email:
            logger.warning("No security notification email configured")
            return
            
        subject = f"{'[UPDATE]' if is_update else '[NEW]'} Security Incident: {incident.severity.value.upper()}"
        body = f"""
        Security Incident Report
        -----------------------
        ID: {incident.id}
        Type: {incident.type.value}
        Severity: {incident.severity.value}
        Status: {incident.status.value}
        Description: {incident.description}
        
        Affected Resources:
        {chr(10).join('- ' + r for r in incident.affected_resources)}
        
        IP Addresses: {', '.join(incident.ip_addresses) if incident.ip_addresses else 'None'}
        User IDs: {', '.join(incident.user_ids) if incident.user_ids else 'None'}
        
        Timeline:
        {chr(10).join(f'- {entry["timestamp"].isoformat()}: {entry["note"]}' for entry in incident.timeline)}
        
        Resolution: {incident.resolution or 'Pending'}
        """
        
        try:
            msg = MIMEMultipart()
            msg["From"] = self.smtp_user
            msg["To"] = self.notify_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.smtp_user and self.smtp_pass:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
                
        except Exception as e:
            logger.error(f"Failed to send incident notification: {e}")
            
    def get_active_incidents(self) -> List[SecurityIncident]:
        """Get all active (non-closed) incidents."""
        incidents = []
        for incident_file in self.incidents_dir.glob("*.json"):
            incident = self._load_incident(incident_file.stem)
            if incident and incident.status != IncidentStatus.CLOSED:
                incidents.append(incident)
        return incidents
    
    def get_incident_statistics(self) -> Dict:
        """Get statistics about security incidents."""
        all_incidents = [
            self._load_incident(f.stem)
            for f in self.incidents_dir.glob("*.json")
        ]
        
        return {
            "total_incidents": len(all_incidents),
            "by_severity": {
                severity.value: len([
                    i for i in all_incidents
                    if i.severity == severity
                ])
                for severity in IncidentSeverity
            },
            "by_status": {
                status.value: len([
                    i for i in all_incidents
                    if i.status == status
                ])
                for status in IncidentStatus
            },
            "by_type": {
                type.value: len([
                    i for i in all_incidents
                    if i.type == type
                ])
                for type in IncidentType
            }
        }
