package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Types

type SignUpRequestBody struct {
	Name     string `json:"name" binding: "required"`
	Password string `json:"password" binding: "required"`
}

type SignUpResponseBody struct {
	// 1. Confirmation http.StatusOK
	// 2. @TODO: Failed

	Body string `json:"body" binding: "required"`
}

func main() {
	router := gin.Default()

	router.POST("/users", func(c *gin.Context) {
		var signUpRequest SignUpRequestBody
		if err := c.ShouldBindBodyWithJSON(&signUpRequest); err != nil {
			// TODO: @Handle Error
			log.Fatal(err.Error())
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(signUpRequest.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Error hashing password: %v", err)
		}

		// TODO: Handle Password Mismatch
		if err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(signUpRequest.Password)); err != nil {
			fmt.Println("The Password doesn't match")
		}

		fmt.Printf("name: %v | password: %v | hashedPassword: %s\n", signUpRequest.Name, signUpRequest.Password, hashedPassword)
		c.JSON(http.StatusOK, SignUpResponseBody{
			Body: "Sign Up Confirmed",
		})

	})

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "msg",
		})
	})

	err := router.Run(":8080")
	if err != nil {
		panic(err)
	}
}
