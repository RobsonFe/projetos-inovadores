import initializeRPV from "./entrypoint.js";

export function Main() {
  try {
    initializeRPV();
  } catch (error) {
    console.error("Falha ao executar programa: ", error);
  }
}

Main();
