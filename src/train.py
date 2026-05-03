import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.optimizers.schedules import CosineDecay
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.utils import Sequence
from model import build_model
print("Training started")

# ---------------------------
# LOAD DATA
# ---------------------------
X_train = np.load("data/processed/X_train.npy", mmap_mode='r')
y_train = np.load("data/processed/y_train.npy", mmap_mode='r')

X_val = np.load("data/processed/X_val.npy", mmap_mode='r')
y_val = np.load("data/processed/y_val.npy", mmap_mode='r')

# ---------------------------
# BUILD MODEL
# ---------------------------
model = build_model(input_shape=(X_train.shape[1], X_train.shape[2]))

# ---------------------------
# COSINE ANNEALING LR
# ---------------------------
# Estimate total steps: (num_samples / batch_size) * epochs
total_steps = (len(X_train) // 64) * 40
lr_schedule = CosineDecay(
    initial_learning_rate=0.001,
    decay_steps=total_steps,
    alpha=0.01  # Minimum LR = 0.00001
)

model.compile(
    optimizer=Adam(learning_rate=lr_schedule),
    loss='mse'
)

model.summary()

# ---------------------------
# CALLBACKS
# ---------------------------
early_stop = EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

checkpoint = ModelCheckpoint(
    "models/lstm_model.h5",
    monitor='val_loss',
    save_best_only=True
)

class DataGenerator(Sequence):
    def __init__(self, x_set, y_set, batch_size):
        self.x, self.y = x_set, y_set
        self.batch_size = batch_size

    def __len__(self):
        return int(np.ceil(len(self.x) / float(self.batch_size)))

    def __getitem__(self, idx):
        batch_x = self.x[idx * self.batch_size:(idx + 1) * self.batch_size]
        batch_y = self.y[idx * self.batch_size:(idx + 1) * self.batch_size]
        
        # Soft regression-focused sample weighting:
        # Gives weight 2.0 at RUL=0 and 1.0 at RUL=125
        weights = 1.0 + ((125.0 - batch_y) / 125.0)
        
        return np.array(batch_x), np.array(batch_y), np.array(weights)

train_gen = DataGenerator(X_train, y_train, 64)
val_gen = DataGenerator(X_val, y_val, 64)

# ---------------------------
# TRAIN
# ---------------------------
history = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=40,
    callbacks=[early_stop, checkpoint]
)

print("Training complete!")

# ---------------------------
# PLOT LOSS CURVE
# ---------------------------
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.legend()
plt.title("Loss Curve")
plt.xlabel("Epochs")
plt.ylabel("Loss")
plt.savefig("models/loss_curve.png")