function VoteDetail() {
    var obj = this;
    $.getJSON('/ajax/vote/VoteList.ashx', {
        ID: QueryString("id"),
        tag: Math.random(), callback: ""
    }, function (result) {
        if (result != null) {
            var str = "";
            var str1 = "";
            var news = result.rows;
            for (var i = 0; i < news.length; i++) {
                var co = i + 1;
                str += "<li><div class=\"tx\"><img src=\"" + news[i].Images + "\" /></div>";
                str += "<b>" + co + "．" + news[i].Name + "</b><input name=\"a\" class=\"xiala-an\" style=\"width:15px;\" type=\"image\" src=\"images/img_02.jpg\" value=\"" + news[i].VoteID + "\">";
                str += "<span class=\"bt_02\">" + news[i].CompanyNameS + "</span><span class=\"bt_02\">" + news[i].PositionS + "</span>";
                str += "<span class=\"bt_02\">票数：" + news[i].Num + "</span></li>";
                var a = 0;
                if (news[i].Num != 0) {
                    var a = news[i].Num / result.Num;
                    a = a.toFixed(2) * 100;
                }
                var pco = "";
                if (co<10) {
                    pco = "&nbsp;" + co;
                }
                else {
                    pco = co;
                }
                str1 += "<li><div class=\"tp_name\"><b>" + pco + "．" + news[i].Name + "</b></div>";
                str1 += "<div class=\"tp_bfb\"><div class=\"tp_bfb_lb\"><dd style=\"width:" + a + "%\"></dd></div></div>";
                str1 += "<div class=\"tp_gl\">(&nbsp;" + news[i].Num + "&nbsp;)</div></li>";
            }
            $("#str").html(str);
            $("#str1").html(str1);
            $(".tx_list ul li").click(function () {
                var ter = 0;
                if ($(this).children("input[type=image]").attr("src") == "images/img_02.jpg") {
                    $("input[name='a']").each(function () { //由于复选框一般选中的是多个,所以可以循环输出
                        if (this.src.indexOf("images/img_03.jpg") > -1) {
                            ter++;
                        }
                    });
                    if (ter >= 10) {
                        ds.dialog({
                            title: '消息提示',
                            content: '您一次最多能投10票！',
                            onyes: true
                        });
                    }
                    else {
                        $(this).children("input[type=image]").attr("src", "images/img_03.jpg");
                    }
                }
                else {
                    $(this).children("input[type=image]").attr("src", "images/img_02.jpg");
                }
            })
            $(".shaixuan-dh ul li").click(function () { if ($(this).children(".xiala").css("display") == "none") { $(".shaixuan-dh ul .xiala").each(function () { $(this).hide(); }); $(this).children(".xiala").show(); $(".hoverclick").show(); } else { $(".shaixuan-dh ul li .xiala").each(function () { $(this).hide(); }); $(".hoverclick").hide(); } });
            ShowNumValidate2();
        }
        else {
            obj.tipsWindown('提示', 'text:<span class=showBoxMsg>返回数据失败!</span><br /><br /><img src=/manager/images/enter.gif style=cursor:pointer; onClick=closeWin(); />', '200', '100', 'true', '1000', 'true', 'text');
        }
    });
}
VoteDetail();

function VoteAdd() {
   // alert("投票活动已结束！");
    $.ajax({
        async: false //设置成为 同步的  
    })
    var ter = "";
    $("input[name='a']").each(function () { //由于复选框一般选中的是多个,所以可以循环输出
        if (this.src.indexOf("images/img_03.jpg")>-1) {
            ter += "," + this.value;
        }
    });
    if (ter == "") {
        ds.dialog({
            title: '消息提示',
            content: '请选择投票对象！',
            onyes: true
        });
        return false;
    }
    else {
        ter = ter.substring(1);
    }
    if ($("#TxtCodeNumber").val() == "") {
        ds.dialog({
            title: '消息提示',
            content: '请输入验证码！',
            onyes: true,
        });
        return false;
    }

    $.getJSON('/ajax/vote/VoteAdd2.ashx', { ter: ter, Type: 1, Code: $("#TxtCodeNumber").val(), tag: Math.random(), callback: "" }, function (result) {
        if (result != null) {
            if (result.success) {
                ds.dialog({
                    title: '消息提示',
                    content: '谢谢投票！',
                    yesText: '确定',
                    onyes: function () {
                        location.reload();
                    }
                });
                return true;
            }
            else {
                ds.dialog({
                    title: '消息提示',
                    content: result.msg,
                    onyes: true
                });
                return false;
            }
        }
    });
}