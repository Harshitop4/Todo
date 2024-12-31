package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Todo struct {
	Id          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserId      primitive.ObjectID `json:"userid" bson:"userid"`
	Title       string             `json:"title" bson:"title"`
	Description string             `json:"description" bson:"description"`
	Completed   bool               `json:"completed" bson:"completed"`
	Created_at  time.Time          `json:"createdAt" bson:"createdAt"`
}
