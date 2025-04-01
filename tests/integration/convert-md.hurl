# Upload Markdown
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1

`# Sample Markdown content`

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
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 25


[Captures]
url: header "Location"

# Convert Markdown to HTML
GET {{url}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/html; charset=utf-8
Content-Length: 33
[Asserts]
body == "<h1>Sample Markdown content</h1>\n"

# Convert Markdown to Plain Text
GET {{url}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 25
[Asserts]
body == "# Sample Markdown content"

# Convert Markdown to Markdown
GET {{url}}.md
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/markdown; charset=utf-8
Content-Length: 25
[Asserts]
body == "# Sample Markdown content"
