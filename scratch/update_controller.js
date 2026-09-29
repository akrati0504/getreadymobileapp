const fs = require('fs');
const path = 'C:/laravel/getReadyWebapp/app/Http/Controllers/Api/ClothApiController.php';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    "'user_id' => Auth::id() ?? request('user_id') ?? 1,", 
    "'user_id' => Auth::id(),"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated ClothApiController.php successfully");
