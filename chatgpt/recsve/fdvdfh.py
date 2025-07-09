import socket

# Sender configuration
SERVER_IP = '192.168.1.25'  # Replace with the receiver device's LAN IP
PORT = 5007
BUFFER_SIZE = 4096

# Send the file over LAN
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((SERVER_IP, PORT))

with open(WAVE_OUTPUT_FILENAME, 'rb') as f:
    while True:
        data = f.read(BUFFER_SIZE)
        if not data:
            break
        client_socket.sendall(data)

print("File sent successfully.")

client_socket.close()
