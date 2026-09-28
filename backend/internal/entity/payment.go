package entity

import "time"

type Payment struct {
	ID           string    `json:"id"`
	MerchantName string    `json:"merchant_name"`
	Amount       float64   `json:"amount"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}
