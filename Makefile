# Project Variables
DOCKER_COMPOSE_DEV=docker-compose-dev.yml
BACKEND_CONTAINER=syncroad_backend
FRONTEND_CONTAINER=syncroad_frontend

# Start everything
start:
	docker compose -f $(DOCKER_COMPOSE_DEV) up -d --force-recreate
	@echo "Backend is running at http://localhost:8000"
	@echo "Frontend (Metro) is running at http://localhost:8081"

build:
	docker compose -f $(DOCKER_COMPOSE_DEV) up -d  --force-recreate --build

stop:
	docker compose -f $(DOCKER_COMPOSE_DEV) down

# Format backend code
format-backend:
	docker exec $(BACKEND_CONTAINER) poetry run black api/

# Format frontend code
format-frontend:
	docker exec $(FRONTEND_CONTAINER) npx prettier --write .


# Format all code
format-all:
	make format-backend
	make format-frontend

# For accesing the backend container shell
connect-to-backend:
	docker exec -it $(BACKEND_CONTAINER) /bin/bash

# TODO: Add tests
# # Run backend tests
# test:
# 	docker exec $(BACKEND_CONTAINER) poetry run pytest api/ --maxfail=1 --disable-warnings --cov=api

# # Run single backend test
# test-single:
# 	docker exec $(BACKEND_CONTAINER) poetry run pytest $(TEST) --maxfail=1 --disable-warnings
