![banner](banner.png)

[Demo Server Link](http://209.38.197.154:8000/):http://209.38.197.154:8000/

[Example Link](http://209.38.197.154:8000/projects/9b24f47f-8e6a-4a7b-8f17-4344ba7b133b/all-admin):
http://209.38.197.154:8000/projects/9b24f47f-8e6a-4a7b-8f17-4344ba7b133b/all-admin

# Projects

```
https://ServerURL/projects/<PID>/<PATH>
```

## Create a new project

```bash
frog-routes projects create <NAME>
```

## List all the projects locally

```bash
frog-routes projects list
```

## Set current project

```bash
frog-routes project checkout <PID>
```

# Routes

## Create new routes for the current project

```bash
frog-routes routes create <PATH> --payload-data=<DATA>
```

## List all the paths of current project

```bash
frog-routes routes list
```

## Get Data from the routes

JavaScript HTTP Request:

```js
async function getData(pid, routePath) {
  const getResponse = await fetch(`${serverURL}/projects/${pid}/${routePath}`, {
    method: "GET",
  })
  if (get.status === 200) {
    const responseBody = await getResponse.json()
    return responseBody
  } else {
    console.error("Unexpected error, please double check the project UUID")
  }
}
```

CURL: 

```bash
curl http://209.38.197.154:8000/projects/9b24f47f-8e6a-4a7b-8f17-4344ba7b133b/all-admin
```

## Delete route from the current project

```bash
frog-routes routes delete <Proj>
```
