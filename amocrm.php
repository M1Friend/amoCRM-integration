<?php

require_once 'interface.php';
require_once 'config.php';

/**
* Класс интеграции c amoCRM
*/
class AmoCRM implements ICrm
{
	private $subdomain;
	private $authMethodString = 'auth.php?type=json';
	private $accountsMethodString = 'v2/account?with=custom_fields';
	private $fieldsMethodString = 'v2/fields';
	private $leadsMethodString = 'v2/leads';
	private $errors = array(
				301=>'Moved permanently',
				400=>'Bad request',
				401=>'Unauthorized',
				403=>'Forbidden',
				404=>'Not found',
				500=>'Internal server error',
				502=>'Bad gateway',
				503=>'Service unavailable'
			);
	private $fieldNames = array(
		'phone' => 'Телефон',
		'email' => 'E-mail',
		'answers' => 'Ответы теста'
	);

	private function checkForErrors($code, $method){
		$code=(int)$code;
		try
		{
		  #Если код ответа не равен 200 или 204 - возвращаем сообщение об ошибке
		 if($code!=200 && $code!=204)
		    throw new Exception(isset($this->errors[$code]) ? $this->errors[$code] : 'Undescribed error',$code);
		}
		catch(Exception $E)
		{
		  die('Ошибка: '.$E->getMessage().PHP_EOL.'Код ошибки: '.$E->getCode().PHP_EOL.'Метод API: '.$method);
		}
	}

	private function sendCurlRequest($method, $data){
		#Формируем ссылку для запроса
		$link = '';
		if($method == $this->authMethodString){
			$link = 'https://'.$this->subdomain.'.amocrm.ru/private/api/'.$method;
		} else {
			$link = 'https://'.$this->subdomain.'.amocrm.ru/api/'.$method;
		}
		#Нам необходимо инициировать запрос к серверу
		$curl=curl_init(); #Сохраняем дескриптор сеанса cURL
		#Устанавливаем необходимые опции для сеанса cURL
		curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($curl,CURLOPT_USERAGENT,'amoCRM-API-client/1.0');
		curl_setopt($curl,CURLOPT_URL,$link);
		if($method != $this->accountsMethodString){
		  curl_setopt($curl,CURLOPT_CUSTOMREQUEST,'POST');
		  curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($data));
		  curl_setopt($curl,CURLOPT_HTTPHEADER,array('Content-Type: application/json'));
		}
		curl_setopt($curl,CURLOPT_HEADER,false);
		curl_setopt($curl,CURLOPT_COOKIEFILE,dirname(__FILE__).'/cookie.txt'); #PHP>5.3.6 dirname(__FILE__) -> __DIR__
		curl_setopt($curl,CURLOPT_COOKIEJAR,dirname(__FILE__).'/cookie.txt'); #PHP>5.3.6 dirname(__FILE__) -> __DIR__
		curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);
		curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,0);
		$out=curl_exec($curl); #Инициируем запрос к API и сохраняем ответ в переменную
		$code=curl_getinfo($curl,CURLINFO_HTTP_CODE);
		$this->checkForErrors($code, $method);
		/*
		 Данные получаем в формате JSON
		*/
		return json_decode($out,true);
	}

	private function searchFieldsID($fieldValue, $array){// ищет ID дополнительного поля amoCRM по имени. Если поля нет, возвращает null
		if(!empty($array)){
			foreach ($array as $key => $value) {
				if(array_search($fieldValue, $value, true)){
					return $key;
				}
			}
		}
		return null;
	}

	private function createFieldDescription($name){#создаёт элемент массива для метода API fields['add']
		$item = array(
		      'name' => $name,
		      'type'=> 1,
		      'element_type' => 2,
		      'origin' => md5(rand(10000, 90000)).'_lf_q'
		);
		return $item;
	}

	private function addNewFields($data, $names, &$fields){
		$requestData['add'] = $data;
		$response = $this->sendCurlRequest($this->fieldsMethodString, $requestData);
		$response = $response['_embedded']['items'];
		foreach ($names as $value) {
			foreach($response as $v){
				if(is_array($v)){
					$fields[$value] = $v['id'];
				}
			}
		}
	}
	private function checkForExistingFields($data){
		$response = $this->sendCurlRequest($this->accountsMethodString, null);
		$response = $response['_embedded']['custom_fields'];
		$fieldNames = $this->fieldNames;
		$fields = array();
		foreach ($data as $key => $value) {
			$fields[$fieldNames[$key]] = $this->searchFieldsID($fieldNames[$key], $response['leads']);
		}
		return $fields;
	}

	private function getFieldsIDs($data){
		$fields = $this->checkForExistingFields($data);
		$newFieldsDescription = array();
		$newFieldsNames = array();
		foreach ($fields as $key => $value) {
			if(!$value){
				$newFieldsDescription[] = $this->createFieldDescription($key);
				$newFieldsNames[] = $key;
				unset($fields[$key]);
			}
		}
		if(!empty($newFieldsDescription)){
			$this->addNewFields($newFieldsDescription, $newFieldsNames, $fields);
		}
		return $fields;
	}

	private function authenticate($login, $hash){
		$userData=array(
			'USER_LOGIN'=>$login,
			'USER_HASH'=>$hash
		);
		$this->sendCurlRequest($this->authMethodString, $userData);
	}

	private function fillCustomFields($data){
		$fields = $this->getFieldsIDs($data);
		$custom_fields = array ();
		foreach ($data as $key => $value) {
			if($key != 'name'){
				$custom_fields[] = array (
			      'id' => $fields[$this->fieldNames[$key]],
			      'values' => 
			        array (
			          array (
			            'value' => $value
			          )
			        )
			    );
			}
		}
		return $custom_fields;
	}

	private function createLeadDescription($data){
		return array(
			'add' => array(
				0 => array(
					'name' => isset($data['name']) ? $data['name'] : 'Новый лид',
					'created_at' => date('U'),
					'custom_fields' => $this->fillCustomFields($data)
				)
			)
		);
	}



	public function sendDataToCRM($data){
		$leads = $this->createLeadDescription($data);
		return $this->sendCurlRequest($this->leadsMethodString, $leads);
	}

	public function __construct($id, $connection){
		$request = mysqli_query($connection, "SELECT `subdomain`, `login`, `hash` FROM `crm_table` WHERE `project_id` = {$id}");
		$result = mysqli_fetch_assoc($request);
		$this->subdomain = $result['subdomain'];
		$this->authenticate($result['login'], $result['hash']);
		return $this;
	}
}