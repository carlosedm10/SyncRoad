# Use the official Python image
FROM python:3.11

# Set environment variables for Poetry
ENV POETRY_VERSION=1.8.2 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PATH="$POETRY_HOME/bin:$PATH"

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Set the working directory inside the container
WORKDIR /app

# Copy Poetry config first (better caching)
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry install --no-root --no-dev

# Now, copy the actual FastAPI application inside "api/"
COPY api .

# Expose the FastAPI default port
EXPOSE 8000

# Run the application from inside "api/"
CMD ["poetry", "run", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
