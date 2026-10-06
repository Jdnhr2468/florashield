def generate_reasoning(disease: str, soil_moisture: float, temperature: float, air_humidity: float, days_since_watering):
    reasoning_parts = []
    
    disease_lower = disease.lower()
    
    # Грибковые болезни - связаны с избыточной влажностью
    fungal_diseases = ["blight", "mold", "spot"]
    is_fungal = any(keyword in disease_lower for keyword in fungal_diseases)
    
    if is_fungal:
        if soil_moisture > 70 or air_humidity > 80:
            reasoning_parts.append(
                "Высокая влажность почвы/воздуха создаёт благоприятные условия для развития грибковой инфекции."
            )
        if temperature > 25:
            reasoning_parts.append(
                "Повышенная температура ускоряет развитие грибковых заболеваний."
            )
    
    # Вирусные болезни - часто связаны со стрессом растения (недостаток влаги)
    viral_diseases = ["virus", "mosaic"]
    is_viral = any(keyword in disease_lower for keyword in viral_diseases)
    
    if is_viral and days_since_watering is not None and days_since_watering > 5:
        reasoning_parts.append(
            f"Растение не поливалось {days_since_watering} дн. — ослабленный иммунитет мог повысить восприимчивость к вирусу."
        )
    
    # Проверка на недостаточный полив в целом
    if days_since_watering is not None and days_since_watering > 7:
        reasoning_parts.append(
            f"Растение не поливалось уже {days_since_watering} дн. Рекомендуется полить в ближайшее время."
        )
    
    # Если растение здоровое
    if "healthy" in disease_lower:
        if days_since_watering is not None and days_since_watering > 7:
            reasoning_parts.append(
                f"Растение выглядит здоровым, но не поливалось {days_since_watering} дн. — рекомендуется полить в ближайшее время для профилактики."
            )
        else:
            reasoning_parts.append("Растение здорово, условия окружающей среды в норме.")
    
    if not reasoning_parts:
        reasoning_parts.append("Недостаточно данных для точного определения причины.")
    
    return " ".join(reasoning_parts)