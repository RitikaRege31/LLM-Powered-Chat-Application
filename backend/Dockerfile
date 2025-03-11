# # Use official Python image as base
# FROM python:3.10

# # Set working directory inside the container
# WORKDIR /app

# # Copy the requirements file and install dependencies
# COPY requirements.txt .

# # Install dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the application code
# COPY . .

# # Expose port 8000 for Django and WebSockets
# EXPOSE 8000

# # Set environment variables
# ENV DJANGO_SETTINGS_MODULE=project.settings \
#     PYTHONUNBUFFERED=1

# # Run migrations and start ASGI server
# CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 project.asgi:application"]
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "project.wsgi:application"]
