// Typing Animation
var typed = new Typed(".auto-type", {
    strings: ["PROGAMER", "WEB DEVELOPER", "GAMER", "STUDENT"],
    typeSpeed: 100,
    backSpeed: 100,
    loop: true
});

let currentActive = null; // Track the currently active button

// Event Listener for extra buttons
document.getElementById('extra').addEventListener('click', (e) => {
    e.preventDefault();
    const extratext = document.getElementById('extratext');

    // Check if clicked element has the class 'extra-button'
    if (e.target.matches('.extra-button')) {
        // Hide previous text if it exists
        if (currentActive && currentActive !== e.target) {
            currentActive.classList.remove('active'); // Remove active class
            extratext.style.display = "none"; // Hide the text
        }

        // Toggle functionality
        if (currentActive === e.target) {
            extratext.innerHTML = ""; // Clear text if clicked again
            currentActive = null; // Reset current active
        } else {
            currentActive = e.target; // Update current active
            currentActive.classList.add('active'); // Add active class

            // Set content based on the button clicked
            switch (e.target.id) {
                 case 'a':
                    extratext.innerHTML = `
                        <strong>B.Tech in Computer Science and Engineering</strong><br>
                        Specialization: Internet of Things (IoT)<br>
                        GCET, Vallabh Vidyanagar<br>
                        Expected Graduation: 2026<br><br>
                        In my third year, I am delving deeper into data structures, algorithms, and IoT technologies. 
                        I am gaining hands-on experience through projects that involve developing smart applications and systems. 
                        My coursework includes advanced programming, embedded systems, and network protocols, equipping me with 
                        the skills necessary to tackle real-world challenges in the tech industry.
                    `;
                    break;
                case 'b':
                    extratext.innerHTML = `
                        I have a diverse range of hobbies that keep me engaged and motivated. 
                        Gaming is a significant passion of mine, allowing me to immerse myself in intricate narratives and strategic challenges. 
                        I also enjoy programming, constantly exploring new technologies and developing innovative solutions.<br><br>
                        Music is an integral part of my life; it inspires me and enhances my creativity. 
                        Additionally, I play snooker, a relaxing way to unwind while sharpening my focus and precision. 
                        These activities not only bring me joy but also contribute to my personal growth and development.
                    `;
                    break;
                case 'c':
                    extratext.innerHTML = `
                        As a web developer, I aspire to create innovative and scalable applications that make a meaningful impact. 
                        I am dedicated to harnessing the latest technologies to solve real-world problems and enhance user experiences. 
                        My goal is to contribute to projects that drive positive change and improve the way people interact with technology.
                    `; 
                    break;
            }
            extratext.style.display = "block"; // Show the text
        }
    }
});
