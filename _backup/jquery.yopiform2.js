(function($){

  var methods = {
	init : function() {
		options = arguments;
		
		settings = $.extend(true, {
			title     : 'お問い合わせ',
			subject   : '[yopiForm]',
			toaddores : 'info@yopisoft.net',
			sendmsg   : 'お問い合わせありがとうございます',
			rows:[
				{index:'お名前',         name:'name',    length:20,
					placeholder:'荒川 ほげ太',            default:'荒川 ほげ太'},
				{index:'ふりがな',       name:'kana',    length:20,
					placeholder:'あらかわ ほげた',        default:'あらかわ ほげた', },
				{index:'メールアドレス', name:'mail',     length:64,
					placeholder:'uname@example.com',      default:'uname@example.com'},
				{index:'電話番号',       name:'tel',      length:14,
					placeholder:'000-0000-0000',          default:'000-0000-0000'},
				{index:'郵便番号',       name:'zip',      type:'zip',
					placeholder:'000-0000',               default:'100-0001'},
				{index:'ご住所',         name:'address',  
					placeholder:'都道府県 市区町村 番地', default:''},
				{index:'都道府県',       name:'pref',     
					placeholder:'都道府県',               default:''},
				{index:'市区町村',       name:'address1', 
					placeholder:'市区町村',               default:''},
				{index:'建物番地',       name:'address2', 
					placeholder:'番地',                   default:''},
				{index:'お問い合わせ',   name:'comment',  type:'area', length:1000,
					placeholder:'1000文字まで',           default:'', 
					height:100},
			],
			button:{
					confirm : {name:'buttonConfirm', value:'書くよ。', class:'btn btn-primary'},
					rewrite : {name:'buttonRewrite', value:'書き直し', class:'btn btn-default'},
					sendnow : {name:'buttonSendNow', value:'送信決定', class:'btn btn-success'},
					//init    : {name:'buttonInitBtn', value:'戻る',     class:'btn btn-success'},
					},
					send:function(data, o){},
				inputheight  : 40,
				buttonheight : null
			}, options[1] ? options[1] : {});
			
			// row指定
			if(Array.isArray(options[0]) && options[0].length){
				var rows = $.grep(settings.rows, function(r){
					return $.grep(options[0], function(name){ 
						return r.index == name;
					}).length;
				});
				settings.rows = rows;
			}
			
			this.yopiForm('initForm');
		},
			
		hoge : function(){
			console.log('hoge');
		},
    
	    ///// ボタン作るヤツ
		getButton : function(btn){
			var inp = $('<input>').css({width:150, height:settings.buttonheight})
			.addClass(btn.class + ' ypf_btn')
			.attr({type:'button', name:btn.name, value:btn.value});
			
			return inp;
		},
		///// データくれ
		vars : function(){
			var data = {};
			var rows = settings.rows;
			$.map(rows, function(o){
				var inp   = $('[name="' + o.name + '"]', this);
				data[o.name] = inp.val();
				return inp.val();
			});
			return data;
		},
		///// inputタグを作る
		getInput : function(r){
			var name  = r.name;
			var type  = r.type ? r.type : 'text';
			var pf    = r.placeholder ? r.placeholder : '';
			var def   = r.default ? r.default : '';
			var mlen  = r.length  ? r.length  : 1000;
			var h     = r.height  ? r.height  : settings.inputheight;
	
			var attr = {name:name, placeholder:pf, maxlength:mlen};
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
					.addClass('btn btn-info yopf_zip_btn')
					.val('郵便から住所');
				
				inp2 = $('<span>').attr({})
					.addClass('input-group-btn yopf_inp')
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
			inp.addClass('form-control yopf_inp')
				.css({height:h})
				.attr(attr);
			
			return inp2 ? [inp, inp2] : inp;
		},
			
		inputToggle : function(rewrite_flag){
			var rows = settings.rows;
			for(var i = 0; i < rows.length; i++){
				var r     = rows[i];
				var name  = r.name;	
				var inp   = $('[name="' + name + '"]', this);
				inp.nextAll('div').text(inp.val());
			}
			if(rewrite_flag){
				this.find('.yopf_val').hide();
				this.find('.yopf_inp').fadeToggle()
			}else{
				this.find('.yopf_inp').hide();
				this.find('.yopf_val').fadeToggle()
			}

			// ボタン表示
			var btn = settings.button;
			for(let k in btn) {
				var b = btn[k];
				var tag = $('[name="' + b.name + '"]', this);
				tag.hide();
				if(rewrite_flag){
					if(k == 'confirm') tag.fadeToggle();
				}else{
					if(k == 'rewrite' || k == 'sendnow') tag.fadeToggle();
				}
			}
		},
		
		///// テーブル書く
		initForm : function(){
			var $this = this;
			var rows  = settings.rows;
			var title = settings.title;
			
			var formtable = $('<table>').addClass('table');
			var thead = $('<thead>');
			var tr    = $('<tr>').append($('<th>').attr({colspan:2}).text(title));
			if(title) formtable.append(thead.append(tr));
			
			var tbody     = $('<tbody>').addClass().append();
		
			for(var i = 0; i < rows.length; i++){
				var r     = rows[i];
				var h     = r.height  ? r.height  : settings.inputheight;
				var index = r.index;
				
				var tr  = tbody.append($('<tr>').addClass()); 
				var th  = $('<th>').css({width:150}).text(index);
				
				//var inp = getInput(r);
				var inp = this.yopiForm('getInput', r);
				
				var context = $('<div>').addClass('yopf_val').css({'min-height':h}).hide();
				tr.append(th, $('<td>').addClass('input-group').append(inp, context));
			}
		
			var btn  = settings.button;
			var btn1 = methods.getButton(btn.confirm);
			var btn2 = methods.getButton(btn.rewrite).hide();
			var btn3 = methods.getButton(btn.sendnow).hide();
			
			// 並べて表示
			var div = $('<div>').addClass('form-group').css({textAlign:'right'}).attr({});
			var n   = $('<span>').text("\n");
			div.append(btn2, n, btn1, n, btn3);
			
			// 確認ボタン
			btn1.click(function(){$this.yopiForm('inputToggle');});
			
			// 戻るボタン
			btn2.click(function(){$this.yopiForm('inputToggle', 1);});
			
			// 送信ボタン
			btn3.click(function(){
				var data = methods.vars();
				var btn = settings.button;
				for(let k in btn) {
					var b = btn[k];
					var tag = $('[name="' + b.name + '"]', $this);
					if(k == 'rewrite' || k == 'sendnow') tag.hide();
				}
				$('.ypf_msg', $this).fadeToggle();
				settings.send(data, $this);
				setTimeout(function(){
					$this.yopiForm('initForm');
				},3000);
				
			});
			
			var msg = $('<div>').addClass('ypf_msg')
				.css({textAlign:'center', height:40})
				.html(settings.sendmsg).hide();
			
			// 出力
			this.empty();
			this.append([formtable.append(tbody), msg, div]).hide();
			this.fadeToggle();
			//$this.slideDown();
			
			// jpostal 設定
			this.jpostal({
				click    : '[name="zip_button"]',
				postcode : ['[name="zip"]'],
				address  : {
					'[name="address"]'  : '%3 %4 %5',
					'[name="pref"]'     : '%3',
					'[name="address1"]' : '%4',
					'[name="address2"]' : '%5',
				}
			});
			return this;
		}, 
	};

	$.fn.yopiForm = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if (typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
})(jQuery)