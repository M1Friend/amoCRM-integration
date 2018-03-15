<?php

require_once 'interface.php';

class Roistat implements ICrm{
	
	private $hashKey;

	private function createDataArray($data){
		return array(
                            'roistat' => isset($_COOKIE['roistat_visit']) ? $_COOKIE['roistat_visit'] : null,
                            'key' => $this->hashKey,
                            'title' => 'QuizSite',
                            'name' => isset($data['name']) ? $data['name'] : "Новый лид",
                            'phone' => isset($data['phone']) ? $data['phone'] : "",
                            'email' => isset($data['email']) ? $data['email'] : "",
                            'comment' => $data['answers'] . "{$roistatComment}"
                        );
	}

	
	public function sendDataToCRM($data){
		$roistatData = $this->createDataArray($data);
		return file_get_contents("https://cloud.roistat.com/api/proxy/1.0/leads/add?" . http_build_query($roistatData));
	}
	public function __construct($id, $connection){
		$request = mysqli_query($connection, "SELECT `hash` FROM `crm_table` WHERE `project_id` = {$id}");
		$result = mysqli_fetch_assoc($request);
		$this->hashKey = $result['hash'];
		return $this;
	}
}