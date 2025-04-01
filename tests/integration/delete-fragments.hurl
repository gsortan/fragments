# Successful deletion test and first posting fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`TestString`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
[Captures]
url: header "Location"

# Delete it
DELETE {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# Try to delete non-existent fragment ID and throw error
DELETE http://localhost:8080/v1/fragments/nonexistent-id
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
