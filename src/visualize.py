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
# LOAD MODEL
# ---------------------------
model = load_model("models/lstm_model.h5", compile=False)

# ---------------------------
# PREDICT
# ---------------------------
y_pred = model.predict(X_val).flatten()

# ---------------------------
# METRICS
# ---------------------------
rmse = np.sqrt(mean_squared_error(y_val, y_pred))
mae = mean_absolute_error(y_val, y_pred)

print("RMSE:", rmse)
print("MAE:", mae)

# ---------------------------
# 1. SCATTER PLOT
# ---------------------------
plt.figure()
plt.scatter(y_val, y_pred)
plt.xlabel("Actual RUL")
plt.ylabel("Predicted RUL")
plt.title("Predicted vs Actual (Scatter)")
plt.grid()
plt.show()

# ---------------------------
# 2. SORTED LINE PLOT (BEST GRAPH)
# ---------------------------
sorted_idx = np.argsort(y_val)

plt.figure()
plt.plot(y_val[sorted_idx], label="Actual")
plt.plot(y_pred[sorted_idx], label="Predicted")
plt.legend()
plt.title("Actual vs Predicted RUL (Sorted)")
plt.xlabel("Samples")
plt.ylabel("RUL")
plt.grid()
plt.show()

# ---------------------------
# 3. ERROR DISTRIBUTION
# ---------------------------
errors = y_val - y_pred

plt.figure()
plt.hist(errors, bins=30)
plt.title("Error Distribution")
plt.xlabel("Error")
plt.ylabel("Frequency")
plt.grid()
plt.show()

# ---------------------------
# 4. SAMPLE PREDICTION (FIRST 100)
# ---------------------------
plt.figure()
plt.plot(y_val[:100], label="Actual")
plt.plot(y_pred[:100], label="Predicted")
plt.legend()
plt.title("Sample Prediction (First 100)")
plt.xlabel("Samples")
plt.ylabel("RUL")
plt.grid()
plt.show()