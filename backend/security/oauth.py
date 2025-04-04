from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
from .encryption import HealthDataEncryption
from ..models.user import User
from ..database import Database

class OAuth2Handler:
    """OAuth 2.0 implementation for HealthBridge"""
    
    def __init__(self, db: Database, encryption: HealthDataEncryption):
        self.db = db
        self.encryption = encryption
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
        
        # Secure key generation
        self.SECRET_KEY = secrets.token_urlsafe(64)
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.REFRESH_TOKEN_EXPIRE_DAYS = 30
        
    async def authenticate_user(
        self,
        username: str,
        password: str
    ) -> Optional[User]:
        """Authenticate user and verify password"""
        user = await self.db.get_user(username)
        if not user:
            return None
        if not self.pwd_context.verify(password, user.hashed_password):
            return None
        return user
        
    def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            self.SECRET_KEY,
            algorithm=self.ALGORITHM
        )
        return encoded_jwt
        
    def create_refresh_token(self, user_id: str) -> str:
        """Create refresh token"""
        expires = datetime.utcnow() + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
        return self.create_access_token(
            data={"sub": user_id, "type": "refresh"},
            expires_delta=expires
        )
        
    async def get_current_user(
        self,
        token: str = Depends(oauth2_scheme)
    ) -> User:
        """Validate and return current user from token"""
        credentials_exception = HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(
                token,
                self.SECRET_KEY,
                algorithms=[self.ALGORITHM]
            )
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
            
        user = await self.db.get_user(username)
        if user is None:
            raise credentials_exception
        return user
        
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, str]:
        """Generate new access token using refresh token"""
        try:
            payload = jwt.decode(
                refresh_token,
                self.SECRET_KEY,
                algorithms=[self.ALGORITHM]
            )
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=401,
                    detail="Invalid refresh token"
                )
                
            user_id = payload.get("sub")
            user = await self.db.get_user_by_id(user_id)
            
            if not user:
                raise HTTPException(
                    status_code=401,
                    detail="User not found"
                )
                
            access_token = self.create_access_token(
                data={"sub": user.username}
            )
            return {
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except JWTError:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )
            
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)
        
    async def validate_token_scope(
        self,
        token: str,
        required_scope: str
    ) -> bool:
        """Validate token has required scope"""
        try:
            payload = jwt.decode(
                token,
                self.SECRET_KEY,
                algorithms=[self.ALGORITHM]
            )
            scopes = payload.get("scopes", [])
            return required_scope in scopes
        except JWTError:
            return False
