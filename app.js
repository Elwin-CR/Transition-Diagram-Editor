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
var selectedState = null;
var isDragging = false;
var offsetX, offsetY;

// Dropdown select element for create options
var createOptionsSelect = document.getElementById('createOptionsSelect');

// Create Transition, Loop, or State based on dropdown selection
createOptionsSelect.addEventListener('change', function() {
    var value = this.value;
    console.log("Dropdown selection:", value); // Debugging line to confirm dropdown selection
    if (value === 'create-state') {
        createState(); // Trigger the state creation
    } else if (value === 'createTransition') {
        createTransition(); // Trigger the transition creation
    } else if (value === 'createLoop') {
        createLoop(); // Trigger the loop creation
    }
});

// Create a new state (circle) with user-defined name
function createState() {
    console.log("Create State triggered!"); // Debugging line to confirm function trigger
    // Ask the user for a state name
    var stateName = prompt("Enter a name for the state:");
    if (stateName) {
        // Create a new state with initial position
        var newState = {
            x: 200,
            y: 200, 
            radius: 30,
            name: stateName,
            selected: false
        };

        // Add the new state to the states array
        states.push(newState);
        console.log("State Created:", newState); // Debugging line to check if state is created
        drawStates(); // Redraw all states on canvas
    } else {
        console.log("No name entered for the state.");
    }
}

// Create a new transition (line between two states)
function createTransition() {
    if (states.length < 2) {
        alert("You need at least two states to create a transition.");
        return;
    }

    // Ask the user for the 'from' and 'to' states
    var fromStateName = prompt("Enter the name of the starting state:");
    var toStateName = prompt("Enter the name of the ending state:");

    var fromState = states.find(s => s.name === fromStateName);
    var toState = states.find(s => s.name === toStateName);

    if (fromState && toState) {
        var transitionName = prompt("Enter a name for the transition:");

        // Create a new transition object and add it to the transitions array
        var newTransition = {
            from: fromState,
            to: toState,
            name: transitionName
        };
        transitions.push(newTransition);

        drawStates(); // Redraw all states
        drawTransitions(); // Draw the transition on canvas
    } else {
        alert("Both states must exist.");
    }
}

// Draw all states (circles) on canvas
function drawStates() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
    states.forEach(function(state) {
        ctx.beginPath();
        ctx.arc(state.x, state.y, state.radius, 0, 2 * Math.PI);
        ctx.fillStyle = state.selected ? 'lightgreen' : 'lightblue'; // Highlight selected state
        ctx.fill();
        ctx.stroke();
        
        // Draw the state name
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.name, state.x, state.y);
    });
}

// Draw all transitions (lines between states)
function drawTransitions() {
    ctx.strokeStyle = 'black';
    transitions.forEach(function(transition) {
        // Draw line from fromState to toState
        ctx.beginPath();
        ctx.moveTo(transition.from.x, transition.from.y);
        ctx.lineTo(transition.to.x, transition.to.y);
        ctx.stroke();

        // Draw the transition name in the middle of the line
        var midX = (transition.from.x + transition.to.x) / 2;
        var midY = (transition.from.y + transition.to.y) / 2;
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(transition.name, midX, midY);
    });
}

// Event listeners for mouse interaction
canvas.addEventListener('mousedown', function(e) {
    var mouseX = e.clientX;
    var mouseY = e.clientY;

    // Check if we clicked inside any state
    states.forEach(function(state) {
        var distance = Math.sqrt(Math.pow(mouseX - state.x, 2) + Math.pow(mouseY - state.y, 2));
        if (distance < state.radius) {
            // Select the state
            if (selectedState === state) {
                // Deselect the state if it is clicked again
                selectedState.selected = false;
                selectedState = null;
            } else {
                // Select the new state
                if (selectedState) {
                    selectedState.selected = false; // Deselect previous state
                }
                state.selected = true;
                selectedState = state;
            }
            drawStates(); // Redraw with updated selection
        }
    });

    // If a state is selected, enable dragging
    if (selectedState) {
        var distance = Math.sqrt(Math.pow(mouseX - selectedState.x, 2) + Math.pow(mouseY - selectedState.y, 2));
        if (distance < selectedState.radius) {
            isDragging = true;
            offsetX = mouseX - selectedState.x;
            offsetY = mouseY - selectedState.y;
        }
    }
});

// Make the state draggable
canvas.addEventListener('mousemove', function(e) {
    if (isDragging && selectedState) {
        selectedState.x = e.clientX - offsetX;
        selectedState.y = e.clientY - offsetY;
        drawStates();
    }
});

canvas.addEventListener('mouseup', function() {
    isDragging = false;
});
