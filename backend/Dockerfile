# Use the official Python image
FROM python:3.11

# Set the working directory inside the container
WORKDIR /app

# Install poetry
ENV POETRY_REQUESTS_TIMEOUT=40
RUN pip install poetry==1.8.3
RUN pip install lockfile
RUN poetry lock

# Install dependencies
COPY pyproject.toml ./
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi

# Copy code
COPY . /code/
