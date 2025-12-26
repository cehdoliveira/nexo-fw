<?php
class dbname_model extends DOLModel
{
	//Nome das colunas da tabela
	protected $field = [];
	//Filtros padrões
	protected $filter = ["active = 'yes'"];

	function __construct($bd = false)
	{
		return parent::__construct("dbname", $bd); //Nome da tabela
	}
}