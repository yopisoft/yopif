<?php
/*
	PHP - 説明
	YYYY/MM/DD
*/

define('NAME', 'New PHP');
define('VERSION', '0.00');

# Config ______________________________________________________________________
$Action   = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['SCRIPT_NAME'];
$Conf = array(
	'key' => 'value'
);

# Main ________________________________________________________________________
main();
exit;
function main(){
	p('okey');
}


# 汎 用 _______________________________________________________________________
# エスケープ
function escape_tab($str){  return preg_replace_callback('/([\s%])/', function($m){return sprintf("%%%02X", ord($m[0]));}, $str);}
function unescape_tab($str){return preg_replace_callback('/%([0-9a-fA-F]{2})/', function($m){return urldecode($m[0]);}, $str);}
function escape_tag($str=""){return htmlspecialchars($str);}
function unescape_tag($str){return htmlspecialchars_decod($str);}
# ファイル
function file_count_rows($fh){$c=0;for($c=0; fgets($fh); $c++){}rewind($fh);return $c;} # ファイル行数
# 互 換
function p(){header('Content-type: text/plain; charset=UTF-8;'); print var_export(func_get_args()); exit;}# ダンプ
function kconv($str, $in = 'SJIS'){return mb_convert_encoding($str, "UTF-8", $in);} # 文字コード変換
function param($k){ return isset($_REQUEST[$k]) ? $_REQUEST[$k] : "";}   # パラメータ
function qw($str = ""){ return preg_split('/\s+/', $str);}               # Perl風配列定義
// -- ランダムID
function rpasswd($l){return substr(str_shuffle('1234567890abcdefghijklmnopqrstuvwxyz'), 0, $l);}
function rId($l=32){return substr(base_convert(hash('sha256', uniqid()), 16, 36), 0, $l);}
// -- 暗号化とチェック
function cryptctl($pwd = "", $cpwd = ""){
	if(! $pwd) return 0;
	return $cpwd ? (crypt($pwd, $cpwd) == $cpwd ? 1 : 0) : crypt($pwd, rpasswd(2));
}
// -- シーケンスインクリメント
function nextval($path){
	$count = 0;
	$fp = fopen($path, "c+") or die("Can't open sequence file `$path`");
	if(flock($fp, 2)){
		$count = fgets($fp) + 1;
		fseek($fp, 0); ftruncate($fp, 0);
		fwrite($fp, $count);
		flock($fp, 3); fclose ($fp);
	}
	return $count;
}

?>