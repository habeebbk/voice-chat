import socket

SERVER_IP = '0.0.0.0'   # Listen on all interfaces
PORT = 5007
BUFFER_SIZE = 4096
OUTPUT_FILE = 'received_audio.wav'

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((SERVER_IP, PORT))
server_socket.listen(1)

print(f"Receiver listening on port {PORT}...")

conn, addr = server_socket.accept()
print(f"Connection established with {addr}")

with open(OUTPUT_FILE, 'wb') as f:
    while True:
        data = conn.recv(BUFFER_SIZE)
        if not data:
            break
        f.write(data)

print(f"File received and saved as {OUTPUT_FILE}")

conn.close()
server_socket.close()
