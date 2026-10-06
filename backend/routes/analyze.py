from fastapi import APIRouter, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from typing import Optional
from ml.predict import predict_disease
from database.database import get_db
from database.models import Diagnosis, User, SensorReading, Device
from utils.security import get_current_user
from utils.watering_logic import calculate_days_since_watering
from utils.diagnosis_reasoning import generate_reasoning

router = APIRouter()

@router.post("/analyze")
async def analyze_plant(
    file: UploadFile = File(...),
    device_id: Optional[int] = Form(None),  # опционально - если None, значит Этап 2 пропущен
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_bytes = await file.read()
    result = predict_disease(image_bytes)
    
    reasoning = None
    sensor_data = None
    
    if device_id is not None:
        device = db.query(Device).filter(Device.id == device_id, Device.user_id == current_user.id).first()
        
        if device:
            latest = db.query(SensorReading).filter(
                SensorReading.device_id == device_id
            ).order_by(SensorReading.timestamp.desc()).first()
            
            if latest:
                days_since_watering = calculate_days_since_watering(device_id, db)
                
                reasoning = generate_reasoning(
                    disease=result["disease"],
                    soil_moisture=latest.soil_moisture,
                    temperature=latest.temperature,
                    air_humidity=latest.air_humidity,
                    days_since_watering=days_since_watering
                )
                
                sensor_data = {
                    "soil_moisture": latest.soil_moisture,
                    "temperature": latest.temperature,
                    "air_humidity": latest.air_humidity,
                    "days_since_watering": days_since_watering
                }
    
    new_diagnosis = Diagnosis(
        user_id=current_user.id,
        device_id=device_id,
        disease=result["disease"],
        confidence=result["confidence"],
        reasoning=reasoning
    )
    db.add(new_diagnosis)
    db.commit()
    db.refresh(new_diagnosis)
    
    response = {
        "diagnosis_id": new_diagnosis.id,
        "disease": result["disease"],
        "confidence": result["confidence"],
        "timestamp": new_diagnosis.timestamp.isoformat(),
        "reasoning": reasoning,
        "sensor_data": sensor_data
    }
    
    return response


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diagnoses = db.query(Diagnosis).filter(Diagnosis.user_id == current_user.id).order_by(Diagnosis.timestamp.desc()).all()
    
    return [
        {
            "diagnosis_id": d.id,
            "disease": d.disease,
            "confidence": d.confidence,
            "reasoning": d.reasoning,
            "timestamp": d.timestamp.isoformat()
        }
        for d in diagnoses
    ]