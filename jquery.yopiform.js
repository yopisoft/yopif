/*
	
	yopiForm v0.00 - A JavaScript jQuery plugin for generating html form;
	(c) よぴそふと http://yopisoft.net/
	
	yopiForm uses
		jpostal 
			https://github.com/ninton/jquery.jpostal.js/blob/master/README.txt
			
*/

(function($) {

	var prefAry = [
			'北海道',
			'青森県','岩手県','宮城県','秋田県','山形県','福島県',
			'茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
			'新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県',
			'愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
			'鳥取県','島根県','岡山県','広島県','山口県',
			'徳島県','香川県','愛媛県','高知県',
			'福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県',
			'沖縄県'];
	/* ----------------------------------------------------------------
		index  : 表示名
		name   : input name="name" の name
		type   : text | area | zip | radio | checkbox | select | file
		valid  : 入力チェック設定空白区切りで指定 詳細は errMsgの所
		length : 最大長
		ph     : placeholder
		def    : 初期値
		ary    : radio,checkbox,select の選択肢配列
	------------------------------------------------------------------- */
	var inputDefault = {
		'お名前' : {index:'お名前',               name:'name',   valid:'',      length:20,
				ph:'苗字 お名前',            def:''},
		'ふりがな' : {index:'ふりがな',           name:'kana',   valid:'kana',  length:20,
				ph:'みょうじ おなまえ',      def:'', },
		'フリガナ' : {index:'フリガナ',           name:'kkana',  valid:'kkana', length:20,
				ph:'ミョウジ オナマエ',      def:'', },
		'メールアドレス':{index:'メールアドレス', name:'mail',   valid:'mail',  length:64,    
				ph:'hoge@example.com',       def:''},
		'URL':	{index:'URL',                     name:'url',    valid:'url',   length:200,   
				ph:'http://www.example.com', def:''},
		'電話番号':	{index:'電話番号',            name:'tel',    valid:'tel',   length:14,
				ph:'000-0000-0000',          def:''},
		
		'郵便番号':{index:'郵便番号',  name:'zip', valid:'zip', type:'zip', zbtn:'郵便番号から住所入力', w:'10em',
				ph:'000-0000',  def:'100-0001'},
			
		'性別':	{index:'性別', name:'sex', type:'radio', 
				ary:['男性', '女性', 'どちらともいえない'], def:'男性'},
		
		'ラジオ':	{index:'ラジオ', name:'yopif_radio', type:'radio', 
				ary:['選択１', '選択２', '選択３', '選択４', '選択５'], def:'選択１'},
		
		'ご住所':{index:'ご住所',         name:'address',  
			ph:'都道府県 市区町村 番地', default:''},
		
		'都道府県':{index:'都道府県',   name:'pref',     
			ph:'都道府県',               def:''},
		'都道府県選択' : {index:'都道府県選択', name:'pref2', type:'select', ary:prefAry, def:'東京都'},
					
		'市区町村':{index:'市区町村',       name:'address1', 
				ph:'市区町村',               def:''},
		'建物番地':{index:'建物番地',       name:'address2', 
				ph:'番地',                   def:''},
		'お問い合わせ':{index:'お問い合わせ', name:'comment',  type:'area', length:300,
				ph:'300文字まで',           def:'', 
				height:100},
		
		
		'パスワード':	{index:'パスワード', name:'pwd', type:'password', w:'16em', valid:'passwd',
			length:16, minlength:4,
			ph:'[0-9a-zA-Z_=#] 4-16文字まで'
		},
		
		/* --------------------------------------------------------------
			fbtn  : ボタン名
			fsize : 最大サイズ byte 1024 = 1MB
			ftype : UP可能ファイルのコンテントタイプ 空白区切りで
				画像 : image/jpeg image/gif image/png
				Zip  : application/zip application/x-zip-compressed
		------------------------------------------------------------------ */
		'画像ファイル'  : {index:'画像ファイル', name:'file_img', type:'file', 
			fbtn:'画像選択', fsize:5000, ph:'jpeg,png,gif 5MBまで', ftype:'image/jpeg image/gif image/png'},
		'添付ファイル'  : {index:'添付ファイル', name:'file_all', type:'file', 
			fbtn:'添付選択', fsize:1024 * 10, ph:'10MBまでなんでもOK', ftype:''},
			
		'利用規約'      : {index:'利用規約', name:'agree', type:'checkbox', valid:'agree',
				ary:['利用規約に同意する'], def:''},
	};
	
	/* ----------------------------------------------------------------
		nn : NotNull
	------------------------------------------------------------------- */
	var errMsg = {
		nn    : '{{idx}} 入力が必要です',
		len   : '{{idx}} が長すぎます({{len}}文字まで)',
		mlen  : '{{idx}} が短すぎます({{mlen}}文字以上)',
		mail  : '{{idx}} がメールアドレスっぽくない気がします',
		url   : '{{idx}} がURL形式っぽくないです',
		zip   : '{{idx}} が郵便番号っぽくないです',
		kana  : '{{idx}} はひらがなのみでご記入ください',
		kkana : '{{idx}} はカタカナのみでご記入ください',
		agree : '{{idx}} をご確認の上チェックをお願いいたします',
		fsize  : '{{idx}} サイズオーバーです ({{fsize}}byteまで)',
		ftype  : '{{idx}} 非対応の形式です',
		passwd : '{{idx}} 使用できる文字は[0-9a-zA-Z_=#]だけです'
	};
	
	var _self = {
		init : function(names, options){
			
			var $this = $(this);
			var data  = $this.data('conf');
						
			if(! data){
				$(this).data('conf', $.extend(true, {
					title     : 'お問い合わせ',
					subject   : '[yopiForm]',
					toaddores : 'info@example.com',
					sendmsg   : '送信中…',         // 送信中メッセージ
					nnall     : false,              // NotNullデフォルト
					nntag     : '<span class="yopif_nn">※</span>', // NotNullのマーク
				
					// ボタンテンプレ
					buttons:{
						btn_confirm  : {name:'buttonConfirm', value:'書くよ。', class:'btn btn-primary'},
						btn_back     : {name:'buttonRewrite', value:'書き直し', class:'btn btn-secondary'},
						btn_post     : {name:'buttonSendNow', value:'送信決定', class:'btn btn-success'},
					},
					btn_confirm  : {value:'確 認'},
					btn_back     : {value:'修 正'},
					btn_post     : {value:'送 信'},
							
					valid        : _self.validation,
					send         : _self.send, //function(data, o){console.log(data, o);},
					
					errMsg        : {},
					errmsg        : function(msg){return '<i class="fa fa-commenting"> ' + msg + '</i>';},
					errtmpl       : '<i class="fa fa-commenting"> {{msg}} </i>',
					inputheight   : 40,    // 入力高さ
					buttonheight  : null,  // ボタン高さ
					defaultlength : 300,
					rows : []
				}, options));
					
				// 並び順
				var conf = $(this).data('conf');
				conf.rows = $.map(inputDefault, function(i, v){return v;});
				if(Array.isArray(names) && names.length) conf.rows = names;
				$(this).data('conf', conf);
				
			}
			
			$this = _self.initForm($this);
			
			// jpostal 設定
			$this.jpostal({
				click    : '[name="zip_button"]',
				postcode : ['[name="zip"]'],
				address  : {
					'[name="address"]'  : '%3 %4 %5',
					'[name="pref"]'     : '%3',
					'[name="pref2"]'     : '%3',
					'[name="address1"]' : '%4',
					'[name="address2"]' : '%5',
				}
			});
			
			return $this;
		},
		
	  // ==============================================================
		//   フォーム描き
		// ==============================================================
		initForm : function(origin){
			var $this = origin;
			var conf  = $this.data('conf');
			
			// タグ作るヤツ
			var gT = function(tag, cls, css, txt, f){
				var ret = $('<'+tag+'>')
				if(cls) ret.addClass(cls);
				if(css) ret.css(css);
				if(txt) ret = f ? ret.html(txt) : ret.text(txt);
				return ret;
			};
			
			// table header
			var title     = conf.title;
			var formtable = gT('table', 'table');
			if(title){
				var th = $('<th>').addClass('yopif_title').attr({colspan:2}).html(title);
				formtable.append(gT('thead').append(th));
			}
			
			// table row 書きループ
			var tbody     = gT('tbody');
			for(var i = 0; i < conf.rows.length; i++){
				var r     = _self.getRow($this, conf.rows[i]);
				var h     = r.height  ? r.height  : conf.inputheight;
				var nn    = r.nn ? conf.nntag : ''; // NotNullマーク
				
				var tr  = tbody.append($('<tr>').addClass());
				var th  = $('<th>').css({width:150}).html(nn + r.index);
			
				var inp = _self.getInput($this, r);
				
				// 表示用
        var cls  = 'yopif_val yopif_val_' + r.name;
       	var cont = gT('div', cls, {display:'none','min-height':h});
				var err = gT('div', 'yopif_err yopif_err_' + r.name, {}).hide();
				tr.append(th, $('<td>').append(inp, cont, err));
				
			}
			
			// ボタン作る
			var getButton = function(k){
				var btn = $.extend(true, conf.buttons[k], conf[k]);
				var inp = $('<input>').css({width:150})
				.addClass(btn.class + ' yopif_btn')
				.attr({type:'button', name:btn.name, value:btn.value});		
				return inp;
			};
			
			// ボタン表示トグル
			var toggleButton = function(keys){
				for(let k in conf.buttons){
					var b = $.extend(true, conf.buttons[k], conf[k]);
					var tg = $('[name="' + b.name + '"]', $this);
					tg.hide();
					if($.grep(keys, function(kk){return k == kk;}).length) tg.fadeToggle();
				}	
			};
			
			// ボタン表示
			var btn1 = getButton('btn_confirm');
			var btn2 = getButton('btn_back').hide();
			var btn3 = getButton('btn_post').hide();
			
			var div = $('<div>').addClass('form-group').css({textAlign:'right'}).attr({});
			div.append(btn2, $('<span>').text("\n"), btn1, $('<span>').text("\n"), btn3);
			
			// 確認ボタン
			btn1.click(function(){
				var data = _self.vars($this);
				console.log(data);
				var flag = conf.valid(data, $this);
				
				if(flag){
					_self.inputToggle($this);
					toggleButton.call($this, ['btn_back', 'btn_post']);
				}
			});
			
			// 戻るボタン
			btn2.click(function(){
				_self.inputToggle($this, 1);
				toggleButton.call($this, ['btn_confirm']);
			});
			
			// 送信ボタン
			btn3.click(function(){
				var data = _self.vars($this);
				toggleButton.call($this, []);
				$('.yopif_msg', $this).fadeToggle();
				
				var data_noobj = $.map(data, function(o, i){
					return {
						idx  : o.idx,
						name : o.name,
						val  : o.val,
						file : o.file ? o.file : null
					};
				});
				conf.send(data_noobj, $this);
			});
			
			// 出力
			var msg = gT('div', 'yopif_msg', {textAlign:'center', height:40}, conf.sendmsg).hide();
			$this.empty().hide();
			$this.append([formtable.append(tbody), msg, div]);
			$this.fadeToggle();
			
			return $this;
		},
		
		// ==============================================================
		// 入力チェック バリデーション
		// ==============================================================
		/* --------------------------------------------------------------
			d.idx   : インデックス
			d.val   : 入力内容
			d.obj   : inputエレメント
			d.eoj   : エラー表示するdivとかエレメント
			d.va    : {
				// バリデーションの種類 
				nn    : NotNull
				len   : 最大長さ数値
				mlen  : 最短長さ数値
				mail  : メアド 
				url   : URL
				zip   : 郵便番号 000-0000 or 0000000
				kana  : ひらがな
				kkana : カタカナ
			};
		----------------------------------------------------------------- */
		validation : function(data, _this){
			var conf  = $(_this).data('conf');
			var e = [];
			//for(let d of data) {
			$.map(data, function(d, i){
				d.eoj.hide();
				var r = _self.valiRow(d, conf.errMsg);
				if(r.msg){
					e.push(r.msg);
					var fa = conf.errmsg(r.msg);
					fa = conf.errtmpl.replace(/{{msg}}/g, r.msg);
					d.eoj.html(fa).slideDown();
				}
			});
			return e.length ? 0 : 1;
		},
		
		valiRow : function(d, emsg){
			var msg = '';
			var eid = '';
			var v   = d.val.replace(/^[\s　]|[\s　]$/g, '');
			var a   = d.va;
			
			if(a.agree && ! v){
				console.log(v);
				eid = 'agree';
			}else if(a.nn && v == ''){
				eid = 'nn';
			}else if(v == '' && ! a.nn){
				eid = '';
			}else if(a.len && v.length > a.len){
				eid = 'len';
			}else if(a.mlen && v.length < a.mlen){
				eid = 'mlen';
			}else if(a.mail && ! v.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.(?:[.a-zA-Z0-9-]+)*$/i)){
				eid = 'mail';
			}else if(a.url && ! v.match(/^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/)){
				eid = 'url';
			}else if(a.zip && ! v.match(/^(\d{3}-\d{4}|\d{7})$/)){
				eid = 'zip';
			}else if(a.kana && !  v.match(/^[\u3040-\u309f]+$/)){
				eid = 'kana';
			}else if(a.kkana && !  v.match(/^[\u30a0-\u30ff]+$/)){
				eid = 'kkana';
			}else if(a.passwd && ! v.match(/^[0-9a-zA-Z_=#]+$/)){
				eid = 'passwd';
			}
			if(eid){
				var tmpl = emsg[eid] ? emsg[eid] : errMsg[eid];
				msg = tmpl.replace(/{{(\w+)}}/g, function(m, k){return d[k]});
			}
			return {eid:eid, msg:msg};
		},
			
		// ==============================================================
		//  送 信
		// ==============================================================
		send : function(data, _this){
			
			var jCon = function(j){ return typeof j == 'json' ? JSON.parse(data) : JSON.stringify(j); };
			var strLen = function(str) { 
				var r = 0; 
				for (var i = 0; i < str.length; i++) { 
	        var c = str.charCodeAt(i); 
	        r += ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) ? 1 : 2;
	      }
				return r; 
			};
			var strF   = function(s, n){while(strLen(s) < n){s += ' ';} return s;};
			var json = jCon(data);
			var ary  = $.map(data, function(o){
				return [strF(o.idx, 16), o.val].join(' : ');
			});
			var body = ary.join("\n");
			var t = $(document).scrollTop();
			
			
			var mail = $('<div>').css({
				position    :'absolute',
				position    :'fixed',
				top: 150, 
				right: 0, left: 0,
				marginLeft      :'auto',
				marginRight     :'auto',
				width: 640,
				//height:480,
				padding     :'1em', 
				background  :'#fff',
				borderWidth :1,
				borderStyle :'solid',
				borderColor :'#333',
				zIndex      : 9999
			}).append(
				$('<div>').html('<i class="fa fa-envelope-o fa-2x"> メール送信内容</i>'),
				'<hr>',
				$('<pre>').css({
						fontFamily  :'monospace', 
						background  : '#FFE793',
						padding     : '1em',
						borderWidth :2, borderStyle :'solid', borderColor :'#ECC849'
				}).text(body),
				'<hr>'
			);
			mail.click(function(){$(this).remove();}).hide();
				
			$('body').append(mail);
			mail.click(function(){$(this).remove();});
			mail.fadeToggle();
			
			setTimeout(function(){ _this.yopiForm('init', _this); },2500);
		},
		
		// ==============================================================
		//  確認画面
		// ==============================================================
		inputToggle : function(origin, back_flag){
			var $this = $(origin);
			var conf  = $this.data('conf');
			
			for(var i = 0; i < conf.rows.length; i++){
				var r     = _self.getRow($this, conf.rows[i]);
				var inp   = $('[name="' + r.name + '"]', $this);
				if(r.type == 'radio')    inp = $('[name="' + r.name + '"]:checked', $this);
				if(r.type == 'checkbox') inp = $('[name="' + r.name + '"]:checked', $this);
				var val   = $('.yopif_val_' + r.name,    $this);
				
				// 確認用詰める
				var inpv  = inp.val();
				inpv = (inpv !== undefined) ? inpv : '';
				inpv = inpv.replace(/^[\s　]+|[\s　]+$/g, ''); // スペース消し
				inpv = _self.escape_html(inpv);                // HTMLタグ消し
				inpv = inpv.replace(/\n/g, '<br />');          // 改行はBR
				
				if(r.type == 'password'){
						inpv = inpv.replace(/./g, '＊'); // パスワード置換
				}

				val.html(inpv);
			}
			if(back_flag){
				$this.find('.yopif_val').hide();
				$this.find('.yopif_inp').fadeToggle()
			}else{
				$this.find('.yopif_inp').hide();
				$this.find('.yopif_val').fadeToggle()
			}
		},
			
		// ==============================================================
		//	 インプット１個作る
		// ==============================================================
		getInput : function(_this, r){
			var $this = $(_this);
			var conf  = $this.data('conf');
			var name  = r.name;
			var type  = r.type ? r.type : 'text';
			var ph    = r.ph  ? r.ph  : '';
			var def   = r.def ? r.def : '';
			var len   = r.length  ? r.length  : 1000;
			var h     = r.height  ? r.height  : conf.inputheight;
			
			var inp, inp2;
			var attr = {
				name         : name, 
				placeholder  : ph, 
				maxlength    : len,
				width:r.w,
				'data-index' : r.index,
				'data-type'  : type,
			};
			
			if(type == 'zip'){
				
				// 郵便番号入力
				attr['maxlength'] = 8;
				inp  = $('<input>');
				
				var zipbtn = $('<input>')
					.attr({type:'button', name:name+'_button'})
					.addClass('btn btn-info yopif_zip_btn')
					.val(r.zbtn ? r.zbtn : '住所検索');
				
				inp2 = $('<span>').attr({})
					.addClass('input-group-btn yopif_inp')
					.append(zipbtn);
				
				$.extend(attr, { type:'TEXT', value:def });
			
			}else if(type == 'select'){
			
				// セレクト
				inp  = $('<select>');
				for(var i=0; i<r.ary.length; i++){
					var v = r.ary[i];
					var s = v == def ? true : false;
					inp.append($('<option>').attr({value:v, selected:s}).text(v));
				}
				$.extend(attr, {});
			
			}else if(type == 'radio' || type == 'checkbox'){
			
				// ラジオ・チェックボックス
				var div = $('<div>').addClass('input-group yopif_inp').css({height:h});
				for(var i=0; i<r.ary.length; i++){
					var v = r.ary[i];
					var label = $('<label>');
					var c     = v == def ? true : false;
					var a     = $.extend({}, attr, {type:type.toUpperCase(), value:v, checked:c});
					var radio = $('<input>').addClass('').attr(a).css({});
					div.append(label.append(radio, ' '+ v + '　'));
				}
				return div;
			
			}else if(type == 'file'){
			
				// ファイル
				var div   = $('<div>').addClass('input-group yopif_inp').css({height:h});
				var label = $('<label>').addClass('input-group-btn');
				var span  = $('<span>').addClass('btn btn-primary').css({height:h});
				inp = $('<input>').attr({type:'FILE', name:name}).css({display:'none'});
				
				inp.on('change', function(){
					var input = $(this);
					input.parent().parent().next(':text').val('');
					
					var tmpl   = '';
					var files = this.files ? this.files : [];
					var file  = files[0];
					var ftype = r.ftype.split(/\s+/);
					
					//console.log(file.type, ftype);
					console.log(file.type);
					if(file.size > r.fsize * 1024){
						tmpl = errMsg['fsize'];
					}else if(r.ftype && ! $.grep(ftype, function(v){return v == file.type;}).length){
						var tmpl = errMsg['ftype'];
					}
					
					if(tmpl){
						var msg = tmpl.replace(/{{(\w+)}}/g, function(m, k){return r[k]});
						alert(msg);
					}else{
						var reader = new FileReader(file);
						reader.readAsDataURL(files[0]);
						reader.onloadend = function(){
							input.attr({
								'data-ftype' : file.type,
								'data-fname' : file.name,
								'data-fsize' : file.size,
								'data-fdata' : this.result
							});
							input.parent().parent().next(':text').val(input.val());
							//console.log(_self.fsizeUnit(this.result.length));
						}
					}
				});
				
				inp2  = $('<input>').addClass('form-control yopif_filepath')
					.css({height:h})
					.attr({type:'TEXT', readonly:"", placeholder:ph});
				
				return div.append(label.append(span.append(r.fbtn, inp)), inp2);
			
			}else if(type == 'area' || type == 'textarea'){
			
				// テキストエリア
				inp = $('<TEXTAREA>').text(def);
			
			}else{
			
				// 通常
				inp = $('<input>');
				$.extend(attr, { type:type.toUpperCase(), value:def });
			
			}
			
			var css = {height:h};
			if(r.w) $.extend(css, {width:r.w});
			//$.extend(css, {width:200});
			inp.addClass('form-control yopif_inp').css(css).attr(attr);
			if(inp2){
				return $('<div>')
				.addClass('input-group')
				.css(css)
				.append(inp, inp2);
			}
			return inp;
		},
	
		// ==============================================================
		//   データくれ
		// ==============================================================
		vars : function(_this, name){
			var $this = $(_this);
			var conf  = $this.data('conf');
		
			var data = $.map(conf.rows, function(k){
				var o      = _self.getRow($this, k);
				var r      = {
					name  : o.name,
					val   : '',
					idx   : o.index.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,''),
					valid : o.valid ? o.valid : '',
					va    : {},
					obj   : null,
					eobj  : null,
					len   : o.length,
					mlen  : o.minlength
				};
				r.obj = $('[name="' + o.name + '"]', $this);
				r.eoj = $('.yopif_err_' + o.name,    $this);
				
				// バリデーション設定validをvaに変換
				var ary   = r.valid.replace(/^[\s　]+|[\s　]+$/g, '').split(/\s+/);
				r.va = {
					nn   : o.nn,
					len  : o.length ? o.length : conf.defaultlength,
					mlen : o.minlength ? o.minlength : ''
				};
				//for(var v of ary){ r.va[v] = true; }
				$.map(ary, function(v){r.va[v] = true;});
				
				// 入力内容
				if(o.type == 'checkbox' || o.type == 'radio')
					r.val = $('[name="' + r.name + '"]:checked', $this).val();
				else
					r.val   = r.obj.val();
				r.val = r.val !== undefined ? r.val : '';
				r.val = r.val.replace(/^[\s　]+|[\s　]+$/g, '');
				
				// ファイルアップロードだ
				if(o.type == 'file' && r.obj.attr('data-fsize')){
					r.val     = r.obj.attr('data-ftype') +' : '+ r.obj.attr('data-fname');
					r['file'] = {
						type : r.obj.attr('data-ftype'),
						name : r.obj.attr('data-fname'),
						size : r.obj.attr('data-fsize'),
						data : r.obj.attr('data-fdata')
					};
					//console.log(r.obj.attr('data-ftype'), r.obj.attr('data-fname'), r.obj.attr('data-fsize'), r.obj.attr('data-fdata'));
				}
				
				return r;
			});
			return data;
		},
		
		// -- フォーム設定取る key -> inputDefault row
		getRow : function(_this, k){
			var $this = $(_this);
			var conf  = $this.data('conf');
			
			var nn = k.match(/^\*/) ? true : conf.nnall;
			if(conf.nnall) nn = k.match(/^-/) ? false : nn;
			k = k.replace(/^[\*-]/, '');
			
			var self = $(this);
			return $.extend({}, inputDefault[k], conf[k], {nn:nn});
		},
		
		escape_html : function(string){
			if(typeof string !== 'string') return string;
			return string.replace(/[&'`"<>]/g, function(m){
		    return {'&': '&amp;',"'": '&#x27;','`': '&#x60;','"': '&quot;','<': '&lt;','>': '&gt;',}[m]
		  });
		},
		fsizeUnit : function(s){
			var f = parseFloat(s);
			var a = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
			for(var i in a){
				if(f < 1024) return (i > 0 ? f.toFixed(2):f)+a[i];
				f = parseFloat(f / 1024);
			}
			return 0;
		},
		_isPublicMethod: function (method) {
			return (typeof _self[method] === 'function' && method.charAt(0) !== '_');
		}
	};
	
	$.fn.yopiForm = function(method, options){
		if (_self._isPublicMethod(method)) {
			return _self[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}else if(typeof method === 'object' || ! method ) {
      return _self.init.apply(this, arguments);
    }else{
      $.error( 'Method ' +  method + ' does not exist on yopiForm' );
    }
	};
})(jQuery);

