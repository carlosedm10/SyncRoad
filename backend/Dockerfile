# Use the official Python image
FROM python:3.11

# Set the working directory inside the container
WORKDIR /app

# Copy pyproject.toml and poetry.lock into the container
COPY pyproject.toml poetry.lock* ./

# Install Poetry (adjust version as needed)
RUN pip install poetry==1.8.3

# Configure Poetry to install dependencies into the system environment
RUN poetry config virtualenvs.create false

# Install project dependencies
RUN poetry install --no-interaction --no-ansi

# Copy the rest of the application code
COPY . .

# Expose port 8000 (FastAPI/Uvicorn default)
EXPOSE 8000

# Start the FastAPI application using Uvicorn
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
