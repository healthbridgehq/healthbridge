from typing import List, Dict, Optional
import openai
from datetime import datetime
from fastapi import HTTPException
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
from .database import Database
from .encryption import EncryptionService

class AIService:
    def __init__(self, db: Database, encryption_service: EncryptionService):
        self.db = db
        self.encryption_service = encryption_service
        self.openai_client = openai.OpenAI()
        self._load_models()

    def _load_models(self):
        """Load or initialize ML models"""
        try:
            self.health_trend_model = joblib.load('models/health_trend_model.pkl')
            self.scaler = joblib.load('models/scaler.pkl')
        except FileNotFoundError:
            # Models will be trained on first use
            self.health_trend_model = None
            self.scaler = StandardScaler()

    async def structure_medical_record(self, raw_text: str) -> Dict:
        """
        Use NLP to structure raw medical text into standardized format
        """
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """
                    You are a medical data structuring assistant. Convert the raw medical text 
                    into a structured format following these categories:
                    - Chief Complaint
                    - History of Present Illness
                    - Past Medical History
                    - Medications
                    - Allergies
                    - Physical Examination
                    - Assessment
                    - Plan
                    Ensure all sensitive information is handled appropriately.
                    """},
                    {"role": "user", "content": raw_text}
                ],
                temperature=0.1,  # Low temperature for consistent formatting
                max_tokens=1000
            )
            
            structured_data = response.choices[0].message.content
            return self._parse_structured_response(structured_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error structuring medical record: {str(e)}")

    async def generate_health_insights(self, patient_id: str) -> Dict:
        """
        Generate AI-driven insights from patient health data
        """
        # Fetch encrypted patient data
        patient_data = await self.db.get_patient_health_data(patient_id)
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient data not found")

        # Decrypt and prepare data for analysis
        decrypted_data = self._prepare_health_data(patient_data)
        
        # Generate trends and insights
        trends = self._analyze_health_trends(decrypted_data)
        insights = await self._generate_personalized_insights(decrypted_data)
        
        return {
            "trends": trends,
            "insights": insights,
            "generated_at": datetime.utcnow().isoformat()
        }

    async def handle_patient_query(self, query: str, patient_context: Dict) -> Dict:
        """
        Process patient queries using AI chatbot while ensuring privacy
        """
        try:
            # Create a privacy-aware context for the AI
            sanitized_context = self._sanitize_patient_context(patient_context)
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """
                    You are a healthcare assistant. Provide helpful information while:
                    1. Never making specific medical recommendations
                    2. Always encouraging consultation with healthcare providers
                    3. Only using provided context, never assuming additional information
                    4. Maintaining strict privacy and confidentiality
                    """},
                    {"role": "user", "content": f"Context: {sanitized_context}\nQuery: {query}"}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return {
                "response": response.choices[0].message.content,
                "disclaimer": "This information is for general purposes only and should not replace professional medical advice.",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

    def _prepare_health_data(self, encrypted_data: Dict) -> Dict:
        """Decrypt and prepare health data for analysis"""
        decrypted_data = {}
        for key, value in encrypted_data.items():
            if isinstance(value, str):
                try:
                    decrypted_data[key] = self.encryption_service.decrypt(value)
                except:
                    decrypted_data[key] = value  # Non-encrypted field
            else:
                decrypted_data[key] = value
        return decrypted_data

    def _analyze_health_trends(self, health_data: Dict) -> Dict:
        """Analyze health data for trends and patterns"""
        trends = {
            "vitals": self._analyze_vitals_trends(health_data.get("vitals", [])),
            "medications": self._analyze_medication_adherence(health_data.get("medications", [])),
            "conditions": self._analyze_condition_progression(health_data.get("conditions", []))
        }
        return trends

    async def _generate_personalized_insights(self, health_data: Dict) -> List[Dict]:
        """Generate personalized health insights using AI"""
        try:
            # Prepare a privacy-conscious summary of health data
            health_summary = self._create_health_summary(health_data)
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """
                    Generate evidence-based health insights while:
                    1. Focusing on general patterns and trends
                    2. Avoiding specific medical advice
                    3. Emphasizing the importance of professional medical consultation
                    4. Maintaining patient privacy
                    """},
                    {"role": "user", "content": health_summary}
                ],
                temperature=0.5,
                max_tokens=800
            )
            
            insights = self._parse_insights_response(response.choices[0].message.content)
            return insights
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

    def _sanitize_patient_context(self, context: Dict) -> Dict:
        """Remove sensitive information from patient context"""
        sensitive_fields = {'ssn', 'address', 'phone', 'email', 'dob'}
        return {k: v for k, v in context.items() if k not in sensitive_fields}

    def _parse_structured_response(self, response: str) -> Dict:
        """Parse the structured response from OpenAI into a standardized format"""
        # Implementation would parse the response into a structured dictionary
        pass

    def _create_health_summary(self, health_data: Dict) -> str:
        """Create a privacy-conscious summary of health data for AI analysis"""
        # Implementation would create a summary while removing sensitive information
        pass

    def _parse_insights_response(self, response: str) -> List[Dict]:
        """Parse AI-generated insights into structured format"""
        # Implementation would parse the response into structured insights
        pass
