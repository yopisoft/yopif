/*
	
	yopiForm v0.00 - A JavaScript jQuery plugin for generating html form;
	(c) よぴそふと http://yopisoft.net/
	
	yopiForm uses
		jpostal 
			https://github.com/ninton/jquery.jpostal.js/blob/master/README.txt
			
*/

(function($) {
	
	$.fn.yopiForm = function(names, options){
		
		var $this = this;
		
		// 設定 ///////////////////////////////////////////////////////////////
		var conf = $.extend({}, {
			title     : 'お問い合わせ',
			subject   : '[yopiForm]',
			toaddores : 'info@yopisoft.net',
			sendmsg   : 'お問い合わせありがとうございます',
			nnall     : false,
			nntag     : '<span class="yopif_nn">※</span>', 
			
			button:{
					confirm : {name:'buttonConfirm', value:'書くよ。', class:'btn btn-primary'},
					rewrite : {name:'buttonRewrite', value:'書き直し', class:'btn btn-default'},
					sendnow : {name:'buttonSendNow', value:'送信決定', class:'btn btn-success'},
				},
			valid        : function(){return true;},
			send         : function(data, o){console.log(data, o);},
			inputheight  : 40,   // 入力高さ
			buttonheight : null,  // ボタン高さ
			rows         : [
				'お名前', 'ふりがな', 'フリガナ', 'メールアドレス', 'URL', '電話番号', '郵便番号',
				'ご住所', '都道府県', '市区町村', '建物番地', 'お問い合わせ'
			],
		}, options);
		var validkeys = ['nn', 'mail', 'tel', 'zip', 'kana', 'kkana'];
		var inputconf = {
			'お名前' : {index:'お名前',         name:'name',    length:20,
					placeholder:'苗字 お名前',            default:''},
			'ふりがな' : {index:'ふりがな',       name:'kana',  valid:'kana',  length:20,
					placeholder:'みょうじ おなまえ',        default:'', },
			'フリガナ' : {index:'フリガナ',       name:'kkana',  valid:'kkana',  length:20,
					placeholder:'ミョウジ オナマエ',        default:'', },
			'メールアドレス':{index:'メールアドレス', name:'mail',  valid:'mail', length:64,    
					placeholder:'hoge@example.com',      default:''},
			'URL':	{index:'URL', name:'url',valid:'url',     length:200,   
					placeholder:'http://www.example.com',      default:''},
			'電話番号':	{index:'電話番号',       name:'tel',      length:14,        valid:'tel',
					placeholder:'000-0000-0000',          default:''},
			'郵便番号':	{index:'郵便番号',       name:'zip',      type:'zip',       valid:'zip',
					placeholder:'000-0000',               default:'100-0001'},
			'ご住所':{index:'ご住所',         name:'address',  
					placeholder:'都道府県 市区町村 番地', default:''},
			'都道府県':{index:'都道府県',       name:'pref',     
					placeholder:'都道府県',               default:''},
			'市区町村':{index:'市区町村',       name:'address1', 
					placeholder:'市区町村',               default:''},
			'建物番地':{index:'建物番地',       name:'address2', 
					placeholder:'番地',                   default:''},
			'お問い合わせ':{index:'お問い合わせ', name:'comment',  type:'area', length:300,
					placeholder:'300文字まで',           default:'', 
					height:100},
		};
		
		// rows指定がある場合
		if(Array.isArray(names) && names.length){
			//console.log('row指定がある場合', names);
			conf.rows = names;
		}
		
		// row取り
		function getRow(k){
			var nn = k.match(/^\*/) ? true : conf.nnall;
			if(conf.nnall) nn = k.match(/^-/) ? false : nn;
			k = k.replace(/^[\*-]/, '');
			
			return $.extend({}, inputconf[k], conf[k], {nn:nn});
		}
		
		function escape_html(string){
			if(typeof string !== 'string') return string;
			return string.replace(/[&'`"<>]/g, function(m){
		    return {'&': '&amp;',"'": '&#x27;','`': '&#x60;','"': '&quot;','<': '&lt;','>': '&gt;',}[m]
		  });
		}
		
		// データくれ
		function vars(){
			var data = [];
			$.map(conf.rows, function(k){
				var o      = getRow(k);
				var r      = {name:o.name};
				r['idx']   = o.index.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
	
				r['valid']  = o.valid ? o.valid : '';
				var vary    = r['valid'].replace(/^[\s　]+|[\s　]+$/g, '').split(/\s+/);
				r['va'] = {
					nn  : o.nn,
					len : o.length ? o.length : 300
				};
				for(var i=0; i<vary.length; i++){
					r.va[vary[i]] = true;
				}
				
				r['obj']   = $('[name="' + o.name + '"]', $this);
				r['eoj']   = $('.yopif_err_' + o.name, $this);
				
				r['val']   = r['obj'].val();
				r['val']   = r['val'].replace(/^[\s　]+|[\s　]+$/g, '');
				
				data.push(r);
			});
			return data;
		}
		
		// 入力欄トグル ///////////////////////////////////////////////////////
		var inputToggle = function(rewrite_flag){
			for(var i = 0; i < conf.rows.length; i++){
				var r     = getRow(conf.rows[i]);
				var name  = r.name;	
				var inp   = $('[name="' + name + '"]', $this);
				var val   = $('.yopif_val_' + name, $this);
				
				// 確認用詰める
				var inpv  = inp.val()
				inpv = inpv.replace(/^[\s　]+|[\s　]+$/g, '');
				inpv = escape_html(inpv);
				inpv = inpv.replace(/\n/g, '<br />');
				val.html(inpv);
			}
			if(rewrite_flag){
				$this.find('.yopif_val').hide();
				$this.find('.yopif_inp').fadeToggle()
			}else{
				$this.find('.yopif_inp').hide();
				$this.find('.yopif_val').fadeToggle()
			}

			// ボタン表示切替
			var btn = conf.button;
			for(let k in btn) {
				var b = btn[k];
				var tag = $('[name="' + b.name + '"]', $this);
				tag.hide();
				if(rewrite_flag){
					if(k == 'confirm') tag.fadeToggle();
				}else{
					if(k == 'rewrite' || k == 'sendnow') tag.fadeToggle();
				}
			}
		};
		
		// inputタグを作る ////////////////////////////////////////////////////
		var getInput = function(r){
			var name  = r.name;
			var type  = r.type ? r.type : 'text';
			var pf    = r.placeholder ? r.placeholder : '';
			var def   = r.default ? r.default : '';
			var mlen  = r.length  ? r.length  : 1000;
			var h     = r.height  ? r.height  : conf.inputheight;
			
			var attr = {
				name:name, placeholder:pf, maxlength:mlen,
				'data-index':r.index,
				'data-type' :type
			};
			var inp;
			var inp2;
			
			if(type == 'area'){
				inp = $('<textarea>').text(def);
			}else if(type == 'zip'){
				// 郵便番号インプット
				attr['maxlength'] = 8;
				inp  = $('<input>');
				
				var zipbtn = $('<input>')
					.attr({type:'button', name:name+'_button'})
					.addClass('btn btn-info yopif_zip_btn')
					.val('郵便から住所');
				
				inp2 = $('<span>').attr({})
					.addClass('input-group-btn yopif_inp')
					.append(zipbtn);
				
				$.extend(attr, {
					type:'text',
					value:def		
				});
				
			}else{
				// 通常
				inp = $('<input>');
				$.extend(attr, {
					type:type,
					value:def		
				});
			}
			inp.addClass('form-control yopif_inp')
				.css({height:h})
				.attr(attr);
			if(inp2){
				return $('<div>').addClass('input-group').append(inp, inp2);
			}
			return inp;
		};
		
		// ボタン作るヤツ
		function getButton(btn){
			var inp = $('<input>').css({width:150, height:conf.buttonheight})
			.addClass(btn.class + ' yopif_btn')
			.attr({type:'button', name:btn.name, value:btn.value});		
			return inp;
		};
		
		// フォーム描き ///////////////////////////////////////////////////////
		var initForm = function(){
			
			var title = conf.title;
			
			var formtable = $('<table>').addClass('table');
			var thead = $('<thead>');
			var tr    = $('<tr>').append($('<th>').addClass('yopif_title').attr({colspan:2}).text(title));
			if(title) formtable.append(thead.append(tr));
			
			var tbody     = $('<tbody>').addClass().append();
			for(var i = 0; i < conf.rows.length; i++){
				var r     = getRow(conf.rows[i]);
				var h     = r.height  ? r.height  : conf.inputheight;
				var index = r.index;
				var name  = r.name;
				var nn    = r.nn ? conf.nntag : '';
				var tr  = tbody.append($('<tr>').addClass()); 
				var th  = $('<th>').css({width:150}).html(nn+index);
				
				var inp = getInput(r);
				
				// 表示用
				var tag  = '<div>';
        var cls  = 'yopif_val yopif_val_' + name;
        if(r.type == 'area'){
        	tag  = '<div>';
					//cls += ' yopif_pre';
				}
       	var cont = $(tag).addClass(cls)
       	.css({display      : 'none','min-height' : h});
				
				var err = $('<div>').addClass('yopif_err yopif_err_' + name).css({}).hide();
				
				tr.append(th, $('<td>').addClass('input-group_').append(inp, cont, err));
			}
		
			var btn  = conf.button;
			var btn1 = getButton(btn.confirm);
			var btn2 = getButton(btn.rewrite).hide();
			var btn3 = getButton(btn.sendnow).hide();
			
			// ボタン並べて表示
			var div = $('<div>').addClass('form-group').css({textAlign:'right'}).attr({});
			var n   = $('<span>').text("\n");
			div.append(btn2, n, btn1, n, btn3);
			
			// 確認ボタン
			btn1.click(function(){
				var data = vars();
				var flag = conf.valid(data, $this);
				if(flag) inputToggle();
			});
			
			// 戻るボタン
			btn2.click(function(){inputToggle(1);});
			
			// 送信ボタン
			btn3.click(function(){
				var data = vars();
				var btn = conf.button;
				for(let k in btn) {
					var b = btn[k];
					var tag = $('[name="' + b.name + '"]', $this);
					if(k == 'rewrite' || k == 'sendnow') tag.hide();
				}
				$('.yopif_msg', $this).fadeToggle();
				conf.send(data);
				setTimeout(function(){ initForm() },3000);
			});
			
			var msg = $('<div>').addClass('yopif_msg')
				.css({textAlign:'center', height:40})
				.html(conf.sendmsg).hide();
			
			// 出力
			$this.empty();
			$this.append([formtable.append(tbody), msg, div]).hide();
			$this.fadeToggle();
			//$this.slideDown();
			
			// jpostal 設定
			$this.jpostal({
				click    : '[name="zip_button"]',
				postcode : ['[name="zip"]'],
				address  : {
					'[name="address"]'  : '%3 %4 %5',
					'[name="pref"]'     : '%3',
					'[name="address1"]' : '%4',
					'[name="address2"]' : '%5',
				}
			});
			return $this;
			//return [formtable.append(tbody), msg, div];
		};

		return initForm();
	}
	
})( jQuery );

