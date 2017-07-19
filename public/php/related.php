<?php

    // Script to fetch related songs from song id

    // Get the query info from the url
    $url = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    $parts = parse_url($url);
    parse_str($parts['query'], $query);
    $id = $query['id'];
    $api_key = $query['client_id'];
    
    $json = file_get_contents('https://api-v2.soundcloud.com/track/' . $id . '/related?client_id='.$client_id);
    printr($json);
?>