const fs = require('fs');
const path = 'C:/laravel/getReadyWebapp/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /Route::get\('\/orders\/\{id\}\/purchase-eligibility', \[OrderApiController::class, 'purchaseEligibility'\]\);/,
  "Route::get('/orders/{id}/purchase-eligibility', [\\App\\Http\\Controllers\\OrderConversionController::class, 'eligibility']);"
);

content = content.replace(
  /Route::post\('\/orders\/\{id\}\/convert-to-purchase', \[OrderApiController::class, 'convertToPurchase'\]\);/,
  "Route::post('/orders/{id}/convert-to-purchase', [\\App\\Http\\Controllers\\OrderConversionController::class, 'convertToPurchase']);\n    Route::post('/orders/conversion/verify', [\\App\\Http\\Controllers\\OrderConversionController::class, 'verifyConversion']);"
);

fs.writeFileSync(path, content, 'utf8');
console.log('API routes updated');
