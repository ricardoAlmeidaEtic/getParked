.PHONY: up down build logs ps clean setup db-setup db-migrate db-studio

setup:
	@echo "Creating .env file..."
	@if [ ! -f .env ]; then \
		echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nextjs_db"' > .env; \
		echo 'NODE_ENV="development"' >> .env; \
	fi

up: setup
	docker-compose up -d

down:
	docker-compose down

build: setup
	npm run prisma:generate
	docker-compose build

logs:
	docker-compose logs -f

ps:
	docker-compose ps

db-setup:
	npm run prisma:generate

db-migrate:
	npm run prisma:migrate

db-studio:
	npm run prisma:studio

clean:
	docker-compose down -v
	docker system prune -f 