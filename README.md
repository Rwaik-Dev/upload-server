# Upload Server

API REST para upload, armazenamento, consulta e exportação de imagens, desenvolvida com **Node.js, TypeScript e Fastify**, utilizando **Cloudflare R2** para armazenamento de arquivos e **PostgreSQL** para persistência de metadados.

O projeto foi estruturado para separar as responsabilidades entre regras de negócio, infraestrutura, armazenamento e camada HTTP, com validação de dados e documentação interativa dos endpoints.

## ✨ Funcionalidades

- **Upload de imagens:** recebimento de arquivos por `multipart/form-data`.
- **Validação de formatos:** suporte a JPEG, JPG, PNG e WebP.
- **Limite de upload:** tamanho máximo de 2 MB por arquivo na rota de upload.
- **Armazenamento em nuvem:** integração com Cloudflare R2 por meio da API compatível com S3.
- **Identificação única:** geração de nomes exclusivos para os arquivos armazenados.
- **Persistência de metadados:** registro do nome original, chave remota, URL pública e data de criação.
- **Listagem de uploads:** consulta com paginação e total de registros.
- **Pesquisa por nome:** filtro textual sem diferenciação entre maiúsculas e minúsculas.
- **Ordenação:** classificação por data de criação em ordem crescente ou decrescente.
- **Exportação CSV:** geração de relatórios de uploads com opção de filtro.
- **Documentação Swagger:** documentação interativa disponível no endpoint `/docs`.
- **Validação de requisições:** utilização de Zod para validação de dados e integração com o Fastify.
- **Testes automatizados:** configuração de testes com Vitest.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução |
| TypeScript | Tipagem estática |
| Fastify 5 | Servidor HTTP e API REST |
| Zod | Validação de dados |
| fastify-type-provider-zod | Integração de validação e serialização |
| PostgreSQL | Banco de dados relacional |
| Drizzle ORM | Consultas e modelagem do banco |
| Cloudflare R2 | Armazenamento de objetos |
| AWS SDK for JavaScript | Comunicação com o armazenamento compatível com S3 |
| Swagger / OpenAPI | Documentação da API |
| Vitest | Testes automatizados |
| Biome | Ferramentas de qualidade e formatação de código |
| csv-stringify | Geração de arquivos CSV |

## 🏗️ Arquitetura

O projeto organiza suas responsabilidades em camadas, separando as rotas HTTP das regras de negócio e dos detalhes de infraestrutura.

```text
src/
├── app/
│   └── functions/
│       ├── upload-image.ts
│       ├── get-uploads.ts
│       ├── export-uploads.ts
│       └── erros/
├── infra/
│   ├── db/
│   │   ├── schemas/
│   │   └── migrations/
│   ├── http/
│   │   ├── routes/
│   │   ├── server.ts
│   │   └── transform-swagger-schema.ts
│   ├── shared/
│   └── storage/
├── env.ts
└── ...
```

### Responsabilidades das camadas

- **Application (`app/functions`):** concentra as operações de negócio para upload, consulta e exportação.
- **HTTP (`infra/http`):** define as rotas, validações, respostas e documentação da API.
- **Database (`infra/db`):** gerencia a conexão PostgreSQL, os schemas e as migrações por meio do Drizzle ORM.
- **Storage (`infra/storage`):** encapsula o envio de arquivos ao Cloudflare R2.
- **Shared (`infra/shared`):** disponibiliza abstrações compartilhadas, como o tratamento de resultados com `Either`.

## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js compatível com as dependências utilizadas.
- npm.
- PostgreSQL.
- Conta e bucket configurados no Cloudflare R2.
- Credenciais de acesso ao armazenamento e URL pública configurada.

### 1. Clone o repositório

```bash
git clone https://github.com/Rwaik-Dev/upload-server.git
cd upload-server
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
NODE_ENV=development

DATABASE_URL=postgresql://usuario:senha@localhost:5432/upload_server

CLOUDFLARE_ACCOUNT_ID=seu_account_id
CLOUDFLARE_ACCESS_KEY_ID=sua_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=sua_secret_key
CLOUDFLARE_BUCKET=nome_do_bucket
CLOUDFLAR_PUBLIC_URL=https://seu-dominio-publico/
```

Substitua os valores de exemplo pelas configurações reais do seu ambiente. A URL pública deve apontar para o endereço configurado para servir os objetos armazenados.

**Importante:** não versione o arquivo `.env` nem compartilhe suas credenciais. Utilize um arquivo `.env.example` sem segredos reais para documentar a configuração.

### 4. Gere e execute as migrações

Para gerar migrações a partir das alterações nos schemas:

```bash
npm run db:generate
```

Para aplicar as migrações ao banco configurado:

```bash
npm run db:migrate
```

### 5. Inicie o servidor

```bash
npm run dev
```

Por padrão, o servidor escuta na porta `3333` e no endereço `0.0.0.0`. A porta pode ser alterada pela variável `PORT`.

### 6. Acesse a documentação

Com o servidor em execução, abra:

[http://localhost:3333/docs](http://localhost:3333/docs)

A interface Swagger permite visualizar e testar os endpoints documentados.

## 📡 Endpoints disponíveis

A API disponibiliza três operações principais.

### `POST /uploads`

Recebe uma imagem e a envia ao Cloudflare R2, registrando os metadados no PostgreSQL.

**Requisição:** `multipart/form-data`, contendo o arquivo.

**Formatos aceitos:** JPEG, JPG, PNG e WebP.

**Limite:** 2 MB.

**Resposta de sucesso:** HTTP `201 Created`.

**Possíveis erros de validação:** HTTP `400 Bad Request`.

### `GET /uploads`

Retorna uma listagem paginada dos uploads registrados.

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `searchQuery` | string | Filtra pelo nome do arquivo |
| `sortBy` | string | Campo de ordenação: `createdAt` |
| `sortDirection` | string | `asc` ou `desc` |
| `page` | number | Página solicitada; padrão `1` |
| `pageSize` | number | Quantidade por página; padrão `20` |

Exemplo:

```http
GET /uploads?page=1&pageSize=20&sortBy=createdAt&sortDirection=desc
```

A resposta contém a lista de arquivos e o total de registros encontrados.

### `POST /uploads/exports`

Gera um relatório CSV com os uploads cadastrados e disponibiliza a URL do arquivo.

Parâmetro de consulta:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `searchQuery` | string | Filtro opcional pelo nome do arquivo |

Exemplo:

```http
POST /uploads/exports?searchQuery=imagem
```

Resposta esperada:

```json
{
  "reportUrl": "https://seu-dominio-publico/downloads/relatorio.csv"
}
```

A URL e o nome efetivos do arquivo são definidos durante a execução.

## 🗄️ Modelo de dados

A tabela `uploads` armazena os metadados dos arquivos:

| Campo | Descrição |
|---|---|
| `id` | Identificador único gerado com UUIDv7 |
| `name` | Nome original do arquivo |
| `remote_key` | Chave do objeto no armazenamento remoto |
| `remote_url` | URL pública do arquivo |
| `created_at` | Data e hora de criação do registro |

O conteúdo binário permanece no armazenamento de objetos, enquanto o PostgreSQL mantém os dados necessários para consultar e localizar cada upload.

## 🧪 Testes

O projeto utiliza Vitest para execução dos testes automatizados.

```bash
npm test
```

Para executar os testes em modo de observação:

```bash
npm run test:watch
```

A configuração utiliza `.env.test` e executa a migração de teste antes da suíte. Configure as variáveis de teste e um banco de dados apropriado antes de executar os comandos.

## 🔐 Considerações de segurança

- Configure credenciais válidas e com privilégios mínimos para o Cloudflare R2.
- Não exponha chaves de acesso, senhas ou variáveis sensíveis no repositório.
- Restrinja o acesso à API conforme o ambiente de implantação.
- Configure CORS para permitir somente as origens necessárias em produção.
- Valide o conteúdo real dos arquivos, além do MIME type informado pelo cliente.
- Avalie limites de requisições, autenticação e autorização antes de disponibilizar o serviço publicamente.
- Garanta que o banco de dados de testes esteja isolado dos dados de produção.

A configuração atual do servidor utiliza CORS com origem `*`. A autenticação e a autorização não estão implementadas nas rotas apresentadas.

## 📌 Próximas evoluções

Possíveis melhorias para versões futuras:

- Autenticação e autorização por tokens.
- Exclusão controlada de arquivos.
- Validação adicional do conteúdo dos arquivos.
- Limites de requisições e cotas por usuário.
- Testes de integração e cobertura automatizada.
- Logs estruturados e monitoramento.
- Containerização com Docker.
- Pipeline de CI/CD para testes e implantação.

## 👨‍💻 Autor

**Wilker Rwaik Eloi**

- GitHub: [@Rwaik-Dev](https://github.com/Rwaik-Dev)
- Repositório: [upload-server](https://github.com/Rwaik-Dev/upload-server)

---

Desenvolvido como projeto de backend para aplicação de boas práticas de APIs REST, TypeScript, persistência de dados e armazenamento de arquivos em nuvem.
