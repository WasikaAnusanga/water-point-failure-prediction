from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import joblib
import pandas as pd
from app.backend.preprocessing import preprocess_input

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory="app/frontend"),
    name="static"
)

class PredictionInput(BaseModel):
    id: int
    amount_tsh: float
    date_recorded: str
    funder: str
    gps_height: float
    installer: str
    longitude: float
    latitude: float
    wpt_name: str
    num_private: int
    basin: str
    subvillage: str
    region: str
    region_code: int
    district_code: int
    lga: str
    ward: str
    population: int
    public_meeting: bool
    recorded_by: str
    scheme_management: str
    scheme_name: str
    permit: bool
    construction_year: float
    extraction_type: str
    extraction_type_group: str
    extraction_type_class: str
    management: str
    management_group: str
    payment: str
    payment_type: str
    water_quality: str
    quality_group: str
    quantity: str
    quantity_group: str
    source: str
    source_type: str
    source_class: str
    waterpoint_type: str
    waterpoint_type_group: str

model = joblib.load("notebooks/final_optimized_model.joblib")
label_encoder = joblib.load("notebooks/label_encoder.joblib")

@app.get("/")
def home():
    return FileResponse("app/frontend/index.html")

@app.post("/predict")
def predict(data: PredictionInput):

    input_data = data.model_dump()

    input_df = pd.DataFrame([input_data])

    processed_data = preprocess_input(input_df)

    prediction = model.predict(processed_data)

    predicted_class = label_encoder.inverse_transform(prediction)[0]

    probabilities = model.predict_proba(processed_data)[0]

    return {
        "prediction": predicted_class,
        "probabilities": {
            "functional": float(probabilities[0]),
            "functional needs repair": float(probabilities[1]),
            "non_functional": float(probabilities[2])
        }
    }

    return {
        "message": "Water Point Prediction API is running"
    }