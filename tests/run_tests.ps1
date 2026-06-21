param (
    [string]$Category = "all"
)

$ProjectRoot = "$PSScriptRoot\.."

function Run-Func {
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Category: Functional Tests (slicer-engine)" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Set-Location "$ProjectRoot\slicer-engine"
    cargo test
}

function Run-Type {
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Category: Type Checking (frontend check)" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Set-Location "$ProjectRoot\frontend"
    npm run check
}

function Run-Ui {
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Category: UI Store Logic Tests" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Set-Location "$ProjectRoot"
    node --test tests/ui/store.test.js
}

switch ($Category) {
    "func" {
        Run-Func
    }
    "type" {
        Run-Type
    }
    "ui" {
        Run-Ui
    }
    "all" {
        Run-Func
        Run-Type
        Run-Ui
    }
    Default {
        Write-Error "Unknown category: $Category"
        Write-Host "Valid categories: func | type | ui | all"
        exit 1
    }
}

Write-Host ""
Write-Host "Tests in category $Category completed successfully!" -ForegroundColor Green
