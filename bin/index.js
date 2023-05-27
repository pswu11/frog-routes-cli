#! /usr/bin/env node

const { Command } = require("commander")
const { v4: uuidv4, validate } = require("uuid")
const os = require("os")
const { writeFileSync, readFileSync, existsSync } = require("fs")
const program = new Command()

const configPath = `${os.homedir()}/.config/frog.json`

function getUUID(configObj, projectName) {
  if (configObj["projects"][projectName]) {
    return configObj["projects"][projectName]
  } else {
    return false
  }
}

function checkConfig() {
  if (!existsSync(configPath)) {
    // create a new config file
    const newConfig = {}
    writeFileSync(configPath, JSON.stringify(newConfig))
    return newConfig
  } else {
    const config = JSON.parse(readFileSync(configPath, "utf8"))
    return config
  }
}

// Projects config
program
  .command("config")
  .description("Access to projects and perform basic operations")
  .action(() => {
    console.log(checkConfig())
  })

// Projects create: name, restore: pid, checkout: name or id
const allConfigs = checkConfig()
const commandProject = program.command("projects")

commandProject
  .command("create")
  .argument("<projectName>", "can be used to restore or checkout a project")
  .description("Create a new project and get a UUID")
  .action((projectName) => {
    const newPID = uuidv4()
    if (getUUID(allConfigs, projectName) === false) {
      allConfigs["projects"][projectName] = newPID
      // write the new config to the file
      writeFileSync(configPath, JSON.stringify(allConfigs))
      // TODO: post request to add new project UUID to the server

      console.log(`Created project ${projectName} with UUID ${newPID}`)
    } else {
      console.error("Project already exists")
    }
  })

commandProject
  .command("restore")
  .argument(
    "<pid>",
    "Project UUID: can be used to restore or checkout a project"
  )
  .description("Access to projects and perform basic operations")
  .action((pid) => {
    console.log(`Restoring project ${pid}`)
    // TODO: go the server and check if the uuid exists
    // if it does, then fetch the name
  })

commandProject
  .command("checkout")
  .argument(
    "<projectArg>",
    "Project Name or UUID: can be used to set the current project"
  )
  .description("Access to projects and perform basic operations")
  .action((projectArg) => {
    let allConfigsNew = {}
    if (!projectArg) {
      console.error("Please provide a project name or UUID")
    } else if (validate(projectArg)) {
      if (allConfigs["projects"][projectArg]) {
        allConfigsNew = {
          ...allConfigs,
          currentProject: projectArg,
        }
        writeFileSync(configPath, JSON.stringify(allConfigsNew))
      } else {
        console.error("Project UUID does not exist")
      }
    } else {
      // check if the project name exists
      if (getUUID(allConfigs, projectArg)) {
        allConfigsNew = {
          ...allConfigs,
          currentProject: getUUID(allConfigs, projectArg),
        }
        writeFileSync(configPath, JSON.stringify(allConfigsNew))
      } else {
        console.error(
          "Project name does not exist locally, do you want to restore it?"
        )
      }
    }
    console.log(allConfigsNew)
  })

// Projects list
commandProject
  .command("list")
  .description("List all the local projects")
  .action(() => {
    console.table(checkConfig().projects)
  })

// Routes

const commandRoutes = program.command("routes")
const currentProject = checkConfig().currentProject
const placeHolderURL = `https://jsonplaceholder.typicode.com/posts`

commandRoutes.command("list").action(() => {
  console.log("List routes")
  // TODO: parse the sever URL with project UUID
  fetch(placeHolderURL, { method: "GET" })
    .then((response) => response.json())
    .then((json) => console.log(json.length))
})

commandRoutes
  .command("delete")
  .argument("<route>", "Route name")
  .action((route) => {
    // TODO: HTTP DELETE request to the server with given project UUID + route name
    console.log(`Deleted ${route} under current project: ${currentProject}`)
  })

commandRoutes
  .command("create")
  .argument("<newRoute>", "Route name")
  .action((newRoute) => {
    // TODO: HTTP POST request to the server with given project UUID + route name
    console.log(`Created ${newRoute} under current project: ${currentProject}`)
  })

commandRoutes
  .command("update")
  .argument("<route>", "The route you want to update")
  .argument("<newRoute>", "The new route name")
  .action((route, newRoute) => {
    // TODO: HTTP PUT request to the server with given project UUID + old route name + new route name
    console.log(
      `Updated ${route} to ${newRoute} under current project: ${currentProject}`
    )
  })

program.parse()
