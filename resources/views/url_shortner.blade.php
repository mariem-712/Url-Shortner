<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>URL Shortener</title>  
    <script src="https://cdn.tailwindcss.com"></script>  
</head>  
<body class="flex items-center justify-center h-screen bg-gray-100">  
    <div class="bg-white p-8 rounded-lg shadow-md w-96">  
        <h1 class="text-2xl font-bold mb-4 text-center">URL Shortener</h1>  
        <form action="/shorten" method="POST">  
            @csrf  
            <div class="mb-4">  
                <input type="url" name="url" placeholder="Enter URL" required class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">  
            </div>  
            <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200">Shorten</button>  
        </form>  
@if (session('shortened_url'))
    <div class="mt-4">
        <h2 class="text-lg font-semibold">Shortened URL:</h2>
        <div class="flex items-center gap-2">
            <input 
                type="text" 
                id="shortenedUrl" 
                value="{{ session('shortened_url') }}" 
                readonly
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
            >
            <button 
                onclick="copyUrl()" 
                class="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition duration-200"
            >
                Copy
            </button>
        </div>

        <!-- Toast message -->
        <p id="copyMessage" 
           class="hidden mt-2 text-sm text-green-600 font-medium">
           ✅ Link copied to clipboard!
        </p>
    </div>
@endif

<script>
    function copyUrl() {
        const urlInput = document.getElementById("shortenedUrl");
        urlInput.select();
        urlInput.setSelectionRange(0, 99999); // for mobile

        navigator.clipboard.writeText(urlInput.value).then(() => {
            const msg = document.getElementById("copyMessage");
            msg.classList.remove("hidden");
            
            // hide after 2.5 seconds
            setTimeout(() => {
                msg.classList.add("hidden");
            }, 2500);
        });
    }
</script>


    </div>  
</body>  
</html>