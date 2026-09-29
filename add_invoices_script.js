const fs = require('fs');
const path = 'C:/laravel/getReadyWebapp/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('App\\Http\\Controllers\\Api\\InvoiceApiController')) {
    content = content.replace(
        'use App\\Http\\Controllers\\Api\\RejectionApiController;',
        'use App\\Http\\Controllers\\Api\\RejectionApiController;\nuse App\\Http\\Controllers\\Api\\InvoiceApiController;'
    );
}

if (!content.includes('/invoices')) {
    content = content + `\n
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/invoices', [InvoiceApiController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceApiController::class, 'show']);
});
Route::get('/invoices/{id}/download', [InvoiceApiController::class, 'download']);
`;
}

fs.writeFileSync(path, content, 'utf8');
console.log('Routes added');
