import readline, { createInterface } from "readline";
import fs, { createWriteStream, write } from "fs";
import { CAMINHO_CSV } from "../config.js";
import * as XLSX from "xlsx";
/**
 * Generates a random viewport size.
 * @returns {Object} An object containing the randomly generated width and height.
 */
function randomizeViewPort() {
  return {
    width: Math.floor(Math.random() * 1200) + 800,
    height: Math.floor(Math.random() * 1000) + 600,
  };
}

/**
 * Adds a delay to simulate human-like behavior.
 */
function humanizeDelay() {
  setTimeout(() => {
    console.log("Waiting a bit");
  }, Math.floor(Math.random() * 1000) + 500);
}

/**
 * Generates random coordinates to simulate human-like mouse movement.
 * @returns {Object} An object containing the randomly generated x and y coordinates.
 */
function humanisticMouseMovement() {
  const x = Math.floor(Math.random() * 1200) + 500;
  const y = Math.floor(Math.random() * 1000) + 500;
  return { x, y };
}

// Função para transformar dados em Excel
function converterExcel(dados) {
  humanizeDelay();
  // Adiciona um timestamp ao nome do arquivo para garantir que seja único
  const timestamp = Date.now();
  const file_path = `./tabela/precatorios-${timestamp}.xlsx`;
  // Criar uma nova planilha e adicionar os dados
  const workbook = XLSX.utils.book_new(); // Cria um novo arquivo Excel
  const worksheet = XLSX.utils.json_to_sheet(dados); // Adiciona o JSON na planilha
  XLSX.utils.book_append_sheet(workbook, worksheet, `Precatorios`); // Cria a planilha com todos os dados passados.
  XLSX.writeFile(workbook, file_path); // Arquivo Excel que será escrito e o caminho onde ficará salvo o arquivo.

  console.log(`Arquivo salvo em: ${file_path}`);
}

// Função para definir tempo de espera em uma função
function time(segundos) {
  return new Promise((resolve) => {
    const milissegundos = segundos * 1000;
    setTimeout(() => {
      resolve();
    }, milissegundos);
  });
}

// Função para a leitura de arquivos CSV, colocando os dados em uma variavel.
function readCsvList(data) {
  const line = readline.createInterface({
    input: fs.createReadStream(CAMINHO_CSV),
  });
  try {
    line.on("line", (data) => {
      let csv = [];
      if (data) {
        csv.push(data.replace(/\s+/g, " ").trim());
      }
      // console.log(csv);
      return csv;
    });
  } catch (error) {
    line.on("error", (err) => {
      console.error("Erro ao ler o arquivo:", err.message);
    });
  }
}

/**
 * Generates a random user agent string from a predefined list of user agents.
 * @returns {string} A randomly selected user agent string.
 */
function randomizeUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1",
    "Mozilla/5.0 (Android 13; Mobile; rv:127.0) Gecko/127.0 Firefox/127.",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; MED-LX9N; HMSCore 6.13.0.351) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 HuaweiBrowser/14.0.5.302 Mobile Safari/537.3",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.3",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 OPR/111.0.0.",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.3",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export {
  randomizeViewPort,
  humanizeDelay,
  humanisticMouseMovement,
  randomizeUserAgent,
  time,
  readCsvList,
  converterExcel,
};
