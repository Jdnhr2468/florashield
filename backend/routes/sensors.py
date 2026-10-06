from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from database.database import get_db
from database.models import SensorReading, Device, User
from utils.security import get_current_user

router = APIRouter()

class SensorData(BaseModel):
    device_id: int
    soil_moisture: float
    temperature: float
    air_humidity: float

# Этот endpoint будет вызывать сам ESP32 (без авторизации пользователя - устройство работает автономно)
@router.post("/sensors/data")
def receive_sensor_data(data: SensorData, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Устройство не найдено")
    
    reading = SensorReading(
        device_id=data.device_id,
        soil_moisture=data.soil_moisture,
        temperature=data.temperature,
        air_humidity=data.air_humidity
    )
    db.add(reading)
    db.commit()
    return {"status": "ok"}


# Получить последние показания устройства (для использования на сайте)
@router.get("/sensors/latest/{device_id}")
def get_latest_reading(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    device = db.query(Device).filter(Device.id == device_id, Device.user_id == current_user.id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Устройство не найдено")
    
    latest = db.query(SensorReading).filter(
        SensorReading.device_id == device_id
    ).order_by(SensorReading.timestamp.desc()).first()
    
    if not latest:
        return {"message": "Пока нет данных с датчиков"}
    
    seconds_ago = (datetime.utcnow() - latest.timestamp).total_seconds()
    minutes_ago = round(seconds_ago / 60, 1)
    
    return {
        "soil_moisture": latest.soil_moisture,
        "temperature": latest.temperature,
        "air_humidity": latest.air_humidity,
        "timestamp": latest.timestamp.isoformat(),
        "minutes_ago": minutes_ago,
        "is_fresh": minutes_ago < 15  # считаем "свежими" данные младше 15 минут (наш интервал замера)
    }

# Пользователь нажимает "Обновить сейчас"
@router.post("/sensors/request-update/{device_id}")
def request_update(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    device = db.query(Device).filter(Device.id == device_id, Device.user_id == current_user.id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Устройство не найдено")
    
    device.force_update_requested = True
    db.commit()
    return {"status": "Запрос на обновление отправлен"}


# ESP32 периодически проверяет, есть ли команда для него
@router.get("/sensors/check-update/{device_id}")
def check_update(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Устройство не найдено")
    
    should_update = device.force_update_requested
    
    if should_update:
        device.force_update_requested = False  # сбрасываем флаг после проверки
        db.commit()
    
    return {"should_update": should_update}