<?php

$config = array(
	'server' => 'localhost',
	'username' => 'quizsite_db',
	'password' => 'Kzi56XvJ',
	'name' => 'quizsite_db'
);

$connection = mysqli_connect(
	$config['server'],
	$config['username'],
	$config['password'],
	$config['name']
);

if($connection == false){
	echo mysqli_connect_error();
	die();
}