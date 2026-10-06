from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
from routes.auth import router as auth_router
from database.database import engine, Base
from database import models
from routes.devices import router as devices_router
from routes.sensors import router as sensors_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plant Disease Detection API")

# Разрешаем запросы с любого адреса (для разработки; позже можно ограничить)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(auth_router)
app.include_router(devices_router)
app.include_router(sensors_router)

@app.get("/")
def read_root():
    return {"message": "The Plant Disease Detection API is operational.!"}

