<?php

require_once 'amocrm.php';
require_once 'roistat.php';

function collectData($arrayItem){
  foreach ($arrayItem as $key => $value) {
	if ($key == "question") {
	  $messageString .= $value . "\n ";
	} else {
	  $messageString .= collectAnswers($value);
	} 
  }
  return $messageString;
}
function collectAnswers($arrayItem){
  foreach ($arrayItem as $value) {
	$answersString .= $value . "  ";
  }
  $answersString .= "\n\n";
  return $answersString;
}
function findEmail($arrayItem){
  foreach ($arrayItem as $key => $value) {
	if($key == 'email'){
	  return $value;
	}
  }
  return "Ooops. Found nothing";
}
function collectFormData($arrayItem){
  $arrayItem = $arrayItem['userContacts'];
  foreach ($arrayItem as $key => $value) {
	$messageString .= $value."\n";
  }
  return $messageString;
}

$address = "pavelboloshovtpr@gmail.com";
$testAnswers = "\nПройден тест:\n";

if (isset($_POST['jsonData'])) {
  $data = json_decode($_POST['jsonData'], true);
  $lastIndexOfDataItems = count($data) - 1;
  for ($i = 0; $i < ($lastIndexOfDataItems); $i++) { 
	$testAnswers .= collectData($data[$i]);
  }


  $headers  = "From: ". strip_tags($address) . "\r\n";
  $headers .= "Reply-To: ". strip_tags($address) . "\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/html;charset=utf-8 \r\n";
  
  $message .= $testAnswers;
  $message .= collectFormData($data[$lastIndexOfDataItems]);

  $subject = "Результаты теста";
  $send = mail($address, $subject, $message, $headers);

  $project_id = (int)$data[$lastIndexOfDataItems]['projectID'];
  $request = mysqli_query($connection, "SELECT `crm_name` FROM `crm_table` WHERE `project_id`= {$project_id}");
  $result = mysqli_fetch_assoc($request);

  if($result['crm_name'] == 'amocrm'){
	$crm = new AmoCRM($project_id, $connection);
  } else{
	$crm = new Roistat($project_id, $connection);
  }
  foreach ($data[$lastIndexOfDataItems]['userContacts'] as $key => $value) {
  	$crmData[$key] = $value;
  }
  $crmData['answers'] = $testAnswers;
  echo var_dump($crm->sendDataToCRM($crmData));

  
  if ($send == 'true')
  {
	echo "success";
  }
  else 
  {
	echo "error";
  }
}