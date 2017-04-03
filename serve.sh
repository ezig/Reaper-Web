#!/bin/sh

cd frontend/static
npm install
cd ../..

cd backend
export FLASK_APP=main.py
python -m flask run --host=0.0.0.0
