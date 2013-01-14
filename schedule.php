<?php $bodyId="logistics"; ?>

<?php include 'includes/header.php'; ?>

<div id="content">
	<div class="wrapper">
		<div class="events">
			<div class="rsvp">
				<h2>Rehersal Block Party</h2>
				<p>May 3rd, 2013</p>
				<p>5:00PM to 8:30PM</p>
			</div>
			<div class="details">
				<h2>Overview</h2>
				<p>Come on by for some food and get to know new faces before the wedding. We will provide the food and festivities and feel free to bring along something to drink. Please in your RSVP lets us know if you are attending.</p>
				<h2>Attire</h2>
				<p>Casual and comfortable</p>
				<h2>Where</h2>
				<p><strong>Matt &amp; Heather's Block</strong></p>
				<p class="address">520 S Durham St (10 minute walk from the Marriott)</p>
				<div id="homeMap" style="width:295px; height:400px"></div>
			</div>
		</div>
		<div class="events">
			<div class="rsvp">
				<h2>The Wedding</h2>
				<p>May 4th, 2013</p>
				<p>3:30PM to 11:00PM</p>
			</div>
			<div class="details">
				<h2>Overview</h2>
				<p>The wedding and ceremony will be located at the 2640 space, an eclectic aged church. We will have shuttles available throughout the evening in case you prefer to leave before your shuttle time. Appetizers and dinner will be prepared by our friend and talented craftsman Joe Edwardsen of <a href="http://joesquared.com/">Joe Squared</a> and wine and beer will be served, so bring your dancing shoes and an appetite! Make sure to note any dietary needs in your RSVP and we will aim to accommodate them.</p>
				<h2>Attire</h2>
				<p>Attire Hipster formal - i.e. long dresses, short dresses, suits, ties or bow-ties, everything is welcome</p>
				<h2>Where</h2>
				<p><strong>2640 Space</strong></p>
				<p class="address">2640 St Paul Street, Baltimore, MD</p>
				<div id="redEmmas" style="width:295px; height:400px"></div>
			</div>
		</div>
	</div>
</div>

<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyA1i6hadNb8ipKvKNNghLXWR5HCFFoVszk&sensor=false"></script>
<script type="text/javascript">

  function initialize() {

    var redEmmasLatLng   = new google.maps.LatLng(39.320451, -76.616003);

    var redEmmasMapOptions = {
	    center: 			redEmmasLatLng,
	    zoom: 				12,
		disableDefaultUI:   true,
		scrollwheel:        false,
		zoomControl:        true,
		zoomControlOptions: {
		  style: google.maps.ZoomControlStyle.SMALL
		},
	    mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var redEmmasMap = new google.maps.Map(document.getElementById("redEmmas"),
        redEmmasMapOptions);

	var redEmmasMarker = new google.maps.Marker({
		position:  redEmmasLatLng,
		map:       redEmmasMap,
		title:     "The 2640 Space"
	});

    var homeLatLng   = new google.maps.LatLng(39.2851709, -76.5907351);

    var homeMapOptions = {
	    center: 			homeLatLng,
	    zoom: 				12,
		disableDefaultUI:   true,
		scrollwheel:        false,
		zoomControl:        true,
		zoomControlOptions: {
		  style: google.maps.ZoomControlStyle.SMALL
		},
	    mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var homeMap = new google.maps.Map(document.getElementById("homeMap"),
        redEmmasMapOptions);

	var homeMarker = new google.maps.Marker({
		position:  homeLatLng,
		map:       homeMap,
		title:     "Matt and Heathers"
	});

  }
  $(function () {
  	initialize();
  });
</script>

<?php include 'includes/footer.php'; ?>