# Backend build stage
FROM golang:1.24 AS build
WORKDIR /app

# Copy the backend source and the OpenAPI spec (referenced at ../openapi.yaml)
COPY backend/ ./backend/
COPY openapi.yaml ./openapi.yaml

WORKDIR /app/backend
RUN go mod tidy && CGO_ENABLED=1 go build -o /app/bin/mygolangapp main.go

# Runtime stage
FROM golang:1.24
WORKDIR /app

COPY --from=build /app/bin/mygolangapp /app/mygolangapp
COPY openapi.yaml /app/openapi.yaml

# The app expects the OpenAPI spec at ../openapi.yaml relative to the working dir.
WORKDIR /app/backend
COPY --from=build /app/openapi.yaml /app/backend/../openapi.yaml

ENV HTTP_ADDR=:8080 \
    OPENAPIYAML_LOCATION=../openapi.yaml \
    JWT_SECRET=dev-secret-replace-me \
    JWT_EXPIRED=24h

EXPOSE 8080
CMD ["/app/mygolangapp"]