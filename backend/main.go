package main

import (
	"database/sql"
	"log"
	"math/rand"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/api"
	"github.com/durianpay/fullstack-boilerplate/internal/config"
	ah "github.com/durianpay/fullstack-boilerplate/internal/module/auth/handler"
	ar "github.com/durianpay/fullstack-boilerplate/internal/module/auth/repository"
	au "github.com/durianpay/fullstack-boilerplate/internal/module/auth/usecase"
	ph "github.com/durianpay/fullstack-boilerplate/internal/module/payments/handler"
	pr "github.com/durianpay/fullstack-boilerplate/internal/module/payments/repository"
	pu "github.com/durianpay/fullstack-boilerplate/internal/module/payments/usecase"
	srv "github.com/durianpay/fullstack-boilerplate/internal/service/http"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load()

	db, err := sql.Open("sqlite3", "dashboard.db?_foreign_keys=1")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := initDB(db); err != nil {
		log.Fatal(err)
	}

	JwtExpiredDuration, err := time.ParseDuration(config.JwtExpired)
	if err != nil {
		panic(err)
	}

	userRepo := ar.NewUserRepo(db)

	authUC := au.NewAuthUsecase(userRepo, config.JwtSecret, JwtExpiredDuration)

	authH := ah.NewAuthHandler(authUC)

	paymentRepo := pr.NewPaymentRepo(db)
	paymentUC := pu.NewPaymentUsecase(paymentRepo)
	paymentH := ph.NewPaymentHandler(paymentUC)

	apiHandler := &api.APIHandler{
		Auth:     authH,
		Payments: paymentH,
	}

	server := srv.NewServer(apiHandler, config.OpenapiYamlLocation)

	addr := config.HttpAddress
	log.Printf("starting server on %s", addr)
	server.Start(addr)
}

func initDB(db *sql.DB) error {
	// create tables if not exists
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  email TEXT NOT NULL UNIQUE,
		  password_hash TEXT NOT NULL,
		  role TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS payments (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  merchant_name TEXT NOT NULL,
		  amount REAL NOT NULL,
		  status TEXT NOT NULL,
		  created_at DATETIME NOT NULL
		);`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return err
		}
	}
	// seed admin user if not exists
	var cnt int
	row := db.QueryRow("SELECT COUNT(1) FROM users")
	if err := row.Scan(&cnt); err != nil {
		return err
	}
	if cnt == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		if _, err := db.Exec("INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)", "cs@test.com", string(hash), "cs"); err != nil {
			return err
		}
		if _, err := db.Exec("INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)", "operation@test.com", string(hash), "operation"); err != nil {
			return err
		}
	}

	// seed payments if not exists
	var payCnt int
	payRow := db.QueryRow("SELECT COUNT(1) FROM payments")
	if err := payRow.Scan(&payCnt); err != nil {
		return err
	}
	if payCnt == 0 {
		if err := seedPayments(db); err != nil {
			return err
		}
	}

	const dbLifetime = time.Minute * 5
	db.SetConnMaxLifetime(dbLifetime)
	return nil
}

// seedPayments inserts a realistic set of sample payments across all statuses.
func seedPayments(db *sql.DB) error {
	merchants := []string{
		"Toko Elektronik Jaya", "Kopi Nusantara", "Fashion House", "Grosir Sembako",
		"Bengkel Motor Prima", "Apotek Sehat", "Restoran Padang Sederhana", "Toko Buku Gramedia",
		"Supermarket FreshMart", "Laundry Express", "Cafe Senja", "Toko Handphone Cell",
		"Salon Cantik", "Optik Jernih", "Toko Sepatu Sport", "Minimarket 24 Jam",
		"Toko Kue Manis", "Bengkel AC Dingin", "Toko Perabot Rumah", "Klinik Gigi Senyum",
	}
	statuses := []string{"completed", "processing", "failed"}
	now := time.Now()

	// deterministic pseudo-random generator for reproducible seed data
	rng := rand.New(rand.NewSource(42))

	for i := 1; i <= 50; i++ {
		merchant := merchants[rng.Intn(len(merchants))]
		status := statuses[rng.Intn(len(statuses))]
		amount := float64(10000+rng.Intn(990000)) + float64(rng.Intn(99))/100
		createdAt := now.Add(-time.Duration(rng.Intn(30*24)) * time.Hour)

		if _, err := db.Exec(
			"INSERT INTO payments(merchant_name, amount, status, created_at) VALUES (?, ?, ?, ?)",
			merchant, amount, status, createdAt.Format(time.RFC3339),
		); err != nil {
			return err
		}
	}
	return nil
}
