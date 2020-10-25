/**
 * Created by Teo on 07.11.2016.
 */
function create_route(map, collection,routes, driver){
    var length = collection.getLength();
    var num_near =11;
    var num_matrix = 4;
    var max_longitude = 0.03;
    var firstPoint = [59.912409, 30.266227]; // Степана Разина 9
    var points = [];
    var current_coordinates = {};
    var current_longitudes = [];
    var last_point_in_path = [];
    var k1 = 0, colors = []; //флаг цвета...из-за функции then, строчка 293
    var red = 1,green = 0, blue = 0;
    var confirm_counter = true;

    main();
    function main()
    {
        var i = 1;

        var first_point = new ymaps.Placemark([59.912409, 30.266227],
            {
                defaultColor: "red"
            },
            {
                iconColor: "red"
            });

        current_coordinates[0] = first_point.geometry._coordinates;
        current_coordinates[0][2] = first_point.properties._data.defaultColor;
        current_coordinates[0][3] = false;
        current_coordinates[0][4] = false;
        current_coordinates[0][5] = 0;
        current_coordinates[0][6] = 0;
        var offset ;

        collection.each(function (obj) {
            var last = points[points.length - 1];
            current_coordinates[i] = obj.geometry._coordinates;
            current_coordinates[i][2] = obj.properties._data.defaultColor;
            if( current_coordinates[i][2] == "white"){
                alert('Есть ошибочные точки ("белые"). Сформировать маршрут не возможно');
                throw new Error('Есть ошибочные точки ("белые"). Сформировать маршрут не возможно');
                return 0;
            }
            current_coordinates[i][3] = false;
            current_coordinates[i][4] = false;
            current_coordinates[i][5] = obj.properties._data.excelNum;
            current_coordinates[i][6] = obj.properties._data.order_id;
            if(current_coordinates[i][2] == "red"){ red++ }
            if(current_coordinates[i][2] == "green"){ green++}
            if(current_coordinates[i][2] == "blue"){ blue++}
            if(current_coordinates[i][2] == "orange"){
                current_coordinates[i][4] = i;
                current_coordinates[i][2] = "red";

                i++;
                current_coordinates[i] = [];
                current_coordinates[i][0] = current_coordinates[i-1][0];
                current_coordinates[i][1] = current_coordinates[i-1][1];
                current_coordinates[i][2] = "green";
                current_coordinates[i][3] = false;
                current_coordinates[i][4] = i-1;
                current_coordinates[i][5] = obj.properties._data.excelNum;
                current_coordinates[i][6] = obj.properties._data.order_id;
            }

            if(current_coordinates[i][2] == "violet"){
                current_coordinates[i][4] = i;
                current_coordinates[i][2] = "green";

                i++;
                current_coordinates[i] = [];
                current_coordinates[i][0] = current_coordinates[i-1][0];
                current_coordinates[i][1] = current_coordinates[i-1][1];
                current_coordinates[i][2] = "blue";
                current_coordinates[i][3] = false;
                current_coordinates[i][4] = i-1;
                current_coordinates[i][5] = obj.properties._data.excelNum;
                current_coordinates[i][6] = obj.properties._data.order_id;
            }

            if(current_coordinates[i][2] == "darkgreen"){
                current_coordinates[i][4] = i;
                current_coordinates[i][2] = "red";

                i++;
                current_coordinates[i] = [];
                current_coordinates[i][0] = current_coordinates[i-1][0];
                current_coordinates[i][1] = current_coordinates[i-1][1];
                current_coordinates[i][2] = "green";
                current_coordinates[i][3] = false;
                current_coordinates[i][4] = i-1;
                current_coordinates[i][5] = obj.properties._data.excelNum;
                current_coordinates[i][6] = obj.properties._data.order_id;

                i++;
                current_coordinates[i] = [];
                current_coordinates[i][0] = current_coordinates[i-1][0];
                current_coordinates[i][1] = current_coordinates[i-1][1];
                current_coordinates[i][2] = "blue";
                current_coordinates[i][3] = false;
                current_coordinates[i][4] = i-2;
                current_coordinates[i][5] = obj.properties._data.excelNum;
                current_coordinates[i][6] = obj.properties._data.order_id;
            }


            offset = getOffsetByTime(firstPoint[2],current_coordinates[i][2] );
            current_longitudes[i] = Math.sqrt(Math.pow(current_coordinates[i][0] - firstPoint[0], 2) + Math.pow(current_coordinates[i][1] - firstPoint[1], 2));
            current_longitudes[i]+= offset;
            i++

        });
        var coords_clone = Object.assign({}, current_coordinates);
        last_point_in_path = coords_clone[0];

        var cc_length = Object.keys(coords_clone).length;
        var j =0;
        // for(var j =0;j<cc_length-1;j++){
        var interval = setInterval(function() {
            if (j==cc_length-1) {
                draw_route(map, points);
                compare_nums_and_orders(collection, points);
                echo_text_draw(points);
                if(driver != "" && confirm_counter) {
                    if (confirm("Вы хотите изменить нумерацию заказов в порядке маршурта?")) {
                        change_numeration(false);
                        // numeric_button.state.set('selected', true);
                    }
                    confirm_counter = false;
                }
                send_route_to_DB(points);
                clearInterval(interval);
                return;
            }
                if(coords_clone[j][3]==false) {
                    // for(var k =0;k<current_coordinates-1;k++) {
                    //     current_longitudes[k] = Math.sqrt(Math.pow(current_coordinates[k][0] - current_coordinates[j][0], 2) + Math.pow(current_coordinates[k][1] - current_coordinates[j][1], 2));
                    // }
                    current_coordinates = optimizeCoords(current_coordinates, j);
                    current_longitudes = countLongs(current_coordinates, last_point_in_path);

                    current_longitudes = SortWithCurrentCoordinates(current_longitudes);
                    var points_to_matrix = [];
                    if(Object.keys(current_coordinates).length<num_near){
                        num_near = Object.keys(current_coordinates).length;
                    }
                    for(var k =0;k<num_near;k++) {
                        points_to_matrix.push(current_coordinates[k]);
                    }
                    var matrix = create_matrix(points_to_matrix);
                    var path = algorytm_Prime(matrix);
                    if(path.length<num_matrix){
                        num_matrix = path.length;
                    }
                    var child1, child2;
                    for(var k =0;k<num_matrix;k++) {
                        coords_clone[path[k]][3] = true;
                        points.push(current_coordinates[path[k]]);
                        last_point_in_path = current_coordinates[path[k]];
                        // current_coordinates.splice(path[k],1);
                        delete current_coordinates[path[k]];

                    }


                }
            j++;
            },10);
    }

    function send_route_to_DB(points){
        var a = 1;
        $.ajax({
            url: "/iwaterTest/backend.php",
            type: "POST",
            dataType: "json",
            data: {
                add_route_to_DB: "",
                data: points,
                map: location.toString()
            },
            success: function (data) {
            }
        });
    }

    function optimizeCoords(coords, j){
        var k =0, new_arr = {};
        for(var index in coords) {
            if(coords.hasOwnProperty(index)) {
                if (typeof  coords[index] != "undefined") {
                    new_arr[k] = coords[index];
                } else {
                    delete coords[index];
                }
                k++;
            }
        };
        return new_arr;
    }
//     function  countLongs(coords, coords_clone, j){
//         var k =0, new_arr = {}, offset = 0;
//         for(var index in coords) {
//             offset = getOffsetByTime(coords[index][2],coords_clone[j][2] );
//             new_arr[k] = Math.sqrt(Math.pow(coords[index][0] - coords_clone[j][0], 2) + Math.pow(coords[index][1] - coords_clone[j][1], 2));
//             new_arr[k] += offset;
//             k++;
//         };
//         return new_arr;
// }
    //Старый код с неверным формированием начальной точки в каждой матрице
        function  countLongs(coords, last_coord){
        var k =0, new_arr = {}, offset = 0;
        for(var index in coords) {
            offset = getOffsetByTime(coords[index][2],last_coord[2] );
            new_arr[k] = Math.sqrt(Math.pow(coords[index][0] - last_coord[0], 2) + Math.pow(coords[index][1] - last_coord[1], 2));
            new_arr[k] += offset;
            k++;
        };
        return new_arr;
}


    function SortWithCurrentCoordinates(A)
    {
        var n = Object.keys(A).length, Count = [], B = [];
        var  new_coord =   Object.assign({}, current_coordinates);
        for (var i = 0; i < n; i++) Count[ i ] = 0;
            for (var i = 0; i < n-1; i++)
            { for (var j = i+1; j < n; j++)
            { if (A[ i ] < A[j]) Count[j]++;
            else Count[ i ]++;
            }
        }
        for (var i = 0; i < n; i++){
            B[Count[ i ]] = A[ i ];
            current_coordinates[ Count[ i ]] = new_coord [ i ]
        }
        return B;
    }

    function algorytm_Prime(matrix) {
        var visited = [];
        visited= [0,0,0,0,0,0,0,0,0,0,0,0,0];
        visited[0] = 0;
        var n = matrix.length;
        var ne = 0, a, b, u, v, i, j, min;
        var path = [], path_index = 0;
        var mincost = 0;
        var outs;
        a = u = 0;
        b = v = 0;

        while (ne < n) {
            for (i = 0, min = 99999999; i <= n-1; i++)
                for (j = 0; j <= n-1; j++)
                    if (matrix[i][j] < min)
                        if (visited[i] != 0) {
                            min = matrix[i][j];
                            a = u = i;
                            b = v = j;

                        }
            if (visited[u] == 0 || visited[v] == 0) {
                path[path_index] = b;
                path_index++;
                //cout<<"\n "<<ne++<<"  "<<a<<"  "<<b<<min; //Можно вывести так
                ne++; //если строчку выше раскомментировать - эту закомментировать
                mincost += min;
                visited[b] = 1;

            }
            matrix[a][b] = matrix[b][a] = 99999999;
        }
        return path;
    }




    function create_matrix(coords){
        var weight = [], offset, long;
        for(var i=0;i<coords.length;i++){
            weight[i] = [];
            for(var j=0;j<coords.length;j++){
                offset = getOffsetByTime(coords[i][2],coords[j][2] );
                long = Math.sqrt(Math.pow(coords[i][0] - coords[j][0], 2) + Math.pow(coords[i][1] - coords[j][1], 2))*1000;
                if(j==0){
                    // Обратная стоймость пути из всех точек в 1, == 99
                    long = 99999999;
                }else if(long == 0){
                    long = 99999999;
                }else {
                    long += offset;
                }

                weight[i][j] =  long;
            }
        }
        return weight;
    }
    function echo_text_draw(points){
        var text = "";
        for(var i = 0; i < points.length; i++)
        {
            if(typeof points[i] != "undefined" )
            {
                text += points[i][5];
                if(i != (points.length - 1))
                    text += " > ";
            }
        }
        $("#text_route").text(text);
    }

    function draw_route(map, coords) {



        var points = [], k=0, obj, colors = [],red_coef, blue_coef, green_coef, coef, delete_points = 0;
        colors=[["red","#ff0000", 0]];
        for(var i=0;i<Object.keys(coords).length;i++){
            if(typeof coords[i] != 'undefined') {
                if (coords[i][4] != false) {
                    for (var j = i + 1, k2 = i+1, leng = coords.length-1; j < leng; j++,k2++) {
                        if (typeof coords[j] != 'undefined' && typeof coords[i] != 'undefined') {
                            // if (coords[i][4] == coords[j][4] || (coords[i][4] == j && coords[j][4] == i)) {
                            if (coords[i][4] == coords[j][4]) {
                                coef = compare_coeficients_for_delete(coords[i][2], i, coords[j][2], j);
                                delete_points++;
                                k2--;
                                delete coords[coef];
                            }
                        }
                    }
                }

                if(typeof coords[i] != 'undefined') {
                    if (colors[colors.length - 1][0] != coords[i][2]) {
                        k++;
                        colors[k] = [];
                        colors[k][0] = coords[i][2];
                        colors[k][1] = toHex(colors[k][0]);
                        colors[k][2] = i;
                    }
                }
            }
        }
        // points.push(firstPoint);
        var current_color = "red";
        points[0]=[];
        k=0;
        for(var i=0;i<Object.keys(coords).length+delete_points;i++) {
            if (typeof coords[i] != 'undefined') {
                obj = {type: 'wayPoint', point: [coords[i][0], coords[i][1]]};
                points[k].push(obj);
                if (current_color != coords[i][2]) {
                    current_color = coords[i][2];
                    k++;
                    points[k] = [];
                    points[k].push(obj);
                }
            }
        }
        for(var i=0;i<colors.length;i++) {
            ymaps.route(points[i], {
                mapStateAutoApply: true,
                avoidTrafficJams: true
            }).then(function (route) {
                {
                    k1++;
                    route.getPaths().options.set({
                        // strokeColor: colors[colors.length-k1][1],
                        strokeColor: "#ff0000",
                        strokeWidth: 5,
                        opacity: 0.8
                    });
                    map.geoObjects.add(route.getPaths());
                }
            });
        }


    }

    function compare_coeficients_for_delete(child1, i , child2, j){
            if(child1=="red"){
                if(child2 == "blue"){
                    red_coef = ((i + 1) / red) / 0.6;
                    green_coef = ((j-red-green)/green)/0.4;
                    if(red_coef < green_coef){
                        red++;
                        return i;
                    }else{
                        blue++;
                        return i;
                    }

                }else {
                    red_coef = ((i + 1) / red) / 0.6;
                    green_coef = ((j - red) / green) / 0.4;
                    if (red_coef < green_coef) {
                        red++;
                        return j;
                    } else {
                        green++;
                        return i;
                    }
                }
            }
        if(child1=="green"){
            red_coef = ((i-red)/green)/0.6;
            green_coef = ((j-red-green)/green)/0.4;
            if(red_coef < green_coef){
                green++;
                return j;
            }else{
                blue++;
                return i;
            }
        }
        if(child1=="blue"){
            red_coef = ((i-red)/green)/0.6;
            green_coef = ((j-red-green)/green)/0.4;
            if(red_coef < green_coef){
                green++;
                return i;
            }else{
                blue++;
                return i;
            }
        }

    }

    function getOffsetByTime(color1, color2){
        var offset;
        switch(color1){
            case "red" :
                switch(color2){
                    case "red" : offset = 0; break;
                    case "green" : offset = 50000;break;
                    case "blue" : offset = 200000;break;
                    case "darkblue" : offset = 200000;break;
                    case "orange" : offset = 0;break;
                    case "violet" : offset = 200000;break;
                    case "darkgreen" : offset = 0;break;
                }
                break;
            case "orange" :
                switch(color2){
                    case "red" : offset = 0; break;
                    case "green" : offset = 0;break;
                    case "darkblue" : offset = 200000;break;
                    case "blue" : offset = 200000;break;
                    case "orange" : offset = 0;break;
                    case "violet" : offset = 200000;break;
                    case "darkgreen" : offset = 0;break;
                }
                break;
            case "green" :
                switch(color2){
                    case "red" : offset = 5000000; break;
                    case "green" : offset = 0;break;
                    case "darkblue" : offset = 5000000;break;
                    case "blue" : offset = 50000;break;
                    case "orange" : offset = 0;break;
                    case "violet" : offset = 0;break;
                    case "darkgreen" : offset = 0;break
                }
                break;
            case "blue" :
                switch(color2){
                    case "red" : offset = 5000000; break;
                    case "green" : offset = 5000000;break;
                    case "blue" : offset = 0;break;
                    case "darkblue" : offset = 50000;break;
                    case "orange" : offset = 5000000;break;
                    case "violet" : offset = 0;break;
                    case "darkgreen" : offset = 100;break
                }
                break;
            case "violet" :
                switch(color2){
                    case "red" : offset = 5000000; break;
                    case "green" : offset = 0;break;
                    case "blue" : offset = 0;break;
                    case "darkblue" : offset = 50000;break;
                    case "orange" : offset = 5000000;break;
                    case "violet" : offset = 0;break;
                    case "darkgreen" : offset = 100;break
                }
                break;
            case "darkgreen" :
                switch(color2){
                    case "red" : offset = 0; break;
                    case "green" : offset = 0;break;
                    case "blue" : offset = 0;break;
                    case "darkblue" : offset = 50000;break;
                    case "orange" : offset = 0;break;
                    case "violet" : offset = 0;break;
                    case "darkgreen" : offset = 0;break
                }
                break;
            case "darkblue" :
                switch(color2){
                    case "red" : offset = 5000000; break;
                    case "green" : offset = 5000000;break;
                    case "blue" : offset = 5000000;break;
                    case "darkblue" : offset = 0;break;
                    case "orange" : offset = 5000000;break;
                    case "violet" : offset = 5000000;break;
                    case "darkgreen" : offset = 5000000;break
                }
                break;

        }
        return offset;
    }

    function toHex(color){
        var hex = "#000000";
        switch (color){
            case "red" :  hex = "#ff0000"; break;
            case "green" :  hex = "#008000";break;
            case "darkgreen" :  hex = "#003000";break;
            case "blue" :  hex = "#4169e1";break;
            case "darkblue" :  hex = "#02055d";break;
            case "orange" :  hex = "#ffa503";break;
            case "violet" :  hex = "#ee82ee";break;
        }
        return hex;
    }
    function compare_nums_and_orders(collection, points) {
        collection.each(function (obj) {
            var excelNum = obj.properties._data.excelNum;
            for (var i = 0,j=0; i < points.length; i++) {
                if (typeof  points[i] != "undefined") {
                    if (excelNum == points[i][5]) {
                        obj.properties._data.mapRouteNum = j;
                    }
                    j++;
                }
            }
        });
    }

}
