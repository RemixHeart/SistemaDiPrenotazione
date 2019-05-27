# API DEFINITION

## USERS

### GET /users : return all users (query: name)

### GET /users/{id} : return all information about a user

### POST /login : login of the user

### POST /signup : register a new user

### PUT /users/{id} : update an user - only him

## EVENTS

### GET /events : return all events (query: name, limit, layout)

### GET /events/{id} : return all information about an event

### GET /events/users/{id} : return all events created by an user (query: mode)

### POST /events/{id}/users/{id} : register an user in an event

### POST /events : create a new event (protected login is needed)

### PUT /events/{id} : update an event

### DELETE /events/{id} : delete an event

### DELETE /events/{id}/users/{id} : cancel a prenotation
