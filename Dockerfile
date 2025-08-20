# Etapa de construção
FROM node:20.19.0 AS build

WORKDIR /app

# Copiar o código fonte para o contêiner
COPY . .

# Instalar dependências
RUN npm install

# Criar os arquivos de build
RUN npm run build

# Usar uma imagem do Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copiar os arquivos de build para o diretório do Nginx
COPY --from=build /app/dist/ /usr/share/nginx/html

# Expor a porta 80 (padrão do Nginx)
EXPOSE 80

# Configurar o Nginx para sempre retornar index.html em rotas internas
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
