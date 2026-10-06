import tensorflow as tf
import json
import numpy as np
from PIL import Image
import io

# Загружаем модель один раз при старте сервера
model = tf.keras.models.load_model('models/plant_disease_model.keras')

# Загружаем названия классов
with open('models/class_names.json', 'r') as f:
    class_names = json.load(f)

def predict_disease(image_bytes: bytes):
    # Открываем фото из байтов
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Приводим к нужному размеру (тот же, что был при обучении - 224x224)
    image = image.resize((224, 224))
    
    # Превращаем в массив и нормализуем (как при обучении)
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # добавляем batch dimension
    
    # Делаем предсказание
    predictions = model.predict(img_array)
    predicted_class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_class_idx])
    
    predicted_class_name = class_names[str(predicted_class_idx)]
    
    result = {
            "disease": predicted_class_name,
            "confidence": round(confidence * 100, 2)
        }
        
    if confidence < 0.6:
            result["warning"] = "Low model confidence. Try taking a clearer photo in good lighting."
        
    return result