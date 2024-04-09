<?php

if($_SERVER['REQUEST_METHOD'] != 'POST' || !isset($_POST['data'])) die();

$file_wagers = '../json/wagers.json';
file_put_contents($file_wagers, $_POST['data']);
echo('Wrote to wagers.json: ' . $_POST['data']);

?>