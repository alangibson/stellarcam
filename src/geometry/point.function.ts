export function angleBetweenPoints(start_x, start_y, end_x, end_y) {
    // Calculate the difference in x and y
    const dx = end_x - start_x;
    const dy = end_y - start_y;
    
    // Calculate the angle in radians
    const radians = Math.atan2(dx, dy);
    
    // Convert radians to degrees
    const degrees = (radians * (180 / Math.PI));

    // Ensure the angle is positive (0 to 360 degrees)
    const normalized_angle = (degrees + 360) % 360;

    return normalized_angle;
}
