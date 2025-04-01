# Upload AVIF Image
POST http://localhost:8080/v1/fragments
Content-Type: image/avif
[BasicAuth]
user1@email.com:password1

file,test.avif;

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
jsonpath "$.fragment.type" == "image/avif"
jsonpath "$.fragment.size" > 0

[Captures]
url: header "Location"

# Convert AVIF to JPG
GET {{url}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg

# Convert AVIF to GIF
GET {{url}}.gif
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif

# Convert AVIF to WEBP
GET {{url}}.webp
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp

# Convert AVIF to AVIF
GET {{url}}.avif
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/avif

# Convert AVIF to PNG 
GET {{url}}.png
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png
