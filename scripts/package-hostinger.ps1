param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$packagePrefix = $packageRoot.TrimEnd('\') + '\'
$packageItems = @(
    'app', 'components', 'data', 'lib', 'public', 'store', 'types', 'tests',
    'deployment/hostinger.env.example', 'scripts/package-hostinger.ps1',
    'package.json', 'package-lock.json', 'next.config.js', 'tsconfig.json',
    'postcss.config.mjs', 'eslint.config.mjs', 'components.json',
    '.gitignore', '.prettierignore', 'README.md', 'HOSTINGER_SETUP.md'
)
$packageFiles = [Collections.Generic.List[IO.FileInfo]]::new()
foreach ($packageItem in $packageItems) {
    $packagePath = Get-Item -LiteralPath (Join-Path $packageRoot $packageItem)
    $packageEntries = @($packagePath)
    if ($packagePath.PSIsContainer) {
        $packageEntries += @(Get-ChildItem -LiteralPath $packagePath.FullName -Recurse -Force)
    }
    foreach ($packageEntry in $packageEntries) {
        if (($packageEntry.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Refusing symbolic link/reparse point: $($packageEntry.FullName)"
        }
        if ($packageEntry.PSIsContainer) { continue }
        if (-not $packageEntry.FullName.StartsWith($packagePrefix, [StringComparison]::OrdinalIgnoreCase)) {
            throw 'Package entry resolves outside the workspace.'
        }
        $packageRelative = $packageEntry.FullName.Substring($packagePrefix.Length).Replace('\', '/')
        if ($packageRelative -match '(^|/)(\.data|\.next|node_modules|\.git)(/|$)|(^|/)\.env($|\.)|\.(pem|key|zip|tsbuildinfo)$') {
            throw "Refusing private or generated file: $packageRelative"
        }
        $packageFiles.Add($packageEntry)
    }
}

$packageOutput = Join-Path $packageRoot 'output/hostinger'
[IO.Directory]::CreateDirectory($packageOutput) | Out-Null
$packageName = 'flair-erp-hostinger-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '.zip'
$packageZip = Join-Path $packageOutput $packageName
$packageArchive = [IO.Compression.ZipFile]::Open($packageZip, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($packageFile in ($packageFiles | Sort-Object FullName -Unique)) {
        $packageRelative = $packageFile.FullName.Substring($packagePrefix.Length).Replace('\', '/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $packageArchive, $packageFile.FullName, $packageRelative,
            [IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
} finally {
    $packageArchive.Dispose()
}

$packageArchive = [IO.Compression.ZipFile]::OpenRead($packageZip)
try {
    foreach ($packageEntry in $packageArchive.Entries) {
        $packageSourceHash = (Get-FileHash -LiteralPath (Join-Path $packageRoot $packageEntry.FullName) -Algorithm SHA256).Hash
        $packageStream = $packageEntry.Open()
        $packageHasher = [Security.Cryptography.SHA256]::Create()
        try {
            $packageEntryHash = [BitConverter]::ToString($packageHasher.ComputeHash($packageStream)).Replace('-', '')
        } finally {
            $packageStream.Dispose()
            $packageHasher.Dispose()
        }
        if ($packageSourceHash -ne $packageEntryHash) { throw "Archive verification failed: $($packageEntry.FullName)" }
    }
    foreach ($packageRequired in @('package.json', 'package-lock.json', 'app/layout.tsx', 'HOSTINGER_SETUP.md')) {
        if (-not $packageArchive.GetEntry($packageRequired)) { throw "Required archive entry missing: $packageRequired" }
    }
    $packageCount = $packageArchive.Entries.Count
} finally {
    $packageArchive.Dispose()
}

[PSCustomObject]@{
    Archive = $packageZip
    FilesVerified = $packageCount
    SizeMB = [Math]::Round((Get-Item -LiteralPath $packageZip).Length / 1MB, 2)
    SHA256 = (Get-FileHash -LiteralPath $packageZip -Algorithm SHA256).Hash
} | Format-List
