# Test Specification: To-Do Application

## Overview

This document outlines the unit testing strategy and specifications for the To-Do web application. The goal is to ensure the reliability and correctness of both the frontend UI logic and the backend Next.js API routes that handle CRUD operations.

---

## Core Features & Requirements

### 1. Frontend Logic & State Management (`src/app/page.tsx`)

- **Requirement**: Provide a user interface to display, add, toggle, and delete tasks. Properly manage loading states and display errors to the user gracefully.
- **Key Functions**: `fetchTodos`, `addTodo`, `toggleTodo`, `deleteTodo`.

### 2. Backend API Routes (`src/app/api/todos`)

- **Requirement**: Provide robust REST endpoints to interact with a JSON file (`data/db.json`) functioning as a database.
- **Key Functions (Methods)**:
  - `GET /api/todos` (Fetch all todos)
  - `POST /api/todos` (Create a new todo)
  - `PUT /api/todos/[id]` (Update a todo's status)
  - `DELETE /api/todos/[id]` (Delete a todo)

---

## Expected Behavior (Happy Path)

### Frontend Components

| Function     | Input Context                        | Expected Output                                                                                                                                   |
| :----------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fetchTodos` | Component mount                      | Successfully fetches the list of tasks from the API, updates the `todos` state, and sets `loading` to `false`.                                    |
| `addTodo`    | Valid text string (e.g., "Buy Milk") | Submits data to the `POST` API, prepends/appends the newly created task to `todos` state, clears `newTodo` input, and clears any previous errors. |
| `toggleTodo` | Valid `id` and `currentStatus`       | Sends a `PUT` request with inverted status, and updates the specific task in the `todos` state array locally.                                     |
| `deleteTodo` | Valid `id`                           | Sends a `DELETE` request to the API, and removes the specific task from the local `todos` state.                                                  |

### Backend API

| Route & Method           | Input                                      | Expected Output                                                                                            |
| :----------------------- | :----------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `GET /api/todos`         | None                                       | Returns a JSON array of all tasks with a 200 OK status.                                                    |
| `POST /api/todos`        | JSON body containing `text`                | Returns the newly created task object (with unique `id` and `completed: false`) with a 201 Created status. |
| `PUT /api/todos/[id]`    | Valid `id` params, JSON body (`completed`) | Modifies the matching record and returns the updated task object with a 200 OK status.                     |
| `DELETE /api/todos/[id]` | Valid `id` params                          | Safely removes the task from `db.json` and returns `{ success: true }` with a 200 OK status.               |

---

## Edge Case & Error Handling

### 1. Frontend Error States

- **Scenario**: Form submitted with empty or whitespace-only text.
  - **Expected**: The `addTodo` function blocks the request early (no API call is made), maintaining the current UI state.
- **Scenario**: A network failure occurs during any API call (e.g., fetch throws an error).
  - **Expected**: The `catch` block intercepts the error, updates the `errorMsg` state, and a visible error banner is displayed. For `deleteTodo`, the error auto-hides after 5 seconds.

### 2. Backend Validation & Edge Cases

- **Scenario**: `POST /api/todos` is called with missing `text` in the request body.
  - **Expected**: The route validates the payload and returns a 400 Bad Request with `{ error: 'Text is required' }`.
- **Scenario**: `PUT` or `DELETE` is called for an `id` that does not exist in `db.json`.
  - **Expected**: The route detects the missing record and returns a 404 Not Found with `{ error: 'Todo not found' }`.
- **Scenario**: The database file `db.json` is missing or has corrupted JSON.
  - **Expected**: The API methods fail to parse or read, catching the exception and returning a 500 Internal Server Error (e.g., "Failed to read database").

### 3. Known Intentional Errors (for Testing)

- **Scenario**: Executing `DELETE /api/todos/[id]` with a valid ID.
  - **Expected (Bug)**: The current implementation attempts to use `todos.remove(todoIndex)` instead of `todos.splice`. This triggers a `TypeError`. The route should catch this exception, log it, and return a 500 status with `"Server Error: todos.remove is not a function"`. The frontend should subsequently capture this 500 response and display the error message.
