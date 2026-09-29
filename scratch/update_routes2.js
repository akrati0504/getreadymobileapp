const fs = require('fs');
const path = 'C:/laravel/getReadyWebapp/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove it from the global area
content = content.replace(/Route::post\('\/outfits', \[ClothApiController::class, 'store'\]\);\s*\n/g, "");

// 2. Add it to the top of the first auth:sanctum group
content = content.replace(
    /Route::middleware\('auth:sanctum'\)->group\(function \(\) \{/i,
    "Route::middleware('auth:sanctum')->group(function () {\n    Route::post('/outfits', [ClothApiController::class, 'store']);"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated api.php successfully");
