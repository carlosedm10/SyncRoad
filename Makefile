# Project Variables
DOCKER_COMPOSE_DEV=docker-compose-dev.yml
DATABASE_CONTAINER=syncroad_database
BACKEND_CONTAINER=syncroad_backend
FRONTEND_CONTAINER=syncroad_frontend


# ------------------------------ Setup ------------------------------ #

build:
	docker compose -f $(DOCKER_COMPOSE_DEV) up -d  --force-recreate --build
	@echo "Backend is running at http://localhost:8000"
	@echo "Frontend (Metro) is running at http://localhost:8081"

start:
	docker compose -f $(DOCKER_COMPOSE_DEV) up -d --force-recreate
	@echo "Backend is running at http://localhost:8000"
	@echo "Frontend (Metro) is running at http://localhost:8081"

stop:
	docker compose -f $(DOCKER_COMPOSE_DEV) down

# ----------------------------- Terminals ----------------------------- #

connect-to-database:
	docker exec -it $(DATABASE_CONTAINER) psql -U syncroad -d syncroad

connect-to-backend:
	docker exec -it $(BACKEND_CONTAINER) /bin/bash

connect-to-frontend:
	docker exec -it $(FRONTEND_CONTAINER) bash

# ----------------------------- Debugging ----------------------------- #

show-database-logs:
	docker logs -n 100 -f $(DATABASE_CONTAINER)

show-backend-logs:
	docker logs -f $(BACKEND_CONTAINER)

show-frontend-logs:
	docker logs -f $(FRONTEND_CONTAINER)

# ----------------------------- Linting ----------------------------- #

format-backend:
	docker exec $(BACKEND_CONTAINER) poetry run black api/

format-frontend:
	docker exec $(FRONTEND_CONTAINER) npx prettier --write .

# Format all code
format-all:
	make format-backend
	make format-frontend


# TODO: Add tests
# # Run backend tests
# test:
# 	docker exec $(BACKEND_CONTAINER) poetry run pytest api/ --maxfail=1 --disable-warnings --cov=api

# # Run single backend test
# test-single:
# 	docker exec $(BACKEND_CONTAINER) poetry run pytest $(TEST) --maxfail=1 --disable-warnings
