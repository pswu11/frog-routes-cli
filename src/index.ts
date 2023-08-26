import figlet from "figlet"
import { Command } from "commander"
import axios from "axios"

const program = new Command()
const serverURL = "https://frog-routes.fly.dev"

console.log(figlet.textSync("Frog Routes"))

const commandProject = program.command("projects")

commandProject
  .command("create")
  .argument("<projectName>", "can be used to restore or checkout a project")
  .description("Create a new project and get a UUID")
  .action(async (projectName) => {
    // [x]: post request to add new project UUID to the server
    const response = await axios
      .post(`${serverURL}/projects`, {
        project_name: projectName,
      })
      .then((res) => res.data)
    console.log(response)
    console.log(`Created project ${projectName} with UUID ${response.id}`)
  })

  commandProject
  .command("delete")
  .argument("<pid>", "Project UUID that you want to delete from the server")
  .action(async (pid) => {
    const response = await axios.delete(`${serverURL}/projects/${pid}`).then((res) => res.data)
    console.log(response)
  })

program.parse()
