# Compile
Write-Host "Compiling..."
& "$PSScriptRoot\compile.ps1"
Write-Host "Compilation complete."

# Deploy
Write-Host "Deploying..."
node "$PSScriptRoot\deploy.js"
Write-Host "Deployment complete."
