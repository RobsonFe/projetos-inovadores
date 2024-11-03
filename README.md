# Bot Extrator de Entes Devedores do TJPE

## Sobre o Projeto

Este projeto tem como objetivo desenvolver um bot que extrai dados de precatórios do Tribunal de Justiça de Pernambuco (TJPE) para um trabalho acadêmico na faculdade UNINASSAU, Campus Paulista - PE. O bot realiza consultas aos dados de precatórios do TJPE e os armazena em um arquivo Excel.

**Dados do Aluno**

- **Nome**: Robson Ferreira da Silva
- **Curso**: Análise e Desenvolvimento de Sistemas
- **Matrícula**: 01266993

## Descrição do Funcionamento

- O bot realiza as consultas sem ser detectado como um possível malware.
- Em caso de listas vazias de precatórios, o bot avança para o próximo bloco de consulta.
- Salva os resultados em planilhas Excel.
- Gera logs completos das ações realizadas, permitindo acompanhamento das operações.

## Instalação

### Pré-requisitos

As bibliotecas utilizadas no projeto incluem:

- **puppeteer**: Para automatizar a navegação e interação com a página do TJPE.
- **xlsx**: Para a criação e manipulação de arquivos Excel.
- **fs**: Para operações de leitura e gravação de arquivos.

Instale as dependências antes de iniciar o bot com o comando:

```bash
npm install puppeteer xlsx fs
```

## Fluxo de Execução

1. O bot acessa a página de consulta de precatórios do TJPE.
2. Cada entidade a ser consultada possui um código específico, que é utilizado para realizar a consulta.

   **Exemplo**:

   ```
   355 - Prefeitura Municipal de Vitória de Santo Antão
   ```

   Código: `355`

3. A partir desse código, o bot acessa a entidade desejada, realiza a consulta e extrai os dados da tabela de resultados.
4. Os dados são então armazenados em um objeto Node.js, que é convertido em um arquivo Excel. O nome do arquivo é gerado automaticamente com base na data e hora para evitar sobrescrita.

## Funções Principais

### Consulta de Entidades

A função abaixo realiza a consulta das entidades cujos precatórios serão extraídos.

```javascript
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
```

### Conversão para Excel

A função `converterExcel` salva os dados extraídos em um arquivo Excel.

```javascript
function converterExcel(dados) {
  humanizeDelay();
  const timestamp = Date.now();
  const file_path = `./tabela/precatorios-${timestamp}.xlsx`;

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(dados);
  XLSX.utils.book_append_sheet(workbook, worksheet, `Precatorios`);
  XLSX.writeFile(workbook, file_path);

  console.log(`Arquivo salvo em: ${file_path}`);
}
```

### Extração de Dados de Precatórios

O trecho a seguir realiza a varredura dos dados de precatórios e os salva:

```javascript
try {
  await waitForSelectorWithTimeout(page, ".rich-table-row", 10000);

  const dados = await page.evaluate(() => {
    const rows = document.querySelectorAll(".rich-table-row");
    if (rows.length === 0) return [];

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
    continue;
  }

  console.log("Dados que serão salvos na tabela");
  console.table(dados);
  converterExcel(dados);
} catch (innerError) {
  console.error("Ocorreu um erro durante a extração de dados:", innerError);
} finally {
  await page.close();
}
```

## Observação Importante

Para consultar apenas algumas entidades específicas, utilize uma tabela-guia de Excel localizada na pasta `CSV`. A função `procv` filtra essas entidades. Para consultar todas as entidades disponíveis no TJPE, utilize a função `converterExcel(entidades);`.

## Contato

Autor: [Robson Ferreira](https://github.com/RobsonFe)
