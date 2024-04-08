<?php

if($_SERVER['REQUEST_METHOD'] != 'POST' || !isset($_POST['data'])) die();

$file_teams = '../json/teams.json';
file_put_contents($file_teams, $_POST['data']);
echo('Wrote to teams.json: ' . $_POST['data']);

?>