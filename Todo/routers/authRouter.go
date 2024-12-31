package routers

import (
	"Todo/db"
	"Todo/models"
	"Todo/utils"
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthRouter(app *fiber.App) {

	Users := db.GetClient().Database("Todo").Collection("users")

	auth := app.Group("/api/auth")

	auth.Post("/register", func(c *fiber.Ctx) error {
		var user models.User
		err := c.BodyParser(&user)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON("Bad Request")
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var temp models.User
		err = Users.FindOne(ctx, bson.M{"username": user.Username}).Decode(&temp)
		if err == nil {
			return c.Status(fiber.StatusBadRequest).JSON("Username Already Exists")
		}

		err = Users.FindOne(ctx, bson.M{"email": user.Email}).Decode(&temp)
		if err == nil {
			return c.Status(fiber.StatusBadRequest).JSON("Email Already Exists")
		}

		hashedPass, err := utils.HashPassword(user.Password)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON("Failed to Hash Password")
		}
		user.Password = hashedPass
		user.Id = primitive.NewObjectID()

		_, err = Users.InsertOne(ctx, user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON("Failed to Insert")
		}
		return c.JSON("Registered Successfully:)")
	})

	auth.Post("/login", func(c *fiber.Ctx) error {
		var user models.User
		err := c.BodyParser(&user)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON("Bad Request")
		}
		
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var temp models.User
		err=Users.FindOne(ctx,bson.M{"email":user.Email}).Decode(&temp)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON("User doesn't exists")
		}
		
		if !utils.CheckPasswordHash(user.Password,temp.Password){
			return c.Status(fiber.StatusUnauthorized).JSON("Invalid Credentials")
		}

		token,err:=utils.GenerateToken(temp.Id.Hex())
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON("Failed to generate token")
		}

		return c.JSON(fiber.Map{"token":token})
	})
}
