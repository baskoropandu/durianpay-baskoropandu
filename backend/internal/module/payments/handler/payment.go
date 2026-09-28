package handler

import (
	"encoding/json"
	"net/http"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	paymentUsecase "github.com/durianpay/fullstack-boilerplate/internal/module/payments/usecase"
	"github.com/durianpay/fullstack-boilerplate/internal/openapigen"
	"github.com/durianpay/fullstack-boilerplate/internal/transport"
)

type PaymentHandler struct {
	paymentUC paymentUsecase.PaymentUsecase
}

func NewPaymentHandler(paymentUC paymentUsecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{
		paymentUC: paymentUC,
	}
}

func (p *PaymentHandler) GetDashboardV1Payments(w http.ResponseWriter, r *http.Request, params openapigen.GetDashboardV1PaymentsParams) {
	var status, sort, id string
	if params.Status != nil {
		status = *params.Status
	}
	if params.Sort != nil {
		sort = string(*params.Sort)
	}
	if params.Id != nil {
		id = *params.Id
	}

	// pagination defaults
	page := 1
	limit := 10
	if params.Page != nil && *params.Page > 0 {
		page = *params.Page
	}
	if params.Limit != nil && *params.Limit > 0 {
		limit = *params.Limit
	}

	pageResult, err := p.paymentUC.ListPayments(status, sort, id, page, limit)
	if err != nil {
		transport.WriteError(w, err)
		return
	}

	// map entity payments to openapi response
	resp := openapigen.PaymentListResponse{Payments: &[]openapigen.Payment{}}
	for _, p := range pageResult.Payments {
		amount := float32(p.Amount)
		createdAt := p.CreatedAt
		status := openapigen.PaymentStatus(p.Status)
		item := openapigen.Payment{
			Id:           &p.ID,
			MerchantName: &p.MerchantName,
			Amount:       &amount,
			Status:       &status,
			CreatedAt:    &createdAt,
		}
		*resp.Payments = append(*resp.Payments, item)
	}

	total := pageResult.Total
	totalPages := (total + limit - 1) / limit
	resp.Total = &total
	resp.Page = &page
	resp.Limit = &limit
	resp.TotalPages = &totalPages

	// aggregate summary across all matching payments (not just the current page)
	summary, err := p.paymentUC.GetSummary(status, id)
	if err != nil {
		transport.WriteError(w, err)
		return
	}
	totalAmount := float32(summary.TotalAmount)
	resp.Summary = &openapigen.Summary{
		Total:       &summary.Total,
		Completed:   &summary.Completed,
		Processing:  &summary.Processing,
		Failed:      &summary.Failed,
		TotalAmount: &totalAmount,
	}

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		transport.WriteAppError(w, entity.ErrorInternal("internal server error"))
		return
	}
}
