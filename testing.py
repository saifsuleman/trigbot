import requests

data = {
    "username": "15",
    "password": "12"
}
res = requests.post("http://localhost:8080/api/createToken", json=data).text
print(res)
