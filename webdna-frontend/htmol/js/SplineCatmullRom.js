/**
 * @author zz85 https://github.com/zz85
 *
 * Centripetal CatmullRom Curve - which is useful for avoiding
 * cusps and self-intersections in non-uniform catmull rom curves.
 * http://www.cemyuksel.com/research/catmullrom_param/catmullrom.pdf
 *
 * curve.type accepts centripetal(default), chordal and catmullrom
 * curve.tension is used for catmullrom which defaults to 0.5
 */
 /**
 *To file has been removed the dependece to three.js
 *All credit for the creators of CatmullRom and three.js
 * @author of the change JulioC3984 https://github.com/JulioC3094
 */
 Spline = function (vec, NumPoints){
   var ver = new Array();
   var n=0;
   for (var i=0; i<vec.length/3; i++)
   {
     ver[i] = new Vector3(vec[n], vec[n+1], vec[n+2]);
     n+=3
   }
   var curve = new CatmullRomCurve3(ver);
   var spline = curve.getPoints(NumPoints*ver.length);
   var splinePoints = new Array();
   for (var i = 0; i < spline.length; i++) {
     splinePoints.push(spline[i].x);
     splinePoints.push(spline[i].y);
     splinePoints.push(spline[i].z);
   }
   return splinePoints
 }
Vector3 = function(a, b, c) {
    this.x = a || 0;
    this.y = b || 0;
    this.z = c || 0
};

Vector3.prototype = {
    constructor: Vector3,
    add: function(a, b) {
        if (void 0 !== b) return console.warn("DEPRECATED: Vector3's .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(a, b);
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        return this
    },
    subVectors: function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this
    },
    distanceToSquared: function(a) {
        var b = this.x - a.x,
            c = this.y - a.y,
            a = this.z - a.z;
        return b * b + c * c + a * a
    }
};

CatmullRomCurve3 = (function() {

    var
        tmp = new Vector3(),
        px = new CubicPoly(),
        py = new CubicPoly(),
        pz = new CubicPoly();

    function CubicPoly() {

    }

    /*
     * Compute coefficients for a cubic polynomial
     *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
     * such that
     *   p(0) = x0, p(1) = x1
     *  and
     *   p'(0) = t0, p'(1) = t1.
     */
    Curve = function() {};
    Curve.prototype.getPoint = function() {
        console.log("Warning, getPoint() not implemented!");
        return null
    };
    Curve.prototype.getPointAt = function(a) {
        a = this.getUtoTmapping(a);
        return this.getPoint(a)
    };
    Curve.prototype.getPoints = function(a) {
        a || (a = 5);
        var b, c = [];
        for (b = 0; b <= a; b++) c.push(this.getPoint(b / a));
        return c
    };
    Curve.prototype.getSpacedPoints = function(a) {
        a || (a = 5);
        var b, c = [];
        for (b = 0; b <= a; b++) c.push(this.getPointAt(b / a));
        return c
    };
    Curve.prototype.getLength = function() {
        var a = this.getLengths();
        return a[a.length - 1]
    };
    Curve.prototype.getLengths = function(a) {
        a || (a = this.__arcLengthDivisions ? this.__arcLengthDivisions : 200);
        if (this.cacheArcLengths && this.cacheArcLengths.length == a + 1 && !this.needsUpdate) return this.cacheArcLengths;
        this.needsUpdate = !1;
        var b = [],
            c, d = this.getPoint(0),
            e, f = 0;
        b.push(0);
        for (e = 1; e <= a; e++) c = this.getPoint(e / a), f += c.distanceTo(d), b.push(f), d = c;
        return this.cacheArcLengths = b
    };
    Curve.prototype.updateArcLengths = function() {
        this.needsUpdate = !0;
        this.getLengths()
    };
    Curve.prototype.getUtoTmapping = function(a, b) {
        var c = this.getLengths(),
            d = 0,
            e = c.length,
            f;
        f = b ? b : a * c[e - 1];
        for (var h = 0, g = e - 1, i; h <= g;)
            if (d = Math.floor(h + (g - h) / 2), i = c[d] - f, 0 > i) h = d + 1;
            else if (0 < i) g = d - 1;
        else {
            g = d;
            break
        }
        d = g;
        if (c[d] == f) return d / (e - 1);
        h = c[d];
        return c = (d + (f - h) / (c[d + 1] - h)) / (e - 1)
    };
    Curve.prototype.getTangent = function(a) {
        var b = a - 1E-4,
            a = a + 1E-4;
        0 > b && (b = 0);
        1 < a && (a = 1);
        b = this.getPoint(b);
        return this.getPoint(a).clone().sub(b).normalize()
    };
    Curve.prototype.getTangentAt = function(a) {
        a = this.getUtoTmapping(a);
        return this.getTangent(a)
    };
    Curve.Utils = {
        tangentQuadraticBezier: function(a, b, c, d) {
            return 2 * (1 - a) * (c - b) + 2 * a * (d - c)
        },
        tangentCubicBezier: function(a, b, c, d, e) {
            return -3 * b * (1 - a) * (1 - a) + 3 * c * (1 - a) * (1 - a) - 6 * a * c * (1 - a) + 6 * a * d * (1 - a) - 3 * a * a * d + 3 * a * a * e
        },
        tangentSpline: function(a) {
            return 6 * a * a - 6 * a + (3 * a * a - 4 * a + 1) + (-6 * a * a + 6 * a) + (3 * a * a - 2 * a)
        },
        interpolate: function(a, b, c, d, e) {
            var a = 0.5 * (c - a),
                d = 0.5 * (d - b),
                f = e * e;
            return (2 * b - 2 * c + a + d) * e * f + (-3 * b + 3 * c - 2 * a - d) * f + a * e + b
        }
    };
    Curve.create = function(a, b) {
        a.prototype = Object.create(Curve.prototype);
        a.prototype.getPoint = b;
        return a
    };
    CubicPoly.prototype.init = function(x0, x1, t0, t1) {

        this.c0 = x0;
        this.c1 = t0;
        this.c2 = -3 * x0 + 3 * x1 - 2 * t0 - t1;
        this.c3 = 2 * x0 - 2 * x1 + t0 + t1;

    };

    CubicPoly.prototype.initNonuniformCatmullRom = function(x0, x1, x2, x3, dt0, dt1, dt2) {

        // compute tangents when parameterized in [t1,t2]
        var t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
        var t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;

        // rescale tangents for parametrization in [0,1]
        t1 *= dt1;
        t2 *= dt1;

        // initCubicPoly
        this.init(x1, x2, t1, t2);

    };

    // standard Catmull-Rom spline: interpolate between x1 and x2 with previous/following points x1/x4
    CubicPoly.prototype.initCatmullRom = function(x0, x1, x2, x3, tension) {

        this.init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));

    };

    CubicPoly.prototype.calc = function(t) {

        var t2 = t * t;
        var t3 = t2 * t;
        return this.c0 + this.c1 * t + this.c2 * t2 + this.c3 * t3;

    };

    // Subclass Three.js curve
    return Curve.create(

        function(p /* array of Vector3 */ ) {

            this.points = p || [];
            this.closed = false;

        },

        function(t) {

            var points = this.points,
                point, intPoint, weight, l;

            l = points.length;

            if (l < 2) console.log('duh, you need at least 2 points');

            point = (l - (this.closed ? 0 : 1)) * t;
            intPoint = Math.floor(point);
            weight = point - intPoint;

            if (this.closed) {

                intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / points.length) + 1) * points.length;

            } else if (weight === 0 && intPoint === l - 1) {

                intPoint = l - 2;
                weight = 1;

            }

            var p0, p1, p2, p3; // 4 points

            if (this.closed || intPoint > 0) {

                p0 = points[(intPoint - 1) % l];

            } else {

                // extrapolate first point
                tmp.subVectors(points[0], points[1]).add(points[0]);
                p0 = tmp;

            }

            p1 = points[intPoint % l];
            p2 = points[(intPoint + 1) % l];

            if (this.closed || intPoint + 2 < l) {

                p3 = points[(intPoint + 2) % l];

            } else {

                // extrapolate last point
                tmp.subVectors(points[l - 1], points[l - 2]).add(points[l - 1]);
                p3 = tmp;

            }

            if (this.type === undefined || this.type === 'centripetal' || this.type === 'chordal') {

                // init Centripetal / Chordal Catmull-Rom
                var pow = this.type === 'chordal' ? 0.5 : 0.25;
                var dt0 = Math.pow(p0.distanceToSquared(p1), pow);
                var dt1 = Math.pow(p1.distanceToSquared(p2), pow);
                var dt2 = Math.pow(p2.distanceToSquared(p3), pow);

                // safety check for repeated points
                if (dt1 < 1e-4) dt1 = 1.0;
                if (dt0 < 1e-4) dt0 = dt1;
                if (dt2 < 1e-4) dt2 = dt1;

                px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
                py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
                pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);

            } else if (this.type === 'catmullrom') {

                var tension = this.tension !== undefined ? this.tension : 0.5;
                px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, tension);
                py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, tension);
                pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, tension);

            }

            var v = new Vector3(
                px.calc(weight),
                py.calc(weight),
                pz.calc(weight)
            );

            return v;

        }

    );

})();
