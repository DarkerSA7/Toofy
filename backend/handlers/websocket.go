package handlers

import (
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan interface{}
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

var hub = &Hub{
	clients:    make(map[*Client]bool),
	broadcast:  make(chan interface{}, 256),
	register:   make(chan *Client),
	unregister: make(chan *Client),
}

func init() {
	go hub.run()
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client %s connected. Total clients: %d\n", client.ID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Conn.Close()
			}
			h.mu.Unlock()
			log.Printf("Client %s disconnected. Total clients: %d\n", client.ID, len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				if err := client.Conn.WriteJSON(message); err != nil {
					h.unregister <- client
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Broadcast(message interface{}) {
	h.broadcast <- message
}

func WebSocketHandler(c *fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

func WebSocketUpgrade(c *websocket.Conn, userID string) {
	client := &Client{
		ID:   userID,
		Conn: c,
	}

	hub.register <- client

	defer func() {
		hub.unregister <- client
	}()

	for {
		var msg map[string]interface{}
		if err := c.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket error: %v", err)
			}
			return
		}

		// Echo message back to all clients
		hub.Broadcast(map[string]interface{}{
			"type":    "message",
			"from":    userID,
			"content": msg,
		})
	}
}

func BroadcastUserUpdate(userID string, action string, data interface{}) {
	hub.Broadcast(map[string]interface{}{
		"type":    "user_update",
		"userID":  userID,
		"action":  action,
		"data":    data,
		"message": fmt.Sprintf("User %s was %s", userID, action),
	})
}
