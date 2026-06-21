#!/bin/bash
set -e

# Chuyển đến thư mục gốc của dự án SeSpark
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

CATEGORY=${1:-"all"}

run_func() {
    echo "========================================="
    echo "⚙️  Category: Functional Tests (slicer-engine)"
    echo "========================================="
    cd "$PROJECT_ROOT/slicer-engine"
    cargo test
}

run_type() {
    echo "========================================="
    echo "🔍 Category: Type Checking (frontend check)"
    echo "========================================="
    cd "$PROJECT_ROOT/frontend"
    npm run check
}

run_ui() {
    echo "========================================="
    echo "🎨 Category: UI Store Logic Tests"
    echo "========================================="
    cd "$PROJECT_ROOT"
    node --test tests/ui/store.test.js
}

case "$CATEGORY" in
    "func")
        run_func
        ;;
    "type")
        run_type
        ;;
    "ui")
        run_ui
        ;;
    "all"|"")
        run_func
        run_type
        run_ui
        ;;
    *)
        echo "❌ Unknown category: $CATEGORY"
        echo "Valid categories: func | type | ui | all"
        exit 1
        ;;
esac

echo ""
echo "✅ Tests in category '$CATEGORY' completed successfully!"
