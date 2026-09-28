package usecase

import (
	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/module/payments/repository"
)

// validStatuses are the only allowed payment statuses.
var validStatuses = map[string]bool{
	"completed":  true,
	"processing": true,
	"failed":     true,
}

type PaymentUsecase interface {
	ListPayments(status, sort, id string, page, limit int) (*repository.PaymentPage, error)
	GetSummary(status, id string) (*repository.PaymentSummary, error)
}

type Payment struct {
	repo repository.PaymentRepository
}

func NewPaymentUsecase(repo repository.PaymentRepository) *Payment {
	return &Payment{repo: repo}
}

// ListPayments validates the status filter and delegates to the repository.
func (p *Payment) ListPayments(status, sort, id string, page, limit int) (*repository.PaymentPage, error) {
	if status != "" && !validStatuses[status] {
		return nil, entity.ErrorBadRequest("invalid status: must be one of completed, processing, failed")
	}
	return p.repo.ListPayments(status, sort, id, page, limit)
}

// GetSummary validates the status filter and returns aggregate statistics.
func (p *Payment) GetSummary(status, id string) (*repository.PaymentSummary, error) {
	if status != "" && !validStatuses[status] {
		return nil, entity.ErrorBadRequest("invalid status: must be one of completed, processing, failed")
	}
	return p.repo.GetSummary(status, id)
}
