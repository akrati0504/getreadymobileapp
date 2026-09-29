import sys
path = 'C:/laravel/getReadyWebapp/app/Http/Controllers/Api/ClothApiController.php'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'user_id' => Auth::id() ?? 1,", 
    "'user_id' => Auth::id() ?? request('user_id') ?? 1,"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
