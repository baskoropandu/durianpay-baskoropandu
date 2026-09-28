package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/golang-jwt/jwt/v5"
)

// buildInput builds an AuthenticationInput for the given Authorization header.
func buildInput(authHeader string) *openapi3filter.AuthenticationInput {
	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments", nil)
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}
	rv := &openapi3filter.RequestValidationInput{
		Request: req,
	}
	return &openapi3filter.AuthenticationInput{
		RequestValidationInput: rv,
		SecuritySchemeName:     "bearerAuth",
	}
}

func TestAuthenticationFunc_MissingToken(t *testing.T) {
	auth := AuthenticationFunc([]byte("secret"))
	err := auth(context.Background(), buildInput(""))
	if err == nil {
		t.Fatal("expected error for missing token")
	}
}

func TestAuthenticationFunc_InvalidToken(t *testing.T) {
	auth := AuthenticationFunc([]byte("secret"))
	err := auth(context.Background(), buildInput("Bearer not-a-valid-token"))
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestAuthenticationFunc_ValidToken(t *testing.T) {
	auth := AuthenticationFunc([]byte("secret"))

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "1",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	signed, err := token.SignedString([]byte("secret"))
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	err = auth(context.Background(), buildInput("Bearer "+signed))
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
}

func TestAuthenticationFunc_WrongSecret(t *testing.T) {
	auth := AuthenticationFunc([]byte("secret"))

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "1",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	signed, err := token.SignedString([]byte("wrong-secret"))
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	err = auth(context.Background(), buildInput("Bearer "+signed))
	if err == nil {
		t.Fatal("expected error for wrong secret")
	}
}
