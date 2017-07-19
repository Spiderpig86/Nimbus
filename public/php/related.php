<?php
    // Script to fetch related songs from song id

    // Get the query info from the url
    $url = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    $parts = parse_url($url);
    parse_str($parts['query'], $query);
    $id = $query['id'];
    $limit = $query['limit'];
    $client_id= $query['client_id'];
    
    $json = file_get_contents('https://api-v2.soundcloud.com/tracks/'.$id.'/related?limit='.$limit.'&client_id='.$client_id);
    print_r($json);
?>