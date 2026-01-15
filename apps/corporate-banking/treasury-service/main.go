package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

type HealthResponse struct {
	Status      string    `json:"status"`
	Service     string    `json:"service"`
	Environment string    `json:"environment"`
	Time        time.Time `json:"time"`
}

type TreasuryPosition struct {
	Book     string    `json:"book"`
	Currency string    `json:"currency"`
	Notional float64   `json:"notional"`
	PnL      float64   `json:"pnl"`
	AsOf     time.Time `json:"as_of"`
}

type FXRate struct {
	Pair      string    `json:"pair"`
	Rate      float64   `json:"rate"`
	AsOf      time.Time `json:"as_of"`
	Provider  string    `json:"provider"`
	RateType  string    `json:"rate_type"`
	Timestamp time.Time `json:"timestamp"`
}

func envOrDefault(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func utcNow() time.Time {
	return time.Now().UTC()
}

func main() {
	serviceName := envOrDefault("SERVICE_NAME", "treasury-service")
	environment := envOrDefault("ENVIRONMENT", "local")
	addr := envOrDefault("LISTEN_ADDR", ":8081")

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, HealthResponse{
			Status:      "ok",
			Service:     serviceName,
			Environment: environment,
			Time:        utcNow(),
		})
	})

	mux.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, HealthResponse{
			Status:      "ok",
			Service:     serviceName,
			Environment: environment,
			Time:        utcNow(),
		})
	})

	mux.HandleFunc("/api/v1/treasury/positions", func(w http.ResponseWriter, r *http.Request) {
		positions := []TreasuryPosition{
			{Book: "FX-OPTIONS", Currency: "USD", Notional: 35000000.0, PnL: 125500.0, AsOf: utcNow()},
			{Book: "MMF", Currency: "EUR", Notional: 18000000.0, PnL: -12250.0, AsOf: utcNow()},
			{Book: "BONDS", Currency: "USD", Notional: 12000000.0, PnL: 5420.0, AsOf: utcNow()},
		}
		writeJSON(w, http.StatusOK, positions)
	})

	mux.HandleFunc("/api/v1/treasury/rates", func(w http.ResponseWriter, r *http.Request) {
		asOf := utcNow()
		rates := []FXRate{
			{Pair: "USD/EUR", Rate: 0.91, AsOf: asOf, Provider: "mock", RateType: "spot", Timestamp: asOf},
			{Pair: "USD/INR", Rate: 83.25, AsOf: asOf, Provider: "mock", RateType: "spot", Timestamp: asOf},
			{Pair: "EUR/GBP", Rate: 0.86, AsOf: asOf, Provider: "mock", RateType: "spot", Timestamp: asOf},
		}
		writeJSON(w, http.StatusOK, rates)
	})

	mux.HandleFunc("/api/v1/treasury/hedge/recommendations", func(w http.ResponseWriter, r *http.Request) {
		resp := map[string]any{
			"as_of": utcNow(),
			"recommendations": []map[string]any{
				{
					"pair": "USD/INR",
					"action": "BUY_CALL",
					"notional": 5000000,
					"rationale": "Protect against INR depreciation risk on upcoming vendor payments",
				},
				{
					"pair": "USD/EUR",
					"action": "FORWARD_SELL",
					"notional": 2000000,
					"rationale": "Lock in EUR receivables for Q+1 corporate settlement",
				},
			},
		}
		writeJSON(w, http.StatusOK, resp)
	})

	srv := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("%s starting on %s (env=%s)", serviceName, addr, environment)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
