package usecase

import (
	"errors"
	"testing"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/module/payments/repository"
)

// mockPaymentRepo is a minimal in-memory implementation of PaymentRepository.
type mockPaymentRepo struct {
	payments []entity.Payment
	err      error
}

func (m *mockPaymentRepo) ListPayments(status, sort, id string, page, limit int) (*repository.PaymentPage, error) {
	if m.err != nil {
		return nil, m.err
	}
	var filtered []entity.Payment
	for _, p := range m.payments {
		if status == "" || p.Status == status {
			filtered = append(filtered, p)
		}
	}
	return &repository.PaymentPage{Payments: filtered, Total: len(filtered)}, nil
}

func (m *mockPaymentRepo) GetSummary(status, id string) (*repository.PaymentSummary, error) {
	if m.err != nil {
		return nil, m.err
	}
	var summary repository.PaymentSummary
	for _, p := range m.payments {
		if status != "" && p.Status != status {
			continue
		}
		summary.Total += 1
		summary.TotalAmount += p.Amount
		switch p.Status {
		case "completed":
			summary.Completed += 1
		case "processing":
			summary.Processing += 1
		case "failed":
			summary.Failed += 1
		}
	}
	return &summary, nil
}

func TestListPayments_ValidStatus(t *testing.T) {
	repo := &mockPaymentRepo{
		payments: []entity.Payment{
			{ID: "1", Status: "completed"},
			{ID: "2", Status: "processing"},
			{ID: "3", Status: "failed"},
		},
	}
	uc := NewPaymentUsecase(repo)

	got, err := uc.ListPayments("completed", "", "", 1, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got.Payments) != 1 || got.Payments[0].ID != "1" {
		t.Fatalf("expected 1 completed payment, got %+v", got)
	}
	if got.Total != 1 {
		t.Fatalf("expected total 1, got %d", got.Total)
	}
}

func TestListPayments_InvalidStatus(t *testing.T) {
	repo := &mockPaymentRepo{}
	uc := NewPaymentUsecase(repo)

	_, err := uc.ListPayments("pending", "", "", 1, 10)
	if err == nil {
		t.Fatal("expected error for invalid status")
	}
	var appErr *entity.AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Code != entity.ErrorCodeBadRequest {
		t.Fatalf("expected bad_request code, got %s", appErr.Code)
	}
}

func TestListPayments_NoFilter(t *testing.T) {
	repo := &mockPaymentRepo{
		payments: []entity.Payment{
			{ID: "1", Status: "completed"},
			{ID: "2", Status: "failed"},
		},
	}
	uc := NewPaymentUsecase(repo)

	got, err := uc.ListPayments("", "", "", 1, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got.Payments) != 2 {
		t.Fatalf("expected 2 payments, got %d", len(got.Payments))
	}
}
