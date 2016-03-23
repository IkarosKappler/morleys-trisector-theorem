/**
 * Inspiration:
 *   http://jsfiddle.net/sebastian_derossi/PYxu7/
 *
 * @author  Ikaros Kappler
 * @date    2016-03-12
 * @version 1.0.0
 **/

(function($) {

    $( document ).ready( function() {

	var canvasWidth  = 640;
	var canvasHeight = 480;
	var origin       = { x : canvasWidth/2.0,
			     y : canvasHeight/2.0
			   };

	var tmp = new IKRS.Color();

	var rad2deg = function( r ) {
	    return (r/Math.PI)*180.0;
	};
	
	// A Point class (aka Vector)
	var Point = function(x,y) {
	    this.x = x;
	    this.y = y;
	    
	    this.clone = function() {
		return new Point(this.x, this.y);
	    };
	   	    
	    this.sub = function( p ) {
		return new Point( this.x - p.x,
				  this.y - p.y );
	    };

	    
	    this.rotate = function( center, angle ) {
		// Found at
		//    http://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
		//  function rotate(cx, cy, x, y, angle) {
		//     var radians = (Math.PI / 180) * angle,
		//     cos = Math.cos(radians),
		//     sin = Math.sin(radians),
		//     nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
		//     ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
		//     return [nx, ny];
		// }
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		var nx = (cos * (this.x - center.x)) + (sin * (this.y - center.y)) + center.x;
		var ny = (cos * (this.y - center.y)) - (sin * (this.x - center.x)) + center.y;
		return new Point( nx, ny ); 
	    };

	    /*
	    this.angle = function() {
		var pointAngle = 0.0;
		if( this.x == 0 ) {
		    if( this.y < 0 ) pointAngle = -Math.PI/2.0;
		    else             pointAngle =  Math.PI/2.0; //0.0;
		} else          pointAngle = Math.atan(this.y/this.x);
		
		if( this.x >= 0 )
		    pointAngle = Math.PI+pointAngle;
		
		return pointAngle;
	    };
	    */

	    this.norm = function() {
		return Math.sqrt( this.x*this.x + this.y*this.y );
	    };

	    this.toString = function() {
		return "{ x : " + x + ", y : " + y + " }";
	    };
	};
	/*
	Point.random = function() {
	    return new Point( Math.random(), Math.random() );
	};
	*/
	// A Line class
	var Line = function( a, b ) {
	    this.a = a;
	    this.b = b;
	    
	    this.draw = function( context ) {
		context.beginPath();
		context.moveTo( this.a.x, this.a.y );
		context.lineTo( this.b.x, this.b.y );
		context.closePath();
		context.stroke();
	    };

	    this.length = function() {
		return Math.sqrt( Math.pow(this.b.x-this.a.x,2) + Math.pow(this.b.y-this.a.y,2) );
	    };

	    this.sub = function( point ) {
		return new Line( this.a.sub(point), this.b.sub(point) );
	    };

	    this.normalize = function() {
		return new Line( this.a.clone(),
				 new Point(this.a.x + (this.b.x-this.a.x)/this.length(),
					   this.a.y + (this.b.y-this.a.y)/this.length())
			       );
					   
	    }; 

	    this.scale = function( factor ) {
		return new Line( this.a.clone(),
				 new Point( this.a.x + (this.b.x-this.a.x)*factor,
					    this.a.y + (this.b.y-this.a.y)*factor ) 
			       );
	    };

	    // Get the angle between this and the passed line (in radians)
	    this.angle = function( line ) {
		if( !line )
		    line = new Line( new Point(0,0), new Point(100,0) );
		
		// Compute the angle from x axis and the return the difference :)
		var v0 = this.b.sub( this.a );
		var v1 = line.b.sub( line.a );
		// Thank you, Javascript, for this second atan function. No additional math is needed here!
		// return Math.atan2( v1.x, v1.y ) - Math.atan2( v0.x, v0.y );
		var tmp = Math.atan2( v1.x, v1.y ) - Math.atan2( v0.x, v0.y );
		// The result might be negative, but it's usually nicer to determine angles in positive values only
		// ... ??? !!!
		return tmp;
	    };

	    /**
	     * Get line point at position t in [0 ... 1]:
	     *  [P(0)]=[A]--------------------[P(t)]------[B]=[P(1)]
	     **/
	    this.linePointAt = function( t ) {
		return new Point( this.a.x + (this.b.x-this.a.x)*t,
				  this.a.y + (this.b.y-this.a.y)*t );
	    };
	    
	    // Get the slope of the line.
	    //    http://www.mathopenref.com/coordslope.html
	    /*
	    this.slope = function() {
		//if( this.a.x-this.b.x < 0.001 )
		//    return NaN;
		return (this.a.y-this.b.y) / (this.a.x-this.b.x);
	    };
	    */
	    

	    this.intersection = function( line ) {
		//  http://jsfiddle.net/justin_c_rounds/Gd2S2/
		var denominator = ((line.b.y - line.a.y) * (this.b.x - this.a.x)) - ((line.b.x - line.a.x) * (this.b.y - this.a.y));
		if (denominator == 0) 
		    return null;
		
		var a = this.a.y - line.a.y; 
		var b = this.a.x - line.a.x; 
		var numerator1 = ((line.b.x - line.a.x) * a) - ((line.b.y - line.a.y) * b);
		var numerator2 = ((this.b.x - this.a.x) * a) - ((this.b.y - this.a.y) * b);
		a = numerator1 / denominator; // NaN if parallel lines
		b = numerator2 / denominator;

		// if we cast these lines infinitely in both directions, they intersect here:
		return new Point( this.a.x + (a * (this.b.x - this.a.x)),
				  this.a.y + (a * (this.b.y - this.a.y)) );
	    };

	    this.toString = function() {
		return "{ a : " + this.a.toString() + ", b : " + this.b.toString() + " }";
	    };
	};

	// A Triangle class
	var Triangle = function( a, b, c ) {
	    this.a = a;
	    this.b = b;
	    this.c = c;

	    this.draw = function( context ) {
		new Line(this.a,this.b).draw( context );
		new Line(this.b,this.c).draw( context );
		new Line(this.c,this.a).draw( context );
	    };

	    this.degree = function() {
		// Polyon clockwise/counterclockwise check:
		// Build all SUM( (p[i+1].x-p[i].x) * (p[i+1].y+p[i].y) ) 
		// Found at:
		//    http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
		return ((this.b.x-this.a.x)*(this.b.y+this.a.y) + (this.c.x-this.b.x)*(this.c.y+this.b.y) + (this.a.x-this.c.x)*(this.a.y+this.c.y)>0);
	    };

	    this.getPointNear = function( p, tolerance ) {
		if( this.a.sub(p).norm() <= tolerance ) return this.a;
		if( this.b.sub(p).norm() <= tolerance ) return this.b;
		if( this.c.sub(p).norm() <= tolerance ) return this.c;
		return null;
	    };
	};
	/*
	Triangle.random = function() {
	    return new Triangle( Point.random(), Point.random(), Point.random() );
	};
	*/

	var border = 32;
	var pointA = new Point( border + Math.random()*(canvasWidth-2*border),
				border + Math.random()*(canvasHeight-2*border) );
	var pointB = new Point( border + Math.random()*(canvasWidth-2*border),
				border + Math.random()*(canvasHeight-2*border) );
	var pointC = new Point( border + Math.random()*(canvasWidth-2*border),
				border + Math.random()*(canvasHeight-2*border) );
	var triangle = new Triangle( pointA, pointB, pointC );
	/*
	  var clockwise = (triangle.degree() > 0);
	
	
	var lineAB = new Line( pointA, pointB );
	var lineAC = new Line( pointA, pointC );
	var lineBC = new Line( pointB, pointC );
	var lineCA = new Line( pointC, pointA );
	*/

	
	var canvas = $( "#trisectionCanvas" );
	var context = canvas[0].getContext( "2d" );

	
	var mouseDownPosition      = null;
	var mouseDownTrianglePoint = null;
	var toRelativePosition = function( event ) {
	    var tmp = $( event.target );
	    return new Point( event.clientX - tmp.offset().left + $(window).scrollLeft(), // - _self.options.origin.x,
			      event.clientY - tmp.offset().top + $(window).scrollTop()    // - _self.options.origin.y
			      );
	};

	var mouseDownHandler = function( event ) {
	    var point = toRelativePosition(  event );
	    //console.debug( "point=" + point );
	    mouseDownPosition      = point;
	    mouseDownTrianglePoint = triangle.getPointNear( mouseDownPosition, 10 );
	};
	var mouseUpHandler = function( event ) {
	    mouseDownPosition      = null;
	    mouseDownTrianglePoint = null;
	};
	var mouseMoveHandler = function( event ) {
	    if( !mouseDownTrianglePoint )
		return;	    
	    var point  = toRelativePosition( event );
	    //console.debug( "point=" + point );
	    var amount = point.sub(mouseDownPosition);
	    mouseDownTrianglePoint.x += amount.x;
	    mouseDownTrianglePoint.y += amount.y;
	    mouseDownPosition = point;
	    // redraw
	    draw( context );
	};

	$( document ).on( "mousedown", mouseDownHandler );
	$( document ).on( "mouseup",   mouseUpHandler );
	$( document ).on( "mousemove", mouseMoveHandler );

	var trisectAngle = function( pA, pB, pC ) {
	    var result = {};
	    result.triangle    = new Triangle( pA, pB, pC );
	    result.lineAB      = new Line( pA, pB );
	    result.lineAC      = new Line( pA, pC );
	    result.thetaAB     = result.lineAB.angle();
	    result.thetaAC     = result.lineAC.angle();
	    //result.thetaCAB    = result.thetaAB - result.thetaAC; // result.lineAB.angle( result.lineAC ); 
	    result.thetaCAB    = result.lineAB.angle( result.lineAC ); // = thetaAB - thetaAC
	    result.insideAngle = result.thetaCAB;	    
	    result.clockwise   = (result.triangle.degree() > 0);
	    
	    // Whoooa, this is ugly.
	    if( result.insideAngle < 0 )
		result.insideAngle = 2*Math.PI + result.insideAngle;
	    if( !result.clockwise )
		result.insideAngle = (2*Math.PI - result.insideAngle) * (-1);
	    //if( !result.clockwise )
	//	result.insideAngle *= -1.0;

	    // Scale the rotated lines to the max leg length (looks better)
	    var lineLength  = Math.max( result.lineAB.length(), result.lineAC.length() );
	    var scaleFactor = lineLength/result.lineAB.length();
		
	    result.sectorLines = [ new Line( pA, pB ),
				   new Line( pA, pB.rotate( pA, (result.insideAngle/3.0) ) ).scale(scaleFactor),
				   new Line( pA, pB.rotate( pA, (result.insideAngle/3.0)*2) ).scale(scaleFactor),
				   new Line( pA, pC )
				 ];

	    return result;
	};

	var draw = function() {

	    // Clear area
	    context.fillStyle = "white";
	    context.beginPath();
	    context.rect( 0, 0, canvasWidth, canvasHeight );
	    context.closePath();
	    context.fill();	    

	    var trisectionA = trisectAngle( triangle.a, triangle.b, triangle.c );
	    var trisectionB = trisectAngle( triangle.b, triangle.c, triangle.a );
	    var trisectionC = trisectAngle( triangle.c, triangle.a, triangle.b );
	    
	    //console.debug( "thetaCAB=" + ((anglesA.thetaCAB/(Math.PI*2))*360) + "deg, thetaCAB=" + anglesA.thetaCAB + "rad, insideAngle=" + ((anglesA.insideAngle/(Math.PI*2))*360) + "deg" );

	    //context.lineWidth   = 2;


	    //console.debug( "insideAngle=" + rad2deg(anglesA.insideAngle) + ", rotationAngle=" + rad2deg(anglesA.insideAngle/3.0) + "deg, rotated b: " + lineAsect0.b + ", clockwise=" + anglesA.clockwise );




	    // Compute the intersecions of all trisecions :)
	    var points = [ trisectionA.sectorLines[1].intersection( trisectionB.sectorLines[2] ),
			   trisectionA.sectorLines[1].intersection( trisectionC.sectorLines[2] ),
			   
			   trisectionB.sectorLines[1].intersection( trisectionC.sectorLines[2] ),
			   trisectionB.sectorLines[1].intersection( trisectionA.sectorLines[2] ),

			   trisectionC.sectorLines[1].intersection( trisectionA.sectorLines[2] ),
			   trisectionC.sectorLines[1].intersection( trisectionB.sectorLines[2] )
			 ];
	    // Draw polyon
	    context.fillStyle = "#a8d8ff";
	    context.beginPath();
	    context.moveTo( points[0].x, points[0].y );
	    for( var i = 1; i < points.length; i++ )
		context.lineTo( points[i].x, points[i].y );
	    context.closePath();
	    context.fill();


	    // Draw the equilateral triangle that's predicted by Morley's Trisector Theorem :)
	    context.fillStyle = "#f04800";
	    context.beginPath();
	    context.moveTo( points[0].x, points[0].y );
	    for( var i = 2; i < points.length; i+=2 )
		context.lineTo( points[i].x, points[i].y );
	    context.closePath();
	    context.fill();

	    

	    // Compute a center of the triangle by using lines AB and AC.
	    // Used to draw the text without intersecting the triangle.
	    var centerAB = trisectionA.lineAB.linePointAt( 0.5 );
	    var centerAC = trisectionA.lineAC.linePointAt( 0.5 );
	    var lineHalfB    = new Line( triangle.b, centerAC );
	    var lineHalfC    = new Line( triangle.c, centerAB );
	    var triangleCenter = lineHalfB.intersection( lineHalfC );
	    /*
	    context.beginPath();
	    context.arc( intersection.x, intersection.y, 2, 0, Math.PI*2 );
	    context.closePath();
	    context.fillStyle = "red";
	    context.fill();
	    */
	    


	    context.strokeStyle = "black";
	    context.lineWidth   = 1;
	    context.strokeStyle = "green";
	    trisectionA.sectorLines[1].draw( context );
	    trisectionA.sectorLines[2].draw( context );

	    context.strokeStyle = "orange";
	    trisectionB.sectorLines[1].draw( context );
	    trisectionB.sectorLines[2].draw( context );

	    context.strokeStyle = "blue";
	    trisectionC.sectorLines[1].draw( context );
	    trisectionC.sectorLines[2].draw( context );


	    // Draw angles
	    context.strokeStyle = "black";
	    context.lineWidth   = 1;
	    context.beginPath();
	    context.arc( pointA.x, pointA.y, 32, trisectionA.thetaAB, trisectionA.thetaAC, trisectionA.clockwise );
	    context.stroke();
	    context.closePath();

	    context.beginPath();
	    context.arc( pointB.x, pointB.y, 32, trisectionB.thetaAB, trisectionB.thetaAC, trisectionB.clockwise );
	    context.stroke();
	    context.closePath();

	    context.beginPath();
	    context.arc( pointC.x, pointC.y, 32, trisectionC.thetaAB, trisectionC.thetaAC, trisectionC.clockwise );
	    context.stroke();
	    context.closePath();


	    // Calculate nice positions for the labels.
	    var textAVector = new Line( triangleCenter, triangle.a );
	    textAVector = textAVector.scale( (textAVector.length()+12)/textAVector.length() );
	    var textBVector = new Line( triangleCenter, triangle.b );
	    textBVector = textBVector.scale( (textBVector.length()+12)/textBVector.length() );
	    var textCVector = new Line( triangleCenter, triangle.c );
	    textCVector = textCVector.scale( (textCVector.length()+12)/textCVector.length() );
	    context.fillStyle = "black";
	    context.font      = "12px Arial";
	    context.fillText( "A", textAVector.b.x, textAVector.b.y );
	    context.fillText( "B", textBVector.b.x, textBVector.b.y );
	    context.fillText( "C", textCVector.b.x, textCVector.b.y );
	    
	    context.strokeStyle = "black";
	    context.lineWidth   = 2;
	    triangle.draw( context );

	    
	};

	draw( context );
	} ); // END init

})(jQuery);
