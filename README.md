# ExecutivoVilaBelaMT

Plataforma-base de governança pública inteligente aplicada ao Município de Vila Bela da Santíssima Trindade - MT.

## Propósito
Estruturar um ambiente digital com foco em gestão pública, transparência, controle, inteligência institucional e integração entre Executivo, Legislativo e órgãos de controle.

## Marco estratégico
Vila Bela, por sua relevância histórica como 1ª Capital de Mato Grosso, torna-se o ponto de partida de um modelo replicável de governança pública inteligente.

## Parcerias e integrações
- Prefeitura Municipal
- Câmara Municipal
- TCE-MT
- TCU
- AMM
- GitHub
- Termux
- Notion
- OpenAI / ChatGPT

## Especialidades
- Gestão pública orientada por dados
- Dashboards institucionais
- Auditoria preventiva
- Planejamento e execução orçamentária
- IA aplicada à administração pública

## Como publicar no GitHub Pages
1. Criar o repositório `executivo-vilabela-mt`
2. Inserir os arquivos nas pastas correspondentes
3. Ir em Settings > Pages
4. Em Build and deployment, escolher Deploy from a branch
5. Selecionar a branch `main` e a pasta `/root`
6. Salvar

## Como testar localmente no Termux
```bash
pkg update && pkg upgrade -y
pkg install git nodejs -y
cd /sdcard
mkdir executivo-vilabela-mt
cd executivo-vilabela-mt
# cole os arquivos do projeto aqui
npx serve .
