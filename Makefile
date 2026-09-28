# Durianpay Payments Dashboard — root convenience targets
# Usage: make <target> from the repository root.

.PHONY: help setup backend-deps backend-run backend-build frontend-deps frontend-dev frontend-build test test-backend test-frontend lint lint-backend lint-frontend format format-frontend docker-up docker-down clean

.DEFAULT_GOAL := help

help:
	@echo "Durianpay Payments Dashboard"
	@echo ""
	@echo "Setup:"
	@echo "  make setup            - install backend + frontend dependencies"
	@echo "  make backend-deps     - install Go dependencies"
	@echo "  make frontend-deps    - install frontend dependencies"
	@echo ""
	@echo "Run:"
	@echo "  make backend-run      - start the backend API on :8080"
	@echo "  make frontend-dev     - start the frontend dev server on :5173"
	@echo "  make docker-up        - run the whole stack with Docker Compose"
	@echo ""
	@echo "Build:"
	@echo "  make backend-build    - build the backend binary"
	@echo "  make frontend-build   - build the frontend for production"
	@echo ""
	@echo "Test:"
	@echo "  make test             - run backend + frontend tests"
	@echo "  make test-backend     - run backend tests"
	@echo "  make test-frontend    - run frontend tests"
	@echo ""
	@echo "Lint / Format:"
	@echo "  make lint             - lint backend + frontend"
	@echo "  make format           - format frontend (Prettier)"
	@echo ""
	@echo "Clean:"
	@echo "  make clean            - remove build artifacts and generated files"

# --- Setup ----------------------------------------------------------------

setup: backend-deps frontend-deps

backend-deps:
	cd backend && make dep

frontend-deps:
	cd frontend && npm install

# --- Run ------------------------------------------------------------------

backend-run:
	cd backend && make run

frontend-dev:
	cd frontend && npm run dev

docker-up:
	docker compose up --build

docker-down:
	docker compose down

# --- Build ----------------------------------------------------------------

backend-build:
	cd backend && make build

frontend-build:
	cd frontend && npm run build

# --- Test -----------------------------------------------------------------

test: test-backend test-frontend

test-backend:
	cd backend && go test ./...

test-frontend:
	cd frontend && npm test

# --- Lint / Format --------------------------------------------------------

lint: lint-backend lint-frontend

lint-backend:
	cd backend && go vet ./...

lint-frontend:
	cd frontend && npm run lint

format: format-frontend

format-frontend:
	cd frontend && npm run format

# --- Clean ----------------------------------------------------------------

clean:
	rm -f backend/dashboard.db backend/.env
	rm -rf frontend/dist
	@echo "Cleaned generated files. Run 'make setup' to reinstall if needed."