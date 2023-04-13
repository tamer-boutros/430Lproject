import numpy as np
import tensorflow as tf

# input data
data = np.array([[1, 100], [2, 200], [3, 300]], dtype=np.float32)
x = data[:, 0:1]
y = data[:, 1:]

# define the model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(10, activation='relu', input_shape=[1]),
    tf.keras.layers.Dense(10, activation='relu'),
    tf.keras.layers.Dense(1)
])

# compile the model
model.compile(optimizer='adam', loss='mse')

# train the model
model.fit(x, y, epochs=1000)

# make predictions
x_new = np.array([[4]], dtype=np.float32)
y_pred = model.predict(x_new)

print(y_pred)
