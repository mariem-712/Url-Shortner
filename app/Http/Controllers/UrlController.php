<?php

namespace App\Http\Controllers;  

use App\Models\Url;  
use Illuminate\Http\Request;  
use Illuminate\Support\Str;  

class UrlController extends Controller  
{  
    public function shorten(Request $request)  
    {  
        $request->validate(['url' => 'required|url']);  
        $url = new Url();  
        $url->original_url = $request->url;  
        $url->shortened_url = Str::random(6);  
        $url->save();  

        return  redirect()->back()->with('shortened_url', url($url->shortened_url));  
    }  

    public function redirect($shortenedUrl)  
    {  
        $url = Url::where('shortened_url', $shortenedUrl)->firstOrFail();  
        return redirect($url->original_url);  
    }  
}
