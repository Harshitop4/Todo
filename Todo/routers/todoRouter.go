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

func TodoRouter(app *fiber.App) {
	Todos := db.GetClient().Database("Todo").Collection("Todos")

	route := app.Group("/api/todos")

	route.Get("/", utils.JWTMiddleware(), func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userId := c.Locals("userID").(string)
		userID, _ := primitive.ObjectIDFromHex(userId)
		cursor, err := Todos.Find(ctx, bson.M{"userid": userID})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch todos"})
		}
		var todoList []models.Todo
		err = cursor.All(ctx, &todoList)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to parse todos",
			})
		}
		return c.JSON(todoList)
	})

	route.Post("/", utils.JWTMiddleware(), func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var todo models.Todo
		err := c.BodyParser(&todo)
		if err != nil || todo.Title == "" || todo.Description == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid data"})
		}

		userId := c.Locals("userID").(string)
		todo.Id = primitive.NewObjectID()
		todo.UserId, _ = primitive.ObjectIDFromHex(userId)
		todo.Completed = false
		todo.Created_at = time.Now()

		result, err := Todos.InsertOne(ctx, todo)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create todo"})
		}

		return c.JSON(result)
	})

	route.Put("/:id", utils.JWTMiddleware(), func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var todo models.Todo
		err := c.BodyParser(&todo)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid data"})
		}

		todoId, _ := primitive.ObjectIDFromHex(c.Params("id"))

		var temp models.Todo
		err = Todos.FindOne(ctx, bson.M{"_id": todoId}).Decode(&temp)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Task doesn't exists!"})
		}
		if todo.Title == "" {
			todo.Title = temp.Title
		}
		if todo.Description == "" {
			todo.Description = temp.Description
		}
		result, err := Todos.UpdateOne(ctx, bson.M{"_id": todoId}, bson.M{"$set": bson.M{"title": todo.Title, "description": todo.Description, "completed": todo.Completed}})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create todo"})
		}

		return c.JSON(result)
	})

	route.Delete("/:id", utils.JWTMiddleware(), func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		todoId, _ := primitive.ObjectIDFromHex(c.Params("id"))
		result, err := Todos.DeleteOne(ctx, bson.M{"_id": todoId})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create todo"})
		}

		return c.JSON(result)
	})

}
