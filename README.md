# NoteItDown-Hacksagon

Video Demonstration Link: https://youtu.be/Pnv2gcdDqeE

Team Members:
1. Siddhant Alhat
2. Gaurav Khaire

## Frontend Local Build Instructions:
  1. Open Frontend(inner) folder in a terminal
  2. Install libraries like remarkable, lucid-react, idb
  3. npm run build
  4. npm start

## Backend Local Build Instructions:
  1. Create a virtual environment
  2. Activate the Virtual environment
  3. pip install fastapi[all] passlib[bcrypt] python-jose[cryptography]
  4. copy main.py from Backend/main.py to this new environment that you have created
  5. run this command "uvicorn main:api --port 8080"
