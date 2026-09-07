# ============================================================================
#  FPIA — página de vendas (site estático servido por nginx)
#
#  Imagem pronta em um passo: não há build de código, só cópia de arquivos.
#  Testar localmente:
#     docker build -t fpia .
#     docker run --rm -p 8080:80 fpia
#     abrir http://localhost:8080/fpia/
# ============================================================================
FROM nginx:1.27-alpine

# Substitui o server padrão do nginx pela nossa configuração
COPY nginx.conf /etc/nginx/conf.d/default.conf

# O site vive em /var/www/fpia — assim o caminho /fpia/... do domínio
# corresponde diretamente à pasta, sem truques de reescrita.
COPY index.html /var/www/fpia/index.html
COPY assets     /var/www/fpia/assets

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
