from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional

def build_model(input_shape):
    model = Sequential()

    # First Bidirectional LSTM layer
    model.add(Bidirectional(LSTM(64, return_sequences=True), input_shape=input_shape))
    # training=True enables Monte Carlo Dropout during inference
    model.add(Dropout(0.2))

    # Second Bidirectional LSTM layer
    model.add(Bidirectional(LSTM(32)))
    model.add(Dropout(0.2))

    # Output layer
    model.add(Dense(1))

    return model