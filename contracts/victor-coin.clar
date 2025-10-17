;; Victor Coin - SIP-010 Fungible Token
;; A decentralized digital currency on the Stacks blockchain

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))

;; Define fungible token
(define-fungible-token victor-coin)

;; Token metadata
(define-data-var token-name (string-ascii 32) "Victor Coin")
(define-data-var token-symbol (string-ascii 10) "VIC")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) none)

;; Total supply (1 billion tokens with 6 decimals)
(define-constant total-supply u1000000000000000)

;; Initialize contract by minting total supply to contract owner
(ft-mint? victor-coin total-supply contract-owner)

;; SIP-010 compliant token (trait implementation can be added during deployment)

;; Transfer function
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-transfer? victor-coin amount sender recipient)
  )
)

;; Get name
(define-read-only (get-name)
  (ok (var-get token-name))
)

;; Get symbol
(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

;; Get decimals
(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

;; Get balance
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance victor-coin who))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply victor-coin))
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Mint tokens (only contract owner)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? victor-coin amount recipient)
  )
)

;; Burn tokens
(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (or (is-eq tx-sender owner) (is-eq contract-caller owner)) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? victor-coin amount owner)
  )
)

;; Set token URI (only contract owner)
(define-public (set-token-uri (uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set token-uri uri)
    (ok true)
  )
)

;; Get contract owner
(define-read-only (get-owner)
  (ok contract-owner)
)

;; Send many - batch transfer function
(define-public (send-many (recipients (list 200 {to: principal, amount: uint, memo: (optional (buff 34))})))
  (fold check-err (map send-token recipients) (ok true))
)

(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior ok-value result err-value (err err-value))
)

(define-private (send-token (recipient {to: principal, amount: uint, memo: (optional (buff 34))}))
  (transfer (get amount recipient) tx-sender (get to recipient) (get memo recipient))
)
