/**
* Created by pimah on 24.04.2018.
*/

 	var confuse = [];
	var coords = [];
	var start = [];
	var lerg = [];


	function getDistance (lat1,lon1,lat2,lon2) {
	  	var R = 6371; // Radius of the earth in km
	  	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	  	var dLon = deg2rad(lon2-lon1);
	  	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
	  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	  	var d = R * c * 1000; // Distance in m
	  	return d;
	}

	function deg2rad (deg) {
	 	return deg * (Math.PI/180);
	}

	// branch and bound method
	function tree_method (leng) {
		var value = [];
		var start_length = leng.length; //При работе алгоритма длинна изначальной матрицы сокращается
		var start_value = true;
		var start_index = 0; //Индекс, откуда начинается построение маршрута алгоритмом

		while (value.length < start_length - 1) {
			var di = []; //Массив минимумов по оси X
			var dj = []; //Массив минимумов по оси Y
			var min = []; //Массив для записи нулевых значений с их весом
			var minIndex; //Переменная для поиска минимального значения из min
			var started = false; //Переменная для фиксации начальной точки
			var dump = [];

			/**
			** Создание копии матрицы длин маршрутов, для проведения операций
			*/
			for (var d = 0; d < leng.length; d++) {
				if (typeof(leng[d]) != 'undefined') {
					dump[d] = [];
					dump[d] = leng[d].slice();
				}
			}

			/**
			**		ПОИСК МИНИМУМА ПО СТРОКАМ
			*/
			for (var i = 0; i < leng.length; i++) {
				di[i] = 1000000000;

				for (var j = 0; j < leng.length; j++) {
					if (typeof(leng[i]) != 'undefined' && typeof(leng[i][j]) != 'undefined' && (di[i] > leng[i][j] || typeof di[i] == 'undefined')) di[i] = leng[i][j];
				}
			}

			/**
			**		ВЫЧИТАНИЕ МИНИМУМА ПО СТРОКАМ ИЗ МАТРИЦЫ
			*/
			for (var i = 0; i < leng.length; i++) {
				for (var j = 0; j < leng.length; j++) {
					if (typeof(dump[i]) != 'undefined' && typeof(dump[i][j]) != 'undefined') {
						dump[i][j] = dump[i][j] - di[i];
						if (dump[i][j] < 0) dump[i][j] = 0;
					}
				}
			}


			/**
			**		ПОИСК МИНИМУМА ПО СТОЛБЦАМ
			*/
			for (var i = 0; i < leng.length; i++) {
				dj[i] = 1000000000;

				for (var j = 0; j < leng.length; j++) {
					if (typeof(leng[j]) != 'undefined' && typeof(leng[j][i]) != 'undefined' && (dj[i] > leng[j][i] || typeof dj[i] == 'undefined')) dj[i] = leng[j][i];
				}
			}

			/**
			**		ВЫЧИТАНИЕ МИНИМУМА ПО СТОЛБЦАМ ИЗ МАТРИЦЫ
			*/
			for (var i = 0; i < leng.length; i++) {
				for (var j = 0; j < leng.length; j++) {
					if (typeof(dump[j]) != 'undefined' && typeof(dump[j][i]) != 'undefined') {
						dump[j][i] = dump[j][i] - dj[i];
						if (dump[j][i] < 0) dump[j][i] = 0;
					}
				}
			}

			/**
			**		НАХОЖДЕНИЕ НУЛЕВЫХ ЗНАЧЕНИЙ В МАТРИЦЕ С ИХ ОЦЕНКОЙ
			*/
			for (var i = 0; i < leng.length; i++) {
				for (var j = 0; j < leng.length; j++) {
					if (typeof(dump[i]) != 'undefined' && typeof(dump[i][j]) != 'undefined' && dump[i][j] == 0 && confuse[i] < 2 && confuse[j] < 2) {
						var x = 100000000, y = 100000000, sum = 0;
						for (var k = 0; k < leng.length; k++) {
							if (typeof(dump[i]) != 'undefined' && typeof(dump[i][k]) != 'undefined' && dump[i][k] < y && k != i) y = dump[i][k];
							if (typeof(dump[k]) != 'undefined' && typeof(dump[k][j]) != 'undefined' && dump[k][j] < x && k != j) x = dump[k][j];
						}
						min.push([(x + y), i, j]); //Запись нулевых ячеек с их оценкой, [вес, x, y]
					}
				}
			}

			/**
			**		НАХОЖДЕНИЕ МИНИМУМА ПО ОЦЕНКАМ С ОТСЕЧЕНИЕМ ПОВТОРЕНИЯ ОДНОГО ИНДЕКСА БОЛЕЕ 2 РАЗ
			*/

			for (var i = 0; i < min.length; i++) {
				if (started && min[minIndex][0] > min[i][0] && confuse[min[i][1]] < 2 && confuse[min[i][2]] < 2) {
					minIndex = i;
				} else if (confuse[min[i][1]] < 2 && confuse[min[i][2]] < 2 && !started) {
					minIndex = i;

					started = true;
				}
			}

			/**
			**		ДОБАВЛЯЕМ В РЕЗУЛЬТАТ МАРШРУТ С МИНИМАЛЬНОЙ ОЦЕНКОЙ + ОБЪЕДИНЕНИЕ ПЕРВОГО И ПОСЛЕДНЕГО ЭЛЕМЕНТА МАРШРУТА
			*/

			if (value.length == (start_length - 2)) {
				var last_index = 0;
				for (var k = 0; k < confuse.length; k++) {
					if (confuse[k] < 2) {
						last_index = k;
					}
				}

				confuse[last_index]++;
				value.push([start_index, last_index]);
			} else if (min.length > 0) {
				value.push([min[minIndex][1], min[minIndex][2]]);

				confuse[min[minIndex][1]]++;
				confuse[min[minIndex][2]]++;

				if (leng.indexOf(min[minIndex][2]) != -1) {
					leng[min[minIndex][2], min[minIndex][1]] = 100000000;
					leng[min[minIndex][1], min[minIndex][2]] = 100000000;
				}

				/**
				**		УДАЛЕНИЕ ЗНАЧЕНИЕ НА ПЕРЕКРЕСТЬЕ
				*/

				for (var h = 0; h < leng.length; h++) {
					//delete leng[h][min[minIndex][1]];
					//delete leng[min[minIndex][2]];

					if (typeof(leng[h]) != 'undefined' && typeof(leng[h][min[minIndex][2]]) != 'undefined') delete leng[h][min[minIndex][2]];
				}
				delete leng[min[minIndex][1]];

				/**		КОНЕЦ
				*/

				if (start_value) { // Первый элемент помечается как тот, к которому нельзя привязываться
					confuse[min[minIndex][1]]++;
					start_index = min[minIndex][1];
					start_value = false;
				}
			}

			//Исключение дуг по 3 точкам
			/**
			var last = value.length - 1;
			if (value.length > 1) {
				for (var i = 0; i < value.length - 1; i++) {
					if (value[i][0] == value[last][0]) {
						//***********************
						leng[value[i][1]][value[last][1]] = 1000000000;
					} else if (value[i][1] == value[last][0]) {
						//***********************
						leng[value[i][0]][value[last][1]] = 1000000000;
					} else if (value[i][0] == value[last][1]) {
						//***********************
						leng[value[i][1]][value[last][0]] = 1000000000;
					} else if (value[i][1] == value[last][1]) {
						//***********************
						leng[value[i][0]][value[last][0]] = 1000000000;
					}
				}
			}
			**/
		}

		var full = []; //Массив конечных значений
		var control = 0; //Счётчик для проверки на "узлы"
		full.push(start[0]); //Запись 1 элемента как старта маршрута
		next = start[0]; //Запись первого
		before = '';

		/**
		**		СБОРКА МАРШРУТА
		*/
		while (full.length < start.length && control < 5) {
			control++;
			for (var i = 0; i < value.length; i++) {
				if (start[value[i][0]] == next && start[value[i][1]] != before) {
					full.push(start[value[i][1]]);
					before = start[value[i][0]];
					next = start[value[i][1]];
					value.splice(i, i + 1);

					control = 0;
				} else if (start[value[i][1]] == next && start[value[i][0]] != before) {
					full.push(start[value[i][0]]);
					before = start[value[i][1]];
					next = start[value[i][0]];
					value.splice(i, i + 1);

					control = 0;
				}

				if (control == 2) { //Поиск узлов и нахождение ближайшего соседа
					var minInConnect = 10000000;
					var idConnect = 0, pullConnect = 0, notIdConnect = 1;

					/**
					** Зачем это всё?
					** Когда возникают узлы, т.е. маршрут построил кольцо, но не со всеми точками
					** Нужно найти это место и найти к нему "ближайшего соседа"
					** midInConnect тут хранит расстояние до соседа, а остальные переменные
					** индекс в массиве value, куда мы пойдём, и куда нам стоит идти дальше
					*/

					for (var l = 0; l < value.length; l++) {
						if (getDistance(next[0], next[1], start[value[l][0]][0], start[value[l][0]][1]) < minInConnect) {
							idConnect = l;
							pullConnect = 0;
							notIdConnect = 1;
						} else if (getDistance(next[0], next[1], start[value[l][1]][0], start[value[l][1]][1]) < minInConnect) {
							idConnect = l;
							pullConnect = 1;
							notIdConnect = 0;
						}
					}

					full.push(start[value[idConnect][pullConnect]]);
					before = next;
					next = start[value[idConnect][notIdConnect]];
					value.splice(i, 1);
				}
			}

		}

		return full;
	}

	function sortCoords(points) {
    console.log('------------------------------COME');
    console.log(points);

		coords = points;
		start = points;

		if (coords.length < 2) {
			return coords;
		}

		for (var i = 0; i < coords.length; i++) {
			lerg[i] = [];
			for (var j = 0; j < coords.length; j++) {
				lerg[i][j] = getDistance(coords[i][0], coords[i][1], coords[j][0], coords[j][1]);
				if (lerg[i][j] == 0) lerg[i][j] = 100000000;
			}
		}

		confuse.length = 0;

		for (var i = 0; i < points.length; i++) {
			confuse[i] = 0;
		}

		fine = tree_method(lerg);
    console.log('--------------------------------EXIST');
    console.log(fine);

		onfuse = [];
		coords = [];
		start = [];
		lerg = [];

		return fine;
	}

	function glueCoords(point, points_s) {
		var minCoordId = 0;
		var min_leng = 1000000000;
		var finish = [];

		for (var i = 0; i < points_s.length; i++) {
			if (getDistance(points_s[i][0], points_s[i][1], point[0], point[1]) < min_leng) {
				minCoordId = i;
				min_leng = getDistance(points_s[i][0], points_s[i][1], point[0], point[1]);
			}
		}

		for (var i = minCoordId; i < points_s; i++) {
			finish.push(points_s[i]);
		}

		for (var i = 0; i < minCoordId; i++) {
			finish.push(points_s[i]);
		}

		return finish;
	}
