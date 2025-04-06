from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, root_validator


class ModuleBase(BaseModel):
    """Base class for optical module data."""
    module_id: str = Field(..., description="Unique module identifier: <vendor>-<datacenter>-<pod>-<rack>-<switch>-<interface>-<speed>")
    vendor: str = Field(..., description="Optical module vendor (e.g., CISCO, HUAWEI)")
    datacenter: str = Field(..., description="Datacenter identifier")
    pod: str = Field(..., description="Pod identifier")
    rack: str = Field(..., description="Rack identifier")
    switch: str = Field(..., description="Switch hostname")
    interface: str = Field(..., description="Interface identifier")
    device_ip: str = Field(..., description="Device IP address")
    speed: str = Field(..., description="Interface speed (e.g., 100G)")
    serial_number: str = Field(..., description="Module serial number")
    part_number: Optional[str] = Field(None, description="Module part number")
    firmware_version: Optional[str] = Field(None, description="Module firmware version")
    status: str = Field("active", description="Module status (active, inactive, failed)")
    health_score: Optional[float] = Field(None, description="Module health score (0-100)")


class ModuleCreate(ModuleBase):
    """Schema for creating a new module."""
    form_factor: Optional[str] = None
    wavelength: Optional[float] = None
    distance: Optional[float] = None
    temperature: Optional[float] = None
    voltage: Optional[float] = None
    current: Optional[float] = None
    tx_power: Optional[float] = None
    rx_power: Optional[float] = None


class ModuleUpdate(BaseModel):
    """Schema for updating an existing module."""
    vendor: Optional[str] = None
    part_number: Optional[str] = None
    firmware_version: Optional[str] = None
    status: Optional[str] = None
    health_score: Optional[float] = None
    

class Module(ModuleBase):
    """Schema for module details with database fields."""
    created_at: datetime
    last_updated: datetime
    
    class Config:
        from_attributes = True
        exclude = {"_sa_instance_state"}


class MetricPoint(BaseModel):
    """Schema for a single metric data point."""
    timestamp: datetime
    value: float

    class Config:
        orm_mode = True
        
    # 使用模型方法代替validator装饰器
    def __init__(self, **data):
        if 'timestamp' in data and isinstance(data['timestamp'], str):
            data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        super().__init__(**data)


class ModuleMetrics(BaseModel):
    """Schema for optical module metric data."""
    module_id: str
    metrics: Dict[str, List[MetricPoint]] = Field(..., description="Dictionary of metric name to list of data points")
    start_time: datetime
    end_time: datetime

    class Config:
        orm_mode = True
        
    # 使用模型方法代替validator装饰器
    def __init__(self, **data):
        if 'start_time' in data and isinstance(data['start_time'], str):
            data['start_time'] = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        if 'end_time' in data and isinstance(data['end_time'], str):
            data['end_time'] = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        super().__init__(**data)


class PredictionPoint(BaseModel):
    """Schema for a prediction point."""
    timestamp: datetime
    value: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None


class ModulePrediction(BaseModel):
    """Schema for optical module prediction data."""
    module_id: str
    predictions: Dict[str, List[PredictionPoint]] = Field(..., description="Dictionary of metric name to list of prediction points")
    model_used: str = Field(..., description="Model used for prediction")
    created_at: datetime
    confidence: Optional[float] = None
    risk_level: Optional[str] = None
    expected_failure_time: Optional[datetime] = None