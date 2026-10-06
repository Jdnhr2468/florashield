from sqlalchemy.orm import Session
from database.models import SensorReading
from datetime import datetime

def calculate_days_since_watering(device_id: int, db: Session):
    # Берём историю показаний за последние 30 дней, отсортированную по времени
    readings = db.query(SensorReading).filter(
        SensorReading.device_id == device_id
    ).order_by(SensorReading.timestamp.asc()).all()
    
    if len(readings) < 2:
        return None  # недостаточно данных для анализа
    
    last_watering_time = None
    
    # Ищем последний резкий скачок влажности вверх (это и есть момент полива)
    THRESHOLD = 15  # порог: скачок влажности больше чем на 15% считаем поливом
    
    for i in range(1, len(readings)):
        prev = readings[i - 1]
        curr = readings[i]
        
        jump = curr.soil_moisture - prev.soil_moisture
        if jump >= THRESHOLD:
            last_watering_time = curr.timestamp
    
    if last_watering_time is None:
        return None  # скачков не найдено за всю историю
    
    days_since = (datetime.utcnow() - last_watering_time).days
    return days_since