from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

# ===== ANALYTICS DATA MODELS =====
class NotionAnalyticsRow(BaseModel):
    """Single row from Notion CSV analytics export."""
    social_file: str  # Video ID/Name
    retention_hook: str  # Hook type
    hook_title: str  # Hook text
    dominance_line: Optional[str] = None
    open_loop: Optional[str] = None
    close: Optional[str] = None
    resolve_script: str  # Full script text
    watch_hours_secs: Optional[float] = 0.0
    retention_percent: float
    likes: int = 0
    comments: int = 0
    subs_per_1000_views: Optional[float] = 0.0

class AnalyticsData(BaseModel):
    """Analytics data stored in MongoDB."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    social_file: str
    retention_hook: str
    hook_title: str
    dominance_line: Optional[str] = None
    open_loop: Optional[str] = None
    close: Optional[str] = None
    resolve_script: str
    watch_hours_secs: float = 0.0
    retention_percent: float
    likes: int = 0
    comments: int = 0
    subs_per_1000_views: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ===== OPTIMIZED SCRIPT GENERATION =====
class OptimizedScriptRequest(BaseModel):
    """Request for ML-optimized script generation."""
    topic: Optional[str] = None
    mode: str = "FAITH_EXPLICIT"
    keywords: List[str] = Field(default_factory=list)
    use_analytics: bool = True  # Toggle for analytics-based optimization
    top_n_examples: int = 3  # Use top N performing examples