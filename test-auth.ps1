# PowerShell script for testing authentication
param(
    [string]$Action = "help",
    [string]$Email = "",
    [string]$Password = ""
)

Write-Host "Food Delivery App - Authentication Tester" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

switch ($Action.ToLower()) {
    "register" {
        if ($Email -eq "" -or $Password -eq "") {
            Write-Host "Error: Email and password required for registration" -ForegroundColor Red
            Write-Host "Usage: .\test-auth.ps1 register user@example.com password123" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "Testing Registration..." -ForegroundColor Green
        node test-auth.js register $Email $Password
    }
    "login" {
        if ($Email -eq "" -or $Password -eq "") {
            Write-Host "Error: Email and password required for login" -ForegroundColor Red
            Write-Host "Usage: .\test-auth.ps1 login user@example.com password123" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "Testing Login..." -ForegroundColor Green
        node test-auth.js login $Email $Password
    }
    "full" {
        Write-Host "Running Full Test Suite..." -ForegroundColor Green
        node test-auth.js
    }
    "quick" {
        Write-Host "Quick Test with Random Account..." -ForegroundColor Green
        $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        $testEmail = "test$timestamp@gmail.com"
        $testPassword = "testpassword123"
        
        Write-Host "Creating account: $testEmail" -ForegroundColor Yellow
        node test-auth.js register $testEmail $testPassword
        
        Write-Host ""
        Write-Host "Testing login (should work immediately):" -ForegroundColor Yellow
        node test-auth.js login $testEmail $testPassword
    }
    default {
        Write-Host "Available Commands:" -ForegroundColor Green
        Write-Host ""
        Write-Host "  .\test-auth.ps1 register email password  " -ForegroundColor White -NoNewline
        Write-Host "# Register new account" -ForegroundColor Gray
        Write-Host "  .\test-auth.ps1 login email password     " -ForegroundColor White -NoNewline
        Write-Host "# Login with account" -ForegroundColor Gray
        Write-Host "  .\test-auth.ps1 full                     " -ForegroundColor White -NoNewline
        Write-Host "# Run complete test suite" -ForegroundColor Gray
        Write-Host "  .\test-auth.ps1 quick                    " -ForegroundColor White -NoNewline
        Write-Host "# Quick test with random account" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Green
        Write-Host "  .\test-auth.ps1 register john@gmail.com mypassword123"
        Write-Host "  .\test-auth.ps1 login john@gmail.com mypassword123"
        Write-Host "  .\test-auth.ps1 quick"
        Write-Host ""
        Write-Host "Tips:" -ForegroundColor Yellow
        Write-Host "  - Use real email domains (gmail.com, outlook.com, etc.)"
        Write-Host "  - Password must be at least 6 characters"
        Write-Host "  - Email confirmation is disabled - immediate login after signup"
        Write-Host "  - Wait between attempts to avoid rate limiting"
    }
}