import { createCursor } from "ghost-cursor";
import { CODIGO_CONSULTA, TJPE_LINK } from "../config.js";
import browser from "./browser.js";
import {
  converterExcel,
  humanizeDelay,
  randomizeUserAgent,
  randomizeViewPort,
  time,
  readCsvList,
} from "./helpers.js";
import * as XLSX from "xlsx";

/**
 * Função de timeout personalizada.
 * @param {number} ms - Tempo de espera em milissegundos.
 * @returns {Promise} - Promessa que resolve após o tempo especificado.
 */
const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Aguarda até que o seletor esteja disponível ou até que o timeout ocorra.
 * @param {Page} page - Instância da página do Puppeteer.
 * @param {string} selector - Seletor para aguardar.
 * @param {number} timeoutMs - Tempo de espera em milissegundos.
 * @returns {Promise} - Promessa que resolve quando o seletor estiver disponível ou o timeout ocorrer.
 */
const waitForSelectorWithTimeout = async (page, selector, timeoutMs) => {
  return Promise.race([
    page.waitForSelector(selector, { timeout: timeoutMs }),
    timeout(timeoutMs).then(() => {
      throw new Error(`Timeout: O seletor ${selector} não foi encontrado`);
    }),
  ]);
};

/**
 * Inicializa o algoritmo de extração de dados.
 * @returns {Object} - Retorna um objeto com a página, o cursor e o tipo que será utilizado no algoritmo.
 */
async function initializeRPV() {
  try {
    console.log("Inicializando o algoritmo de extração");
    console.log("*".repeat(50));

    const page = await browser.newPage();
    console.log("Criando página");

    page.setUserAgent(randomizeUserAgent());
    console.log("Definindo user agent");

    page.setBypassCSP(true);
    console.log("Bypassando CSP");

    page.setDefaultTimeout(520000);
    await page.setViewport(randomizeViewPort());
    console.log("Definindo viewport");

    console.log("*".repeat(50));

    console.log("Acessando página do TJPE");
    await page.goto(TJPE_LINK);

    const cursor = createCursor(page);
    console.log("Aguardando a confirmação de carregamento da página");
    await waitForSelectorWithTimeout(page, ".form-select", 10000);
    console.log("Dropdown Detectado");
    console.log("Página carregada");

    humanizeDelay();
    await waitForSelectorWithTimeout(page, ".form-select", 10000);

    // Consulta as entidades que serão extraídas os precatórios.
    const entidades = await page.evaluate(() => {
      const selectElement = document.querySelector(
        "#consultaPrecatorioInscritoTJPEFrom\\:entidade"
      );
      const options = [...selectElement.options];

      const valores = options
        .filter((option) => option.value)
        .map((option) => {
          return {
            valor: option.value,
            entidade: option.textContent.trim(),
          };
        });

      return valores;
    });

    for (let index = 0; index < CODIGO_CONSULTA.length; index++) {
      const element = CODIGO_CONSULTA[index];

      const page = await browser.newPage();
      console.log("Criando página");

      page.setUserAgent(randomizeUserAgent());
      console.log("Definindo user agent");

      page.setBypassCSP(true);
      console.log("Bypassando CSP");

      page.setDefaultTimeout(520000);
      await page.setViewport(randomizeViewPort());
      console.log("Definindo viewport");

      console.log("*".repeat(50));

      console.log("Acessando página do TJPE");
      await page.goto(TJPE_LINK);

      humanizeDelay();

      console.log("Aguardando a confirmação de carregamento da página");
      await waitForSelectorWithTimeout(page, ".form-select", 10000);
      console.log("Dropdown Detectado");
      console.log("Página carregada");

      humanizeDelay();
      await waitForSelectorWithTimeout(page, ".form-select", 10000);

      const consulta = element.toString();
      console.log(`Código que será consultado: ${consulta}`);
      await page.select(".form-select", consulta);

      humanizeDelay();
      console.log("Elemento selecionado");

      await waitForSelectorWithTimeout(page, ".form-button", 10000);
      humanizeDelay();

      await page.click(".form-button");

      console.log("O botão foi clicado");

      await time(3);

      try {
        // Aguarda até que as linhas da tabela estejam carregadas
        await waitForSelectorWithTimeout(page, ".rich-table-row", 10000);

        // Verifica se há dados na página
        const dados = await page.evaluate(() => {
          const rows = document.querySelectorAll(".rich-table-row");
          if (rows.length === 0) {
            // Caso não haja linhas, retorna um array vazio
            return [];
          }

          const result = [];
          rows.forEach((row) => {
            if (!row.classList.contains("rich-table-footer")) {
              const cells = row.querySelectorAll("td");
              const data = {
                Ordem: cells[0]?.innerText.trim(),
                "Nº Precatório": cells[1]?.innerText.trim(),
                Natureza: cells[2]?.innerText.trim(),
                Orçamento: cells[3]?.innerText.trim(),
                Recebimento: cells[4]?.innerText.trim(),
                "Nome do beneficiário": cells[5]?.innerText.trim(),
                Prioridade: cells[6]?.innerText.trim(),
                "Valor Atualizado": cells[7]?.innerText.trim(),
              };
              result.push(data);
            }
          });

          return result;
        });

        if (dados.length === 0) {
          console.log("Nenhum dado encontrado na página.");
          await page.close();
          continue; // Passa para a próxima consulta
        }

        console.log("Dados que serão salvos na tabela");
        console.log(dados);
        console.log("Tabela Pronta");
        console.table(dados);

        converterExcel(dados);
      } catch (innerError) {
        console.error(
          "Ocorreu um erro durante a extração de dados:",
          innerError
        );
      } finally {
        await page.close();
      }

      await time(5);
    }
    console.log("*".repeat(50));
    humanizeDelay();
    console.log("Ponto de entrada definido e funcional");
    console.log("*".repeat(50));

    return { cursor, page };
  } catch (error) {
    console.error("Ocorreu um erro durante a inicialização:", error);
    throw error;
  }
}

export default initializeRPV;
