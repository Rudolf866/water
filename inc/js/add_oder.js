/**
 * Created by Teo on 08.08.2016.
 */
$(function() {
    $("#date").datepicker();
    $("#date").datepicker( "option", "dateFormat", "dd/mm/yy" );
    $("#date").val("<?php if(date('N',time()+86400)==7){ echo date('d/m/Y',time()+86400*2); }else{ echo date('d/m/Y',time()+86400); } ?>");
    $("#status").change(function() {
        if(this.value=='Отмена'){
            var text = document.createElement('textarea');
            text.id = "reason";
            text.className = "reason";
            text.name = "reason";
            text.placeholder = "Причина отмены";
            $("#reason_d").append(text);
        }else{
            $("#reason").remove();
        }
    });

    $("#client_num").on('keyup', function () {
        var $item = $(this),
            value = $item.val();
        $.ajax({
            type: "POST",
            data: {client_num_l:value},
            url: "/iwaterTest/backend.php",
            success: function(req){
                request(req, 'list1');
            }
        });
    });

    $("#client_num").on('select', function () {
        var val = document.getElementById("client_num").value;
        var opts = document.getElementById('list1').childNodes;
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].value === val) {
                //alert(opts[i].value);
                $.ajax({
                    type: "POST",
                    data: {client_num_s:opts[i].value},
                    url: "/iwaterTest/backend.php",
                    success: function(data){
                        insert_data(data, 'list1');
                    }
                });
                break;
            }
        }
    });

    $("#name").on('keyup', function () {
        var $item = $(this),
            value = $item.val();
        $.ajax({
            type: "POST",
            data: {name_l:value},
            url: "/iwaterTest/backend.php",
            success: function(req){
                request(req, 'list2');
            }
        });
    });

    $("#name").on('select', function () {
        var val = document.getElementById("name").value;
        var opts = document.getElementById('list2').childNodes;
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].value === val) {
                //alert(opts[i].value);
                $.ajax({
                    type: "POST",
                    data: {name_s:opts[i].value},
                    url: "/iwaterTest/backend.php",
                    success: function(data){
                        insert_data(data, 'list2');
                    }
                });
                break;
            }
        }
    });

    $("#address").on('keyup', function () {
        var $item = $(this),
            value = $item.val();
        $.ajax({
            type: "POST",
            data: {address_l:value},
            url: "/iwaterTest/backend.php",
            success: function(req){
                request(req, 'list3');
            }
        });
    });

    $("#address").on('select', function () {
        var val = document.getElementById("address").value;
        var opts = document.getElementById('list3').childNodes;
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].value === val) {
                //alert(opts[i].value);
                $.ajax({
                    type: "POST",
                    data: {address_s:opts[i].value},
                    url: "/iwaterTest/backend.php",
                    success: function(data){
                        insert_data(data, 'list3');
                    }
                });
                break;
            }
        }
    });
    function request(req, list){
        document.getElementById(list).innerHTML = '';
        var i=0;
        var list_arr=[];
        var rows = req.getElementsByTagName('rows')[0];
        l=rows.getElementsByTagName('row').length;
        while(i<l){
            var request = rows.getElementsByTagName('row')[i];
            list_arr[i] = request.getElementsByTagName("cell")[0].childNodes[0].nodeValue;
            i++;
        }
        $.each(list_arr, function(key, value) {
            $('#'+list)
                .append($("<option></option>")
                    .attr("value",value));
        });
    }

    function insert_data(data, list_id){
        var i=0;
        var rows = data.getElementsByTagName('rows')[0];
        l=rows.getElementsByTagName('row').length;
        while(i<l){
            var request = rows.getElementsByTagName('row')[i];
            if(list_id=='list1'){
                document.getElementById("name").value=request.getElementsByTagName("cell")[0].childNodes[0].nodeValue;
                document.getElementById("address").value=request.getElementsByTagName("cell")[1].childNodes[0].nodeValue;
            }
            if(list_id=='list2'){
                document.getElementById("client_num").value=request.getElementsByTagName("cell")[0].childNodes[0].nodeValue;
                document.getElementById("address").value=request.getElementsByTagName("cell")[1].childNodes[0].nodeValue;
            }
            if(list_id=='list3'){
                document.getElementById("name").value=request.getElementsByTagName("cell")[0].childNodes[0].nodeValue;
                document.getElementById("client_num").value=request.getElementsByTagName("cell")[1].childNodes[0].nodeValue;
            }
            i++;
        }
    }


});
