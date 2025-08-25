#!/usr/bin/env node

// Crea ramas a partir de nombres de tickets pasados por consola
// Ejemplo ticket-branch "#123 User Story" "#123Task" -> TG-123-#123task

const { execSync } = require("child_process");
const readline = require("readline");

let [userStory, task] = process.argv.slice(2);

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

const createBranch = () => {
  const formatted =
    "TG-" +
    (task
      ? extractNumbers(userStory)
      : normalizeText(userStory).toLowerCase().replace(/\s+/g, "_")) +
    (task ? `-#${normalizeText(task).toLowerCase().replace(/\s+/g, "_")}` : "");

  try {
    console.log("Creado con exito ~(^-^)~");
    execSync(`git checkout -b ${formatted}`);
  } catch (e) {
    console.error("Error ejecutando git:", e.message);
  }
};

if (!userStory) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "No se detectó una user story. ¿Desea ingresar una? (Ingresá ambos valores entre comillas)",
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
      createBranch();
    }
  );
} else {
  createBranch();
}
