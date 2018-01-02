<?php
/*
	PHP - 説明
	YYYY/MM/DD
*/
# Packages ____________________________________________________________________
include_once 'Mail.class.php';

/*
upload_max_filesize=1024M
post_max_size=1024M
memory_limit=1024M
ini_set('upload_max_filesize', '10M');
ini_set('post_max_size', '10M');
ini_set('memory_limit', '10M');
*/


define('NAME', 'New PHP');
define('VERSION', '0.00');
date_default_timezone_set('Asia/Tokyo');

# Config ______________________________________________________________________
$Action   = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['SCRIPT_NAME'];
$Conf = array(
	'DataDir' => './data',
	'RoomDir' => './data',
	'MsgFile' => 'msg.json',
	'SeqFile' => 'seq.txt',
	'MaxLogs' => 100,
	'Passwd'  => '5rA1nrP1fgH6I',
	'Subject' => 'よぴフォームからのメールだよ'
);

$Mail = array('smtp.hetemail.jp', 'info@yopisoft.net', 'info@yopisoft.net', 587);
#$Mail = array('smtp-mail.outlook.com', 'yopisoft@hotmail.com', 'yopisoft@hotmail.com', 587);

# Main ________________________________________________________________________
main();
exit;
function main(){
	GLOBAL $Conf, $Mail;
	
	$p = $_POST;
	if(! isset($p['_json'])) exit;
	
	$body = body($p);
	$p['_body'] = $body;
	
	// ファイルある？
	$file  = false;
	$files = array();
	$j = json_decode($p['_json']);
	for($i=0; $i <count($j); $i++){
		$v = $j[$i];
		if($v->file && isset($v->file->data)){
			$data = $v->file->data;
			//$data = preg_replace('/^data:/', '', $data);
			$data = preg_replace('/^[^,]+,/', '', $data);
			$file = array(
				'name' => $v->file->name,    # ファイル名
				'type' => $v->file->type,    # Content-type
				'conv' => 'base64',          # 変換モード
				'data' => $data              # データ文字列
			);
			array_push($files, $file);
			#p($file);
		}
	}
	
	$p['stat'] = 0;
	if(1){
		$mail = new CGIToolBox_Mail();	
		$p['stat'] = $mail->sendmail(
			array(
				'KANJICODE'  => 'UTF-8',
				'SmtpServer' => $Mail[0],
				'From'       => $Mail[1],
				//'To'         => array('よぴフォーム' => $Mail[2]),
				'To'         => $Mail[2],
				//'Cc'         => array('よぴフォーム' => 'cgi@yopisoft.net'),
				'Subject'    => $Conf['Subject'],
				'Body'       => $body,
				'Port'       => $Mail[3],
				'files'      => $files
				//'File'       => $file
			)
		);
	}else{
		//$p['stat'] = mail('yopisoft@hotmail.com', $Conf['Subject'], $body);
		$p['stat'] = mail('cgi@yopisoft.net', $Conf['Subject'], $body);
	}
	
	// レスポン酢
	$r = array(
		'stat' => $p['stat'],
		'body' => $body
	);
	print json_encode($r, JSON_UNESCAPED_UNICODE);
}
# Subs ________________________________________________________________________
// -- body作る
function body($p){
	$body = array();
	if(isset($p['_json']) && $p['_json']){
		$j = json_decode($p['_json']);
		for($i=0; $i <count($j); $i++){
			$v = $j[$i];
			array_push($body, strlenf($v->idx, 16) .' : '. $v->val);
		}
	}else{
		array_push($body,'not json');
	}
	array_push($body,
		'',
		'=======================================================================',
		'送信日時       : ' . datef(),
		'送信者IP       : ' . $_SERVER['REMOTE_ADDR'],
		'OS情報         : ' . getOs(),
		'ブラウザ情報   : ' . getUa(),
		'送信プログラム : http://' . $_SERVER['HTTP_HOST'] . $_SERVER['SCRIPT_NAME'],
		'------------------------------  ｷ ﾘ ﾄ ﾘ  ------------------------------',
		date(DATE_RFC2822),
		$_SERVER['HTTP_USER_AGENT'],
		'======================================================================='
	);
	return join("\n", $body);
}

function datef(){
	$w = array("日", "月", "火", "水", "木", "金", "土");
	return date("Y年m月d日 ") .'('. $w[date("w")] .') '.  date("H時i分s秒");
}

function getUa(){
	$ua = $_SERVER['HTTP_USER_AGENT'];
	if(preg_match('/msie/i', $ua) || preg_match('/trident/i', $ua)){
	    return 'Internet Explorer';
	} else if(preg_match('/edge/i', $ua)) {
	    return 'Edge';
	} else if(preg_match('/chrome/i', $ua)) {
	    return 'Google Chrome';
	} else if(preg_match('/safari/i', $ua)) {
	    return 'Safari';
	} else if(preg_match('/firefox/i', $ua)) {
	    return 'FireFox';
	} else if(preg_match('/opera/i', $ua)) {
	   return 'opera';
	}
	return 'ぬこ太の知らないヤツ';
}

function getOs($user_agent = ''){
  if (empty($user_agent)) {
      // ユーザエージェント
      $user_agent = $_SERVER['HTTP_USER_AGENT'];
  }

  if (preg_match('/Windows NT 10.0/', $user_agent)) {
      $os = 'Windows 10';
  } elseif (preg_match('/Windows NT 6.3/', $user_agent)) {
      $os = 'Windows 8.1 / Windows Server 2012 R2';
  } elseif (preg_match('/Windows NT 6.2/', $user_agent)) {
      $os = 'Windows 8 / Windows Server 2012';
  } elseif (preg_match('/Windows NT 6.1/', $user_agent)) {
      $os = 'Windows 7 / Windows Server 2008 R2';
  } elseif (preg_match('/Windows NT 6.0/', $user_agent)) {
      $os = 'Windows Vista / Windows Server 2008';
  } elseif (preg_match('/Windows NT 5.2/', $user_agent)) {
      $os = 'Windows XP x64 Edition / Windows Server 2003';
  } elseif (preg_match('/Windows NT 5.1/', $user_agent)) {
      $os = 'Windows XP';
  } elseif (preg_match('/Windows NT 5.0/', $user_agent)) {
      $os = 'Windows 2000';
  } elseif (preg_match('/Windows NT 4.0/', $user_agent)) {
      $os = 'Microsoft Windows NT 4.0'; 
  } elseif (preg_match('/Mac OS X ([0-9\._]+)/', $user_agent, $matches)) {
      $os = 'Macintosh Intel ' . str_replace('_', '.', $matches[1]);
  } elseif (preg_match('/OS ([a-z0-9_]+)/', $user_agent, $matches)) {
      $os = 'iOS ' . str_replace('_', '.', $matches[1]);
  } elseif (preg_match('/Android ([a-z0-9\.]+)/', $user_agent, $matches)) {
      $os = 'Android ' . $matches[1];
  } elseif (preg_match('/Linux ([a-z0-9_]+)/', $user_agent, $matches)) {
      $os = 'Linux ' . $matches[1];
  } else {
      $os = 'ぬこ太の知らないヤツ';
  }
  return $os;
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
# 価格フォーマット
function pricef($num){return preg_replace('/\G((?:^[-+])?\d{1,3})(?=(?:\d\d\d)+(?!\d))/', "\\1,", $num);}
function strlenf($str, $n = 0){while(mb_strwidth($str,'UTF-8') < $n){$str .= ' ';} return $str;};
function strlenff($str, $n = 0){while(strlen($str) < $n){$str .= ' ';} return $str;};
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