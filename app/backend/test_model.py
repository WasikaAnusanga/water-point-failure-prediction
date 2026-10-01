import joblib

model_path = "notebooks/final_optimized_model.joblib"

model = joblib.load(model_path)

print("Model loaded successfully!")
print("Model type:", type(model))