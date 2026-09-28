package middleware

import (
	"context"
	"fmt"
	"strings"

	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/golang-jwt/jwt/v5"
)

// AuthenticationFunc returns an openapi3filter.AuthenticationFunc that validates
// the JWT bearer token presented on protected routes. It returns nil on success
// or an error that the OpenAPI validator turns into a 401 response.
func AuthenticationFunc(jwtSecret []byte) openapi3filter.AuthenticationFunc {
	return func(ctx context.Context, input *openapi3filter.AuthenticationInput) error {
		req := input.RequestValidationInput.Request
		authHeader := req.Header.Get("Authorization")
		if authHeader == "" {
			return input.NewError(fmt.Errorf("missing bearer token"))
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return input.NewError(fmt.Errorf("invalid authorization header"))
		}

		tokenStr := parts[1]
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unsupported signing method")
			}
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			return input.NewError(fmt.Errorf("invalid or expired token"))
		}

		// store the authenticated user id in the request context for downstream handlers
		sub, _ := claims["sub"].(string)
		ctx = context.WithValue(ctx, "userID", sub)
		input.RequestValidationInput.Request = input.RequestValidationInput.Request.WithContext(ctx)
		return nil
	}
}
