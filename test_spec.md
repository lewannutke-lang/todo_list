# Task Master - Comprehensive Unit Test Specification

## Overview

Task Master is a Next.js-based Todo application with a React frontend and Node.js backend. This document provides comprehensive unit test specifications for all functions in the project, covering API endpoints and frontend components.

**Application Type:** Full-stack Todo Management System
**Tech Stack:** Next.js 16, React 19, TypeScript, Node.js
**Database:** JSON file-based (db.json)

---

## Core Features & Requirements

### Frontend Features (page.tsx)
1. **Fetch Todos** - Retrieve all todos from the database on component mount
2. **Add Todo** - Create a new todo item with validation
3. **Toggle Todo** - Update todo completion status
4. **Delete Todo** - Remove a todo from the list
5. **Error Handling** - Display error messages to users
6. **Loading State** - Show loading indicator while fetching

### Backend API Features (route.ts)
1. **GET /api/todos** - Retrieve all todos from database
2. **POST /api/todos** - Create a new todo with validation
3. **PUT /api/todos/[id]** - Update a todo by ID
4. **DELETE /api/todos/[id]** - Delete a todo by ID

---

## Expected Behavior (Happy Path)

### Frontend Test Cases

#### Test 1: fetchTodos() - Initial Load Success
```
Given: User opens the application
When: Component mounts and calls fetchTodos()
Then: 
  - Loading state is true initially
  - API call is made to GET /api/todos
  - Todos are populated in state
  - Loading state is set to false
  - Error message is empty
```

#### Test 2: addTodo() - Create New Todo Success
```
Given: User enters text "Buy Groceries" in the input field
And: User submits the form
When: addTodo() is executed
Then:
  - Fetch POST request sent to /api/todos
  - New todo is added to the state with id, text, and completed: false
  - Input field is cleared
  - Error message is cleared
  - UI updates to show new todo in the list
```

#### Test 3: toggleTodo() - Mark Todo as Completed
```
Given: Todo with id "123" exists in state with completed: false
When: User clicks the checkbox
Then:
  - Fetch PUT request sent to /api/todos/123 with { completed: true }
  - Todo in state is updated with completed: true
  - UI shows visual indication of completed todo (e.g., strikethrough)
  - Error message is cleared
```

#### Test 4: toggleTodo() - Mark Todo as Incomplete
```
Given: Todo with id "123" exists in state with completed: true
When: User clicks the checkbox again
Then:
  - Fetch PUT request sent to /api/todos/123 with { completed: false }
  - Todo in state is updated with completed: false
  - UI removes completed indication
  - Error message is cleared
```

#### Test 5: deleteTodo() - Delete Todo Success
```
Given: Todo with id "456" exists in state
When: User clicks the delete button
Then:
  - Fetch DELETE request sent to /api/todos/456
  - Todo is removed from the state
  - UI updates to remove todo from the list
  - Error message is cleared
```

### Backend Test Cases

#### Test 6: GET /api/todos - Fetch All Todos Success
```
Given: db.json contains valid todo data
When: GET request is sent to /api/todos
Then:
  - Response status is 200
  - Response body contains array of todos
  - Each todo has id, text, and completed properties
  - Todos are returned in correct order
```

#### Test 7: POST /api/todos - Create Todo Success
```
Given: Request body contains { text: "Learn TypeScript" }
When: POST request is sent to /api/todos
Then:
  - Response status is 201
  - Response body contains new todo with:
    - Unique id (timestamp-based)
    - text: "Learn TypeScript"
    - completed: false
  - Todo is persisted in db.json
```

#### Test 8: PUT /api/todos/[id] - Update Todo Status Success
```
Given: Todo with id "789" exists in db.json with completed: false
When: PUT request sent to /api/todos/789 with { completed: true }
Then:
  - Response status is 200
  - Response body contains updated todo with completed: true
  - Change is persisted in db.json
```

#### Test 9: DELETE /api/todos/[id] - Delete Todo Success (EXPECTED AFTER BUG FIX)
```
Given: Todo with id "999" exists in db.json
When: DELETE request sent to /api/todos/999
Then:
  - Response status is 200 (if working correctly)
  - Todo is removed from db.json
  - Remaining todos are preserved
```

---

## Edge Cases & Error Handling

### Frontend Edge Cases & Errors

#### Test 10: fetchTodos() - Network Error Handling
```
Given: API is unreachable or returns 5xx error
When: fetchTodos() is called
Then:
  - Exception is caught
  - Error message is displayed to user
  - Loading state is set to false
  - GUI remains responsive
```

#### Test 11: addTodo() - Empty Input Validation
```
Given: User enters empty string or only whitespace " "
When: User submits the form
Then:
  - Form submission is prevented (e.preventDefault)
  - Function returns early without making API call
  - Input field remains in focus
  - No error toast is shown for empty input
```

#### Test 12: addTodo() - API Server Error (500)
```
Given: Server returns 500 error
When: addTodo() is called
Then:
  - Exception is caught
  - Error message "Failed to add todo" is displayed
  - Input is not cleared
  - Todo is not added to state
  - User can retry
```

#### Test 13: addTodo() - API returns non-200 status
```
Given: POST request returns 400 or 403 status
When: addTodo() processes response
Then:
  - Error is thrown
  - Error message is set
  - TODO is not added to list
```

#### Test 14: toggleTodo() - Todo Not Found (404)
```
Given: Todo with id "invalid" doesn't exist
When: toggleTodo() is called
Then:
  - API returns 404 error
  - Exception is caught in catch block
  - Error message is displayed
  - State remains unchanged
```

#### Test 15: toggleTodo() - Network Error
```
Given: Network connection is lost during toggle
When: toggleTodo() is called
Then:
  - Fetch fails
  - Error message is displayed to user
  - Todo state is not updated
  - User can retry
```

#### Test 16: deleteTodo() - Handles Thrown Error Gracefully
```
Given: Server throws any error (intentional or unexpected)
When: deleteTodo() is called for a valid todo ID
Then:
  - Error is caught in catch block
  - Error message is displayed to user
  - Auto-hide mechanism triggers after 5 seconds
  - Todo remains in the list (not deleted on error)
  - Console logs the error
```

#### Test 17: deleteTodo() - Todo Not Found (404)
```
Given: Todo with id "nonexistent" doesn't exist
When: deleteTodo() is called
Then:
  - API returns { error: "Todo not found" } with 404
  - Error is caught and displayed
  - State is not modified
```

#### Test 18: Concurrent Operations - Multiple Adds
```
Given: User rapidly clicks "Add Todo" button 3 times with different values
When: All three POST requests are inflight
Then:
  - All requests complete individually
  - All todos are added to state
  - UI reflects all additions
  - State remains consistent
```

#### Test 19: State Consistency - Add Then Delete
```
Given: User adds a todo and immediately deletes it
When: Both operations are in flight
Then:
  - If both complete, todo should not appear
  - If delete completes first, error shown for non-existent todo
  - State remains consistent
```

### Backend Edge Cases & Errors

#### Test 20: GET /api/todos - Database File Corrupted
```
Given: db.json contains invalid JSON
When: GET request is sent to /api/todos
Then:
  - Exception is caught during JSON.parse()
  - Response status is 500
  - Response body is { error: "Failed to read database" }
  - DB file is not overwritten
```

#### Test 21: GET /api/todos - Database File Missing
```
Given: data/db.json file does not exist
When: GET request is sent to /api/todos
Then:
  - fs.readFileSync() throws error
  - Response status is 500
  - Response body is { error: "Failed to read database" }
```

#### Test 22: POST /api/todos - Missing Text Field
```
Given: Request body is {} (missing text field)
When: POST request is sent to /api/todos
Then:
  - Response status is 400
  - Response body is { error: "Text is required" }
  - No todo is created
  - Database is not modified
```

#### Test 23: POST /api/todos - Text Field is Null
```
Given: Request body is { text: null }
When: POST request is sent to /api/todos
Then:
  - Response status is 400
  - Response body is { error: "Text is required" }
  - No todo is created
```

#### Test 24: POST /api/todos - Text Field is Empty String
```
Given: Request body is { text: "" }
When: POST request is sent to /api/todos
Then:
  - Response status is 400, OR
  - Todo is created with empty text (depends on business logic)
  - Should document expected behavior
```

#### Test 25: POST /api/todos - Invalid JSON Body
```
Given: Request body is malformed JSON
When: POST request is sent to /api/todos
Then:
  - request.json() throws error
  - Response status is 500
  - Response body is { error: "Failed to create todo" }
  - Database is not modified
```

#### Test 26: POST /api/todos - Database Write Fails
```
Given: fs.writeFileSync() throws permission error
When: POST request is sent to /api/todos
Then:
  - Exception is caught
  - Response status is 500
  - Response body is { error: "Failed to create todo" }
```

#### Test 27: PUT /api/todos/[id] - Todo ID Not Found
```
Given: No todo exists with id "nonexistent"
When: PUT request sent to /api/todos/nonexistent with { completed: true }
Then:
  - Response status is 404
  - Response body is { error: "Todo not found" }
  - Database is not modified
```

#### Test 28: PUT /api/todos/[id] - Invalid Request Body
```
Given: Request body is malformed JSON
When: PUT request sent to /api/todos/123
Then:
  - request.json() throws error
  - Response status is 500
  - Response body is { error: "Failed to update todo" }
  - Database is not modified
```

#### Test 29: PUT /api/todos/[id] - Database Write Fails
```
Given: fs.writeFileSync() throws error (permission denied)
When: PUT request sent to /api/todos/123 with valid data
Then:
  - Exception is caught
  - Response status is 500
  - Response body is { error: "Failed to update todo" }
  - Database retains original data
```

#### Test 30: PUT /api/todos/[id] - Partial Update (Only Completed Field)
```
Given: Todo has text "Buy Milk" with completed: false
When: PUT request sent with { completed: true } (no text field)
Then:
  - Response status is 200
  - Todo is updated: text remains "Buy Milk", completed becomes true
  - Other fields are preserved using spread operator
```

#### Test 31: DELETE /api/todos/[id] - KNOWN BUG: Function Not Implemented
```
Given: Todo with valid id exists in database
When: DELETE request sent to /api/todos/[id]
Then:
  - CURRENT BEHAVIOR: TypeError is thrown (todos.remove is not a function)
  - Response status is 500
  - Response body contains error message with server details
  - Todo is NOT deleted (ideally)
  
NOTE: This is an intentional bug in route.ts using:
  todos.remove(todoIndex);  // Should use todos.splice(todoIndex, 1)
  
EXPECTED BEHAVIOR after fix:
  - Response status is 200
  - Todo is successfully deleted from db.json
  - Response contains { success: true }
```

#### Test 32: DELETE /api/todos/[id] - Todo ID Not Found
```
Given: No todo exists with id "nonexistent"
When: DELETE request sent to /api/todos/nonexistent
Then:
  - Response status is 404
  - Response body is { error: "Todo not found" }
  - Database is not modified
```

#### Test 33: DELETE /api/todos/[id] - Invalid ID Format
```
Given: Request sent with id containing special characters or SQL injection attempt
When: DELETE request sent to /api/todos/'; DROP TABLE todos;--
Then:
  - ID is treated as literal string
  - Todo matching that exact string is searched (none found)
  - Response status is 404
  - No security breach occurs
```

#### Test 34: DELETE /api/todos/[id] - Database Write Fails
```
Given: fs.writeFileSync() throws permission error
When: DELETE request sent to /api/todos/123
Then:
  - Exception is caught
  - Response status is 500
  - Response body is { error: "Server Error: ..." }
  - Database is not modified
```

#### Test 35: All Endpoints - Concurrent Requests
```
Given: Multiple concurrent requests (GET, POST, PUT, DELETE)
When: Requests are processed simultaneously
Then:
  - Each request is handled independently
  - No race conditions occur
  - Final database state is consistent
  - All responses are correct
```
