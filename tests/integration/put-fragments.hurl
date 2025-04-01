# Invalid different fragment content update test
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Initial Content`

HTTP/1.1 201
[Captures]
url: header "Location"

# Try updating it with a different Content-Type
PUT {{url}}
Content-Type: text/html
[BasicAuth]
user1@email.com:password1

<p>Invalid</p>

HTTP/1.1 400
[Asserts]
jsonpath "$.status" == "error"

# Try updating non-existent fragment
PUT http://localhost:8080/v1/fragments/invalid
Content-Type: text/html
[BasicAuth]
user1@email.com:password1

<p>Invalid</p>

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"

# Update fragment using PUT successfully
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Update Test`

# 1. We expect to get back an HTTP 200
HTTP/1.1 200
# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 11

# Confirm update
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 11
[Asserts]
body == "Update Test"
