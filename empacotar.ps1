# ============================================================================
#  Gera fpia-deploy.zip para enviar no Easypanel (Source: Upload)
#  Uso:  powershell -File empacotar.ps1
#
#  Nota: o zip é montado entrada por entrada de propósito. O Compress-Archive
#  do Windows PowerShell grava os caminhos com barra INVERTIDA, e o servidor
#  (Linux) então cria arquivos chamados "assets\css\style.css" soltos, em vez
#  das pastas — o que quebra o COPY do Dockerfile. O padrão ZIP exige barra
#  normal, e é isso que fazemos aqui.
# ============================================================================

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projeto = $PSScriptRoot
$saida   = Join-Path $projeto 'fpia-deploy.zip'

# Só o que o servidor precisa. Imagem de referência, README, DEPLOY e o
# próprio zip ficam de fora.
$raiz  = @('index.html', 'Dockerfile', 'nginx.conf')
$pasta = 'assets'

foreach ($f in $raiz) {
    if (-not (Test-Path (Join-Path $projeto $f))) { throw "Arquivo obrigatorio ausente: $f" }
}
if (-not (Test-Path (Join-Path $projeto $pasta))) { throw "Pasta obrigatoria ausente: $pasta" }

Write-Host 'Montando pacote...' -ForegroundColor Cyan
if (Test-Path $saida) { Remove-Item -LiteralPath $saida -Force }

$zip = [System.IO.Compression.ZipFile]::Open($saida, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    # arquivos da raiz
    foreach ($f in $raiz) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $zip, (Join-Path $projeto $f), $f,
            [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        Write-Host "  + $f"
    }

    # pasta assets, preservando a hierarquia com barra normal
    $base = (Resolve-Path $projeto).Path.TrimEnd('\') + '\'
    Get-ChildItem -Path (Join-Path $projeto $pasta) -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($base.Length).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $zip, $_.FullName, $rel,
            [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        Write-Host "  + $rel"
    }
}
finally {
    $zip.Dispose()
}

$mb = [Math]::Round((Get-Item $saida).Length / 1MB, 1)
Write-Host ''
Write-Host "Pronto: fpia-deploy.zip ($mb MB)" -ForegroundColor Green
Write-Host 'Envie este arquivo no Easypanel em Source > Upload, com Build = Dockerfile.'
