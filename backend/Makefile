server_runner_path="./internal/app/service/server/server.go"
go_exec="./main.go"

dev:
	go run $(go_exec)

lint:
	golangci-lint run

psql:
	docker compose -f ../dev.backend.docker-compose.yml exec psql psql -U root keeper

swagger-update:
	@swag init --collectionFormat multi -g $(server_runner_path)

swagger-fmt:
	@swag fmt -g $(server_runner_path)

swagger: swagger-fmt swagger-update
