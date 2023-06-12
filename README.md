![banner](banner.png)

## Intro

Frog Routes is a project that gives you a simple HTTP enpoints to mock up your
web applications with sample data without a solid backend.

It is a hackathon project inspired by my own experience learning web development
as a beginner. Many web development beginners start with building static
websites after they first learned about HTML, CSS, and basic JavaScript. Having
zero idea what HTTP is about, the only way to show realistic data on the website
is to either hard-code website information or to use browser's local storage to
make data persistent. The former is quite a tedious job and the latter is far
from how this is handled in reality.

That's why I thought a simple tool like this would really help beginners to get
up to speed in building out their projects, while slowly gaining more knowledge
about HTTP. This tool can also be useful for experienced frontend developers who
just want to quickly get an MVP out without the presense of backend.

[Demo Server](http://209.38.197.154:8000/): http://209.38.197.154:8000/

[Example URL](http://209.38.197.154:8000/projects/9b24f47f-8e6a-4a7b-8f17-4344ba7b133b/all-admin):
http://209.38.197.154:8000/projects/9b24f47f-8e6a-4a7b-8f17-4344ba7b133b/all-admin

## Frog Routes CLI

Frog Routes CLI provides basic operations in command line interface to interact
with the Frog Routes demo server.

## Usage

### Projects

```
https://ServerURL/projects/<PID>/<PATH>
```

Create a new project

```bash
frog-routes projects create <NAME>
```

List all the projects locally

```bash
frog-routes projects list
```

Set current project

```bash
frog-routes project checkout <PID>
```

### Routes

Create new routes for the current project

```bash
frog-routes routes create <PATH> --payload-data=<DATA>
```

List all the paths of current project

```bash
frog-routes routes list
```

Delete route from the current project

```bash
frog-routes routes delete <Proj>
```

### Get Data

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
