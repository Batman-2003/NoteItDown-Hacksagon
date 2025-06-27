package main

import (
	"fmt"
	"log"

	// "gin-sqlite-gorm-demo/models" // Import your models package
	"com.example.database_trial/models"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB global variable to hold the database connection
var DB *gorm.DB

func main() {
	// Initialize database connection
	initDB()

	// Initialize Gin router
	router := gin.Default()

	// Pass the DB connection to the context or make it accessible
	// A common pattern is to use middleware to attach the DB to the context.
	// For simplicity, we'll access the global DB variable directly in handlers.
	// In larger applications, dependency injection or a middleware approach is better.

	// Define API routes
	router.POST("/users", createUser)
	// router.GET("/users", getUsers)
	// router.GET("/users/:id", getUserByID)
	// router.PUT("/users/:id", updateUser)
	// router.DELETE("/users/:id", deleteUser)

	// Run the Gin server
	err := router.Run(":8080")
	if err != nil {
		log.Fatalf("Gin server failed to start: %v", err)
	}
}

// initDB initializes the SQLite database connection using GORM
func initDB() {
	var err error
	// Open a connection to a SQLite database file named "test.db"
	// If the file doesn't exist, it will be created.
	DB, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// AutoMigrate will automatically create or update the table schema based on your model.
	// It's convenient for development but be cautious in production.
	err = DB.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to auto migrate database: %v", err)
	}

	log.Println("Database connection successful and schema migrated!")
}

func createUser(c *gin.Context) {
	// TODO: insert function
	fmt.Printf("did it work? ")
}
