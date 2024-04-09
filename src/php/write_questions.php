<?php

if($_SERVER['REQUEST_METHOD'] != 'POST' || !isset($_POST['data'])) die();

$file_questions = '../json/questions.json';
/*
$current_state = json_decode( file_get_contents($file_questions) );

//we want to update all fields passed in by the POST request. This could include current question, revealed, the questions array, etc.
foreach ($_POST as $field => $value) {
    $current_state[$field] = $value;
}
*/

file_put_contents($file_questions, $_POST['data']);
echo('Wrote to questions.json: ' . $_POST['data']);

?>