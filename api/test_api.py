import numpy as np
import pickle
from tensorflow.keras.models import load_model

# load model
model = load_model("models/lstm_model.h5", compile=False)

# load scaler
with open("models/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# test 1: low stress
seq1 = np.ones((30,17)) * 50
seq1 = scaler.transform(seq1)
seq1 = seq1.reshape(1,30,17)

# test 2: high stress
seq2 = np.ones((30,17)) * 200
seq2 = scaler.transform(seq2)
seq2 = seq2.reshape(1,30,17)

pred1 = model.predict(seq1)[0][0]
pred2 = model.predict(seq2)[0][0]

print("Low stress RUL:", pred1)
print("High stress RUL:", pred2)