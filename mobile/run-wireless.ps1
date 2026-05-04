param(
    [string]$LaptopIp
)

if (-not $LaptopIp) {
    $candidateIps = Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -notlike '127.*' -and
            $_.IPAddress -notlike '169.254.*' -and
            $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Virtual|Bluetooth'
        } |
        Select-Object -ExpandProperty IPAddress

    $LaptopIp = $candidateIps | Select-Object -First 1
}

if (-not $LaptopIp) {
    throw 'IP laptop tidak ditemukan. Jalankan: .\run-wireless.ps1 -LaptopIp 192.168.x.x'
}

$apiBaseUrl = "http://$LaptopIp`:8080/api"
Write-Host "Menjalankan Flutter dengan API_BASE_URL=$apiBaseUrl"

flutter run --dart-define="API_BASE_URL=$apiBaseUrl"