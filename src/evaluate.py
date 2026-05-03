import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from sklearn.metrics import mean_squared_error, mean_absolute_error

# ---------------------------
# LOAD DATA
# ---------------------------
X_val = np.load("data/processed/X_val.npy")
y_val = np.load("data/processed/y_val.npy")

# ---------------------------
# LOAD MODEL (FIXED)
# ---------------------------
model = load_model("models/lstm_model.h5", compile=False)

# ---------------------------
# PREDICT
# ---------------------------
y_pred = model.predict(X_val)

# ---------------------------
# METRICS
# ---------------------------
rmse = np.sqrt(mean_squared_error(y_val, y_pred))
mae = mean_absolute_error(y_val, y_pred)

print("RMSE:", rmse)
print("MAE:", mae)

# ---------------------------
# PLOT
# ---------------------------
plt.figure(figsize=(8,6))
plt.scatter(y_val[:200], y_pred[:200])
plt.xlabel("Actual RUL")
plt.ylabel("Predicted RUL")
plt.title("Predicted vs Actual (Sample)")
plt.show()
# ---------------------------
# SORTED PLOT (BETTER VISUAL)
# ---------------------------
plt.figure(figsize=(10,6))

# Sort values for better visualization
sorted_idx = np.argsort(y_val)
plt.plot(y_val[sorted_idx], label="Actual RUL")
plt.plot(y_pred[sorted_idx], label="Predicted RUL")

plt.legend()
plt.title("Actual vs Predicted RUL (Sorted)")
plt.xlabel("Samples")
plt.ylabel("RUL")
plt.show()