# stellarcam

## Data Model

### Geometries

#### Inheritance

Geometry
Point
Shape
Arc
Circle
CubicCurve
Ellipse
Rectangle
Segment
QuadraticCurve

#### Collection

Multishape
Shape

Area
Shape

### Entities

Drawing
Layer
Chain

### Configuration

#### Runtime

Configuration that gets built in order to run the app or produce gcode.

Program
Machine
Stock
Part
Cut
Path
Operation (LinuxCNC Material)

#### Application

Overall application configuration

Application
Postprocessor

## TODO

- Detect Parts
- Add inner and outer offset function to all shapes
- Add lead-ins and lead-outs
- Add Program configuration
- Add cut direction arrow to every shape midpoint
- Make Ellipse a real Shape
- Optionally approximate Ellipse with line segments.
