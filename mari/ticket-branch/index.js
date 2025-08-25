#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline");

const showHelp = () => {
  console.log(`
Usage: ticket-branch [flag] [userStory] [task]

Flags:
  -create, -c         Crea una nueva rama (por defecto si no se especifica flag)
  -rename, -u, -update Renombra la rama actual siguiendo la convención

Arguments:
  userStory: El nombre de la user story o el número de ticket.
  task:      (Opcional) El nombre de la task.

Ejemplos:
  ticket-branch -c "Mi nueva feature"
  ticket-branch -rename "12345" "Implementar backend"
  ticket-branch "Solo user story"

Si no se pasan argumentos, el script los pedirá por consola.
  `);
  process.exit(0);
};

if (process.argv.includes("--help")) {
  showHelp();
}

// Flags
const flags = {
  create: ["-create", "-c"],
  rename: ["-rename", "-u", "-update"],
};

let mode = "create";
let args = process.argv.slice(2).filter((arg) => {
  if (flags.create.includes(arg)) {
    mode = "create";
    return false;
  }
  if (flags.rename.includes(arg)) {
    mode = "rename";
    return false;
  }
  return true;
});

let [userStory, task] = args;

const normalizeText = (text) =>
  text
    .replace(/#/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "ni")
    .replace(/Ñ/g, "Ni");

const extractNumbers = (text) => {
  const match = text.match(/^\d+/);
  return match
    ? match[0]
    : normalizeText(text).toLowerCase().replace(/\s+/g, "_");
};

const getBranchName = () =>
  "TG-" +
  (task
    ? extractNumbers(userStory)
    : normalizeText(userStory).toLowerCase().replace(/\s+/g, "_")) +
  (task ? `-#${normalizeText(task).toLowerCase().replace(/\s+/g, "_")}` : "");

const createBranch = (branchName) => {
  try {
    console.log("Creado con exito ~(^-^)~");
    execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });
  } catch (e) {
    console.error("Error ejecutando git:", e.message);
  }
};

const renameBranch = (branchName) => {
  try {
    execSync(`git branch -m ${branchName}`, { stdio: "inherit" });
    console.log(`Rama renombrada a ${branchName} ~(^-^)~`);
  } catch (e) {
    console.error("Error renombrando rama:", e.message);
  }
};

const promptForArgs = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "No se detectó una user story. ¿Desea ingresar una? (Ingresá ambos valores entre comillas) ",
    (answer) => {
      const matches = [...answer.matchAll(/"([^"]+)"/g)];

      if (matches.length === 0) {
        console.error("No se detectaron comillas válidas. Abortando. (~-~)");
        rl.close();
        process.exit(1);
      }

      userStory = matches[0]?.[1];
      task = matches[1]?.[1];

      if (!userStory) {
        console.error("No se ingresó ninguna user story. Abortando. (-.-)");
        rl.close();
        process.exit(1);
      }

      rl.close();
      const branchName = getBranchName();
      mode === "rename" ? renameBranch(branchName) : createBranch(branchName);
    }
  );
};

if (!userStory) {
  promptForArgs();
} else {
  const branchName = getBranchName();
  mode === "rename" ? renameBranch(branchName) : createBranch(branchName);
}
