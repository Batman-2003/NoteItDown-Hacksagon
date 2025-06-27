package models

import (
	"gorm.io/gorm"
)

// User represents a user in our database
type User struct {
	gorm.Model        // GORM provides ID, CreatedAt, UpdatedAt, DeletedAt fields automatically
	Name       string `json:"name"`
	Password   string `json:"password"` // unique constraint for email
}
