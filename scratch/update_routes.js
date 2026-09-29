const fs = require('fs');
const path = 'C:/laravel/getReadyWebapp/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove it from the global area
content = content.replace("Route::post('/outfits', [ClothApiController::class, 'store']);\n", "");

// 2. Add it to the top of the first auth:sanctum group
const searchStr = "Route::middleware('auth:sanctum')->group(function () {\n    \n    // Fetch logged-in user details";
const replaceStr = "Route::middleware('auth:sanctum')->group(function () {\n    Route::post('/outfits', [ClothApiController::class, 'store']);\n    \n    // Fetch logged-in user details";

if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Updated api.php successfully");
} else {
    console.log("Could not find the target string in api.php");
}
