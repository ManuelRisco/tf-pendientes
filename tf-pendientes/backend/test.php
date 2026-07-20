<?php
require 'core/JwtHelper.php';
$token = JwtHelper::generate(['id'=>3,'email'=>'admin@tecnofilm.com','rol_id'=>1]);
$context = stream_context_create([
    'http' => [
        'method' => 'DELETE',
        'header' => "Authorization: Bearer $token\r\n",
        'ignore_errors' => true
    ]
]);
$result = file_get_contents('http://localhost/tf-pendientes/backend/usuarios/6', false, $context);
echo $result;
