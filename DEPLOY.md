# Publicar em `arvisx.com.br/fpia`

Easypanel servindo o site, domínio da HostGator apontado para o servidor.

---

## Antes de começar

Anote o **IP do servidor do Easypanel**. É o mesmo IP que você usa para abrir o
painel (`http://SEU_IP:3000`). Ele aparece também no seu provedor de VPS.

Neste guia ele é chamado de `SEU_IP`.

---

## Passo 1 — Gerar o pacote para upload

Na pasta do projeto, rode:

```powershell
powershell -File empacotar.ps1
```

Isso gera `fpia-deploy.zip` com apenas o necessário: `index.html`, `assets/`,
`Dockerfile` e `nginx.conf`.

> Se preferir usar GitHub em vez de upload, pode pular este passo — no Passo 2
> escolha **GitHub** como source em vez de **Upload**.

---

## Passo 2 — Criar o serviço no Easypanel

1. Abra o Easypanel → **Project** → **+ Service** → **App**
2. Nome: `fpia`
3. Aba **Source**:
   - Tipo: **Upload**
   - Envie o `fpia-deploy.zip`
4. Aba **Build**:
   - Método: **Dockerfile**
   - Caminho do Dockerfile: `Dockerfile` (o padrão)
5. Clique em **Deploy** e acompanhe o log até aparecer que subiu.

O build é rápido — não há compilação, apenas cópia de arquivos para dentro de
uma imagem do nginx.

### Conferir antes de mexer no domínio

Ainda no Easypanel, a aba **Domains** cria um endereço de teste automático
(algo como `fpia-abc123.easypanel.host`). Abra:

```
https://<endereço-de-teste>/fpia/
```

Se a página carregar com as imagens e o vídeo, o container está correto e o que
falta é só DNS.

---

## Passo 3 — Apontar o domínio na HostGator

No painel da HostGator, vá em **Domínios → Zona de DNS** (ou *DNS Zone Editor*)
do `arvisx.com.br` e crie/edite:

| Tipo | Nome | Valor    | TTL  |
|------|------|----------|------|
| A    | `@`  | `SEU_IP` | 3600 |
| A    | `www`| `SEU_IP` | 3600 |

Se já existir um registro `A` para `@` apontando para a hospedagem da
HostGator, **edite** esse registro em vez de criar outro — dois registros `A`
no mesmo nome fazem o tráfego se dividir entre os dois servidores de forma
imprevisível.

> **Atenção:** isto move o domínio inteiro para o servidor do Easypanel. Se
> `arvisx.com.br` hoje já serve outro site na HostGator, esse site sai do ar.
> Nesse caso, use um subdomínio (veja "Alternativa" no fim).

A propagação costuma levar de alguns minutos a algumas horas.

Para acompanhar:

```powershell
nslookup arvisx.com.br 8.8.8.8
```

Quando responder `SEU_IP`, siga para o próximo passo.

---

## Passo 4 — Ligar o domínio ao serviço

No Easypanel, serviço `fpia` → aba **Domains** → **Add Domain**:

| Campo         | Valor            |
|---------------|------------------|
| Host          | `arvisx.com.br`  |
| Path          | `/fpia`          |
| Port          | `80`             |
| HTTPS         | ligado           |
| Certificate   | Let's Encrypt    |

Salve. O certificado SSL é emitido sozinho em cerca de um minuto — **desde que
o DNS do Passo 3 já esteja propagado**, porque a Let's Encrypt precisa acessar
o domínio para validar. Se der erro de certificado, quase sempre é DNS que
ainda não propagou: espere e clique em emitir de novo.

Pronto: **https://arvisx.com.br/fpia**

---

## Sobre o caminho `/fpia`

O proxy do Easypanel pode repassar a requisição ao container de duas formas:
com o caminho completo (`/fpia/assets/...`) ou já sem o prefixo
(`/assets/...`). A documentação não deixa claro qual das duas acontece.

O `nginx.conf` deste projeto **atende as duas** — não é preciso descobrir qual
é, e continua funcionando se o comportamento mudar numa atualização.

Todos os caminhos do site (CSS, imagens, vídeo) são relativos, então a página
funciona em qualquer subpasta sem edição.

### Se quiser que a raiz também abra a página

Para `arvisx.com.br` (sem `/fpia`) abrir o mesmo conteúdo, adicione o domínio
uma segunda vez com **Path** vazio. Para a raiz *redirecionar* para `/fpia/`
em vez de mostrar a página, troque no `nginx.conf`:

```nginx
location / {
    root /var/www/fpia;
    try_files $uri $uri/ /index.html;
}
```

por:

```nginx
location = / { return 301 /fpia/; }
```

---

## Atualizar a página depois

1. Edite os arquivos localmente
2. Rode `powershell -File empacotar.ps1` de novo
3. Easypanel → serviço `fpia` → **Source** → envie o zip novo → **Deploy**

Se usar GitHub como source, basta dar `git push` e clicar em **Deploy** (ou
ligar o auto deploy).

Depois de atualizar, force um recarregamento no navegador (**Ctrl+F5**) — os
arquivos estáticos ficam 30 dias em cache.

---

## Alternativa: subdomínio em vez de subpasta

Se `arvisx.com.br` precisa continuar servindo outra coisa, use um subdomínio —
é mais simples e evita a questão do prefixo de caminho:

1. DNS na HostGator: registro `A` com nome `fpia` → `SEU_IP`
2. Easypanel → Domains: Host `fpia.arvisx.com.br`, **Path vazio**, porta 80

O endereço vira `https://fpia.arvisx.com.br`. O `nginx.conf` já atende esse
caso (o bloco `location /`), sem nenhuma alteração.

Se escolher este caminho, lembre de atualizar as meta tags `og:url`,
`og:image` e `canonical` no `index.html`, que hoje apontam para
`https://arvisx.com.br/fpia/`.

---

## Alternativa mais simples: hospedar direto na HostGator

Vale saber que este site é **estático** — só HTML, CSS, JS e mídia. Se você já
tem um plano de hospedagem na HostGator (não apenas o registro do domínio),
dá para publicar sem Easypanel, sem Docker e sem mexer em DNS: pelo
Gerenciador de Arquivos do cPanel, crie a pasta `fpia` dentro de `public_html`
e envie `index.html` + `assets/`. O endereço `arvisx.com.br/fpia` funciona na
hora, com o SSL que a HostGator já emite.

O Easypanel faz sentido se você quer tudo no mesmo servidor que seus outros
projetos, ou se pretende crescer para algo com backend.

---

## Problemas comuns

**A página abre sem estilo, imagens quebradas**
Você acessou `arvisx.com.br/fpia` sem a barra final e algo impediu o
redirecionamento. Teste `arvisx.com.br/fpia/` com a barra. O nginx já
redireciona sozinho — se não estiver acontecendo, confira se o `nginx.conf`
foi mesmo copiado na imagem.

**Erro de certificado / "não seguro"**
DNS ainda não propagou quando a Let's Encrypt tentou validar. Confirme com
`nslookup arvisx.com.br 8.8.8.8` e emita o certificado novamente.

**O vídeo não toca**
Confirme que `assets/img/video-cta.mp4` (8,6 MB) entrou no zip. No log do
build do Easypanel deve aparecer o `COPY assets`.

**Mudei o site e não vejo a alteração**
Cache do navegador: **Ctrl+F5**. Se persistir, confira se o deploy realmente
terminou no Easypanel.
