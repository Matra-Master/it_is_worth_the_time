#!/usr/bin/env node

// Crea ramas a partir de nombres de tickets pasados por consola
// Ejemplo ticket-branch "#123 User Story" "#123Task" -> TG-123-#123task

const { execSync } = require("child_process");

const userStory = process.argv.slice(2)?.[0];
const task = process.argv.slice(2)?.[1];

if (!userStory) {
  console.error("Por favor, pasá un texto como argumento.");
  process.exit(1);
}

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
