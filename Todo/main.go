package main

import (
	"Todo/db"
	"Todo/routers"
	"os"

	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {

	db.ConnectDB()

	app := fiber.New()

	app.Use(cors.New())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Hello"})
	})
	routers.AuthRouter(app)
	routers.TodoRouter(app)

	port := os.Getenv("PORT")

	log.Fatal(app.Listen(":"+port))
}
