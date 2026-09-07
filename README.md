# FPIA — Página de vendas

Landing page estática (HTML + CSS + JS puro, sem build). Basta abrir `index.html`
ou publicar a pasta inteira em qualquer hospedagem.

## Estrutura

```
index.html                     página completa
assets/css/style.css           estilos
assets/js/main.js              menu, FAQ, animações, CTAs, player
assets/img/                    imagens e o vídeo

Dockerfile                     imagem nginx para o Easypanel
nginx.conf                     config do nginx dentro do container
empacotar.ps1                  gera o fpia-deploy.zip para upload
DEPLOY.md                      passo a passo da publicação
```

## Publicar

Ver **[DEPLOY.md](DEPLOY.md)** — Easypanel + domínio da HostGator em
`arvisx.com.br/fpia`.

## O que falta configurar

### 1. Link do checkout  ← principal

Abra `assets/js/main.js` e cole o link entre as aspas na primeira linha útil:

```js
var LINK_CHECKOUT = 'https://pay.suaplataforma.com/...';
```

Isso aplica o link em **todos** os botões "Quero me inscrever" de uma vez
(topo, hero, oferta e barra fixa do mobile). Se ficar vazio, os botões apenas
rolam a página até a seção de oferta.

### 2. Vídeo do topo

O vídeo é o destaque do topo: capa + botão de play no centro, sobre a imagem
do hero ao fundo.

| Arquivo | O que é |
|---|---|
| `assets/img/video-cta.mp4` | o vídeo (16:9 — o atual é 1024×576, 42s) |
| `assets/img/video-cta-capa.jpg` | a capa, extraída do frame de 20s do vídeo |

Para trocar, substitua os arquivos mantendo os nomes. Se o vídeo novo tiver
outro enquadramento, gere uma capa nova a partir dele (qualquer frame serve;
prefira um com a expressão fechada).

**Por que o play é por clique e não automático:** navegador nenhum permite
autoplay com áudio sem uma interação. Como o clique no play é essa interação,
o vídeo já começa com som — sem botão extra de "ativar som". O download do
vídeo (`preload="none"`) também só acontece no clique, então os 8 MB não
pesam no carregamento da página.

### 3. Redes sociais

No `index.html`, no rodapé, troque os `href="#"` dos links de Instagram,
Facebook e YouTube.

### 4. Imagem de compartilhamento (opcional)

`assets/img/og-image.png` ainda é um placeholder — é a miniatura que aparece
quando o link é enviado no WhatsApp / Instagram / Facebook. Tamanho: 1200×630 px.

## Imagens em uso

| Arquivo | Onde aparece |
|---|---|
| `hero.png` | fundo do topo (desktop) e banner do topo (mobile) |
| `foto-ministrante.png` | seção "Conheça a ministrante" |
| `logo-fpia.png` | cabeçalho, caixa da oferta e rodapé |
| `favicon.png` | ícone da aba do navegador |
| `og-image.png` | *placeholder* — pré-visualização em redes sociais |
| `FPIA_LOGOTIPO_600x120.png` | original enviado (mantido como fonte; `logo-fpia.png` é a versão aparada) |

Para trocar qualquer uma, basta substituir o arquivo mantendo o mesmo nome.

## Textos

Todo o conteúdo veio do layout de referência. **As respostas do FAQ foram
escritas por mim como rascunho** — revise antes de publicar, principalmente:

- tempo de acesso ao curso;
- se o certificado é realmente emitido;
- condições de parcelamento.

## Detalhes de implementação

- **Responsivo**: 4 colunas → 2 → 1. Abaixo de 900px o menu vira drawer e a
  imagem do topo passa a ser um banner abaixo do texto (para a foto não ficar
  cortada). Abaixo de 640px aparece uma barra fixa de CTA no rodapé — para
  removê-la, apague o bloco `.cta-fixed` do CSS e do HTML.
- **Ícones**: SVG inline (sprite no topo do `index.html`), sem biblioteca externa.
- **Fontes**: Playfair Display (títulos) e Montserrat (texto), via Google Fonts.
- **Acessibilidade**: FAQ com `aria-expanded`, menu com `aria-controls`,
  link "pular para o conteúdo" e respeito a `prefers-reduced-motion`.
