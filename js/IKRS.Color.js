/**
 * @author  Ikaros kappler
 * @date    2016-03-16
 * @version 1.0.0
 **/

// Make a fallback
IKRS = { "AUTHOR" : "Ikaros Kappler" } || window.IKRS;


IKRS.Color = function(r,g,b) {
    this.r = r;
    this.g = g;
    this.b = b;
};

IKRS.Color.prototype = Object.create( Object.prototype );
IKRS.Color.prototype.constructor = IKRS.Color;

IKRS.Color.prototype.toString = function() { 
    return "rgb(" + this.r + "," + this.g + "," + this.b +")"; 
};

IKRS.Color.prototype.interpolate  = function(color,t) {
    return new Color( Math.floor(this.r + (color.r-this.r)*t),
		      Math.floor(this.g + (color.g-this.g)*t),
		      Math.floor(this.b + (color.b-this.b)*t)
		    );
};

// This function currently only understands '#xxxxxx' hex and 'rgb(r,g,b,)' colors.
IKRS.Color.parse = function(str) {
    if( !str || str.length == 0 )
	return new IKRS.Color();
    if( str.startsWith("#") ) {
	var num = patseInt( str.substring(1).trim(), 16 );
	return new IKRS.Color( (num>>16)&0xFF, (num>>8)&0xFF, num&0xFF );
    } else if( str.startsWith("rgb(") && str.endsWith(")") && str.length > 5 ) {
	var list = JSON.parse( "[" + str.substring(4,str.length-1) + "]" );
	//console.debug( "str=" + str + ", list=" + JSON.stringify(list) );
	return new IKRS.xColor( list[0]*1, list[1]*1, list[2]*1 );
    } else		
	throw "Unrecognized color format: " + str + ".";
};
