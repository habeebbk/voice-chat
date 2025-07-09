import socket
import threading
import tkinter as tk
import pyaudio

# Audio config
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
RECORD_SECONDS = 5

server_ip = '192.168.1.5'  # replace with receiver IP
server_port = 5001

def record_and_send():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((server_ip, server_port))

    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

    print("* Recording")
    for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        client_socket.sendall(data)
    print("* Done Recording")

    stream.stop_stream()
    stream.close()
    p.terminate()
    client_socket.close()

root = tk.Tk()
root.title("Sender")

tk.Button(root, text="Record & Send Audio", command=lambda: threading.Thread(target=record_and_send).start()).pack(pady=10)

root.mainloop()
