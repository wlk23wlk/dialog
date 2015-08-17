/*
目标功能：
	自由配置弹窗结构
	自由配置弹窗样式
	设置拖拽
	设置遮罩
	自动居中定位
*/
(function($){
	//拖动
	function Move(m_id,cur_id){
		this.m_id=arguments[0]||null;
		this.cur_id=arguments[1]||null;
		this.flag=0;
		this.x=null;
		this.y=null;
		this.cur_left=null;
		this.cur_top=null;
	}
	Move.prototype={
		_mousedown:function(){
			var that=this;
			$(that.cur_id).on("mousedown",function(e){
				that.x=e.pageX;
				that.y=e.pageY;
				that.cur_left=parseFloat($(that.m_id).css("left"),10);
				that.cur_top=parseFloat($(that.m_id).css("top"),10);
				that.flag=1;
			});
		},
		_mouseup:function(){
			var that=this;
			$(document).on("mouseup",function(e){
				that.flag=0;
			});
		},
		_mousemove:function(){
			var that=this;
			$(document).on("mousemove",function(e){
				if(that.flag==1){
					var cur_x=e.pageX;
					var cur_y=e.pageY;
					var xx=cur_x-that.x;
					var yy=cur_y-that.y;
					$(that.m_id).css({left:that.cur_left+xx,top:that.cur_top+yy});
				}	
			});
		}
	}
	//弹窗
	var newFlag=0;
	var _open=null;
	var _close=null;
	function Dialog(option,flag){
		var _option={
			_dom:{
				"box":["div",".dialog",""],
				"prompt":["h2",".dialog>''","提示："],
				"close":["span","h2>.close","&times;"]
			},
			//设置元素CSS样式
			_css:{
				".dialog":{
					display:"none",
					width:"350px",
					minHeight:"100px",
					position:"absolute",
					left:"50%",
					top:"50%",
					marginLeft:"-150px",
					marginTop:"-50px",
					backgroundColor:"#fff",
					borderRadius:"3px",
					overflow:"hidden",
					zIndex:100000,
                    boxShadow:"0 0 5px rgba(0,0,0,0.5)"
				},
				"span":{
					display:"block",
					width:"20px",
					height:"20px",
					fontSize:"14px",
					lineHeight:"20px",
					textAlign:"center",
					position: "absolute",
                    right:"5px",
                    top:"50%",
                    
					marginTop: "-10px",
					cursor:"pointer",
                    textIndent:0
				},
				"h2":{
					position:"relative",
					height:"32px",
					marginBottom:"10px",
					backgroundColor:"#5092cf",
					lineHeight:"32px",
					textAlign:"center",
					color:"#fff",
					fontWeight:"bold",
					fontSize:"16px",
					textAlign:"left",
					textIndent:"10px"
				},
				"p":{
					fontSize:"14px"
				}
			},
			drag:true,
			mask:true,
			position:true
		}
		Dialog.prototype.baseOption=_option;//初始化参数
		++newFlag;
		if( option == undefined||typeof(arguments[0])=="string"){
			var flag=arguments[0];
		}else{
			var opt=this.baseOption;
			for(i in opt){
				if(opt[i] instanceof Object){
					opt[i]=$.extend(true,{},opt[i],option[i]);
				}else if(option[i]!=undefined){
					opt[i]=option[i];
				}
			}
			Dialog.prototype.baseOption=opt;
		}
		option=this.baseOption;
		if(option instanceof Object){
			this.createMask(option);
			//创建元素
			this.createDom(option,flag);
			//对应元素添加样式
			this.addCss(option,flag);
			//弹窗是否可拖动
			if(option.drag){
				this._drag(option,flag);
			}
			//是否自动居中定位
			if(option.position){
				this._position(option);
			}
		}
	}
	Dialog.prototype={
		getClassAttr:function(name){//获取正确CSS属性
			var _reg=/[A-Z]/;
			if(_reg.exec(name)!==null){
				var _str=_reg.exec(name)[0];
				var _Str="-"+_reg.exec(name)[0].toLowerCase();
			}else{
				str="";
			}
			var _newStr=name.replace(_str,_Str);
			if(_reg.test(_newStr)){
				return this.getClassAttr(_newStr);
			}else{
				return _newStr;
			}
		},
		createDom:function(option,flag){//创建节点
			for(i in option._dom){
				var _arr=option._dom[i][1].split(">");
				var _len=_arr.length;
				var _class=null;
				if(/\./g.test(_arr[_len-1])){
					_class='class="';
					_className=_arr[_len-1].replace(/\./g,"")+'"';
					
				}else if(/\#/g.test(_arr[_len-1])){
					_class="id=";
					_className=_arr[_len-1].replace(/\#/g,"")+'"';
				}else{
					_class="";
					_className="";
				}
				//判断标签是否为自闭和标签
				var autoClose=["area","base","basefont","br","col","hr","img","input","keygen","link","param","source","track"];
				var auto_flag=null;
				for(var _i=0;_i<autoClose.length;_i++){
					if(autoClose[_i]==option._dom[i][0]){
						auto_flag=0;//自闭和
						break;
					}else{
						auto_flag=1;//非自闭和
					}
				}
				var str=auto_flag==0?'<'+option._dom[i][0]+" "+_class+_className+' />':'<'+option._dom[i][0]+" "+_class+_className+'>'+option._dom[i][2]+'</'+option._dom[i][0]+'>';
				if(_len>1){
					if($(_arr[_len-2]).hasClass(flag)){
						$(_arr[_len-2]+"."+flag).append(str);
					}else if(_arr[_len-2]!==".mask"){
						$("."+flag).find(_arr[_len-2]).append(str);
					}else{
						$(_arr[_len-2]).append(str);
					}
				}else{
					$("body").append(str);
					if(flag!=undefined){
						if($("."+_className.replace(/\"/,"")).length>1){
							$("."+_className.replace(/\"/,"")).eq(newFlag-1).addClass(flag);
						}else{
							$("."+_className.replace(/\"/,"")).addClass(flag);
						}
						
					}
				}
			}
		},
		createMask:function(option){
			if(option.mask){
				var _opt={
					_dom:{
						"mask":["div",".mask",""],
						"mask-box":["div",".mask>.mask-box",""]
					},
					_css:{
						".mask":{
							display:"none",
							position:"absolute",
							left:"0",
							top:"0",
							width:"100%",
							height:"100%",
							zIndex:"1000"
						},
						".mask-box":{
							width:"100%",
							height:"100%",
							zIndex:9990,
							filter:"Alpha(opacity=50)",
							opacity:"0.5",
							zoom:1,
							backgroundColor:"#000"
						}
					}
				}
				option._dom=$.extend({},option._dom,_opt._dom);
				option._css=$.extend({},option._css,_opt._css);
			}
		},
		addCss:function(option,flag){//添加样式
			var flag=flag||'';
			for(i in option._css){
				var _strCss="";
				var _arrStr=[];
				var _arrStrIndex=[];
				for(j in option._css[i]){
                    if(option._css[i][j] instanceof Array){
                        for(var e=0;e<option._css[i][j].length;e++){
                            _strCss+=this.getClassAttr(j)+":"+option._css[i][j][e]+";"
                        }
                    }else{
                        _strCss+=this.getClassAttr(j)+":"+option._css[i][j]+";"
                    }
					
				}
				if(option._dom["box"][1]==i||i==".mask"){
					$(i+"."+flag).attr("style",_strCss);
				}else{
					$("."+flag).find(i).attr("style",_strCss);
				}
			}		
		},
		_drag:function(option,flag){//拖动
			_c1=option._dom.box[1];
			_c2=option._dom.prompt[0];
			$("."+flag+">"+_c2).css({cursor:"move"});
			var move=new Move(_c1+"."+flag,"."+flag+">"+_c2);
			move._mousedown();
			move._mouseup();	
			move._mousemove();	
		},
		_position:function(option){
			var that=this;
			var _width=$(option._dom["box"][1]).innerWidth();
			var _height=$(option._dom["box"][1]).innerHeight();
			var w_width=$(window).width();
			var w_height=$(window).height();
			if(!!window.ActiveXObject&&!window.XMLHttpRequest){
				var s_height=$(document).scrollTop();
				$(option._dom["box"][1]).css({position:"absolute",left:"50%",marginLeft:-(w/2),top:s_height});
				$(window).on("scroll",function(){
					var s_height=$(document).scrollTop();
					if($(option._dom["box"][1]).is(':visible')){
						$(option._dom["box"][1]).stop().animate({top:s_height},200);
					}
				});
			}else{
				if(_height>w_height){
					$(option._dom["box"][1]).css({position:"fixed",left:"50%",top:0,marginLeft:-_width/2,marginTop:0});
				}else{
					$(option._dom["box"][1]).css({position:"fixed",left:"50%",top:"50%",marginLeft:-_width/2,marginTop:-(_height/2)});
				}
				
			}
			
		},
		_open:function(flag){
			var flag=flag==undefined?"":"."+flag;
			var that=this;
			$(that.baseOption._dom['box'][1]+flag).fadeIn();
			if(that.baseOption._dom['mask']){
				$(that.baseOption._dom['mask'][1]+flag).fadeIn();
			}
		},
		_close:function(flag){
			var flag=flag==undefined?"":"."+flag;
			var that=this;
			$(that.baseOption._dom['box'][1]+flag).fadeOut();
			if(that.baseOption._dom['mask']){
				$(that.baseOption._dom['mask'][1]+flag).fadeOut();
			}
		}
	}
	var runDialog=null;
	$.extend({
		fD:function(option,flag){
			runDialog=new Dialog(option,flag);
		},
		fD_text:function(message,flag){
			
            if($("."+flag).length==0){
                var option={
                    _dom:{
                        "message":["div",".dialog>.message",message]
                    },
                    _css:{
                        ".message":{
                            padding:"5px",
                            wordWrap:"break-word"
                        }
                    }
                }
                runDialog=new Dialog(option,flag);
                runDialog._open(flag);  
            }else{
              $(".message").text(message);
              runDialog._open(flag);
            }
            
		},
        fD_confirm:function(message,flag,fn,callback){
            if($("."+flag).length==0){
                var option={
                    _dom:{
                        "message":["div",".dialog>.message",message],
                        "confirm":["div",".dialog>.confirm",""],
                        "sure":["div",".confirm>.sure","确定"],
                        "cancel":["div",".confirm>.cancel","取消"]
                    },
                    _css:{
                        ".message":{
                            padding:"5px",
                            wordWrap:"break-word"
                        },
                        ".confirm":{
                            textAlign:"center",
                            padding:"10px 0"
                        },
                        ".sure":{
                            "display": "inline-block",
                            "*display": "inline", 
                            "*zoom": 1,
                            "color": "#FFF",
                            "textDecoration": "none !important", 
                            "cursor": "pointer", 
                            "height": "28px", 
                            "lineHeight": "28px", 
                            "padding": "0 12px",
                            "border": "1px solid #1067B6", 
                            "overflow": "visible", 
                            "width": "auto", 
                            "*width": 1, 
                            "fontSize": "12px", 
                            "marginRight": "5px",
                            "borderRadius": "2px",
                            "verticalAlign": "middle",
                            "background":[
                                "#2185DF",
                                "-webkit-linear-gradient(top, #238AE7 0%, #1F81D9 100%)",
                                "-moz-linear-gradient(top, #238AE7 0%, #1F81D9 100%)",
                                "-o-linear-gradient(top, #238AE7 0%, #1F81D9 100%)",
                                "linear-gradient(top, #238AE7 0%, #1F81D9 100%)"
                            ],
                            "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#238AE7', endColorstr='#1F81D9',GradientType=0)"
                        },
                        ".cancel":{
                            "display": "inline-block",
                            "*display": "inline", 
                            "*zoom": 1,
                            "color": "#FFF",
                            "textDecoration": "none !important", 
                            "cursor": "pointer", 
                            "height": "28px", 
                            "lineHeight": "28px", 
                            "padding": "0 12px",
                            "border": "1px solid #1067B6", 
                            "overflow": "visible", 
                            "width": "auto", 
                            "*width": 1, 
                            "fontSize": "12px", 
                            "marginRight": "5px",
                            "borderRadius": "2px",
                            "verticalAlign": "middle",
                            "background":[
                                "#2185DF",
                                "-webkit-linear-gradient(top, #238AE7 0%, #1F81D9 100%)",
                                "-moz-linear-gradient(top, #238AE7 0%, #1F81D9 100%)",
                                "-o-linear-gradient(top, #238AE7 0%, #1F81D9 100%)",
                                "linear-gradient(top, #238AE7 0%, #1F81D9 100%)"
                            ],
                            "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#238AE7', endColorstr='#1F81D9',GradientType=0)"
                        }
                    }
                }
                runDialog=new Dialog(option,flag);
                runDialog._open(flag);  
            }else{
              $(".message").text(message);
              runDialog._open(flag);
            }
            if(typeof(arguments[2])=="function"){
                arguments[2]();
            }
            if(arguments[3]!=undefined){
                $(".sure").on("click",arguments[3].sure);
                $(".cancel").on("click",arguments[3].cancel);
            }else if(typeof(arguments[2])=="object"){
                $(".sure").on("click",arguments[2].sure);
                $(".cancel").on("click",arguments[2].cancel);
            }
        },
        fD_confirm_close:function(flag){
           runDialog._close(flag);
          $(".sure,.cancel").unbind( "click" );
        },
		fDOpen:function(flag){
			runDialog._open(flag);
		},
		fDClose:function(flag){
			runDialog._close(flag);
		}
	});
})(jQuery)