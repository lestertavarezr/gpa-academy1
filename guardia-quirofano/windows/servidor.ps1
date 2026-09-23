param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$port = 4174
$address = "http://127.0.0.1:$port/"
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)

function Send-Response($stream, $status, $contentType, $body, $headOnly) {
    $reason = switch ($status) { 200 { 'OK' } 403 { 'Forbidden' } 404 { 'Not Found' } 405 { 'Method Not Allowed' } default { 'Server Error' } }
    $header = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $headOnly -and $body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
}

try {
    $listener.Start()
    Write-Host "Guardia de Quirofano: $address"
    Write-Host 'Mantén esta ventana abierta mientras juegas. Ciérrala para apagar el servidor.'
    if (-not $NoBrowser) { Start-Process $address }

    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 10000
            $stream = $client.GetStream()
            $buffer = New-Object byte[] 8192
            $request = New-Object System.IO.MemoryStream
            do {
                $read = $stream.Read($buffer, 0, $buffer.Length)
                if ($read -le 0) { break }
                $request.Write($buffer, 0, $read)
                $raw = [System.Text.Encoding]::ASCII.GetString($request.ToArray())
            } while (-not $raw.Contains("`r`n`r`n") -and $request.Length -lt 16384)

            $firstLine = ($raw -split "`r`n")[0]
            if ($firstLine -notmatch '^(GET|HEAD)\s+(\S+)\s+HTTP/') {
                Send-Response $stream 405 'text/plain' ([byte[]]@()) $false
                continue
            }
            $method = $matches[1]
            $urlPath = ($matches[2] -split '\?')[0]
            $relative = [System.Uri]::UnescapeDataString($urlPath).TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
            $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $relative))
            $inside = $candidate.Equals($root, [System.StringComparison]::OrdinalIgnoreCase) -or
                $candidate.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)

            if (-not $inside) {
                Send-Response $stream 403 'text/plain' ([byte[]]@()) ($method -eq 'HEAD')
                continue
            }
            if (-not [System.IO.File]::Exists($candidate)) {
                Send-Response $stream 404 'text/plain' ([byte[]]@()) ($method -eq 'HEAD')
                continue
            }

            $contentType = switch ([System.IO.Path]::GetExtension($candidate).ToLowerInvariant()) {
                '.html' { 'text/html; charset=utf-8' }
                '.js'   { 'text/javascript; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.png'  { 'image/png' }
                '.webp' { 'image/webp' }
                '.svg'  { 'image/svg+xml' }
                '.json' { 'application/json; charset=utf-8' }
                '.webmanifest' { 'application/manifest+json; charset=utf-8' }
                default { 'application/octet-stream' }
            }
            $body = [System.IO.File]::ReadAllBytes($candidate)
            Send-Response $stream 200 $contentType $body ($method -eq 'HEAD')
        }
        catch {
            Write-Warning $_.Exception.Message
        }
        finally {
            $client.Close()
        }
    }
}
finally {
    $listener.Stop()
}
