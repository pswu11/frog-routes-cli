#! /usr/bin/env node

const { Command } = require("commander")
const { validate } = require("uuid")
const os = require("os")
const { writeFileSync, readFileSync, existsSync } = require("fs")
const program = new Command()
const configPath = `${os.homedir()}/.config/frog.json`

function ifUUIDExists(configObj, uuid) {
  const projects = configObj["projects"]
  for (const project of projects) {
    if (project.id === uuid) {
      return true
    }
  }
  return false
}

function getUUID(configObj, projectName) {
  const projects = configObj["projects"]
  if (projects.length === 0) {
    return false
  } else {
    for (const project of projects) {
      if (project.name === projectName) {
        return project.id
      }
    }
  }
  return false
}

function checkConfig() {
  if (!existsSync(configPath)) {
    // create a new config file
    const newConfig = { projects: [], currentProject: "" }
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
const serverURL = "http://209.38.197.154:8000"
const currentProject = checkConfig().currentProject

commandProject
  .command("create")
  .argument("<projectName>", "can be used to restore or checkout a project")
  .description("Create a new project and get a UUID")
  .action(async (projectName) => {
    if (getUUID(allConfigs, projectName) === false) {
      // [x]: post request to add new project UUID to the server
      const response = await fetch(`${serverURL}/projects`, {
        method: "POST",
        body: JSON.stringify({ name: projectName }),
      })
      const newPID = await response.json().then((json) => json.id)
      allConfigs["projects"].push({ id: newPID, name: projectName })
      writeFileSync(configPath, JSON.stringify(allConfigs))
      console.log(`Created project ${projectName} with UUID ${newPID}`)
    } else {
      console.error("Project already exists")
    }
  })

// [x]: delete project from the server (and from local config)
commandProject
  .command("delete")
  .argument("<pid>", "Project UUID that you want to delete from the server")
  .action(async (pid) => {
    const deleteResponse = await fetch(`${serverURL}/projects/${pid}`, {
      method: "DELETE",
    })
    if (deleteResponse.status === 204) {
      console.log(`Deleted project ${pid} from the server`)
      const restProjects = allConfigs.projects.filter((proj) => proj.id !== pid)
      const allConfigsNew = { currentProject, projects: restProjects }
      console.log(allConfigsNew)
      writeFileSync(configPath, JSON.stringify(allConfigsNew))
    } else {
      console.error("Unexpected error, please double check the project UUID")
    }
  })

// [x]: restore project from the server (and add it to local config)
commandProject
  .command("restore")
  .argument(
    "<pid>",
    "Project UUID: can be used to restore or checkout a project"
  )
  .description("Access to projects and perform basic operations")
  .action(async (pid) => {
    console.log(`Restoring project ${pid}`)
    // Send request the server to check if the uuid exists
    const restoreResponse = await fetch(`${serverURL}/projects/${pid}`, {
      method: "GET",
    })
    if (restoreResponse.status === 200) {
      const restoredProject = await restoreResponse.json()
      const allConfigsNew = {
        ...allConfigs,
        projects: [...allConfigs.projects, restoredProject], // { id: pid, name: projectName }
      }
      writeFileSync(configPath, JSON.stringify(allConfigsNew))
    } else {
      console.error("Project UUID does not exist")
    }
  })

// [x]: checkout project and set it as current project
commandProject
  .command("checkout")
  .argument(
    "<projectArg>",
    "Project Name or UUID: can be used to set the current project"
  )
  .description("Set the current project")
  .action((projectArg) => {
    let allConfigsNew = {}
    if (!projectArg) {
      console.error("Please provide a project name or UUID")
    } else if (validate(projectArg)) {
      // check if the project UUID exists
      if (ifUUIDExists(allConfigs, projectArg)) {
        allConfigsNew = {
          ...allConfigs,
          currentProject: projectArg,
        }
        writeFileSync(configPath, JSON.stringify(allConfigsNew))
      } else {
        console.error("Project name or id does not exist locally.")
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
        console.error("Project name or id does not exist locally.")
      }
    }
    console.log(allConfigsNew)
  })

// List local projects
commandProject
  .command("list")
  .option("--server", "list all projects on the server")
  .description("List all the local projects")
  .action(async (option) => {
    if (option.server) {
      // TODO: list all projects on the server
      // const responseProjects = await fetch(`${serverURL}/projects`, {
      //   method: "GET",
      // })
      // console.log(await responseProjects.json())
      // console.log(responseProjects.status)
    } else {
      console.table(checkConfig().projects)
    }
  })

// Routes
const commandRoutes = program.command("routes")

// [x]: create new route under the current project
commandRoutes
  .command("create")
  .argument("<newPath>", "specify the new path, i.e. /users")
  .argument("<verb>", "specify the verb")
  .option("--payload-data <data>", "specify a string or a path to a json file")
  .action(async (newPath, verb, data) => {
    let myData = ""
    // check whether the payload file is empty
    if (Object.keys(data).length === 0) {
      console.error("Please provide a payload data")
      return
    }
    console.log(data.payloadData)
    if (data) {
      if (data.payloadData.includes(".json")) {
        myData = readFileSync(data.payloadData, "utf8")
      } else {
        myData = data.payloadData
      }
    }

    console.log(`payload data: ${myData}`)

    // [x]: HTTP POST request to the server with given project UUID + path + payloadData
    const registerNewRouteResponse = await fetch(
      `${serverURL}/projects/${currentProject}/routes`,
      {
        method: "POST",
        body: JSON.stringify({
          verb: verb,
          path: newPath,
          data: myData,
        }),
      }
    )
    const newRouteId = await registerNewRouteResponse
      .json()
      .then((json) => json.id)
    if (registerNewRouteResponse.status === 200) {
      console.log(`Created new path ${newPath} with route id: ${newRouteId}`)
    } else {
      console.error("Error creating new route", "states:", registerNewRouteResponse.status)
    }
  })

// [x]: list all routes under the current project
commandRoutes.command("list").action(async () => {
  const responseListRoutes = await fetch(
    `${serverURL}/projects/${currentProject}/routes`,
    {
      method: "GET",
    }
  )
  console.log(await responseListRoutes.json())
})

// [x]: delete route from the server
commandRoutes
  .command("delete")
  .argument(
    "<routeId>",
    "Route ID that you want to delete from the current project"
  )
  .action(async (routeId) => {
    const deleteRoute = await fetch(
      `${serverURL}/projects/${currentProject}/routes/${routeId}`,
      {
        method: "DELETE",
      }
    )
    if (deleteRoute.status === 204) {
      console.log(
        `Deleted route ${routeId} under current project: ${currentProject}`
      )
    } else {
      console.error("Unexpected error, please double check the route ID")
    }
  })

// [x]: update the data of a specific route
commandRoutes
  .command("update")
  .argument("<routeID>", "specify the routeID you want to update, i.e. /users")
  .option(
    "--payload-data <updatedData>",
    "a string or a path to a json file with your updated data"
  )
  .action(async (routeID, updatedData) => {
    let myData = ""
    // check whether the payload file is empty
    if (Object.keys(updatedData).length === 0) {
      console.error("Please provide a payload data")
      return
    }
    console.log(updatedData.payloadData)
    if (updatedData) {
      if (updatedData.payloadData.includes(".json")) {
        myData = readFileSync(updatedData.payloadData, "utf8")
      } else {
        myData = updatedData.payloadData
      }
    }
    const updateResponse = await fetch(
      `${serverURL}/projects/${currentProject}/routes/${routeID}`,
      {
        method: "PUT",
        body: JSON.stringify({
          verb: "GET",
          data: myData,
        }),
      }
    )
    console.log(updateResponse)
    // handle errors 
  })

program.parse()
