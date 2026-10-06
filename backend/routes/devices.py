from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.database import get_db
from database.models import Device, User
from utils.security import get_current_user

router = APIRouter()

class DeviceCreate(BaseModel):
    name: str

@router.post("/devices")
def create_device(
    data: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_device = Device(user_id=current_user.id, name=data.name)
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return {"device_id": new_device.id, "name": new_device.name}


@router.get("/devices")
def get_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    devices = db.query(Device).filter(Device.user_id == current_user.id).all()
    return [{"device_id": d.id, "name": d.name} for d in devices]