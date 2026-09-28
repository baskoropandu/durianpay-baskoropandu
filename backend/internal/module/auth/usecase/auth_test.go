package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// mockUserRepo is a minimal in-memory UserRepository.
type mockUserRepo struct {
	user *entity.User
	err  error
}

func (m *mockUserRepo) GetUserByEmail(email string) (*entity.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	if m.user == nil || m.user.Email != email {
		return nil, entity.ErrorNotFound("user not found")
	}
	return m.user, nil
}

func makeUser(email, passwordHash, role string) *entity.User {
	return &entity.User{
		ID:           "1",
		Email:        email,
		PasswordHash: passwordHash,
		Role:         role,
	}
}

func TestLogin_Success(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to hash: %v", err)
	}
	repo := &mockUserRepo{user: makeUser("cs@test.com", string(hash), "cs")}
	uc := NewAuthUsecase(repo, []byte("secret"), time.Hour)

	token, user, err := uc.Login("cs@test.com", "password")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if user == nil || user.Email != "cs@test.com" {
		t.Fatalf("expected user, got %v", user)
	}
	if token == "" {
		t.Fatal("expected a JWT token")
	}

	// Verify the token is a valid JWT signed with our secret.
	claims := jwt.MapClaims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte("secret"), nil
	})
	if err != nil || !parsed.Valid {
		t.Fatalf("token should be valid: %v", err)
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to hash: %v", err)
	}
	repo := &mockUserRepo{user: makeUser("cs@test.com", string(hash), "cs")}
	uc := NewAuthUsecase(repo, []byte("secret"), time.Hour)

	_, _, err = uc.Login("cs@test.com", "wrong-password")
	if err == nil {
		t.Fatal("expected error for wrong password")
	}
	var appErr *entity.AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Code != entity.ErrorCodeUnauthorized {
		t.Fatalf("expected unauthorized, got %s", appErr.Code)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	repo := &mockUserRepo{user: nil}
	uc := NewAuthUsecase(repo, []byte("secret"), time.Hour)

	_, _, err := uc.Login("nobody@test.com", "password")
	if err == nil {
		t.Fatal("expected error for missing user")
	}
	var appErr *entity.AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Code != entity.ErrorCodeNotFound {
		t.Fatalf("expected not_found, got %s", appErr.Code)
	}
}
