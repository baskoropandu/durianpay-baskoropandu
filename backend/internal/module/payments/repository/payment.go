package repository

import (
	"database/sql"
	"strings"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
)

// PaymentPage is the paginated result of a payments query.
type PaymentPage struct {
	Payments []entity.Payment
	Total    int
}

// PaymentSummary holds aggregate statistics across all matching payments.
type PaymentSummary struct {
	Total       int
	Completed   int
	Processing  int
	Failed      int
	TotalAmount float64
}

type PaymentRepository interface {
	ListPayments(status, sort, id string, page, limit int) (*PaymentPage, error)
	GetSummary(status, id string) (*PaymentSummary, error)
}

type Payment struct {
	db *sql.DB
}

func NewPaymentRepo(db *sql.DB) *Payment {
	return &Payment{db: db}
}

// ListPayments returns a page of payments, optionally filtered by status and/or id,
// sorted by the given sort field (prefix "-" for descending), and paginated.
func (r *Payment) ListPayments(status, sort, id string, page, limit int) (*PaymentPage, error) {
	var conditions []string
	var args []interface{}

	if status != "" {
		conditions = append(conditions, "status = ?")
		args = append(args, status)
	}
	if id != "" {
		conditions = append(conditions, "id = ?")
		args = append(args, id)
	}

	where := ""
	if len(conditions) > 0 {
		where = " WHERE " + strings.Join(conditions, " AND ")
	}

	// default sort: newest first
	orderBy := "created_at DESC"
	if sort != "" {
		desc := strings.HasPrefix(sort, "-")
		field := strings.TrimPrefix(sort, "-")
		switch field {
		case "created_at", "amount", "merchant_name", "status":
			orderBy = field
			if desc {
				orderBy += " DESC"
			} else {
				orderBy += " ASC"
			}
		}
	}

	// count total matching rows
	var total int
	countRow := r.db.QueryRow("SELECT COUNT(1) FROM payments"+where, args...)
	if err := countRow.Scan(&total); err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}

	// fetch the requested page
	offset := (page - 1) * limit
	query := `SELECT id, merchant_name, amount, status, created_at FROM payments` + where + " ORDER BY " + orderBy + " LIMIT ? OFFSET ?"
	pageArgs := append(args, limit, offset)

	rows, err := r.db.Query(query, pageArgs...)
	if err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}
	defer rows.Close()

	var payments []entity.Payment
	for rows.Next() {
		var p entity.Payment
		var createdAt string
		if err := rows.Scan(&p.ID, &p.MerchantName, &p.Amount, &p.Status, &createdAt); err != nil {
			return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
		}
		// created_at stored as RFC3339 string
		if t, err := parseTime(createdAt); err == nil {
			p.CreatedAt = t
		}
		payments = append(payments, p)
	}
	if err := rows.Err(); err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}
	return &PaymentPage{Payments: payments, Total: total}, nil
}

// GetSummary computes aggregate statistics across all matching payments.
func (r *Payment) GetSummary(status, id string) (*PaymentSummary, error) {
	var conditions []string
	var args []interface{}

	if status != "" {
		conditions = append(conditions, "status = ?")
		args = append(args, status)
	}
	if id != "" {
		conditions = append(conditions, "id = ?")
		args = append(args, id)
	}

	where := ""
	if len(conditions) > 0 {
		where = " WHERE " + strings.Join(conditions, " AND ")
	}

	// Aggregate counts per status and total amount in a single query.
	row := r.db.QueryRow(
		`SELECT COUNT(1),
		        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0),
		        COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0),
		        COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0),
		        COALESCE(SUM(amount), 0)
		 FROM payments`+where,
		args...,
	)

	var summary PaymentSummary
	if err := row.Scan(&summary.Total, &summary.Completed, &summary.Processing, &summary.Failed, &summary.TotalAmount); err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}
	return &summary, nil
}

func parseTime(s string) (time.Time, error) {
	return time.Parse(time.RFC3339, s)
}
