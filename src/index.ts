import figlet from "figlet"
import { Command } from "commander"
import axios from "axios"
import os from "os"
import { existsSync, readFileSync, writeFileSync } from "fs"

const program = new Command()
const serverURL = "https://frog-routes.fly.dev"
const configPath = "./frog.json"

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

function createConfig() {
  const newConfig = {
    currentProject: {
      id: "",
      name: "",
      routes: [],
    },
  }
  writeFileSync(configPath, JSON.stringify(newConfig))
  return newConfig
}

console.log(figlet.textSync("Frog Routes"))

program
  .version("0.0.1")
  .description("Frog Routes CLI")
  .command("init")
  .description("Initialize the frog routes CLI")
  .action(() => {
    if (!existsSync(configPath)) {
      const config = createConfig()
      console.log(config)
    }
    const config = checkConfig()
    console.log(config)
  })

// Projects
const commandProject = program.command("projects")

commandProject
  .command("create")
  .argument("<projectName>", "can be used to restore or checkout a project")
  .description("Create a new project and get a UUID")
  .action(async (projectName) => {
    // [x]: post request to add new project UUID to the server
    try {
      const response = await axios.post(`${serverURL}/projects`, {
        project_name: projectName,
      })
      if (response.status !== 201) throw new Error("Error creating project")
      const newProject = response.data
      console.log(`Created project ${projectName} with UUID ${newProject.id}`)
    } catch (err) {
      console.log(err)
    }
  })

commandProject
  .command("delete")
  .argument("<pid>", "Project UUID that you want to delete from the server")
  .action(async (pid) => {
    try {
      const response = await axios.delete(`${serverURL}/projects/${pid}`)
      if (response.status !== 204) throw new Error("Error deleting project")
      const deletedProject = response.data
      console.log(deletedProject)
    } catch (err) {
      console.log(err)
    }
  })

commandProject.command("list").action(async () => {
  console.log(config)
  config.currentProject = "test"
})

program.parse()
