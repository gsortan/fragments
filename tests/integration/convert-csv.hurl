# Upload CSV
POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
user1@email.com:password1

`name,age\nJohn,30\nJane,25`

HTTP/1.1 201
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/csv"
jsonpath "$.fragment.size" == 24

[Captures]
url: header "Location"

# Convert CSV to JSON
GET {{url}}.json
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
Content-Length: 92
[Asserts]
jsonpath "$[0].name" == "John"
jsonpath "$[0].age" == "30"
jsonpath "$[1].name" == "Jane"
jsonpath "$[1].age" == "25"

# Convert CSV to Plain Text
GET {{url}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 24
[Asserts]
body == "name,age\nJohn,30\nJane,25"

# Convert CSV to CSV
GET {{url}}.csv
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/csv; charset=utf-8
Content-Length: 24
[Asserts]
body == "name,age\nJohn,30\nJane,25"
