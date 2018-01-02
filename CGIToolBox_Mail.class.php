<?php
/*
	CGIToolBox_Mail -- メール送信クラス
	2018/01/02 (c)よぴそふと http://yopisoft.net/

=pod
=head1 NAME
	
	CGIToolBox_Mail -- メール送信クラス

=head1 HISTORY
	
	2018.01.02 v2.3 
	
	2007.02.26 v2.2
		+ Port指定できるように変更
		
	2006.03.30 v2.1
		+ MIMECodeオプション追加

	2006.02.14 v2.0
		+ 引数の大文字、小文字どちらでもいけるように
		+ ファイル添付機能追加
	
	2005.11.14 v1.2
		+ smtpコマンドを二点変更
		+ 何故かqmailが受け付けない為quitを排除していいのか・・・
		+ メール本文の前の改行(\r\n)を2個に、これもqmail対策？
		
	2004.06.05 v1.1
		+ Fromをhashで受けれないバグ修正

=head1 SYNOPSIS

	include_once 'Mail.class.php';
	$mail  = new CGIToolBox_Mail();
	$stats = $mail->sendmail(
		array(
			'SendmailPath' => '/path/to/sendmail',               # sendmailで送信する場合に指定※省略可
			'SmtpServer'   => 'mail.domain',                     # SMTPServer
			'From'         => 'from@domain',                     # 送信元
			'To'           => array('あどみん' => 'to@domain' ), # 送信先
			'Cc'           => array('よぴ'     => 'cc@domain' ), # Cc送信先  ※省略可
			'Bcc'          => 'bcc@domain',                      # Bcc送信先 ※省略可
			'Subject'      => 'Subject',                         # 表題
			'Body'         => 'Body Text',                       # 本文
			'KanjiCode'    => 'EUC-JP,SJIS,JIS',                 # 入力漢字コードのリスト※省略可
			'MIMECode'     => 'iso-2022-jp|utf-8',               # MIMEエンコード        ※省略可
			'Port'         => 587,                               # 送信ポート            ※省略可
			
			'Error'        => [0|1],         # 0:エラーステータスを返す | 1:SMTPエラーで終了※省略可
			'File'         => array(         # 添付ファイル
				'name' => 'hoge.txt',　　　　# ファイル名
				'type' => 'text/plain',      # Content-type
				'conv' => [url|base64|etc],  # 変換モード
				'data' => 'xxxxxxxxxxxxxxx'  # データ文字列
			)
		)
	);

=head1 DESCRIPTION
=cut


*/

class CGIToolBox_Mail
{
	
	var $VERSION    = '2.3';
	var $SmtpServer = 'localhost';
	var $Error      = 0;
	var $Boundary   = 'CGIToolBox_Mail_Boundary_';
	var $MIMECode   = 'iso-2022-jp';
	
	function CGIToolBox_Mail($smtp = 0, $err = ''){
		if($smtp)      $this->SmtpServer = $smtp;
		if($err != '') $this->Error = $err;
		$this->Boundary .= md5(uniqid(rand()));
	}

	// -- メール送信
	function sendmail($p){
		$p = array_change_key_case($p, CASE_UPPER);
		if(! isset($p['TO']) || ! isset($p['FROM'])) return;
		if(isset($p['SMTPSERVER'])) $this->SmtpServer = $p['SMTPSERVER'];
		if(isset($p['ERROR']))      $this->Error = $p['ERROR'];
		$p['PORT'] = isset($p['PORT']) ? $p['PORT'] : 25;
		$kcode = isset($p['KANJICODE']) ? $p['KANJICODE'] : 'EUC-JP,SJIS,JIS,UTF-8';
		$mime  = isset($p['MIMECODE']) ? $p['MIMECODE'] : 'iso-2022-jp';
		$this->MIMECode = $mime;
	
		$rcpt = array();
		if(is_array($p['TO'])){
			$rcpt = array_merge($rcpt, $p['TO']);
		}else{
			array_push($rcpt, $p['TO']);
		}
		
		if(isset($p['CC']))  $rcpt = array_merge($rcpt, $p['CC']);
		if(isset($p['BCC'])) $rcpt = array_merge($rcpt, $p['BCC']);
	
		$header   = array();
		$header[] = 'From: ' . $this->mail_address_format($p['FROM'], $kcode);
		$header[] = 'Mime-Version: 1.0';
		$header[] = 'To: '   . $this->mail_address_format($p['TO'], $kcode);
		if(isset($p['SUBJECT'])) $header[] = 'Subject: '. $this->mail_encode_b64($p['SUBJECT'], $kcode);
		if(isset($p['CC']))      $header[] = 'Cc: '     . $this->mail_address_format($p['CC'], $kcode);
		if(isset($p['BCC']))     $header[] = 'Bcc: '    . $this->mail_address_format($p['BCC'], $kcode);
		
		$p['BODY']     = preg_replace('/\r\n|\r/', "\n", $p['BODY']);
		$p['BODY']     = preg_replace('/\n/', "\r\n", $p['BODY']);
		$p['BODYORIG'] = $p['BODY'];
		
		if(! isset($p['FILE']) || ! isset($p['FILES'])){
		
			### 添付ファイル有り
			$n             = "\r\n";
			$header[]      = 'Content-Type: multipart/mixed;';
			$header[]      = '  boundary="' . $this->Boundary . '"';
			$p['BODY']     = $this->sendencode($p['BODY'], $kcode);
			$p['BODY']     = "This is a multi-part message in MIME format.$n"
			. '--' . $this->Boundary . $n
			. "Content-Type: text/plain; charset=$mime" . $n
			. 'Content-Transfer-Encoding: 7bit' . "$n$n"
			. $p['BODY']. "$n$n";
			
			$files = isset($p['FILES']) ? $p['FILES'] : array($p['FILE']);
			foreach($files as $f){
				if(! isset($f['data'])) continue;
				$p['BODY'] .= '--' . $this->Boundary . $n;
				$p['BODY'] .= "Content-Type: " . $f['type'] . ";$n";
				$p['BODY'] .= '  name="' . $this->mail_encode_b64($f['name'], $kcode) . '"' . $n;
				$p['BODY'] .= "Content-Transfer-Encoding: base64$n";
				$p['BODY'] .= "Content-Disposition: inline;$n";
				$p['BODY'] .= '  filename="' . $this->mail_encode_b64($f['name'], $kcode) . '"' . $n . $n;
				if(strtoupper($f['conv']) == 'URL'){
					$p['BODY'] .= chunk_split(base64_encode(unescape_url($f['data'])));				
				}else if(strtoupper($f['conv']) == 'BASE64'){
					$p['BODY'] .= chunk_split($f['data']);
				}else{
					$p['BODY'] .= chunk_split(base64_encode($f['data']));
				}
			}
			$p['BODY'] .= '--' . $this->Boundary . "--$n";
			
		}else{
			
			### 添付ファイル無し
			$header[]  = "Content-Type: text/plain; charset=$mime";
			$header[]  = 'Content-Disposition: inline';
			$header[]  = 'Content-Transfer-Encoding: 7bit';
			#$p['BODY'] = str2jis($p['BODY'], $kcode);
			$p['BODY'] = $this->sendencode($p['BODY'], $kcode);
		
		}
		
		if(isset($p['MB_SEND_MAIL'])){
		
			### mb_send_mail関数で送信
			
			mb_send_mail(
				$p['TO'],
				$p['SUBJECT'],
				$p['BODYORIG'],
				join("\n", $header)
			);
			
		}else if(isset($p['SENDMAILPATH'])){
		
			### sendmail送信
			
			return $this->sendmail_submit(
				$p['SendmailPath'], 
				join("\n", $header),
				$p['BODY']
			);
			
		}else{
		
			### SMTP送信
			
			return $this->smtp_submit(
				$this->SmtpServer, 
				(is_array($p['FROM']) ? $p['FROM'][0] : $p['FROM']), 
				$rcpt, 
				join("\r\n", $header),
				$p['BODY'],
				$p['PORT']
			);
		}

	}

	// -- sendmail送信
	function sendmail_submit($sendmail, $header, $body){

		if (!($fp = @popen($sendmail.' -t -i', "w"))) return 0;
		fputs($fp, $header);
		fputs($fp, "\n");
		fputs($fp, $body);
		pclose($fp);
		return 1;

	}

	// -- SMTP送信
	function smtp_submit($smtp_server, $from, $rcpt, $header, $body, $port = 25){
		
		$sock = @fsockopen($smtp_server, $port, $errno, $errstr, 5);
		if(! $sock) 
			return $this->smtp_error("Sock:$smtp_server, $errno, $errstr");
		if(! $this->smtp_ok($sock))
			return $this->smtp_error('Connect');
		if(! $this->smtp_cmd($sock, 'HELO', $smtp_server))
			return $this->smtp_error('HELO');
		if(! $this->smtp_cmd($sock, 'MAIL', "FROM:<$from>"))
			return $this->smtp_error('MAIL FROM');
		if(is_array($rcpt)){
			foreach($rcpt as $add){
				if(! $this->smtp_cmd($sock, "RCPT", "TO:<$add>"))
					return $this->smtp_error('RCPT TO');
			}
		}else{
			if(! $this->smtp_cmd($sock, "RCPT", "TO:<$rcpt>"))
				return $this->smtp_error('RCPT TO');
		}
		if(! $this->smtp_cmd($sock, "DATA"))
		return $this->smtp_error('DATA');
		
		if(! $this->smtp_cmd($sock, $header . "\r\n\r\n" . $body . "\r\n.\r\n"))
		return $this->smtp_error('MESSAGE');
		
		return 1;
	}

	// -- SMTPエラー
	function smtp_error($msg){
		if($this->Error == 1){
			//die("SMTP ERROR($msg) $php_errormsg\n");
			die("SMTP ERROR($msg)");
		}
		//return "SMTPERROR($msg) $php_errormsg\n";
		return "SMTPERROR($msg)\n";
	}

	// -- SMTPチェック
	function smtp_ok($sock){
		$res   = fgets($sock, 512);
		$stats = substr($res, 0, 1);
		if($stats != '2' && $stats != '3'){
			@$this->smtp_cmd($sock, "QUIT\r\n");
			return 0;
		}
		return 1;
	}

	// -- SMTPコマンド実行
	function smtp_cmd($sock, $cmd, $arg = ''){
		if ($arg != "") $cmd = $cmd . ' ' . $arg;
		fputs($sock, $cmd."\r\n");
		return $this->smtp_ok($sock);
	}
	
	// -- Base64変換
	function mail_encode_b64($str, $kcode){
		if($str){
			#$str = base64_encode(str2jis($str, $kcode));
			#$str = "=?iso-2022-jp?B?$str?=";
			$str = $this->sendencode($str, $kcode);
			$str = mb_encode_mimeheader($str, $this->MIMECode);
			
		}
		return $str;
	}
	
	// -- 送信コード変換
	function sendencode($str, $kcode){
		if(preg_match('/utf-8/i', $this->MIMECode)){
			$str = mb_convert_encoding($str, 'UTF-8', $kcode);
		}else{
			$str = mb_convert_encoding($str, 'JIS', $kcode);
		}
		return $str;
	}

	// -- アドレスフォーマット
	function mail_address_format($add, $kcode){
		$str = array();
		if(is_array($add)){
			foreach($add as $k => $v){
				array_push($str, $this->mail_encode_b64($k, $kcode) . " <$v>");
			}
			return join(',', $str);
		}
		return $add;
	}


	// -- アドレスを配列変換
	function mail_address2ary($add){
		$str = array();
		if(is_array($add)){
			foreach($add as $k => $v){
				array_push($str, $v);
			}
			return $str;
		}
		return array($add);
	
	}
	
	// -- 開発用ダンプ
	function p(){header('Content-type: text/plain; charset=UTF-8;'); print var_export(func_get_args()); exit;}

}
?>