(function(){
	var $rates = [ /* set your rates here */
			{ 'Off' : 0.065 },
			{ 'Mid' : 0.094 },
			{ 'On' : 0.132 }
		],
		$holidays = [ /* set your holidays here [month,day] */
			[3,30], [5,21], [7,2], [8,6], [9,3], [10,8], [12,25], [12,26]
		],
		$seasons = {
			"summer" : [5,1],
			"winter" : [11,1]
		},
		$peaksfr = ['pÃƒÂ©riode creuse','pÃƒÂ©riode mÃƒÂ©diane','pÃƒÂ©riode de pointe'],
		$peakColors = [
			{ 'background-color' : '#48a942', 'text-color' : '#48a942' },
			{ 'background-color' : '#F8971D', 'text-color' : '#F8971D' },
			{ 'background-color' : '#F53945', 'text-color' : '#F53945' }
		],
		$usagePatterns = { /* set your tou usage pattern */
			"summer" : [
				'Off','Off','Off','Off','Off','Off','Off',
				'Mid','Mid','Mid','Mid',
				'On','On','On','On','On','On',
				'Mid','Mid',
				'Off','Off','Off','Off','Off'
			],
			"winter" : [
				'Off','Off','Off','Off','Off','Off','Off',
				'On','On','On','On',
				'Mid','Mid','Mid','Mid','Mid','Mid',
				'On','On',
				'Off','Off','Off','Off','Off'
			]
		},
		$weekdays = [],
		$setpeaks = [],
		$container = false,
		/* functions */
		$season = function(){
			var $s = ''; 
				$date = new Date(),
				$day = $date.getDate(),
				$month = ($date.getMonth() + 1);
			// start with summer
			if( $month >= $seasons['summer'][0] ){
				$s = "summer";
			}
			if( $month >= $seasons['winter'][0] || $month < $seasons['summer'][0] ){
				$s = "winter";
			}
			return $s;
		},
		$isWeekend = function(){
			var $w;
			// check for weekend
			$w = ([0,6].indexOf(new Date().getDay()) != -1);
			// check for holiday
			$w = $checkfordate($holidays, $w);
			return $w;
		},
		$checkfordate = function($d, $c){
			var $check = $c,
				$date = new Date(),
				$day = $date.getDate(),
				$month = ($date.getMonth() + 1);
			for(var $q=0; $q<$d.length; $q++ ){
				if( $d[$q][0] == $month && $d[$q][1] == $day ){
					$check = true;
				}
			}
			return $check;
		},
		$fixhour = function($h){
			$h = $h >= 12 ? $h - 12 : $h;
			$h = $h == 0 ? 12 : $h;
			return $h;
		},
		$getrate = function($t){
			for( var $r=0; $r<$rates.length; $r++ ){
				if($rates[$r][$t]){
					return $rates[$r][$t];
				}
			}
		},
		$getpeak = function($tr){
			for( var $r=0; $r<$rates.length; $r++ ){
				for(var $q in $rates[$r]){
					if($rates[$r][$q] == $tr){
						return $q;
					}
				}
			}
		},
		$getindexfrompeak = function($t){
			for( var $r=0; $r<$rates.length; $r++ ){
				if($rates[$r][$t]){
					return $r;
				}
			}
		},
		$getindexfromrate = function($tr){
			for( var $r=0; $r<$rates.length; $r++ ){
				for(var $q in $rates[$r]){
					if($rates[$r][$q] == $tr){
						return $r;
					}
				}
			}
		},
		$getnexthour = function($hourindex, $weekdays, $current){
			var $nexthourindex = 0;
			for( var $q=$hourindex; $q<$weekdays.length; $q++){
				// get next hour
				if($weekdays[$q] != $current){
					$nexthourindex = $q;
					break;
				}
			}
			return $nexthourindex;
		},
		$returnToU = function(){
			/* hour index */
			var $date = new Date(),
				$hourindex = $date.getHours(),
				$current = $weekdays[$hourindex],
				$peakclass = $peakColors[$getindexfromrate($current)],
				$peakname = $rates[$getindexfromrate($current)],
				$nexthourindex = $getnexthour($hourindex, $weekdays, $current),
				$nexthour = 0;
			if($nexthourindex){ /* we found the next hour, lets move on */
				$nexthour = $weekdays[$nexthourindex];
			}else{ /* lets start from 0 and try again */
				$nexthourindex = $getnexthour(0, $weekdays, $current);
				$nexthour = $weekdays[$nexthourindex];
			}
			var $nh = $nexthourindex > 12 ? $nexthourindex - 12 : $nexthourindex,
				$ampm = $hourindex >= 12 ? 'p.m.' : 'a.m.',
				$nampm = $nexthourindex >= 12 ? 'p.m.' : 'a.m.',
				$nextpeakclass = $peakColors[$getindexfromrate($nexthour)];
			return {
				'current' : $current,
				'peakname' : $peakname,
				'peakclass' : $peakclass,
				'nextpeak' : $nexthour,
				'nextpeakclass' : $nextpeakclass,
				'nhindex' : $nexthourindex,
				'nh' : $fixhour($nh),
				'ampm' : $ampm,
				'nampm' : $nampm,
				'hour' : $fixhour($hourindex)
			};
		},
		$output = function(){
			/* loops */
			var $pattern;
			for(var $w=0; $w<$usagePatterns[$season()].length; $w++){
				$pattern = !$isWeekend() ? $usagePatterns[$season()][$w] : 'Off';
				$weekdays[$w] = $getrate($pattern);
			}
			var $ctou = $returnToU(),
			$html = '<div class="ctu-container">' + 
			'<span class="ctu-title">Current Time-of-Use Price</span>' + 
			'<div class="ctu-rates">' + 
			'<div class="ctu-current">' + 
			'<div class="ctu-info" style="background-color:' + $ctou['peakclass']['background-color'] + '; border-color:' + $ctou['peakclass']['background-color'] + ';">' + 
			'<span class="ctu-peak">' + $getpeak($ctou['current']) + '-Peak</span>' + 
			'<span class="ctu-peak-info"><strong>' + (($ctou['current'] * 100)).toFixed(1) + ' Â¢/kWh</strong> for ' + $ctou['hour'] + ' ' + $ctou['ampm'] + '</span>' + 
			'</div>' + 
			'</div>' + 
			'<div class="ctu-next">' + 
			'<div class="ctu-info" style="border-color:' + $ctou['nextpeakclass']['background-color'] + ';">' + 
			'<span class="ctu-peak">' + $getpeak($ctou['nextpeak']) + '-Peak Starts</span>' + 
			'<span class="ctu-peak-time">' + $ctou['nh'] + ' ' + $ctou['nampm'] + '</span>' + 
			'</div>' + 
			'</div>' + 
			'</div>' + 
			'<span class="ctu-credit"><strong>Digital presentation by:</strong>&nbsp;&nbsp;&nbsp;&nbsp;<a href="http://www.ieso.ca" target="_blank">www.ieso.ca</a></span>' + 
			'</div>';
			$container = document.getElementById('ctu-container');
			$container.innerHTML = $html;
		},
		$resize = function(){
			$container = document.getElementById('ctu-container');
			if($container.offsetWidth >= 768){ /* move to two column */
				$container.classList.add('ctu-two-column');
			}else{
				$container.classList.remove('ctu-two-column');
			}
		};
		/* start */

		if(!$container){
			
			document.write('<link href="https://fonts.googleapis.com/css?family=Titillium+Web" rel="stylesheet"><link href="http://www.ieso.ca/-/media/Files/IESO/tou/ieso-tou-css.css" rel="stylesheet">');

			var el = document.createElement("div");
			el.setAttribute("id", "ctu-container");
			document.body.appendChild(el);

		}

		$output();
		$resize();
		/* set for refresh */
		var now = new Date();
		var delay = 60 * 60 * 1000;
		var start = delay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();
		var test = 500;
		$refresh_output = function(){
			$output();
			setTimeout( $refresh_output, delay );
		}
		setTimeout( $refresh_output, start );
		/* on page resize */
		window.onresize = function(event) {
			// check container size
			$resize();
		};
})();