// Get the canvas element and its context
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// Resize the canvas to fill the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 50; // Adjust for navbar height
}

// Resize canvas when window is resized
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial canvas size on page load

// Variables for states and interactions
var states = [];
var transitions = [];
var loops = [];
var selectedState = null;
var selectedTransition = null;
var selectedLoop = null;
var isDragging = false;
var offsetX, offsetY;
var initialStates = [];
var finalStates = [];

// Dropdown select elements
var createOptionsSelect = document.getElementById('createOptionsSelect');
var deleteOptionsSelect = document.getElementById('deleteOptionsSelect');

// Create options handler
createOptionsSelect.addEventListener('change', function() {
    var value = this.value;
    if (!value) return;
    
    switch(value) {
        case 'create-state':
            createState();
            break;
        case 'createTransition':
            createTransition();
            break;
        case 'createLoop':
            createLoop();
            break;
        case 'set_init':
            setInitialState();
            break;
        case 'set_fin':
            setFinalState();
            break;
    }
    this.value = ""; // Reset dropdown
});

// Delete options handler
deleteOptionsSelect.addEventListener('change', function() {
    var value = this.value;
    if (!value) return;
    
    switch(value) {
        case 'deleteState':
            deleteState();
            break;
        case 'deleteTransition':
            deleteTransition();
            break;
        case 'deleteLoop':
            deleteLoop();
            break;
    }
    this.value = ""; // Reset dropdown
});

// Create a new state
// Create a new state
// In the createState function, add draggable property
// Create a new state
function createState() {
    var stateName = prompt("Enter a name for the state:");
    if (stateName) {
        // Calculate position for new state (spread them out)
        const padding = 100;
        const cols = Math.floor(canvas.width / (2 * padding));
        const row = Math.floor(states.length / cols);
        const col = states.length % cols;
        
        var newState = {
            x: padding + col * (canvas.width - 2 * padding) / Math.max(1, cols - 1),
            y: padding + row * 100,
            radius: 30,
            name: stateName,
            selected: false,
            isInitial: false,
            isFinal: false,
            draggable : true
        };
        
        // If this is the first state, center it
        if (states.length === 0) {
            newState.x = canvas.width / 2;
            newState.y = canvas.height / 2;
        }
        
        states.push(newState);
        drawAll();
    }
}
// In the createTransition function, update draggable status
function createTransition() {
    if (states.length < 2) {
        alert("You need at least two states to create a transition.");
        return;
    }

    var fromStateName = prompt("Enter the name of the starting state:");
    var toStateName = prompt("Enter the name of the ending state:");
    if (!fromStateName || !toStateName) return;

    var fromState = states.find(s => s.name === fromStateName);
    var toState = states.find(s => s.name === toStateName);

    if (!fromState || !toState) {
        alert("One or both states not found.");
        return;
    }

    var transitionName = prompt("Enter a name for the transition:");
    if (!transitionName) return;

    var newTransition = {
        from: fromState,
        to: toState,
        name: transitionName,
        selected: false
    };
    transitions.push(newTransition);
    drawAll();
}

// Modify the mouse event handlers
canvas.addEventListener('mousedown', function(e) {
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    
    // Clear all selections
    states.forEach(s => s.selected = false);
    transitions.forEach(t => t.selected = false);
    loops.forEach(l => l.selected = false);
    selectedState = null;
    selectedTransition = null;
    selectedLoop = null;
    
    // Check for state selection (only if draggable)
    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const distance = Math.sqrt(Math.pow(mouseX - state.x, 2) + Math.pow(mouseY - state.y, 2));
        
        if (distance < state.radius) {  // Removed the draggable check
            state.selected = true;
            selectedState = state;
            isDragging = true;
            offsetX = mouseX - state.x;
            offsetY = mouseY - state.y;
            drawAll();
            return;
        }
    }
    
    // Rest of your selection logic...
    drawAll();
});

// Helper function to get correct mouse coordinates
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// Replace your existing mousedown listener with this:
canvas.addEventListener('mousedown', function(e) {
    const mousePos = getMousePos(canvas, e);
    const mouseX = mousePos.x;
    const mouseY = mousePos.y;
    
    // Clear all selections
    states.forEach(s => s.selected = false);
    transitions.forEach(t => t.selected = false);
    loops.forEach(l => l.selected = false);
    selectedState = null;
    selectedTransition = null;
    selectedLoop = null;
    isDragging = false;
    
    // Check for loop selection first (since they're smaller)
    for (let i = 0; i < loops.length; i++) {
        const loop = loops[i];
        const loopCenterX = loop.state.x + loop.state.radius + 30;
        const loopCenterY = loop.state.y - loop.state.radius - 30;
        const distance = Math.sqrt(Math.pow(mouseX - loopCenterX, 2) + Math.pow(mouseY - loopCenterY, 2));
        
        if (distance < 35) {
            loop.selected = true;
            selectedLoop = loop;
            drawAll();
            return;
        }
    }
    
    // Check for transition selection
    for (let i = 0; i < transitions.length; i++) {
        const transition = transitions[i];
        const distance = pointToLineDistance(
            mouseX, mouseY, 
            transition.from.x, transition.from.y, 
            transition.to.x, transition.to.y
        );
        
        if (distance < 10) {
            transition.selected = true;
            selectedTransition = transition;
            drawAll();
            return;
        }
    }
    
    // Finally, check for state selection
    for (let i = states.length - 1; i >= 0; i--) { // Check from top to bottom
        const state = states[i];
        const distance = Math.sqrt(Math.pow(mouseX - state.x, 2) + Math.pow(mouseY - state.y, 2));
        
        if (distance < state.radius) {
            state.selected = true;
            selectedState = state;
            isDragging = true;
            offsetX = mouseX - state.x;
            offsetY = mouseY - state.y;
            drawAll();
            return;
        }
    }
    
    drawAll();
});

// Replace your existing mousemove listener with this (remove any duplicates):
canvas.addEventListener('mousemove', function(e) {
    if (!isDragging || !selectedState) return;
    
    const mousePos = getMousePos(canvas, e);
    selectedState.x = mousePos.x - offsetX;
    selectedState.y = mousePos.y - offsetY;
    drawAll();
});

// Keep your existing mouseup listener
canvas.addEventListener('mouseup', function() {
    isDragging = false;
});

if (state.selected || distance < state.radius) {
    canvas.style.cursor = 'pointer';
} else {
    canvas.style.cursor = 'default';
}

// Create a loop on a state
function createLoop() {
    if (states.length < 1) {
        alert("You need at least one state to create a loop.");
        return;
    }

    var stateName = prompt("Enter the name of the state for the loop:");
    if (!stateName) return;

    var state = states.find(s => s.name === stateName);
    if (!state) {
        alert("State not found.");
        return;
    }

    var loopName = prompt("Enter a name for the loop:");
    if (!loopName) return;

    var newLoop = {
        state: state,
        name: loopName,
        selected: false
    };
    loops.push(newLoop);
    drawAll();
}

// Set a state as initial
function setInitialState() {
    if (states.length < 1) {
        alert("No states available.");
        return;
    }

    var stateName = prompt("Enter the name of the initial state:");
    if (!stateName) return;

    var state = states.find(s => s.name === stateName);
    if (!state) {
        alert("State not found.");
        return;
    }

    // Remove initial status from all states
    states.forEach(s => s.isInitial = false);
    initialStates = [];
    
    // Set this state as initial
    state.isInitial = true;
    initialStates.push(state);
    drawAll();
}

// Set a state as final
function setFinalState() {
    if (states.length < 1) {
        alert("No states available.");
        return;
    }

    var stateName = prompt("Enter the name of the final state:");
    if (!stateName) return;

    var state = states.find(s => s.name === stateName);
    if (!state) {
        alert("State not found.");
        return;
    }

    // Toggle final status
    state.isFinal = !state.isFinal;
    
    // Update finalStates array
    if (state.isFinal && !finalStates.includes(state)) {
        finalStates.push(state);
    } else if (!state.isFinal) {
        finalStates = finalStates.filter(s => s !== state);
    }
    drawAll();
}

// Delete a state
function deleteState() {
    if (states.length < 1) {
        alert("No states available to delete.");
        return;
    }

    var stateName = prompt("Enter the name of the state to delete:");
    if (!stateName) return;

    var stateIndex = states.findIndex(s => s.name === stateName);
    if (stateIndex === -1) {
        alert("State not found.");
        return;
    }

    // Remove all transitions and loops associated with this state
    transitions = transitions.filter(t => t.from !== states[stateIndex] && t.to !== states[stateIndex]);
    loops = loops.filter(l => l.state !== states[stateIndex]);
    
    // Remove from initial/final states
    initialStates = initialStates.filter(s => s !== states[stateIndex]);
    finalStates = finalStates.filter(s => s !== states[stateIndex]);
    
    // Remove the state
    states.splice(stateIndex, 1);
    drawAll();
}

// Delete a transition
function deleteTransition() {
    if (transitions.length < 1) {
        alert("No transitions available to delete.");
        return;
    }

    var fromStateName = prompt("Enter the name of the starting state of the transition to delete:");
    var toStateName = prompt("Enter the name of the ending state of the transition to delete:");
    if (!fromStateName || !toStateName) return;

    var transitionIndex = transitions.findIndex(t => 
        t.from.name === fromStateName && t.to.name === toStateName);
    
    if (transitionIndex === -1) {
        alert("Transition not found.");
        return;
    }

    transitions.splice(transitionIndex, 1);
    drawAll();
}

// Delete a loop
function deleteLoop() {
    if (loops.length < 1) {
        alert("No loops available to delete.");
        return;
    }

    var stateName = prompt("Enter the name of the state with the loop to delete:");
    if (!stateName) return;

    var loopIndex = loops.findIndex(l => l.state.name === stateName);
    if (loopIndex === -1) {
        alert("Loop not found.");
        return;
    }

    loops.splice(loopIndex, 1);
    drawAll();
}

// Draw all elements on canvas
function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw transitions first (so they appear behind states)
    drawTransitions();
    drawLoops();
    
    // Then draw states (so they appear on top)
    drawStates();
}

// Draw all states

function drawStates() {
    states.forEach(function(state) {
        // Draw state circle
        ctx.beginPath();
        ctx.arc(state.x, state.y, state.radius, 0, 2 * Math.PI);
        
        // Set fill color based on state properties
        let fillColor = 'lightblue';
        if (state.selected) fillColor = 'lightgreen';
        else if (state.isInitial && state.isFinal) fillColor = 'purple';
        else if (state.isInitial) fillColor = 'lightyellow';
        else if (state.isFinal) fillColor = 'pink';
        
        // Visual feedback for draggable states
        if (state.draggable) {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 1;
        }
        
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.stroke();
        
        // Draw the state name
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.name, state.x, state.y);
        
        // Draw initial state marker (arrow)
        if (state.isInitial) {
            drawInitialStateMarker(state);
        }
        
        // Draw final state marker (double circle)
        if (state.isFinal) {
            drawFinalStateMarker(state);
        }
    });
}

// Draw initial state marker (arrow pointing to the state)
// Draw initial state marker (shorter arrow pointing to the state)
function drawInitialStateMarker(state) {
    // Calculate direction from a point just outside the circle
    const angle = Math.atan2(state.y - (state.y - 40), state.x - (state.x - 40));
    
    // Start point is 40 pixels away from the state's edge
    const startX = state.x - (state.radius + 40) * Math.cos(angle);
    const startY = state.y - (state.radius + 40) * Math.sin(angle);
    
    // End point is at the state's edge
    const endX = state.x - state.radius * Math.cos(angle);
    const endY = state.y - state.radius * Math.sin(angle);
    
    // Draw a shorter arrow
    drawArrow(startX, startY, endX, endY, 10);
}

// Draw final state marker (double circle)
function drawFinalStateMarker(state) {
    ctx.beginPath();
    ctx.arc(state.x, state.y, state.radius - 5, 0, 2 * Math.PI);
    ctx.stroke();
}

// Draw all transitions
function drawTransitions() {
    transitions.forEach(function(transition) {
        // Set style based on selection
        ctx.strokeStyle = transition.selected ? 'red' : 'black';
        ctx.lineWidth = transition.selected ? 3 : 1;
        
        // Calculate direction vector
        const dx = transition.to.x - transition.from.x;
        const dy = transition.to.y - transition.from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate start and end points at the edges of the circles
        const startX = transition.from.x + (dx / distance) * transition.from.radius;
        const startY = transition.from.y + (dy / distance) * transition.from.radius;
        const endX = transition.to.x - (dx / distance) * transition.to.radius;
        const endY = transition.to.y - (dy / distance) * transition.to.radius;
        
        // Draw line with arrow
        drawArrow(startX, startY, endX, endY, 10);
        
        // Draw the transition name
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        // Offset the text perpendicular to the line
        const textOffset = 15;
        const angle = Math.atan2(dy, dx);
        const textX = midX + textOffset * Math.cos(angle + Math.PI/2);
        const textY = midY + textOffset * Math.sin(angle + Math.PI/2);
        
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(transition.name, textX, textY);
    });
}

// Draw all loops
function drawLoops() {
    loops.forEach(function(loop) {
        // Set style based on selection
        ctx.strokeStyle = loop.selected ? 'red' : 'black';
        ctx.lineWidth = loop.selected ? 3 : 1;
        
        // Draw loop as a small circle with an arrow
        const loopRadius = 30;
        const startAngle = Math.PI/4;
        const endAngle = 2*Math.PI + Math.PI/4;
        
        ctx.beginPath();
        ctx.arc(
            loop.state.x + loop.state.radius + loopRadius, 
            loop.state.y - loop.state.radius - loopRadius, 
            loopRadius, 
            startAngle, 
            endAngle,
            false
        );
        ctx.stroke();
        
        // Draw arrow head
        const arrowAngle = endAngle - 0.2;
        const arrowX = loop.state.x + loop.state.radius + loopRadius + loopRadius * Math.cos(arrowAngle);
        const arrowY = loop.state.y - loop.state.radius - loopRadius + loopRadius * Math.sin(arrowAngle);
        
        const arrowAngle2 = arrowAngle - 0.2;
        const arrowX2 = loop.state.x + loop.state.radius + loopRadius + loopRadius * Math.cos(arrowAngle2);
        const arrowY2 = loop.state.y - loop.state.radius - loopRadius + loopRadius * Math.sin(arrowAngle2);
        
        drawArrow(arrowX2, arrowY2, arrowX, arrowY, 8);
        
        // Draw the loop name
        const textX = loop.state.x + loop.state.radius + loopRadius;
        const textY = loop.state.y - loop.state.radius - loopRadius - loopRadius - 5;
        
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(loop.name, textX, textY);
    });
}

// Helper function to draw an arrow
function drawArrow(fromX, fromY, toX, toY, headLength) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI/6),
        toY - headLength * Math.sin(angle - Math.PI/6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI/6),
        toY - headLength * Math.sin(angle + Math.PI/6)
    );
    ctx.stroke();
}

// Mouse event handlers for selection and dragging
canvas.addEventListener('mousedown', function(e) {
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    
    // Clear all selections
    states.forEach(s => s.selected = false);
    transitions.forEach(t => t.selected = false);
    loops.forEach(l => l.selected = false);
    selectedState = null;
    selectedTransition = null;
    selectedLoop = null;
    
    // Check for loop selection
    for (let i = 0; i < loops.length; i++) {
        const loop = loops[i];
        const loopCenterX = loop.state.x + loop.state.radius + 30;
        const loopCenterY = loop.state.y - loop.state.radius - 30;
        const distance = Math.sqrt(Math.pow(mouseX - loopCenterX, 2) + Math.pow(mouseY - loopCenterY, 2));
        
        if (distance < 35) { // Approximate loop selection area
            loop.selected = true;
            selectedLoop = loop;
            drawAll();
            return;
        }
    }
    
    // Check for transition selection
    for (let i = 0; i < transitions.length; i++) {
        const transition = transitions[i];
        const midX = (transition.from.x + transition.to.x) / 2;
        const midY = (transition.from.y + transition.to.y) / 2;
        const distance = pointToLineDistance(
            mouseX, mouseY, 
            transition.from.x, transition.from.y, 
            transition.to.x, transition.to.y
        );
        
        if (distance < 10) { // Threshold for selecting a transition
            transition.selected = true;
            selectedTransition = transition;
            drawAll();
            return;
        }
    }
    
    // Check for state selection
    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const distance = Math.sqrt(Math.pow(mouseX - state.x, 2) + Math.pow(mouseY - state.y, 2));
        
        if (distance < state.radius) {
            state.selected = true;
            selectedState = state;
            isDragging = true;
            offsetX = mouseX - state.x;
            offsetY = mouseY - state.y;
            drawAll();
            return;
        }
    }
    
    // If nothing was selected, redraw to clear any selections
    drawAll();
});

canvas.addEventListener('mousemove', function(e) {
    if (isDragging && selectedState) {
        selectedState.x = e.clientX - offsetX;
        selectedState.y = e.clientY - offsetY;
        drawAll();
    }
});

canvas.addEventListener('mouseup', function() {
    isDragging = false;
});

// Helper function to calculate distance from point to line segment
function pointToLineDistance(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Initial draw
drawAll();
