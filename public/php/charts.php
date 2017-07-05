<?php
    // Script to fetch data from API v2 for song charts

    // Get the query info from the url
    $parts = parse_url($url);
    parse_str($parts['query'], $query);
    $kind = $query['kind'];
    $genre = $query['genre'];
    $limit = $query['limit'];
    $linked_partitioning = $query['linked_partitioning'];
    $client_id = $query['client_id'];

    $json = file_get_contents('https://api-v2.soundcloud.com/charts?kind='.$kind'&genre=soundcloud%3Agenres%3Adanceedm&limit=50&linked_partitioning=1&client_id='.$client_id);

    print_r($json); // Needed so we can get the response from the body

?>